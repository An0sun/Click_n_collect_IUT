from flask import Blueprint, request, jsonify
from http import HTTPStatus
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from dtos.user_dto import RegisterDTO, LoginDTO, PublicUserDTO
from services.user_service import UserService

from flasgger.utils import swag_from
import logging

auth_bp = Blueprint("auth", __name__, url_prefix = "/auth")

logger = logging.getLogger("lcde")

@auth_bp.post("/register")
@swag_from("../docs/auth/register.yaml")
def register() :
    dto = RegisterDTO.model_validate_json(request.data)
    user = UserService.register(dto)
    logger.info("Utilisateur créé : %s (%s)", user.name, user.email)
    return jsonify(PublicUserDTO.model_validate(user).model_dump()), HTTPStatus.CREATED

@auth_bp.post("/login")
@swag_from("../docs/auth/login.yaml")
def login() :
    dto = LoginDTO.model_validate_json(request.data)
    logger.info("Tentative de connexion")
    user = UserService.verify_user(dto)
    logger.info("Connexion réussie ",)
    access_token = create_access_token(
        identity=user.id,
        
        additional_claims={
            "role": user.role.value,
            "name": user.name,
            "email": user.email,
        }    
    )

    return jsonify({
        "token" : access_token,
        "expires_in" : 15 * 60,
        "user" : PublicUserDTO.model_validate(user).model_dump()
    }), HTTPStatus.OK

