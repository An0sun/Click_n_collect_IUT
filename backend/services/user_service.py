# services/user_service.py
from __future__ import annotations

from sqlalchemy import or_
from shared.extensions import db
from models.user_model import User, UserRole


class UserService:
    @staticmethod
    def list(q: str | None, page: int, per_page: int):
        query = User.query
        if q:
            like = f"%{q.lower()}%"
            query = query.filter(
                or_(
                    User.email.ilike(like),
                    User.first_name.ilike(like),
                    User.last_name.ilike(like),
                )
            )
        return query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    @staticmethod
    def get(uid: int) -> User | None:
        return User.query.get(uid)

    @staticmethod
    def update(uid: int, fields: dict) -> User | None:
        u = User.query.get(uid)
        if not u:
            return None
        for k, v in fields.items():
            if k in {"first_name", "last_name", "password_hash"}:
                setattr(u, k, v)
        db.session.commit()
        return u

    @staticmethod
    def update_role(uid: int, role: str) -> User | None:
        u = User.query.get(uid)
        if not u:
            return None
        # sécurise la valeur
        if role not in {r.value for r in UserRole}:
            raise ValueError("invalid role")
        u.role = UserRole(role)
        db.session.commit()
        return u

    @staticmethod
    def delete(uid: int) -> bool:
        u = User.query.get(uid)
        if not u:
            return False
        db.session.delete(u)
        db.session.commit()
        return True
