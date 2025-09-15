from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pydantic import ValidationError
from dtos.user_dtos import RegisterDTO, LoginDTO
from services.auth_service import register_client, authenticate, get_user_by_id

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.post("/register")
def register():
    try:
        payload = RegisterDTO(**(request.get_json() or {}))
    except ValidationError as e:
        return jsonify({"message": "Données invalides", "errors": e.errors()}), 400

    try:
        user = register_client(
            payload.first_name, payload.last_name, payload.email, payload.password
        )
    except ValueError as e:
        return jsonify({"message": str(e)}), 409

    return jsonify({"message": "Compte créé (client)", "user": user.to_dict()}), 201

@auth_bp.post("/login")
def login():
    try:
        payload = LoginDTO(**(request.get_json() or {}))
    except ValidationError as e:
        return jsonify({"message": "Données invalides", "errors": e.errors()}), 400

    result = authenticate(payload.email, payload.password)
    if not result:
        return jsonify({"message": "Identifiants incorrects"}), 401

    user, token = result
    return jsonify({"access_token": token, "user": user.to_dict()}), 200

@auth_bp.get("/me")
@jwt_required()
def me():
    uid = get_jwt_identity()
    user = get_user_by_id(int(uid))
    if not user:
        return jsonify({"message": "Utilisateur introuvable"}), 404
    return jsonify(user.to_dict()), 200
