# product_controllers.py
from flask import Blueprint, request, jsonify, abort
from pydantic import ValidationError
from services.product_service import ProductService
from dto.product_dto import ProductInDTO, ProductUpdateDTO, ProductOutDTO

bp = Blueprint("products", __name__, url_prefix="/products")

def _dto_dump(model) -> dict:
    d = ProductOutDTO.model_validate(model).model_dump(mode="json")
    if isinstance(d.get("price"), str): d["price"] = float(d["price"])
    return d

@bp.get("")
def list_products():
    q = request.args.get("q")
    category = request.args.get("category")
    sort = request.args.get("sort")

    try:
        page = int(request.args.get("page", 1))
    except ValueError:
        page = 1

    try:
        per_page = int(request.args.get("per_page", 20))
    except ValueError:
        per_page = 20
    per_page = min(max(per_page, 1), 100)

    pagination = ProductService.list(q=q, category=category, sort=sort, page=page, per_page=per_page)
    items = [_dto_dump(p) for p in pagination.items]
    return jsonify({
        "items": items,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages
    }), 200

@bp.get("/<int:pid>")
def get_product(pid: int):
    p = ProductService.get(pid)
    if not p:
        abort(404)
    return jsonify(_dto_dump(p)), 200

@bp.post("")
def create_product():
    data = request.get_json(silent=True) or {}
    try:
        dto = ProductInDTO.model_validate(data)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400
    p = ProductService.create(dto.model_dump())
    resp = jsonify(_dto_dump(p))
    resp.headers["Location"] = f"/products/{p.id}"
    return resp, 201

@bp.patch("/<int:pid>")
def update_product(pid: int):
    data = request.get_json(silent=True) or {}
    try:
        dto = ProductUpdateDTO.model_validate(data)
        payload = dto.model_dump(exclude_unset=True)
        if not payload:
            return jsonify({"error": "no fields to update"}), 400
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400
    p = ProductService.update(pid, payload)
    if not p:
        abort(404)
    return jsonify(_dto_dump(p)), 200

@bp.delete("/<int:pid>")
def delete_product(pid: int):
    ok = ProductService.delete(pid)
    if not ok:
        abort(404)
    return "", 204
