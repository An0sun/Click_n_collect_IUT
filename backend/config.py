import os

DEBUG = os.getenv("DEBUG", "0") == "1"
SWAGGER_ENABLED = os.getenv("SWAGGER_ENABLED", "1") == "1"

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()