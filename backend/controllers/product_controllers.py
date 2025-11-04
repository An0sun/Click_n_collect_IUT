from http import HTTPStatus
from flask import Blueprint, request, jsonify
from pydantic import ValidationError

from services.product_service import ProductService
from dtos.product_dto import ProductInDTO, ProductUpdateDTO, ProductOutDTO
from mappers.product_mapper import product_to_dto
from exceptions.product_exceptions import ProductNotFound, InvalidProduct, BadProductRequest
from flasgger.utils import swag_from


bp = Blueprint("products", __name__, url_prefix="/products")


@bp.get("/")
@swag_from("../docs/products/get_products.yaml")
def list_products():
    q = (request.args.get("q") or "").strip() or None
    category = (request.args.get("category") or "").strip() or None
    sort = (request.args.get("sort") or "").strip() or None

    # pagination parameters
    try:
        page = int(request.args.get("page", 1))
    except (ValueError, TypeError):
        page = 1
    try:
        per_page = int(request.args.get("per_page", 20))
    except (ValueError, TypeError):
        per_page = 20
    per_page = min(max(per_page, 1), 100)

    pagination = ProductService.list(q, category, sort, page, per_page)
    items = [product_to_dto(p).model_dump() for p in pagination.items]

    return (
        jsonify(
            {
                "items": items,
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total": pagination.total,
                "pages": pagination.pages,
            }
        ),
        HTTPStatus.OK,
    )


@bp.get("/<int:pid>")
def get_product(pid: int):
    p = ProductService.get(pid)
    if not p:
        raise ProductNotFound()
    return jsonify(product_to_dto(p).model_dump()), HTTPStatus.OK


@bp.post("/")
@swag_from("../docs/products/create_product.yaml")
def create_product():
    try:
        product_dto = ProductInDTO.model_validate_json(request.data)
    except ValidationError:
        raise InvalidProduct("Product data validation failed.")
    p = ProductService.create(product_dto.model_dump())
    resp = jsonify(product_to_dto(p).model_dump())
    resp.headers["Location"] = f"/products/{p.id}"
    return resp, HTTPStatus.CREATED


@bp.patch("/<int:pid>")
@bp.put("/<int:pid>")
@swag_from("../docs/products/update_product.yaml")
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
    return jsonify(product_to_dto(p).model_dump()), HTTPStatus.OK


@bp.delete("/<int:pid>")
@swag_from("../docs/products/delete_product.yaml")
def delete_product(pid: int):
    ProductService.delete(pid)
    return "", HTTPStatus.NO_CONTENT
