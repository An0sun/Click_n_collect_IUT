from functools import wraps
from http import HTTPStatus
from flask_jwt_extended import verify_jwt_in_request, get_jwt




def requires_roles(*allowed_roles: str):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            role = claims.get("role")
            if role not in allowed_roles:
                return {"message": "Forbidden"}, HTTPStatus.FORBIDDEN
            return fn(*args, **kwargs)
        return wrapper
    return decorator