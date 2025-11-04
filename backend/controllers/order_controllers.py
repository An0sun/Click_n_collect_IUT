from flask import Blueprint, request, jsonify
from http import HTTPStatus
from dtos.order_dto import OrderInDTO, OrderStatus
from flask_jwt_extended import get_jwt, jwt_required
from services.order_service import OrderService
from mappers.order_mapper import order_to_dto
from realtime.order_sse import push_order_event
from mappers.order_mapper import order_to_dto

bp_orders = Blueprint("orders", __name__, url_prefix ="/orders")

@bp_orders.get("")
@jwt_required()
def find_all() :
    claims = get_jwt()
    role = claims.get("role")
    if role == "ADMIN" :
        orders = OrderService.find_all()
    else :
        email = claims.get("email")
        if not email :
            return {"message" : "Email introuvable dans le token"}, HTTPStatus.UNAUTHORIZED
        orders = OrderService.find_by_email(email)

    return jsonify([order_to_dto(o).model_dump() for o in orders]), HTTPStatus.OK

@bp_orders.get("/<int:order_id>")
def find_by_id(order_id: int):
    order = OrderService.find_by_id(order_id)
    return jsonify(order_to_dto(order).model_dump()), HTTPStatus.OK 

@bp_orders.post("/")
def create():
    order_create_dto = OrderInDTO.model_validate_json(request.data)
    created_order = OrderService.create(order_create_dto)
    return jsonify(order_to_dto(created_order).model_dump()), HTTPStatus.CREATED

@bp_orders.delete("/<int:order_id>")
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

    updated = OrderService.patch(order_id, data)
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
