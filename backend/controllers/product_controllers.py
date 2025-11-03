from flask import Blueprint, request, jsonify

from dtos.product_dto import ProductInDTO, ProductOutDTO, ProductUpdateDTO
from services.product_service import ProductService
from pydantic import ValidationError


bp = Blueprint("products", __name__, url_prefix="/products")

@bp.get("/")
def list_products():
    q = (request.args.get("q") or "").strip() or None
    category = (request.args.get("category") or "").strip() or None
    sort = (request.args.get("sort") or "").strip() or None

    try:
        page = max(int(request.args.get("page", 1)), 1)
        per_page = min(max(int(request.args.get("per_page", 2)), 1), 100)
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


@bp.post("/")
def create_product():
    data = request.get_json(silent=True) or {}
    try:
        payload = ProductInDTO.model_validate(data).model_dump()
    except ValidationError as e:
        print("VALIDATION ERROR:", e.errors())
        return jsonify({"message": "invalid body", "errors": e.errors()}), 400
    except Exception as e:
        return jsonify({"message": "invalid body", "detail": str(e)}), 400

    p = ProductService.create(payload)
    return jsonify({"message": "Produit créé", "id": p.id}), 201


@bp.patch("/<int:pid>")
@bp.put("/<int:pid>")
def update_product(pid: int):
    data = request.get_json(silent=True) or {}
    try:
        payload = ProductUpdateDTO.model_validate(data).model_dump(
            exclude_none=True
        )
        if not payload:
            return jsonify({"message": "no fields to update"}), 400
    except Exception as e:
        return jsonify({"message": "invalid body", "detail": str(e)}), 400
    print("ok1")

    p = ProductService.update(pid, payload)
    if not p:
        return jsonify({"message": "product not found"}), 404
    print("ok2")

    return (
        jsonify(
            ProductOutDTO.model_validate(
                {
                    "id": p.id,
                    "name": p.name,
                    "description": p.description,
                    "category": p.category,
                    "price": p.price,
                    "stock": p.stock,
                }
            ).model_dump()
        ),
        200,
    )


@bp.delete("/<int:pid>")
def delete_product(pid: int):
    ok = ProductService.delete(pid)
    if not ok:
        return jsonify({"message": "product not found"}), 404
    return jsonify({"message": "deleted"}), 200
