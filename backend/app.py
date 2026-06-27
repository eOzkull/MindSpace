import os
import shutil
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
plt.style.use('ggplot')

from flask import Flask
from flask_cors import CORS

# ── Blueprints ────────────────────────────────────────────────────────────────
from routes.history_routes    import history_bp
from routes.upload_routes     import upload_bp
from routes.dashboard_routes  import dashboard_bp
from routes.evaluation_routes import evaluation_bp
from routes.edit_routes       import edit_bp
from routes.compare_routes    import compare_bp

# ── Application factory ───────────────────────────────────────────────────────
app = Flask(__name__, static_folder='static', static_url_path='/static')

CORS(app, supports_credentials=True)

app.config['SECRET_KEY']              = os.environ.get('SECRET_KEY') or os.urandom(24)
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE']   = os.environ.get('FLASK_ENV') == 'production'

# Clear old plots on startup
plot_dir = os.path.join(app.static_folder, 'plots')
if os.path.exists(plot_dir):
    shutil.rmtree(plot_dir)
os.makedirs(plot_dir, exist_ok=True)

# ── Register Blueprints ───────────────────────────────────────────────────────
app.register_blueprint(history_bp)
app.register_blueprint(upload_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(evaluation_bp)
app.register_blueprint(edit_bp)
app.register_blueprint(compare_bp)

# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, port=5000)
