from flask import Blueprint, request, jsonify
from http import HTTPStatus
from typing import Optional

from security.guards import requires_roles
from dtos.user_dto import RegisterDTO, UpdateProfileDTO, PublicUserDTO
from services.user_service import UserService

from flasgger.utils import swag_from

user_bp = Blueprint("users", __name__, url_prefix="/users")


@user_bp.get("")
@swag_from("../docs/users/find_many.yaml")
@requires_roles("ADMIN")
def find_many() :
    users = UserService.list_users()
    user_dtos = [PublicUserDTO.model_validate(u).model_dump() for u in users]
    return jsonify(user_dtos), HTTPStatus.OK

@user_bp.get("/<int:user_id>")
@swag_from("../docs/users/find_one.yaml")
@requires_roles("ADMIN")
def find_one(user_id : int) :
    user = UserService.get_user_by_id(user_id)
    return jsonify(PublicUserDTO.model_validate(user).model_dump()), HTTPStatus.OK

@user_bp.post("")
@swag_from("../docs/users/create.yaml")
def create() :
    register_dto = RegisterDTO.model_validate_json(request.data)
    user = UserService.register(register_dto)
    return jsonify(PublicUserDTO.model_validate(user).model_dump()), HTTPStatus.CREATED

@user_bp.put("/<int:user_id>")
@swag_from("../docs/users/update.yaml")
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
    user = UserService.replace_user(user_id, name = name, first_name = first_name, email = email)
    return jsonify(PublicUserDTO.model_validate(user).model_dump()), HTTPStatus.OK

@user_bp.patch("/<int:user_id>")
@swag_from("../docs/users/patch.yaml")
@requires_roles("ADMIN")
def patch(user_id : int) :
    update_dto = UpdateProfileDTO.model_validate_json(request.data)
    user = UserService.update_profile(user_id, update_dto)
    return jsonify(PublicUserDTO.model_validate(user).model_dump()), HTTPStatus.OK

@user_bp.delete("/<int:user_id>")
@swag_from("../docs/users/delete.yaml")
@requires_roles("ADMIN")
def remove(user_id : int) :
    UserService.delete_user(user_id)
    return "", HTTPStatus.NO_CONTENT
