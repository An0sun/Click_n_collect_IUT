from werkzeug.exceptions import NotFound, UnprocessableEntity, Conflict


class OrderNotFound(NotFound):
    """Levée quand une commande n’existe pas."""
    def __init__(self, description: str = "Order not found."):
        super().__init__(description=description)


class InvalidOrder(UnprocessableEntity):
    """Levée quand une commande est invalide (ex: données incohérentes)."""
    def __init__(self, description: str = "Invalid order data."):
        super().__init__(description=description)


class DuplicateOrder(Conflict):
    """Levée quand une commande en double est détectée."""
    def __init__(self, description: str = "Order already exists."):
        super().__init__(description=description)
