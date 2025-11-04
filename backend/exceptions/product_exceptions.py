from werkzeug.exceptions import NotFound, Conflict, UnprocessableEntity, BadRequest

class ProductNotFound(NotFound):
    """Levée quand un produit est introuvable."""
    def __init__(self, description: str = "Product not found."):
        super().__init__(description=description)

class DuplicateProduct(Conflict):
    """Levée quand un produit en double est détecté (même nom, etc.)."""
    def __init__(self, description: str = "Product already exists."):
        super().__init__(description=description)

class InvalidProduct(UnprocessableEntity):
    """Levée quand les données d’un produit sont invalides."""
    def __init__(self, description: str = "Invalid product data."):
        super().__init__(description=description)

class BadProductRequest(BadRequest):
    """Levée quand la requête produit est mal formée."""
    def __init__(self, description: str = "Bad request for product endpoint."):
        super().__init__(description=description)
