import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from config import LOG_LEVEL


def setup_logging() -> None:

    base_dir = Path(__file__).resolve().parents[2]
    logs_dir = base_dir / "logs"
    logs_dir.mkdir(exist_ok=True)
    log_file = logs_dir / "app.log"

    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d] — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    app_logger = logging.getLogger("lcde")
    app_logger.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))

    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=5_000_000,
        backupCount=3,
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)
    app_logger.addHandler(file_handler)

    app_logger.propagate = False

    app_logger.info("Logging fichier initialisé sans modifier les logs Flask.")