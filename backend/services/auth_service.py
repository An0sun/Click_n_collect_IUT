from typing import Optional, Tuple
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import create_access_token
from shared.extensions import db
from models.user_model import User, UserRole
from utils.security import make_password_hash, verify_password

def register_client(first_name: str, last_name: str, email: str, password: str) -> User:
    user = User(
        first_name=first_name.strip(),
        last_name=last_name.strip(),
        email=email.lower().strip(),
        password_hash=make_password_hash(password),
        role=UserRole.CLIENT
    )
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise ValueError("Cet email existe déjà")
    return user

def authenticate(email: str, password: str) -> Optional[Tuple[User, str]]:
    user: User | None = User.query.filter_by(email=email.lower().strip()).first()
    if not user or not verify_password(password, user.password_hash):
        return None
    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": (user.role.value if isinstance(user.role, UserRole) else user.role),
                           "email": user.email}
    )
    return user, token

def get_user_by_id(user_id: int) -> Optional[User]:
    return User.query.get(user_id)
