from models.order_model import Order, OrderItem
from dtos.order_dto import OrderItemDTO, OrderInDTO, OrderOutDTO, OrderStatus
from datetime import datetime

def order_to_dto(order: Order) -> OrderOutDTO:
    return OrderOutDTO(
        id=order.id,
        customer_name=order.customer_name,
        email=order.email,
        total=order.total,
        status = order.status,
        created_at=order.created_at,
        items=[
            OrderItemDTO(
                product_id=item.product_id,
                product_name=item.product_name,
                quantity=item.quantity,
                price=item.price
            )
            for item in order.items
        ]
    )


def dto_to_order(order_dto: OrderInDTO) -> Order:
    order = Order(
        customer_name=order_dto.customer_name,
        email=order_dto.email,
        total=order_dto.total,
        status = OrderStatus.PREPARING.value
    )

    order.items = [
        OrderItem(
            product_id=item.product_id,
            product_name=item.product_name,
            quantity=item.quantity,
            price=item.price
        )
        for item in order_dto.items
    ]

    return order