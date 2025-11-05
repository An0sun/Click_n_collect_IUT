from flask import Blueprint, request, jsonify
from http import HTTPStatus
from dtos.product_dto import ProductInDTO, ProductUpdateDTO
from services.product_service import ProductService
from mappers.product_mapper import product_to_dto
from flasgger.utils import swag_from
from queries.product_query import ProductListQuery
import logging

bp = Blueprint("products", __name__, url_prefix="/products")
logger = logging.getLogger("lcde")

@bp.get("/")
@swag_from("../docs/products/get_products.yaml")
def list_products():
    logger.info("Récupération de la liste des produits.")
    query = ProductListQuery.from_request()
    logger.debug(
        "Params : q=%s, category=%s, sort=%s, page=%d, per_page=%d",
        query.q, query.category, query.sort, query.page, query.per_page
    )
    pagination = ProductService.list(q=query.q, category=query.category, sort=query.sort, page=query.page, per_page=query.per_page)
    items = [product_to_dto(p).model_dump(mode="json") for p in pagination.items]
    logger.info("%d produits récupérés", len(items))    

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
    logger.info("Création d’un nouveau produit demandée.")
    product_dto = ProductInDTO.model_validate_json(request.data)
    # Use JSON mode to serialize types (e.g., HttpUrl) to primitives
    created_product = ProductService.create(product_dto.model_dump(mode="json"))

    logger.info("Produit créé : %s (ID=%d)", created_product.name, created_product.id)
    return jsonify(product_to_dto(created_product).model_dump()), HTTPStatus.CREATED

@bp.patch("/<int:pid>")
@bp.put("/<int:pid>")
@swag_from("../docs/products/update_product.yaml")
def update_product(pid: int):
    update_dto = ProductUpdateDTO.model_validate_json(request.data)
    # Ensure serialization for complex types
    updated_product = ProductService.update(
        pid,
        update_dto.model_dump(exclude_none=True, mode="json")
    )
    return jsonify(product_to_dto(updated_product).model_dump()), HTTPStatus.OK

@bp.delete("/<int:pid>")
@swag_from("../docs/products/delete_product.yaml")
def delete_product(pid: int):
    ProductService.delete(pid)  
    return "", HTTPStatus.NO_CONTENT
