from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from config.database import get_db

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
def get_chart_data(chart_name, chart_queries):
    if not chart_queries:
        return {"error": "chart_queries is empty or None"}

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
            # Handle the case where query_obj is None
            chart_data[key] = {"error": f"query_obj for key '{key}' is None"}

    db.close()
    return chart_data

# Process all charts
def get_all_charts(charts):
    if not charts:
        return {"error": "charts list is empty or None"}
    return [get_chart_data(chart["name"], chart["queries"]) for chart in charts]
