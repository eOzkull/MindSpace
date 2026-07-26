import os
from dotenv import load_dotenv

# Load .env file from current directory
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)

class Config:
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    IS_VERCEL = bool(os.environ.get('VERCEL') or os.environ.get('VERCEL_ENV'))
    
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_secret_key_mindspace')

    # Parse cookie secure setting, defaults to True if production or Vercel
    is_prod = (FLASK_ENV == 'production') or IS_VERCEL
    cookie_secure_str = os.environ.get('COOKIE_SECURE', str(is_prod)).lower()
    COOKIE_SECURE = cookie_secure_str in ('true', '1', 'yes')

    # Session cookie parameters
    SESSION_COOKIE_SAMESITE = 'None' if (COOKIE_SECURE and is_prod) else 'Lax'
    SESSION_COOKIE_SECURE = COOKIE_SECURE

    # CORS settings (list of origins)
    origins_str = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')
    CORS_ALLOWED_ORIGINS = [orig.strip() for orig in origins_str.split(',') if orig.strip()]
    
    # Auto-append Vercel URL if running on Vercel
    vercel_url = os.environ.get('VERCEL_URL')
    if vercel_url:
        formatted_vercel = f"https://{vercel_url}" if not vercel_url.startswith('http') else vercel_url
        if formatted_vercel not in CORS_ALLOWED_ORIGINS:
            CORS_ALLOWED_ORIGINS.append(formatted_vercel)

    # Static plot directory relative to backend app
    STATIC_PLOT_DIR = os.environ.get('STATIC_PLOT_DIR', '/tmp/plots' if IS_VERCEL else 'static/plots')

    # Database Configuration
    basedir = os.path.abspath(os.path.dirname(__file__))
    
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        
    if not db_url:
        if is_prod:
            SQLALCHEMY_DATABASE_URI = 'sqlite:////tmp/mindspace.db'
        else:
            SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'mindspace.db')
    else:
        SQLALCHEMY_DATABASE_URI = db_url
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False

