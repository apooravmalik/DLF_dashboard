from flask import Flask, request, jsonify, send_file
from services.chartService import get_all_charts, map_report_data_to_table, export_report_to_csv
import os
from datetime import datetime

app = Flask(__name__)

@app.route('/api/dashboard/charts', methods=['POST'])
def get_dashboard_charts():
    try:
        data = request.get_json()
        dashboard_id = data.get("dashboard_id")
        
        if not dashboard_id:
            return jsonify({"error": "'dashboard_id' is required."}), 400
        if 'charts' not in data or not isinstance(data['charts'], list):
            return jsonify({"error": "'charts' must be a list of chart query objects."}), 400

        charts = data['charts']
        chart_results = get_all_charts(charts, dashboard_id)

        return jsonify(chart_results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/report/download', methods=['POST'])
def download_report():
    try:
        # Get the JSON data from the request
        request_data = request.get_json()
        
        # If the request contains chart data
        if 'charts' in request_data:
            # Process the charts to extract report data
            chart_results = get_all_charts(request_data['charts'])
            
            # Find the report query results
            report_data = []
            for chart in chart_results:
                if 'report_query' in chart and chart['report_query'].get('data'):
                    report_data.extend(
                        [
                            {col['attribute']: col['count'] for col in chart['report_query']['data']}
                        ]
                    )
        elif 'data' in request_data:
            # If direct data is provided
            report_data = request_data['data']
        else:
            return jsonify({"error": "No data found for report"}), 400

        # Map the report data to a structured format
        mapped_data = map_report_data_to_table({"data": report_data})
        
        # Generate a unique filename with date and time
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_filename = f"report_{timestamp}.csv"
        
        # Save the file in the current working directory
        file_path = os.path.join(os.getcwd(), csv_filename)
        export_report_to_csv(mapped_data, file_path)
        
        # Send the file for immediate download
        return send_file(file_path, as_attachment=True, mimetype='text/csv', download_name=csv_filename)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

