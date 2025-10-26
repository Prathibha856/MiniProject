"""
Logging Configuration for BMTC Bus Crowd Prediction System

This module provides centralized logging setup with file and console handlers,
rotating file logs, and structured formatting.

Usage:
    from logger import setup_logger
    
    logger = setup_logger('predict_api')
    logger.info("Starting prediction API")
    logger.error("Failed to load model", exc_info=True)
"""

import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from datetime import datetime
from typing import Optional

try:
    from config import config
except ImportError:
    # Fallback if config not available
    class FallbackConfig:
        BASE_DIR = Path(__file__).parent
        LOG_LEVEL = 'INFO'
        LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        LOG_FILE = BASE_DIR / 'app.log'
        LOG_MAX_BYTES = 10_000_000  # 10MB
        LOG_BACKUP_COUNT = 5
    
    config = FallbackConfig()


def setup_logger(
    name: str,
    log_file: Optional[str] = None,
    level: Optional[str] = None,
    console: bool = True
) -> logging.Logger:
    """
    Configure and return a logger with file and console handlers.
    
    Args:
        name: Logger name (e.g., 'predict_api', 'fare_api')
        log_file: Custom log file path (default: uses name-based file)
        level: Log level (default: from config)
        console: Whether to add console handler (default: True)
    
    Returns:
        Configured logger instance
    
    Example:
        >>> logger = setup_logger('predict_api')
        >>> logger.info("Server started on port 5000")
        >>> logger.error("Model not found", exc_info=True)
    """
    
    # Get or create logger
    logger = logging.getLogger(name)
    
    # Prevent duplicate handlers if logger already exists
    if logger.handlers:
        return logger
    
    # Set log level
    log_level = level or config.LOG_LEVEL
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # File handler with rotation
    if log_file is None:
        log_file = config.BASE_DIR / f'{name}.log'
    else:
        log_file = Path(log_file)
    
    # Ensure log directory exists
    log_file.parent.mkdir(parents=True, exist_ok=True)
    
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=config.LOG_MAX_BYTES,
        backupCount=config.LOG_BACKUP_COUNT,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)  # Capture all levels to file
    file_handler.setFormatter(detailed_formatter)
    logger.addHandler(file_handler)
    
    # Console handler (if enabled)
    if console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)  # Only INFO and above to console
        console_handler.setFormatter(simple_formatter)
        logger.addHandler(console_handler)
    
    # Prevent propagation to root logger
    logger.propagate = False
    
    return logger


def log_request(logger: logging.Logger, method: str, endpoint: str, **kwargs):
    """
    Log incoming API request with context.
    
    Args:
        logger: Logger instance
        method: HTTP method (GET, POST, etc.)
        endpoint: API endpoint
        **kwargs: Additional context (e.g., params, body size)
    
    Example:
        >>> log_request(logger, 'POST', '/predict', body_size=156)
    """
    context = ' | '.join(f"{k}={v}" for k, v in kwargs.items())
    logger.info(f"Request: {method} {endpoint}" + (f" | {context}" if context else ""))


def log_response(logger: logging.Logger, endpoint: str, status_code: int, duration_ms: float, **kwargs):
    """
    Log API response with timing and context.
    
    Args:
        logger: Logger instance
        endpoint: API endpoint
        status_code: HTTP status code
        duration_ms: Request duration in milliseconds
        **kwargs: Additional context
    
    Example:
        >>> log_response(logger, '/predict', 200, 45.3, crowd_level='High')
    """
    context = ' | '.join(f"{k}={v}" for k, v in kwargs.items())
    logger.info(
        f"Response: {endpoint} | Status={status_code} | "
        f"Duration={duration_ms:.2f}ms" + (f" | {context}" if context else "")
    )


