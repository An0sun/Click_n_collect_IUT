from functools import wraps
from http import HTTPStatus
from flask_jwt_extended import verify_jwt_in_request, get_jwt, get_jwt_identity




def requires_roles(*roles) :
    def wrapper(fn) :
        @wraps(fn)
        def decorated(user_id, *args, **kwargs) :
            verify_jwt_in_request()
            claims = get_jwt()
            role = claims.get("role")
            identity = get_jwt_identity()
            if role in roles or identity == user_id :
                return fn(user_id, *args, **kwargs)
            return "", HTTPStatus.FORBIDDEN
        return decorated
    return wrapper
