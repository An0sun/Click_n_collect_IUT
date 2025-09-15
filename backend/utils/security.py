from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from shared.extensions import bcrypt

def make_password_hash(plain: str) -> str:
    return bcrypt.generate_password_hash(plain).decode("utf-8")

def verify_password(plain: str, password_hash: str) -> bool:
    return bcrypt.check_password_hash(password_hash, plain)

def roles_required(*roles):
    """
    À utiliser sur des routes protégées, ex: @roles_required("admin")
    Nécessite un JWT valide contenant une claim 'role'.
    """
    def wrapper(fn):
        @wraps(fn)
        def decorated(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt() or {}
            user_role = claims.get("role")
            if user_role not in roles:
                return jsonify({"message": "Forbidden: insufficient role"}), 403
            return fn(*args, **kwargs)
        return decorated
    return wrapper
