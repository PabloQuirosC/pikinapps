import logging
import os
import sys
from datetime import datetime
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path

LOGGER_NAME = "pikinapps"
LOG_FORMAT = "%(asctime)s - %(levelname)s - %(name)s - %(message)s"


def setup_logger() -> logging.Logger:
    """Configura el logger de la aplicación una sola vez."""
    logger = logging.getLogger(LOGGER_NAME)
    if logger.handlers:
        return logger

    logger.setLevel(logging.INFO)
    logger.propagate = False
    formatter = logging.Formatter(LOG_FORMAT, datefmt="%Y-%m-%d %H:%M:%S")

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    if os.getenv("VERCEL", "").lower() != "true":
        try:
            logs_dir = Path(__file__).resolve().parent.parent / "logs"
            logs_dir.mkdir(exist_ok=True)
            log_file = logs_dir / f"pikinapps-{datetime.now():%Y-%m-%d}.log"
            file_handler = TimedRotatingFileHandler(
                log_file,
                when="midnight",
                interval=1,
                backupCount=30,
                encoding="utf-8",
            )
            file_handler.suffix = "%Y-%m-%d"
            file_handler.setLevel(logging.INFO)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
            logger.info("Logging configurado en consola y archivo: %s", log_file)
        except OSError:
            logger.exception("No se pudo crear el archivo de logs.")
    else:
        logger.info("Logging configurado para Vercel: solo consola.")

    return logger


def get_logger(name: str) -> logging.Logger:
    """Obtiene un logger hijo con el formato centralizado de PikinApps."""
    setup_logger()
    return logging.getLogger(f"{LOGGER_NAME}.{name}")
