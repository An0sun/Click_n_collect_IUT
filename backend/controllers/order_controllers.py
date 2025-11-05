from security.guards import requires_roles
from flask import Blueprint, request, jsonify
from http import HTTPStatus
from dtos.order_dto import OrderInDTO, OrderStatus
from flask_jwt_extended import get_jwt, jwt_required
from services.order_service import OrderService
from mappers.order_mapper import order_to_dto
from flasgger.utils import swag_from
import logging


logger = logging.getLogger("lcde")
from realtime.order_sse import push_order_event
from mappers.order_mapper import order_to_dto

bp_orders = Blueprint("orders", __name__, url_prefix = "/orders")

@bp_orders.get("")
@jwt_required()
@swag_from("../docs/orders/get_all_orders.yaml")
def find_all() :
    claims = get_jwt()
    role = claims.get("role")
    email = claims.get("email")
    try :
        page = max(1, int(request.args.get("page", "1")))
    except ValueError :
        page = 1

    if role == "ADMIN" :
        pagination = OrderService.find_all(page = page)
    else :
        if not email :
            return {"message" : "Email not foud"}, HTTPStatus.UNAUTHORIZED
        pagination = OrderService.find_by_email(email = email, page = page)

    items = [order_to_dto(order).model_dump(mode="json") for order in pagination.items]
    return jsonify({
        "items" : items,
        "page" : pagination.page,
        "per_page" : pagination.per_page,
        "total" : pagination.total,
        "pages" : pagination.pages,
    }), HTTPStatus.OK


@bp_orders.get("/<int:order_id>")
@jwt_required()
@swag_from("../docs/orders/get_order_by_id.yaml")
def find_by_id(order_id : int) :
    order = OrderService.find_by_id(order_id)

    claims = get_jwt()
    role = claims.get("role")
    if role != "ADMIN" :
        requester_email = claims.get("email")
        if not requester_email or requester_email.lower() != (order.email or "").lower() :
            return {"message" : "Forbidden"}, HTTPStatus.FORBIDDEN
    return jsonify(order_to_dto(order).model_dump()), HTTPStatus.OK

@bp_orders.post("/")
@jwt_required()
@swag_from("../docs/orders/create_order.yaml")
def create():
    order_create_dto = OrderInDTO.model_validate_json(request.data)
    created_order = OrderService.create(order_create_dto)
    logger.info("Commande #%s créée avec succès.", created_order.id)
    return jsonify(order_to_dto(created_order).model_dump()), HTTPStatus.CREATED

@bp_orders.delete("/<int:order_id>")
@jwt_required()
@requires_roles("ADMIN")
@swag_from("../docs/orders/delete_order.yaml")
def delete(order_id: int):
    OrderService.delete(order_id)
    return "", HTTPStatus.NO_CONTENT




@bp_orders.patch("/<int:order_id>")
@jwt_required()
def patch_order(order_id : int) :
    claims = get_jwt()
    if claims.get("role") != "ADMIN" :
        return {"message" : "Forbidden"}, HTTPStatus.FORBIDDEN

    data = request.get_json()

    try :
        updated = OrderService.patch(order_id, data)
    except ValueError as e :
        return {"message" : str(e)}, HTTPStatus.UNPROCESSABLE_ENTITY
    
    out = order_to_dto(updated).model_dump()

    if "status" in data :
        status_value = (updated.status.value if hasattr(updated.status, "value") else str(updated.status))
        push_order_event(
            order_id,
            "status_updated",
            {"id" : updated.id, "status" : status_value}
        )
    else :
        push_order_event(order_id, "order_updated", out)

    return jsonify(out), HTTPStatus.OK
