import os
import sys

# Fix module resolution (sys.path) so local imports work in Vercel Serverless environment
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

import nltk
# Add root-level nltk_data to search path for offline access
root_dir = os.path.dirname(backend_dir)
local_nltk_path = os.path.join(root_dir, 'nltk_data')
if local_nltk_path not in nltk.data.path:
    nltk.data.path.append(local_nltk_path)

from flask import Flask
from flask_cors import CORS

from config import Config
from utils.logger import logger
from middleware.error_handlers import register_error_handlers
from extensions import db, migrate
import models

# ── Blueprints ────────────────────────────────────────────────────────────────
from routes.history_routes    import history_bp
from routes.upload_routes     import upload_bp
from routes.dashboard_routes  import dashboard_bp
from routes.evaluation_routes import evaluation_bp
from routes.edit_routes       import edit_bp
from routes.compare_routes    import compare_bp

def create_app(config_class=Config):
    """Application factory for the MindSpace Flask backend."""
    app = Flask(__name__, static_folder='static', static_url_path='/static')
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Automatically create database tables if they do not exist
    with app.app_context():
        db.create_all()

    # Initialize CORS with explicit whitelisted origins
    CORS(app, origins=config_class.CORS_ALLOWED_ORIGINS, supports_credentials=True)

    # Register exception and error handling middleware
    register_error_handlers(app)

    # Register route blueprints
    app.register_blueprint(history_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(evaluation_bp)
    app.register_blueprint(edit_bp)
    app.register_blueprint(compare_bp)

    logger.info(f"MindSpace application initialized in '{config_class.FLASK_ENV}' mode.")
    return app

# Instantiate app for WSGI / Serverless runner compatibility
app = create_app()

if __name__ == '__main__':
    # Local development server running on port 5000
    app.run(debug=(Config.FLASK_ENV == 'development'), use_reloader=False, port=5000)
