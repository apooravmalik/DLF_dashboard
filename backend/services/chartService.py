from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from config.database import get_db

# Execute SQL query and fetch results
def execute_query(query: str, db: Session):
    try:
        result = db.execute(text(query))  # Wrap query in text()
        return result.fetchall()
    except Exception as e:
        print(f"Error executing query: {e}")
        return []

# Convert SQL results to chart points
def convert_to_points(results):
    points = []
    for row in results:
        point = {
            "x": row[0],  # Assuming first column is x-axis
            "y": row[1]   # Assuming second column is y-axis
        }
        points.append(point)
    return points

# Main function to handle query and return chart points
def get_chart_data(query: str):
    db = next(get_db())  # Get session
    results = execute_query(query, db)
    db.close()  # Close session
    return convert_to_points(results)
