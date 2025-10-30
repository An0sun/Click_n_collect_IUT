from flask import Blueprint, request, jsonify
from http import HTTPStatus
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from dtos.user_dto import RegisterDTO, LoginDTO, PublicUserDTO
from services.user_service import UserService

auth_bp = Blueprint("auth", __name__, url_prefix = "/auth")


@auth_bp.post("/register")
def register() :
    try :
        dto = RegisterDTO.model_validate_json(request.data)
    except Exception :
        return "", HTTPStatus.UNPROCESSABLE_ENTITY

    user, err = UserService.register(dto)

    if err == "This email exist already" :
        return "", HTTPStatus.CONFLICT
    if err :
        return "", HTTPStatus.BAD_REQUEST

    return jsonify(PublicUserDTO.model_validate(user).model_dump()), HTTPStatus.CREATED


@auth_bp.post("/login")
def login() :
    try :
        dto = LoginDTO.model_validate_json(request.data)
    except Exception :
        return "", HTTPStatus.UNAUTHORIZED

    user = UserService.verify_user(dto)
    if not user :
        return "", HTTPStatus.UNAUTHORIZED

    access_token = create_access_token(
        identity=user.id,
        
        additional_claims={
            "role": user.role.value,
            "email": user.email,
        }    
    )

    return jsonify({
        "token" : access_token,
        "expires_in" : 15 * 60,
        "user" : PublicUserDTO.model_validate(user).model_dump()
    }), HTTPStatus.OK


@auth_bp.get("/me")
@jwt_required()
def me() :
    current_id = get_jwt_identity()
    user = UserService.get_user_by_id(current_id)
    if not user :
        return "", HTTPStatus.NOT_FOUND
    return jsonify(PublicUserDTO.model_validate(user).model_dump()), HTTPStatus.OK


@auth_bp.post("/change-password")
@jwt_required()
def change_password() :
    data = request.get_json(silent=True) or {}

    old_password = str(data.get("old_password") or "")
    new_password = str(data.get("new_password") or "")
    if not old_password or not new_password :
        return "", HTTPStatus.UNPROCESSABLE_ENTITY

    user_id = get_jwt_identity()
    ok, err = UserService.change_password(user_id, old_password, new_password)

    if err == "not found" :
        return "", HTTPStatus.NOT_FOUND
    if err == "invalid old password" :
        return "", HTTPStatus.UNAUTHORIZED
    if err :
        return "", HTTPStatus.BAD_REQUEST

    return "", HTTPStatus.NO_CONTENT
