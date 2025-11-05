from werkzeug.exceptions import NotFound, UnprocessableEntity, Conflict


class OrderNotFound(NotFound):
    def __init__(self, description: str = "Order not found."):
        super().__init__(description=description)


class InvalidOrder(UnprocessableEntity):
    def __init__(self, description: str = "Invalid order data."):
        super().__init__(description=description)


class DuplicateOrder(Conflict):
    def __init__(self, description: str = "Order already exists."):
        super().__init__(description=description)

class ProductNotFound(NotFound):
    def __init__(self, description: str = "Product not found."):
        super().__init__(description=description)