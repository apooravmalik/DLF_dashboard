from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from config.database import get_db
import json

# Execute SQL query and fetch results
def execute_query(query: str, db: Session):
    try:
        result = db.execute(text(query))  # Wrap query in text()
        if result.returns_rows:
            return result.fetchall(), list(result.keys())  # Convert keys to a list
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

        for col_name, value in zip(columns[1:], row[1:]):  # Skip the first column
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
def get_chart_data(chart_queries):
    db = next(get_db())
    chart_data = {}

    for key, query in chart_queries.items():
        if query:
            results, columns = execute_query(query, db)
            if key == "drill_down_query":
                chart_data[key] = {
                    "data": convert_to_drilldown(results, columns),
                    "query": query
                } if results else {"data": [], "query": query}
            else:
                chart_data[key] = {
                    "data": [{"attribute": col_name, "count": value} for row in results for col_name, value in zip(columns, row)],
                    "query": query
                } if results else {"data": [], "query": query}
        else:
            chart_data[key] = None

    db.close()
    return chart_data

# Process all charts
def get_all_charts(charts):
    return [get_chart_data(chart) for chart in charts]
