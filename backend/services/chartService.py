import json
import os
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from config.database import get_db
import csv
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.executors.pool import ThreadPoolExecutor
import threading

# Configure logging
logging.basicConfig(
    filename='query_logs.log',
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%dT%H:%M:%S'
)

# Cache settings
CACHE_DIR = 'cache'
CACHE_REFRESH_INTERVAL = 600  # 10 minutes in seconds

# Ensure cache directory exists
os.makedirs(CACHE_DIR, exist_ok=True)

# Thread-safe scheduler instance tracking
_scheduler_lock = threading.Lock()
_scheduler_instance = None

def get_scheduler():
    """Get or create the scheduler in a thread-safe way."""
    global _scheduler_instance
    
    with _scheduler_lock:
        if _scheduler_instance is None:
            job_defaults = {
                'coalesce': True,
                'max_instances': 1,
                'misfire_grace_time': 60
            }
            
            executors = {
                'default': ThreadPoolExecutor(max_workers=1)
            }
            
            _scheduler_instance = BackgroundScheduler(
                jobstores={'default': MemoryJobStore()},
                executors=executors,
                job_defaults=job_defaults
            )
            _scheduler_instance.start()
            
        return _scheduler_instance

def get_cache_path(dashboard_id: str) -> str:
    """Get the path for the dashboard's cache file."""
    return os.path.join(CACHE_DIR, f"{dashboard_id}.json")

def save_cache(dashboard_id: str, data: Dict[str, Any]) -> None:
    """Save data to cache."""
    cache_path = get_cache_path(dashboard_id)
    temp_path = f"{cache_path}.tmp"
    
    try:
        now = datetime.now()
        cache_data = {
            "last_refresh_time": now.isoformat(),
            "next_refresh_time": (now + timedelta(seconds=CACHE_REFRESH_INTERVAL)).isoformat(),
            "data": data,
            "instance_id": os.getpid()
        }
        
        with open(temp_path, 'w') as f:
            json.dump(cache_data, f)
        # Use os.replace for atomic operation
        os.replace(temp_path, cache_path)
        
    except Exception as e:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
        raise e

def load_cache(dashboard_id: str) -> Optional[Dict[str, Any]]:
    """Load cache data."""
    try:
        cache_path = get_cache_path(dashboard_id)
        if os.path.exists(cache_path):
            with open(cache_path, 'r') as f:
                cache_data = json.load(f)
                if all(key in cache_data for key in ["last_refresh_time", "next_refresh_time", "data"]):
                    logging.info(f"Cache hit for dashboard {dashboard_id}")  # Add this line
                    return cache_data
    except Exception as e:
        logging.error(f"Error loading cache for dashboard {dashboard_id}: {str(e)}")
    logging.info(f"Cache miss for dashboard {dashboard_id}")  # Add this line
    return None

def refresh_dashboard_cache(dashboard_id: str, chart_queries: list) -> None:
    """Refresh cache."""
    try:
        chart_results = get_all_charts(chart_queries)
        save_cache(dashboard_id, chart_results)
        logging.info(f"Cache refreshed for dashboard {dashboard_id} by instance {os.getpid()}")
    except Exception as e:
        logging.error(f"Cache refresh failed for dashboard {dashboard_id}: {str(e)}")

def schedule_cache_refresh(dashboard_id: str, chart_queries: list) -> None:
    """Schedule cache refresh."""
    scheduler = get_scheduler()
    job_id = f"refresh_{dashboard_id}"
    
    try:
        with _scheduler_lock:
            existing_job = scheduler.get_job(job_id)
            if existing_job:
                # Update existing job
                existing_job.modify(args=[dashboard_id, chart_queries])
                return
                
            scheduler.add_job(
                refresh_dashboard_cache,
                trigger=IntervalTrigger(seconds=CACHE_REFRESH_INTERVAL),
                args=[dashboard_id, chart_queries],
                id=job_id,
                replace_existing=True,
                next_run_time=datetime.now()
            )
            
    except Exception as e:
        logging.error(f"Error scheduling cache refresh for dashboard {dashboard_id}: {str(e)}")
        # Still try to refresh once
        refresh_dashboard_cache(dashboard_id, chart_queries)

