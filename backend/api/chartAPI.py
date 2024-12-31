from flask import Flask, request, jsonify
from services.chartService import get_all_charts

app = Flask(__name__)

@app.route('/api/dashboard/charts', methods=['POST'])
def get_dashboard_charts():
    try:
        data = request.get_json()
        if 'charts' not in data or not isinstance(data['charts'], list):
            return jsonify({"error": "'charts' must be a list of chart query objects."}), 400

        charts = data['charts']
        chart_results = get_all_charts(charts)

        return jsonify({"charts": chart_results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
