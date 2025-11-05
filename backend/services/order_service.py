from typing import Any, Dict, List
from exceptions.order_exceptions import OrderNotFound, InvalidOrder, ProductNotFound

from dtos.order_dto import OrderInDTO, OrderStatus
from mappers.order_mapper import dto_to_order, order_to_dto
from repositories.order_repository import OrderRepository
from repositories.product_repository import ProductRepository
from models.order_model import Order

from realtime.order_sse import push_order_created
from realtime.product_sse import push_stock_updated

class OrderService:
    def create(order_dto: OrderInDTO) -> Order:
        if not order_dto.items or order_dto.total <= 0:
            raise InvalidOrder("Cannot create an empty or invalid order.")

        order = dto_to_order(order_dto)
        created_order = OrderRepository.create(order)

        OrderService._update_stocks_after_order(created_order)

        payload = {"order": order_to_dto(created_order).model_dump(mode="json")}
        push_order_created(payload)

        return created_order 

    def _update_stocks_after_order(order: Order) -> None:
        for item in order.items:
            product = ProductRepository.get_by_id(item.product_id)
            if not product:
                raise ProductNotFound("Product not found.")

            new_stock = max(product.stock - item.quantity, 0)
            ProductRepository.update_stock(item.product_id, new_stock)
            push_stock_updated(item.product_id, {"id": item.product_id, "stock": new_stock})

    def find_all(page: int = 1) :
        try :
            page = max(1, int(page or 1))
        except (TypeError, ValueError) :
            page = 1
        return OrderRepository.paginate_all(page = page, per_page = 20)

    def find_by_email(email : str, page : int = 1) :
        try :
            page = max(1, int(page or 1))
        except (TypeError, ValueError) :
            page = 1
        return OrderRepository.paginate_by_email(email = email, page = page, per_page = 20)

    def find_by_id(order_id: int) -> Order:
        order = OrderRepository.find_by_id(order_id)
        if not order:
            raise OrderNotFound()
        return order

    def delete(order_id: int) -> None:
        deleted = OrderRepository.delete(order_id)
        if not deleted:
            raise OrderNotFound()

    def patch(order_id: int, changes: Dict[str, Any]) -> Order:
        if "status" in changes and changes["status"] not in {s.value for s in OrderStatus}:
            raise ValueError("Invalid status")

        updated = OrderRepository.patch(order_id, changes)
        if not updated:
            raise OrderNotFound()
        return updated
