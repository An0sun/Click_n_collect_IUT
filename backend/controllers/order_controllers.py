from flask import Blueprint, request, jsonify
from http import HTTPStatus
from dtos.order_dto import OrderInDTO
from flask_jwt_extended import get_jwt, jwt_required
from services.order_service import OrderService
from mappers.order_mapper import order_to_dto

bp_orders = Blueprint("orders", __name__, url_prefix="/orders")


@bp_orders.get("")
@jwt_required()
def find_all() :
    jwt = get_jwt()
    role = jwt.get("role")
    if role == "ADMIN" :
        orders = OrderService.find_all()
    else :
        email = jwt.get("email")
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