def log_error(logger: logging.Logger, error: Exception, context: str = "", include_trace: bool = True):
    """
    Log error with full context and optional traceback.
    
    Args:
        logger: Logger instance
        error: Exception object
        context: Additional context about where error occurred
        include_trace: Whether to include full traceback
    
    Example:
        >>> try:
        ...     model.predict(data)
        ... except Exception as e:
        ...     log_error(logger, e, "Model prediction failed")
    """
    error_msg = f"{context}: {type(error).__name__}: {str(error)}" if context else str(error)
    logger.error(error_msg, exc_info=include_trace)


def log_startup(logger: logging.Logger, service_name: str, host: str, port: int, **kwargs):
    """
    Log service startup information.
    
    Args:
        logger: Logger instance
        service_name: Name of the service
        host: Host address
        port: Port number
        **kwargs: Additional startup info
    
    Example:
        >>> log_startup(logger, 'Prediction API', '0.0.0.0', 5000, 
        ...             model_loaded=True, features=5)
    """
    logger.info("=" * 60)
    logger.info(f"{service_name} - Starting")
    logger.info("=" * 60)
    logger.info(f"Host: {host}")
    logger.info(f"Port: {port}")
    
    for key, value in kwargs.items():
        logger.info(f"{key.replace('_', ' ').title()}: {value}")
    
    logger.info("=" * 60)


def log_shutdown(logger: logging.Logger, service_name: str):
    """
    Log service shutdown.
    
    Args:
        logger: Logger instance
        service_name: Name of the service
    """
    logger.info("=" * 60)
    logger.info(f"{service_name} - Shutting down")
    logger.info("=" * 60)


class RequestLogger:
    """
    Context manager for logging requests with automatic timing.
    
    Example:
        >>> logger = setup_logger('api')
        >>> with RequestLogger(logger, 'POST', '/predict') as req_logger:
        ...     result = process_request()
        ...     req_logger.set_response(200, crowd_level='High')
    """
    
    def __init__(self, logger: logging.Logger, method: str, endpoint: str, **kwargs):
        self.logger = logger
        self.method = method
        self.endpoint = endpoint
        self.request_context = kwargs
        self.start_time = None
        self.response_status = None
        self.response_context = {}
    
    def __enter__(self):
        self.start_time = datetime.now()
        log_request(self.logger, self.method, self.endpoint, **self.request_context)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration_ms = (datetime.now() - self.start_time).total_seconds() * 1000
        
        if exc_type is not None:
            # Log error if exception occurred
            log_error(self.logger, exc_val, f"Error processing {self.endpoint}")
            self.response_status = 500
        
        if self.response_status:
            log_response(
                self.logger, 
                self.endpoint, 
                self.response_status, 
                duration_ms,
                **self.response_context
            )
    
    def set_response(self, status_code: int, **kwargs):
        """Set response details for logging"""
        self.response_status = status_code
        self.response_context = kwargs


# Create default loggers for convenience
def get_predict_api_logger() -> logging.Logger:
    """Get or create logger for prediction API"""
    return setup_logger('predict_api', log_file=config.BASE_DIR / 'predict_api.log')


def get_fare_api_logger() -> logging.Logger:
    """Get or create logger for fare API"""
    return setup_logger('fare_api', log_file=config.BASE_DIR / 'fare_api.log')


def get_training_logger() -> logging.Logger:
    """Get or create logger for model training"""
    return setup_logger('training', log_file=config.BASE_DIR / 'training.log')


# Example usage
if __name__ == '__main__':
    # Test logging setup
    logger = setup_logger('test')
    
    logger.debug("This is a debug message")
    logger.info("This is an info message")
    logger.warning("This is a warning message")
    logger.error("This is an error message")
    
    # Test request logging
    with RequestLogger(logger, 'POST', '/predict', body_size=256) as req:
        # Simulate processing
        import time
        time.sleep(0.1)
        req.set_response(200, crowd_level='High')
    
    print(f"\nLog file created at: {config.BASE_DIR / 'test.log'}")
