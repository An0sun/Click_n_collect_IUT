from typing import Optional, List
from sqlalchemy import select
from shared.extensions import db
from models.user_model import User

class UserRepository : 
    def list_all() -> List[User] :
        return db.session.query(User).order_by(User.id.asc()).all()

    def get_by_id(user_id : int) -> Optional[User] : 
        return db.session.get(User, user_id)
    
    def get_by_email(user_email : str) -> Optional[User] :
        request = select(User).where(User.email == user_email)
        return db.session.execute(request).scalars().one_or_none()

    def add(user: User) -> User :
        db.session.add(user)
        db.session.commit()

        return user
    
    def update() -> None :
        db.session.commit()

    def delete(user : User) -> None :
        db.session.delete(user)
        db.session.commit()