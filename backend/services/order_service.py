from exceptions.order_exceptions import OrderNotFound, InvalidOrder
from typing import List
from dtos.order_dto import OrderInDTO
from mappers.order_mapper import order_to_dto
from repositories.order_repository import OrderRepository
from models.order_model import Order
from mappers.order_mapper import dto_to_order



class OrderService:

    def create(order_dto: OrderInDTO) -> Order:
        if not order_dto.items or order_dto.total <= 0:
            raise InvalidOrder("Cannot create an empty or invalid order.")
        order = dto_to_order(order_dto)
        return OrderRepository.create(order)

    def find_all() -> List[Order]:
        return OrderRepository.find_all()

    def find_by_email(email: str) -> List[Order]:
        return OrderRepository.find_by_email(email)

    def find_by_id(order_id: int) -> Order:
        order = OrderRepository.find_by_id(order_id)
        if not order:
            raise OrderNotFound()
        return order

    
    def delete(order_id: int) -> None:
        deleted = OrderRepository.delete(order_id)
        if not deleted:
            raise OrderNotFound()
