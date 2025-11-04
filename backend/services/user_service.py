from typing import Optional,  List
from sqlalchemy.exc import IntegrityError
from shared.extensions import db, bcrypt
from models.user_model import User, UserRole
from repositories.user_repository import UserRepository
from dtos.user_dto import RegisterDTO, LoginDTO, UpdateProfileDTO
from exceptions.user_exceptions import UserNotFound, InvalidUser, DuplicateUser, InvalidCredentials

class UserService : 

    def list_users() -> List[User] :
        return UserRepository.list_all()

    def get_user_by_id(user_id : int) -> User:
        user = UserRepository.get_by_id(user_id)
        if not user:
            raise UserNotFound()
        return user

    def update_profile(user_id : int, payload : UpdateProfileDTO) ->  User:
        user = UserRepository.get_by_id(user_id)
        if not user :
            raise UserNotFound()
        
        if payload.name is not None :
            user.name = payload.name.strip()
        if payload.first_name is not None :
            user.first_name = payload.first_name.strip()

        try :
            UserRepository.update()
        except IntegrityError :
            db.session.rollback()
            raise InvalidUser()

        return user

    def replace_user(user_id : int, name : str, first_name : str, email : Optional[str] = None) -> User:
        user = UserRepository.get_by_id(user_id)
        if not user :
            raise UserNotFound()

        if email is not None and email != user.email :
            if UserRepository.get_by_email(email) :
                raise DuplicateUser()
            user.email = email

        user.name = name.strip()
        user.first_name = first_name.strip()

        try :
            UserRepository.update()
        except IntegrityError :
            db.session.rollback()
            raise InvalidUser()

        return user
    
    def delete_user(user_id: int) -> None:
        user = UserRepository.get_by_id(user_id)
        if not user:
            raise UserNotFound()

        try:
            UserRepository.delete(user)
        except IntegrityError:
            db.session.rollback()
            raise InvalidUser()

    def register(payload : RegisterDTO) -> User:
        if UserRepository.get_by_email(payload.email):
            raise DuplicateUser()

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
            raise InvalidUser()

        return user
    

    def verify_user(payload : LoginDTO) -> User:
        user = UserRepository.get_by_email(payload.email)
        if not user :
            raise InvalidCredentials()
        if not bcrypt.check_password_hash(user.password_hash, payload.password) :
             raise InvalidCredentials()
        return user
    

    def change_password(user_id : int, old_password : str, new_password : str) -> None:
        user = UserRepository.get_by_id(user_id)
        if not user :
            raise UserNotFound()

        if not bcrypt.check_password_hash(user.password_hash, old_password) :
            raise InvalidCredentials()

        user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
        try :
            UserRepository.update()
        except IntegrityError :
            db.session.rollback()
            raise InvalidUser()
    

    def promote_to_admin(user_id : int) -> User:
        user = UserRepository.get_by_id(user_id)
        if not user :
            raise UserNotFound()
        user.role = UserRole.ADMIN
        try:
            UserRepository.update()
        except IntegrityError :
            db.session.rollback()
            raise InvalidUser()
        return user
    