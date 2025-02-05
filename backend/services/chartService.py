import pickle
import os
import time
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from config.database import get_db
import csv
from datetime import datetime
import pytz

IST = pytz.timezone("Asia/Kolkata")

# Execute SQL query and fetch results
def execute_query(query: str, db: Session):
    try:
        result = db.execute(text(query))
        if result.returns_rows:
            return result.fetchall(), list(result.keys())
        else:
            return [], []
    except Exception as e:
        return [], []

# Convert SQL results to drill-down format
def convert_to_drilldown(results, columns):
    drilldown_data = {}
    for row in results:
        attribute_value = row[0]  # Assuming the first column is the main attribute
        if attribute_value not in drilldown_data:
            drilldown_data[attribute_value] = []

        for col_name, value in zip(columns[1:], row[1:]):
            drilldown_data[attribute_value].append({
                "type": col_name,
                "value": value
            })

    # Restructure the data
    structured_data = [
        {
            "attribute": "Building Name",
            "value": key,
            "counts": values
        }
        for key, values in drilldown_data.items()
    ]
    return structured_data

# Get data for one chart
def get_chart_data(chart_name, chart_queries, dashboard_id, refresh_interval=900):
    if is_cache_valid(dashboard_id, refresh_interval):
        cached_data, _ = load_cache(dashboard_id)
        return cached_data
    
    db = next(get_db())
    chart_data = {"chart_name": chart_name}

    for key, query_obj in chart_queries.items():
        if query_obj is not None:
            query = query_obj.get("query")
            query_name = query_obj.get("name", f"{key}_chart")
            legends = query_obj.get("legends", [])
            if query:
                results, columns = execute_query(query, db)
                chart_data[key] = {
                    "chart_name": query_name,
                    "legends": legends,
                    "data": [{"attribute": col_name, "count": value} for row in results for col_name, value in zip(columns, row)],
                    "query": query
                } if results else {"chart_name": query_name, "legends": legends, "data": [], "query": query}
        else:
            chart_data[key] = {"error": f"query_obj for key '{key}' is None"}

    db.close()
    
    save_cache(dashboard_id, chart_data)  # Save result to cache
    return chart_data

# Process all charts
def get_all_charts(charts, dashboard_id, refresh_interval=900):
    if is_cache_valid(dashboard_id, refresh_interval):
        cached_data, timestamp = load_cache(dashboard_id)
        ist_timestamp = datetime.fromtimestamp(timestamp, IST).strftime("%Y-%m-%d %H:%M:%S")
        ist_next_refresh = datetime.fromtimestamp(timestamp + refresh_interval, IST).strftime("%Y-%m-%d %H:%M:%S")

        return {
            "dashboard_id": dashboard_id,
            "last_refresh_time": ist_timestamp,
            "next_refresh_time": ist_next_refresh,
            "charts": cached_data
        }

    results = [get_chart_data(chart["name"], chart["queries"], dashboard_id, refresh_interval) for chart in charts]
    save_cache(dashboard_id, results)

    ist_now = datetime.now(IST).strftime("%Y-%m-%d %H:%M:%S")
    ist_next_refresh = datetime.fromtimestamp(time.time() + refresh_interval, IST).strftime("%Y-%m-%d %H:%M:%S")

    return {
        "dashboard_id": dashboard_id,
        "last_refresh_time": ist_now,
        "next_refresh_time": ist_next_refresh,
        "charts": results
    }

def map_report_data_to_table(request_data):
    """
    Maps the input data to a structured format for exporting.

    :param request_data: The JSON request data containing 'data'.
    :return: A dictionary containing 'columns' and 'formatted_data'.
    """
    try:
        # Extract data from the request
        data = request_data.get('data', [])

        # Ensure the data is a list of dictionaries with consistent keys
        if not all(isinstance(item, dict) for item in data):
            raise ValueError("'data' must be a list of dictionaries.")

        # Determine the columns based on keys in the first dictionary
        columns = list(data[0].keys()) if data else []

        # Format the data for output
        formatted_data = [{col: row.get(col, "") for col in columns} for row in data]

        return {
            "columns": columns,
            "formatted_data": formatted_data
        }
    except Exception as e:
        raise Exception(f"Error mapping report data: {str(e)}")

def export_report_to_csv(mapped_data, filename):
    """
    Exports the mapped report data to a CSV file.

    :param mapped_data: The data to be exported, containing columns and formatted_data.
    :param filename: The name of the file to save the CSV as.
    """
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as output_file:
            writer = csv.DictWriter(output_file, fieldnames=mapped_data['columns'])
            writer.writeheader()
            writer.writerows(mapped_data['formatted_data'])
        return filename  # Return the filename for further use
    except Exception as e:
        raise Exception(f"Error writing to CSV: {str(e)}")

# Caching Mechanism

CACHE_DIR = "cache"
os.makedirs(CACHE_DIR, exist_ok=True)

# Save data to .pkl cache
def save_cache(dashboard_id, data):
    cache_file = os.path.join(CACHE_DIR, f"{dashboard_id}.pkl")
    with open(cache_file, "wb") as f:
        pickle.dump({"timestamp": time.time(), "data": data}, f)

# Load cached data if available
def load_cache(dashboard_id):
    cache_file = os.path.join(CACHE_DIR, f"{dashboard_id}.pkl")
    if os.path.exists(cache_file):
        with open(cache_file, "rb") as f:
            cache = pickle.load(f)
            return cache["data"], cache["timestamp"]
    return None, None

# Check if cache is valid
def is_cache_valid(dashboard_id, refresh_interval):
    _, timestamp = load_cache(dashboard_id)
    if timestamp and (time.time() - timestamp) < refresh_interval:
        return True
    return False

# Clear cache for a specific dashboard
def clear_cache(dashboard_id):
    cache_file = os.path.join(CACHE_DIR, f"{dashboard_id}.pkl")
    if os.path.exists(cache_file):
        os.remove(cache_file)
