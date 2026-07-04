import os
import shutil
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
plt.style.use('ggplot')

from flask import Flask, send_from_directory
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

    # Initialize CORS with explicit whitelisted origins
    CORS(app, origins=config_class.CORS_ALLOWED_ORIGINS, supports_credentials=True)

    # Register exception and error handling middleware
    register_error_handlers(app)

    # Handle temporary plot directory (production uses /tmp due to serverless read-only disk)
    is_prod = config_class.FLASK_ENV == 'production'
    if is_prod:
        plot_dir = '/tmp/plots'
        # Serve plots from /tmp in production environment
        @app.route('/static/plots/<path:filename>')
        def serve_plots(filename):
            return send_from_directory('/tmp/plots', filename)
    else:
        plot_dir = os.path.join(app.static_folder, 'plots')

    # Recreate plots directory safely on startup
    if os.path.exists(plot_dir):
        try:
            shutil.rmtree(plot_dir)
        except Exception as e:
            logger.warning(f"Could not clear plot directory: {e}")
    os.makedirs(plot_dir, exist_ok=True)

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
