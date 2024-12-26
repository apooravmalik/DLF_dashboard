from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from config.database import get_db
import json

# Execute SQL query and fetch results
def execute_query(query: str, db: Session):
    try:
        result = db.execute(text(query))  # Wrap query in text()
        if result.returns_rows:  # Check if query returns rows
            return result.fetchall(), list(result.keys())  # Convert keys to a list
        else:
            print(f"Query did not return rows: {query}")
            return [], []
    except Exception as e:
        print(f"Error executing query: {e}")
        return [], []

# Convert SQL results to chart points
def convert_to_points(results, columns):
    points = []
    for row in results:
        for col_name, value in zip(columns, row):
            point = {
                "attribute": col_name,  # Use column name as the attribute
                "count": value          # Use the corresponding value
            }
            points.append(point)
    return [points]  # Wrap points in a list for each query


# Main function to handle multiple queries and return chart points
def get_chart_data(queries: list):
    db = next(get_db())  # Get session
    all_points = []  # To hold results from all queries

    for query in queries:
        results, columns = execute_query(query, db)
        if results and columns:
            all_points.append(convert_to_points(results, columns))
        else:
            print(f"No data found for query: {query}")
    
    db.close()  # Close session
    return json.dumps(all_points, indent=4)  # Convert to JSON format
