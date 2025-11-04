from http import HTTPStatus
from flask import Blueprint, request, jsonify
from pydantic import ValidationError

from exceptions.product_exceptions import ProductNotFound, InvalidProduct, BadProductRequest
from services.product_service import ProductService
from dtos.product_dto import ProductInDTO, ProductUpdateDTO, ProductOutDTO

bp = Blueprint("products", __name__, url_prefix="/products")

def _dto_dump(model) -> dict:
    return ProductOutDTO.model_validate(model).model_dump(mode="json")

@bp.get("")
def list_products():
    q        = (request.args.get("q") or "").strip() or None
    category = (request.args.get("category") or "").strip() or None
    sort     = (request.args.get("sort") or "").strip() or None

    try:
        page = int(request.args.get("page", "1"))
    except ValueError:
        page = 1
    try:
        per_page = int(request.args.get("per_page", "20"))
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
    }), HTTPStatus.OK

@bp.get("/<int:pid>")
def get_product(pid: int):
    p = ProductService.get(pid)
    if not p:
        raise ProductNotFound()
    return jsonify(_dto_dump(p)), HTTPStatus.OK

@bp.post("")
def create_product():
    try:
        dto = ProductInDTO.model_validate_json(request.data)
    except ValidationError:
        raise InvalidProduct("Product data validation failed.")
    p = ProductService.create(dto.model_dump())
    resp = jsonify(_dto_dump(p))
    resp.headers["Location"] = f"/products/{p.id}"
    return resp, HTTPStatus.CREATED

@bp.patch("/<int:pid>")
@bp.put("/<int:pid>")
def update_product(pid: int):
    if not request.data:
        raise BadProductRequest("Empty request body.")
    try:
        dto = ProductUpdateDTO.model_validate_json(request.data)
        payload = dto.model_dump(exclude_none=True)
    except ValidationError:
        raise InvalidProduct("Product update validation failed.")
    if not payload:
        raise BadProductRequest("No fields to update.")

    p = ProductService.update(pid, payload)
    if not p:
        raise ProductNotFound()
    return jsonify(_dto_dump(p)), HTTPStatus.OK

@bp.delete("/<int:pid>")
def delete_product(pid: int):
    ok = ProductService.delete(pid)
    if not ok:
        raise ProductNotFound()
    return "", HTTPStatus.NO_CONTENT
