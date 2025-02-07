from flask import Flask, request, jsonify, send_file
from services.chartService import (
    get_all_charts, map_report_data_to_table, export_report_to_csv,
    schedule_cache_refresh, load_cache, is_cache_valid, refresh_dashboard_cache,
    CACHE_REFRESH_INTERVAL
)
import os
from datetime import datetime, timedelta
import logging

app = Flask(__name__)

@app.route('/api/dashboard/charts', methods=['POST'])
def get_dashboard_charts():
    try:
        data = request.get_json()
        if 'charts' not in data or not isinstance(data['charts'], list):
            return jsonify({"error": "'charts' must be a list of chart query objects."}), 400

        charts = data['charts']
        dashboard_id = data.get('dashboard_id')
        
        if not dashboard_id:
            return jsonify({"error": "dashboard_id is required"}), 400

        try:
            schedule_cache_refresh(dashboard_id, charts)
        except Exception as e:
            logging.error("Cache scheduling failed for dashboard %s: %s", dashboard_id, str(e))

        try:
            if is_cache_valid(dashboard_id):
                cache = load_cache(dashboard_id)
                if cache and "data" in cache:
                    return jsonify({
                        "dashboard_id": dashboard_id,
                        "last_refresh_time": cache["last_refresh_time"],
                        "next_refresh_time": cache["next_refresh_time"],
                        "charts": cache["data"],
                        "source": "cache",
                        "instance_id": cache.get("instance_id", "unknown")
                    }), 200
        except Exception as e:
            logging.warning(f"Cache access failed for dashboard {dashboard_id}: {str(e)}")

        chart_results = get_all_charts(charts)
        
        try:
            refresh_dashboard_cache(dashboard_id, charts)
        except Exception as e:
            logging.error(f"Failed to cache fresh results for dashboard {dashboard_id}: {str(e)}")

        now = datetime.now()
        return jsonify({
            "dashboard_id": dashboard_id,
            "last_refresh_time": now.isoformat(),
            "next_refresh_time": (now + timedelta(seconds=CACHE_REFRESH_INTERVAL)).isoformat(),
            "charts": chart_results,
            "source": "fresh",
            "instance_id": os.getpid()
        }), 200

    except Exception as e:
        logging.error(f"Error in get_dashboard_charts: {str(e)}", exc_info=True)
        return jsonify({
            "error": "An error occurred while processing your request",
            "details": str(e)
        }), 500

@app.route('/api/report/download', methods=['POST'])
def download_report():
    try:
        request_data = request.get_json()
        dashboard_id = request_data.get('dashboard_id')
        
        # Try to use cached data first if available
        if dashboard_id:
            try:
                if is_cache_valid(dashboard_id):
                    cache = load_cache(dashboard_id)
                    if cache and 'data' in cache:
                        report_data = []
                        for chart in cache['data']:
                            if 'report_query' in chart and chart['report_query'].get('data'):
                                report_data.extend(
                                    [{col['attribute']: col['count'] for col in chart['report_query']['data']}]
                                )
                        
                        if report_data:
                            request_data['data'] = report_data
            except Exception as e:
                logging.warning(f"Failed to access cache for report download: {str(e)}")

        # Process fresh data if needed
        if 'charts' in request_data:
            chart_results = get_all_charts(request_data['charts'])
            report_data = []
            for chart in chart_results:
                if 'report_query' in chart and chart['report_query'].get('data'):
                    report_data.extend(
                        [{col['attribute']: col['count'] for col in chart['report_query']['data']}]
                    )
        elif 'data' in request_data:
            report_data = request_data['data']
        else:
            return jsonify({"error": "No data found for report"}), 400

        # Map and export data
        mapped_data = map_report_data_to_table({"data": report_data})
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_filename = f"report_{timestamp}.csv"
        
        file_path = os.path.join(os.getcwd(), csv_filename)
        export_report_to_csv(mapped_data, file_path)
        
        try:
            return send_file(
                file_path,
                as_attachment=True,
                mimetype='text/csv',
                download_name=csv_filename
            )
        finally:
            # Clean up the temporary file after sending
            try:
                os.remove(file_path)
            except Exception as e:
                logging.error(f"Failed to clean up temporary file {file_path}: {str(e)}")
    
    except Exception as e:
        logging.error(f"Error in download_report: {str(e)}", exc_info=True)
        return jsonify({
            "error": "An error occurred while processing your request",
            "details": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True)