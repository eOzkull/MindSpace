import os
import logging
from logging.handlers import RotatingFileHandler

def setup_logger(name, log_file=None, level=logging.INFO):
    """Sets up a logger with console and optional rotating file handlers."""
    formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(name)s: %(message)s')

    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Prevent duplicate handlers if logging setup is re-run
    if not logger.handlers:
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

        # Optional rotating file handler
        if log_file:
            log_dir = os.path.dirname(log_file)
            if log_dir:
                os.makedirs(log_dir, exist_ok=True)
            file_handler = RotatingFileHandler(log_file, maxBytes=5 * 1024 * 1024, backupCount=5)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)

    return logger

# Core application logger instance
logger = setup_logger('mindspace')
