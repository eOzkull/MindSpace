import os
from dotenv import load_dotenv

# Load .env file from current directory
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)

class Config:
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_secret_key_mindspace')
    
    # Parse cookie secure setting, defaults to True if production
    is_prod = FLASK_ENV == 'production'
    cookie_secure_str = os.environ.get('COOKIE_SECURE', str(is_prod)).lower()
    COOKIE_SECURE = cookie_secure_str in ('true', '1', 'yes')
    
    # Session cookies parameters
    SESSION_COOKIE_SAMESITE = 'None' if COOKIE_SECURE else 'Lax'
    SESSION_COOKIE_SECURE = COOKIE_SECURE

    # CORS settings (list of origins)
    origins_str = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')
    CORS_ALLOWED_ORIGINS = [orig.strip() for orig in origins_str.split(',') if orig.strip()]

    # Static plot directory relative to backend app
    STATIC_PLOT_DIR = os.environ.get('STATIC_PLOT_DIR', 'static/plots')
