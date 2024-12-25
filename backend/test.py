from services.chartService import get_chart_data
from config.database import SessionLocal, Base, engine

# Setup the database for testing
Base.metadata.create_all(bind=engine)

# Test function to run a sample query and print chart points
def test_chart_service():
    # Use SessionLocal for querying
    db = SessionLocal()
    try:
        query = """
        SELECT 
        COUNT(*) AS 'Total',
        SUM (CASE
         WHEN ptsCurrentState_LNG = 1 THEN 1 ELSE 0
         END) AS "Online",
        SUM (CASE
         WHEN ptsCurrentState_LNG = 2 THEN 1 ELSE 0
         END) AS "Offline"
        FROM PingTest_TBL
        WHERE ptsCameraZone_FRK = 3  
        """
        chart_points = get_chart_data(query)
        print("Generated Chart Points:", chart_points)
    finally:
        db.close()

if __name__ == "__main__":
    test_chart_service()
