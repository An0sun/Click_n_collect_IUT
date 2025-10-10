from exceptions.order_exceptions import OrderNotFound, InvalidOrder
from typing import List
from dtos.order_dto import OrderInDTO
from mappers.order_mapper import order_to_dto
from repositories.order_repository import OrderRepository
from models.order_model import Order



class OrderService:

    @staticmethod
    def create(order_dto: OrderInDTO) -> Order:
        if not order_dto.items or order_dto.total <= 0:
            raise InvalidOrder("Cannot create an empty or invalid order.")

        order = order_to_dto(order_dto)
        return OrderRepository.create(order)

    @staticmethod
    def find_all() -> List[Order]:
        return OrderRepository.find_all()

    @staticmethod
    def find_by_id(order_id: int) -> Order:
        order = OrderRepository.find_by_id(order_id)
        if not order:
            raise OrderNotFound()
        return order

    @staticmethod
    def delete(order_id: int) -> None:
        deleted = OrderRepository.delete(order_id)
        if not deleted:
            raise OrderNotFound()
