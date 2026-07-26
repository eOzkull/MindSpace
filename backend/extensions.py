from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

try:
    from flask_migrate import Migrate
    migrate = Migrate()
except ImportError:
    migrate = None

