from flask import Flask, request, jsonify
from services.chartService import get_chart_data  # Ensure this is correctly imported
from config.database import get_db  # Import the session from database config
import json

app = Flask(__name__)

@app.route('/get-chart-data/', methods=['POST'])
def get_chart_data_endpoint():
    try:
        # Parse the incoming JSON payload from the request body
        data = request.get_json()

        # Ensure that 'queries' is present in the incoming data and is a list
        if 'queries' not in data or not isinstance(data['queries'], list):
            return jsonify({"error": "Invalid input, 'queries' must be a list."}), 400

        # Get the queries from the request
        queries = data['queries']

        # Get the chart data by passing the queries (no need for db here, it's handled internally)
        chart_data = get_chart_data(queries)

        # Return the chart data as a JSON response
        return jsonify(json.loads(chart_data))  # Send the result as JSON

    except Exception as e:
        # Return an error message if something goes wrong
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
