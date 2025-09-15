# controllers/product_controller.py
from __future__ import annotations

from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from flask_jwt_extended import jwt_required

from dtos.product_dto import ProductInDTO, ProductOutDTO, ProductUpdateDTO
from services.product_service import ProductService
from utils.security import roles_required  # adapte le chemin si ton projet utilise src.utils.security

bp = Blueprint("products", __name__, url_prefix="/api/products")


@bp.get("")
def list_products():
    """
    Liste paginée des produits avec recherche/filtrage/tri.
    Accès: public (tu peux protéger si tu veux).
    Query params:
      - q: str (recherche texte)
      - category: "Food" | "Beverage"
      - sort: "name" | "price" | "stock" (optionnel)
      - page: int>=1 (defaut 1)
      - per_page: 1..100 (defaut 20)
    """
    q = (request.args.get("q") or "").strip() or None
    category = (request.args.get("category") or "").strip() or None
    sort = (request.args.get("sort") or "").strip() or None

    try:
        page = max(int(request.args.get("page", 1)), 1)
        per_page = min(max(int(request.args.get("per_page", 20)), 1), 100)
    except ValueError:
        return jsonify({"message": "page/per_page must be integers"}), 400

    pagination = ProductService.list(q, category, sort, page, per_page)
    items = [
        ProductOutDTO.model_validate(
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "category": p.category,
                "price": p.price,
                "stock": p.stock,
            }
        ).model_dump(mode="json")
        for p in pagination.items
    ]

    return (
        jsonify(
            {
                "items": items,
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages,
            }
        ),
        200,
    )


@bp.post("")
@jwt_required()
@roles_required("admin")
def create_product():
    """
    Crée un produit (admin uniquement).
    Body JSON: ProductInDTO
    """
    data = request.get_json(silent=True) or {}
    try:
        payload = ProductInDTO.model_validate(data).model_dump()
    except ValidationError as e:
        return jsonify({"message": "invalid body", "errors": e.errors()}), 400
    except Exception as e:
        return jsonify({"message": "invalid body", "detail": str(e)}), 400

    p = ProductService.create(payload)
    return jsonify({"message": "Produit créé", "id": p.id}), 201


@bp.put("/<int:pid>")
@bp.patch("/<int:pid>")
@jwt_required()
@roles_required("admin")
def update_product(pid: int):
    """
    Met à jour un produit (admin uniquement).
    Body JSON: ProductUpdateDTO (champs partiels autorisés).
    """
    data = request.get_json(silent=True) or {}
    try:
        payload = ProductUpdateDTO.model_validate(data).model_dump(exclude_none=True)
        if not payload:
            return jsonify({"message": "no fields to update"}), 400
    except ValidationError as e:
        return jsonify({"message": "invalid body", "errors": e.errors()}), 400
    except Exception as e:
        return jsonify({"message": "invalid body", "detail": str(e)}), 400

    p = ProductService.update(pid, payload)
    if not p:
        return jsonify({"message": "product not found"}), 404

    out = ProductOutDTO.model_validate(
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "category": p.category,
            "price": p.price,
            "stock": p.stock,
        }
    ).model_dump(mode="json")

    return jsonify(out), 200


@bp.delete("/<int:pid>")
@jwt_required()
@roles_required("admin")
def delete_product(pid: int):
    """
    Supprime un produit (admin uniquement).
    """
    ok = ProductService.delete(pid)
    if not ok:
        return jsonify({"message": "product not found"}), 404
    return jsonify({"message": "deleted"}), 200
