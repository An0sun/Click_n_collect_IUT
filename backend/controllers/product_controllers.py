from flask import Blueprint, request, jsonify
from http import HTTPStatus
from dtos.product_dto import ProductInDTO, ProductUpdateDTO
from services.product_service import ProductService
from mappers.product_mapper import product_to_dto
from flasgger.utils import swag_from

bp = Blueprint("products", __name__, url_prefix="/products")

@bp.get("/")
@swag_from("../docs/products/get_products.yaml")
def list_products():
    q = (request.args.get("q") or "").strip() or None
    category = (request.args.get("category") or "").strip() or None
    sort = (request.args.get("sort") or "").strip() or None

    page = request.args.get("page", 1)
    per_page = request.args.get("per_page", 2)

    pagination = ProductService.list(q, category, sort, page, per_page)
    items = [product_to_dto(p).model_dump(mode="json") for p in pagination.items]

    return jsonify({
        "items": items,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
    }), HTTPStatus.OK

@bp.post("/")
@swag_from("../docs/products/create_product.yaml")
def create_product():
    product_dto = ProductInDTO.model_validate_json(request.data)
    created_product = ProductService.create(product_dto)
    return jsonify(product_to_dto(created_product).model_dump()), HTTPStatus.CREATED

@bp.patch("/<int:pid>")
@bp.put("/<int:pid>")
@swag_from("../docs/products/update_product.yaml")
def update_product(pid: int):
    update_dto = ProductUpdateDTO.model_validate_json(request.data)
    updated_product = ProductService.update(pid, update_dto.model_dump(exclude_none=True))
    return jsonify(product_to_dto(updated_product).model_dump()), HTTPStatus.OK

@bp.delete("/<int:pid>")
@swag_from("../docs/products/delete_product.yaml")
def delete_product(pid: int):
    ProductService.delete(pid)  
    return "", HTTPStatus.NO_CONTENT