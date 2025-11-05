from werkzeug.exceptions import NotFound, BadRequest


class ProductNotFound(NotFound):
    def __init__(self, description: str = "Product not found."):
        super().__init__(description=description)


class InvalidProduct(BadRequest):
    def __init__(self, description: str = "Invalid product data."):
        super().__init__(description=description)

