# controllers/user_controller.py
from __future__ import annotations

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from pydantic import ValidationError

from shared.extensions import db
from models.user_model import User, UserRole
from utils.security import roles_required, make_password_hash
from dtos.user_dtos import (
    UserOutDTO,
    UserUpdateDTO,
    RoleUpdateDTO,
)
from services.user_service import UserService

bp = Blueprint("users", __name__, url_prefix="/api/users")


@bp.get("")
@jwt_required()
@roles_required("admin")
def list_users():
    """
    Liste des users (admin only) avec recherche et pagination.
    Query:
      - q: filtre sur email/nom/prénom
      - page (def 1), per_page (def 20, max 100)
    """
    q = (request.args.get("q") or "").strip() or None
    try:
        page = max(int(request.args.get("page", 1)), 1)
        per_page = min(max(int(request.args.get("per_page", 20)), 1), 100)
    except ValueError:
        return jsonify({"message": "page/per_page must be integers"}), 400

    pagination = UserService.list(q=q, page=page, per_page=per_page)
    items = [
        UserOutDTO.model_validate(
            {
                "id": u.id,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "email": u.email,
                "role": (u.role.value if isinstance(u.role, UserRole) else u.role),
                "created_at": u.created_at,
            }
        ).model_dump(mode="json")
        for u in pagination.items
    ]

    return jsonify(
        {
            "items": items,
            "page": page,
            "per_page": per_page,
            "total": pagination.total,
            "pages": pagination.pages,
        }
    ), 200


@bp.get("/me")
@jwt_required()
def get_me():
    """Retourne le profil du user connecté."""
    uid = int(get_jwt_identity())
    u = UserService.get(uid)
    if not u:
        return jsonify({"message": "Utilisateur introuvable"}), 404

    out = UserOutDTO.model_validate(
        {
            "id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "role": (u.role.value if isinstance(u.role, UserRole) else u.role),
            "created_at": u.created_at,
        }
    ).model_dump(mode="json")
    return jsonify(out), 200


@bp.get("/<int:uid>")
@jwt_required()
def get_user(uid: int):
    """
    Détail d'un user.
    - Un admin peut voir n'importe qui.
    - Un user ne peut voir que lui-même.
    """
    claims = get_jwt() or {}
    my_id = int(get_jwt_identity())
    my_role = claims.get("role")

    if my_role != "admin" and my_id != uid:
        return jsonify({"message": "Forbidden"}), 403

    u = UserService.get(uid)
    if not u:
        return jsonify({"message": "Utilisateur introuvable"}), 404

    out = UserOutDTO.model_validate(
        {
            "id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "role": (u.role.value if isinstance(u.role, UserRole) else u.role),
            "created_at": u.created_at,
        }
    ).model_dump(mode="json")
    return jsonify(out), 200


@bp.patch("/<int:uid>")
@jwt_required()
def update_user(uid: int):
    """
    Mise à jour d'un user.
    - Un user peut MAJ son propre profil (first_name, last_name, password).
    - Seul un admin peut modifier le rôle (via RoleUpdateDTO ou champ 'role').
    """
    claims = get_jwt() or {}
    my_id = int(get_jwt_identity())
    is_admin = claims.get("role") == "admin"

    if not is_admin and my_id != uid:
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json(silent=True) or {}

    # Si le payload a qu'un changement de rôle => on valide via RoleUpdateDTO
    if "role" in data and data.keys() == {"role"}:
        if not is_admin:
            return jsonify({"message": "Admin required to change role"}), 403
        try:
            role_payload = RoleUpdateDTO.model_validate(data).model_dump()
        except ValidationError as e:
            return jsonify({"message": "invalid body", "errors": e.errors()}), 400

        u = UserService.update_role(uid, role_payload["role"])
        if not u:
            return jsonify({"message": "Utilisateur introuvable"}), 404

        out = UserOutDTO.model_validate(
            {
                "id": u.id,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "email": u.email,
                "role": (u.role.value if isinstance(u.role, UserRole) else u.role),
                "created_at": u.created_at,
            }
        ).model_dump(mode="json")
        return jsonify(out), 200

    # Sinon on mise à jour classic du profil genre (first_name, last_name, password)
    try:
        payload = UserUpdateDTO.model_validate(data).model_dump(exclude_none=True)
        if not payload:
            return jsonify({"message": "no fields to update"}), 400
    except ValidationError as e:
        return jsonify({"message": "invalid body", "errors": e.errors()}), 400

    # Si password => hash
    if "password" in payload:
        payload["password_hash"] = make_password_hash(payload.pop("password"))

    u = UserService.update(uid, payload)
    if not u:
        return jsonify({"message": "Utilisateur introuvable"}), 404

    out = UserOutDTO.model_validate(
        {
            "id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "role": (u.role.value if isinstance(u.role, UserRole) else u.role),
            "created_at": u.created_at,
        }
    ).model_dump(mode="json")
    return jsonify(out), 200


@bp.delete("/<int:uid>")
@jwt_required()
@roles_required("admin")
def delete_user(uid: int):
    """Suppression (admin only). Évite de supprimer son propre compte admin par sécurité."""
    my_id = int(get_jwt_identity())
    if uid == my_id:
        return jsonify({"message": "Impossible de supprimer votre propre compte"}), 400

    ok = UserService.delete(uid)
    if not ok:
        return jsonify({"message": "Utilisateur introuvable"}), 404
    return jsonify({"message": "deleted"}), 200
