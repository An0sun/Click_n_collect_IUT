from flask import jsonify
from werkzeug.exceptions import HTTPException

def register_error_handlers(app):
    @app.errorhandler(HTTPException)
    def handle_http_exception(e: HTTPException):
        return jsonify({
            "code": e.code,
            "name": e.name,
            "description": e.description,
        }), e.code

    @app.errorhandler(Exception)
    def handle_exception(e: Exception):
        app.logger.exception("Unhandled error")
        return jsonify({"code": 500, "name": "Internal Server Error"}), 500