def is_cache_valid(dashboard_id: str) -> bool:
    """Check cache validity."""
    try:
        cache = load_cache(dashboard_id)
        if cache and "last_refresh_time" in cache:
            last_refresh = datetime.fromisoformat(cache["last_refresh_time"])
            return (datetime.now() - last_refresh).total_seconds() < CACHE_REFRESH_INTERVAL
    except Exception as e:
        logging.error(f"Error checking cache validity for dashboard {dashboard_id}: {str(e)}")
    return False

def clear_cache(dashboard_id: str) -> None:
    """Delete cache file for a dashboard."""
    cache_path = get_cache_path(dashboard_id)
    if os.path.exists(cache_path):
        os.remove(cache_path)

def execute_query(query: str, db: Session):
    """Execute SQL query with logging."""
    try:
        result = db.execute(text(query))
        if result.returns_rows:
            rows = result.fetchall()
            columns = list(result.keys())
            
            logging.info(
                "Query Results: %s",
                {
                    "query": query,
                    "row_count": len(rows),
                    "columns": columns
                }
            )
            
            return rows, columns
        else:
            logging.info("Query executed with no rows returned: %s", query)
            return [], []
    except Exception as e:
        logging.error("Query execution error: %s\nQuery: %s", str(e), query)
        return [], []

def get_chart_data(dashboard_id: str, chart_name: str, chart_queries: Dict) -> Dict:
    """Get chart data with caching support."""
    if is_cache_valid(dashboard_id):
        cache = load_cache(dashboard_id)
        if cache:
            for chart in cache["data"]:
                if chart["chart_name"] == chart_name:
                    return {
                        **chart,
                        "cache_metadata": {
                            "last_refresh_time": cache["last_refresh_time"],
                            "next_refresh_time": cache["next_refresh_time"]
                        }
                    }
    
    db = next(get_db())
    chart_data = {"chart_name": chart_name}
    
    for key, query_obj in chart_queries.items():
        if query_obj is not None:
            query = query_obj.get("query")
            query_name = query_obj.get("name", f"{key}_chart")
            legends = query_obj.get("legends", [])
            
            if query:
                results, columns = execute_query(query, db)
                if key == "drill_down_query":
                    chart_data[key] = {
                        "chart_name": query_name,
                        "legends": legends,
                        "data": convert_to_drilldown(results, columns),
                        "query": query
                    } if results else {"chart_name": query_name, "legends": legends, "data": [], "query": query}
                else:
                    chart_data[key] = {
                        "chart_name": query_name,
                        "legends": legends,
                        "data": [{"attribute": col_name, "count": value} for row in results for col_name, value in zip(columns, row)],
                        "query": query
                    } if results else {"chart_name": query_name, "legends": legends, "data": [], "query": query}
        else:
            chart_data[key] = {"error": f"query_obj for key '{key}' is None"}
    
    db.close()
    return chart_data

def get_all_charts(charts: list) -> list:
    """Get all charts with caching support."""
    if not charts:
        return {"error": "charts list is empty or None"}
    
    return [get_chart_data(chart.get("dashboard_id"), chart["name"], chart["queries"]) for chart in charts]

def map_report_data_to_table(request_data):
    """Maps the input data to a structured format for exporting."""
    try:
        data = request_data.get('data', [])
        
        if not all(isinstance(item, dict) for item in data):
            raise ValueError("'data' must be a list of dictionaries.")
            
        columns = list(data[0].keys()) if data else []
        formatted_data = [{col: row.get(col, "") for col in columns} for row in data]
        
        return {
            "columns": columns,
            "formatted_data": formatted_data
        }
    except Exception as e:
        raise Exception(f"Error mapping report data: {str(e)}")

def export_report_to_csv(mapped_data, filename):
    """Exports the mapped report data to a CSV file."""
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as output_file:
            writer = csv.DictWriter(output_file, fieldnames=mapped_data['columns'])
            writer.writeheader()
            writer.writerows(mapped_data['formatted_data'])
        return filename
    except Exception as e:
        raise Exception(f"Error writing to CSV: {str(e)}")

def convert_to_drilldown(results, columns):
    """Convert query results to drilldown format."""
    drilldown_data = {}
    for row in results:
        attribute_value = row[0]
        if attribute_value not in drilldown_data:
            drilldown_data[attribute_value] = []

        for col_name, value in zip(columns[1:], row[1:]):
            drilldown_data[attribute_value].append({
                "type": col_name,
                "value": value
            })

    return [
        {
            "attribute": "Building Name",
            "value": key,
            "counts": values
        }
        for key, values in drilldown_data.items()
    ]