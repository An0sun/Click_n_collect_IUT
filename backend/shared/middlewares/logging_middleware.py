import time
import logging
from flask import request, jsonify

logger = logging.getLogger("lcde")

def register_logging_middleware(app):

    @app.before_request
    def before_request():
        request.start_time = time.time()

    @app.after_request
    def after_request(response):
        try:
            duration = round((time.time() - request.start_time) * 1000, 2)
        except AttributeError:
            duration = 0.0

        logger.info(
            f"{request.method} {request.path} — {response.status_code} — {duration}ms — "
            f"{request.headers.get('User-Agent', 'Unknown')} — {request.remote_addr}"
        )
        return response

    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.error(f"Erreur sur {request.path}: {type(e).__name__} — {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500
