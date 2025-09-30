from flask import Blueprint, request, jsonify
from http import HTTPStatus
from typing import Optional

from security.guards import requires_roles
from dtos.user_dto import RegisterDTO, UpdateProfileDTO, PublicUserDTO
from services.user_service import UserService

user_bp = Blueprint("users", __name__, url_prefix="/users")


@user_bp.get("")
@requires_roles("ADMIN")
def find_many() :
    users = UserService.list_users()
    user_dtos = [PublicUserDTO.model_validate(u).model_dump() for u in users]
    return jsonify(user_dtos), HTTPStatus.OK


@user_bp.get("/<int:user_id>")
@requires_roles("ADMIN")
def find_one(user_id : int) :
    user = UserService.get_user_by_id(user_id)
    if not user :
        return "", HTTPStatus.NOT_FOUND
    return jsonify(PublicUserDTO.model_validate(user).model_dump()), HTTPStatus.OK


@user_bp.post("")
def create() :
    try :
        register_dto = RegisterDTO.model_validate_json(request.data)
    except Exception :
        return "", HTTPStatus.UNPROCESSABLE_ENTITY

    user, err = UserService.register(register_dto)

    if err == "This email exist already" :
        return "", HTTPStatus.CONFLICT
    if err :
        return "", HTTPStatus.BAD_REQUEST

    return jsonify(PublicUserDTO.model_validate(user).model_dump()), HTTPStatus.CREATED


@user_bp.put("/<int:user_id>")
@requires_roles("ADMIN")
def update(user_id : int) :
    payload = request.get_json(silent=True) or {}

    name = (payload.get("name") or "").strip()
    first_name = (payload.get("first_name") or "").strip()
    email : Optional[str] = (payload.get("email") or None)
    if email :
        email = email.strip().lower()

    if not name or not first_name :
        return "", HTTPStatus.UNPROCESSABLE_ENTITY

    user, err = UserService.replace_user(user_id, name = name, first_name = first_name, email = email)

    if err == "not found" :
        return "", HTTPStatus.NOT_FOUND
    if err == "This email exist already" :
        return "", HTTPStatus.CONFLICT
    if err :
        return "", HTTPStatus.BAD_REQUEST

    return jsonify(PublicUserDTO.model_validate(user).model_dump()), HTTPStatus.OK


@user_bp.patch("/<int:user_id>")
@requires_roles("ADMIN")
def patch(user_id : int) :
    try :
        update_dto = UpdateProfileDTO.model_validate_json(request.data)
    except Exception :
        return "", HTTPStatus.UNPROCESSABLE_ENTITY

    user, err = UserService.update_profile(user_id, update_dto)

    if err == "not found" :
        return "", HTTPStatus.NOT_FOUND
    if err :
        return "", HTTPStatus.BAD_REQUEST

    return jsonify(PublicUserDTO.model_validate(user).model_dump()), HTTPStatus.OK


@user_bp.delete("/<int:user_id>")
@requires_roles("ADMIN")
def remove(user_id : int) :
    ok, err = UserService.delete_user(user_id)

    if err == "not found" :
        return "", HTTPStatus.NOT_FOUND
    if err :
        return "", HTTPStatus.BAD_REQUEST

    return "", HTTPStatus.NO_CONTENT
