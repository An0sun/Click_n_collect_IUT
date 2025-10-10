from flask import jsonify
from werkzeug.exceptions import HTTPException, BadRequest
from pydantic import ValidationError

def register_error_handlers(app):
    """Enregistre les gestionnaires globaux d'erreurs Flask + Pydantic."""
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(e: HTTPException):
        return jsonify({
            "code": e.code,
            "name": e.name,
            "description": e.description,
        }), e.code

    @app.errorhandler(ValidationError)
    def handle_validation_error(e: ValidationError):
        first_error = e.errors()[0] if e.errors() else None
        message = first_error["msg"] if first_error else "Invalid data."
        return jsonify({
            "code": 422,
            "name": "Unprocessable Entity",
            "description": message,
        }), 422

    @app.errorhandler(BadRequest)
    def handle_bad_request(e: BadRequest):
        return jsonify({
            "code": 400,
            "name": "Bad Request",
            "description": "Malformed JSON or invalid request format.",
        }), 400

    @app.errorhandler(Exception)
    def handle_exception(e: Exception):
        app.logger.exception("Unhandled error")
        return jsonify({
            "code": 500,
            "name": "Internal Server Error",
            "description": str(e)
        }), 500
