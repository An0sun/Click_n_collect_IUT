from typing import Optional, Tuple, List
from sqlalchemy.exc import IntegrityError
from shared.extensions import db, bcrypt
from models.user_model import User, UserRole
from repositories.user_repository import UserRepository
from dtos.user_dto import RegisterDTO, LoginDTO, UpdateProfileDTO


class UserService : 

    def list_users() -> List[User] :
        return UserRepository.list_all()

    def get_user_by_id(user_id : int) -> Optional[User] :
        return UserRepository.get_by_id(user_id)

    def update_profile(user_id : int, payload : UpdateProfileDTO) -> Tuple[Optional[User], Optional[str]] :
        user = UserRepository.get_by_id(user_id)
        if not user :
            return None
        
        if payload.name is not None :
            user.name = payload.name.strip()
        if payload.first_name is not None :
            user.first_name = payload.first_name.strip()

        try :
            UserRepository.update()
        except IntegrityError :
            db.session.rollback()
            return None

        return user, None

    def replace_user(
        user_id : int,
        name : str,
        first_name : str,
        email : Optional[str] = None,
    ) -> Tuple[Optional[User], Optional[str]]:

        user = UserRepository.get_by_id(user_id)
        if not user :
            return None

        if email is not None and email != user.email :
            if UserRepository.get_by_email(email) :
                return None
            user.email = email

        user.name = name.strip()
        user.first_name = first_name.strip()

        try :
            UserRepository.update()
        except IntegrityError :
            db.session.rollback()
            return None

        return user, None

    def delete_user(user_id: int) -> Tuple[bool, Optional[str]]:
        user = UserRepository.get_by_id(user_id)
        if not user:
            return False

        try:
            UserRepository.delete(user)
            return True, None
        except IntegrityError:
            db.session.rollback()
            return False


    def register(payload : RegisterDTO) -> Tuple[Optional[User], Optional[str]] :
        if UserRepository.get_by_email(payload.email):
            return None

        user = User(
            name = payload.name.strip(),
            first_name = payload.first_name.strip(),
            email = payload.email,
            role = UserRole.CLIENT,
            password_hash = bcrypt.generate_password_hash(payload.password).decode("utf-8"),
        )

        try :
            UserRepository.add(user)
        except IntegrityError :
            db.session.rollback()
            return None

        return user, None
    

    def verify_user(payload : LoginDTO) -> Optional[User] :
        user = UserRepository.get_by_email(payload.email)
        if not user :
            return None
        if not bcrypt.check_password_hash(user.password_hash, payload.password) :
            return None
        return user
    

    def change_password(user_id : int, old_password : str, new_password : str) -> Tuple[bool, Optional[str]] :
        user = UserRepository.get_by_id(user_id)
        if not user :
            return False

        if not bcrypt.check_password_hash(user.password_hash, old_password) :
            return False

        user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
        try :
            UserRepository.update()
        except IntegrityError :
            db.session.rollback()
            return False

        return True, None
    

    def promote_to_admin(user_id : int) -> Tuple[Optional[User], Optional[str]] :
        user = UserRepository.get_by_id(user_id)
        if not user :
            return None
        user.role = UserRole.ADMIN
        try:
            UserRepository.update()
        except IntegrityError :
            db.session.rollback()
            return None
        return user, None
    
if __name__ == "__main__" : 
    service = UserService()
    service.promote_to_admin(4)