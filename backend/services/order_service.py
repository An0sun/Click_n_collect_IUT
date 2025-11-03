from exceptions.order_exceptions import OrderNotFound, InvalidOrder, ProductNotFound
from typing import List
from dtos.order_dto import OrderInDTO
from mappers.order_mapper import dto_to_order
from repositories.order_repository import OrderRepository
from repositories.product_repository import ProductRepository
from models.order_model import Order

class OrderService:

    def create(order_dto: OrderInDTO) -> Order:
        if not order_dto.items or order_dto.total <= 0:
            raise InvalidOrder("Cannot create an empty or invalid order.")
        order = dto_to_order(order_dto)
        created_order = OrderRepository.create(order)
        OrderService._update_stocks_after_order(created_order)
        return OrderRepository.create(order)
    
    def _update_stocks_after_order(order: Order) -> None:

        for item in order.items:
            product = ProductRepository.get_by_id(item.product_id)
            if not product:
                raise ProductNotFound("Product not found.")

            new_stock = max(product.stock - item.quantity, 0)
            ProductRepository.update_stock(item.product_id, new_stock)

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
