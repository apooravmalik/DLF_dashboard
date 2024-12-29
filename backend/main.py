from api.chartAPI import app  # Import the app from your existing chartAPI.py file
from flask_cors import CORS
import os

# Get allowed origins from .env
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

# Configure CORS
CORS(app, resources={
    r"/*": {  # Allow all routes
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

if __name__ == "__main__":
    app.run(debug=True)
