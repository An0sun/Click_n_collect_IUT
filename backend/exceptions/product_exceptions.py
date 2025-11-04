from werkzeug.exceptions import NotFound, BadRequest


class ProductNotFound(NotFound):
    """Levée quand un produit n’existe pas."""
    def __init__(self, description: str = "Product not found."):
        super().__init__(description=description)


class InvalidProduct(BadRequest):
    """Levée quand les données d’un produit sont invalides."""
    def __init__(self, description: str = "Invalid product data."):
        super().__init__(description=description)

