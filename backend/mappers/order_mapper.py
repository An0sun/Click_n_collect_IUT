from models.order_model import Order, OrderItem
from dtos.order_dto import OrderDTO, OrderItemDTO, OrderInDTO


def order_to_dto(order: Order) -> OrderDTO:
    return OrderDTO(
        id=order.id,
        customer_name=order.customer_name,
        email=order.email,
        total=order.total,
        created_at=order.created_at,
        items=[
            OrderItemDTO(
                product_id=i.product_id,
                product_name=i.product_name,
                quantity=i.quantity,
                price=i.price
            )
            for i in order.items
        ]
    )


def dto_to_order(order_dto: OrderInDTO) -> Order:
    order = Order(
        customer_name=order_dto.customer_name,
        email=order_dto.email,
        total=order_dto.total,
    )

    order.items = [
        OrderItem(
            product_id=item.product_id,
            product_name=item.product_name,
            quantity=item.quantity,
            price=item.price,
        )
        for item in order_dto.items
    ]
    return order