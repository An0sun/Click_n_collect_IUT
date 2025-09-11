from repositories.product_repository import ProductRepository
from models.product_model import Product

class ProductService:

    @staticmethod
    def create(data: Dict[str, Any]) -> Product:
        p = Product(**data)
        return ProductRepository.create(p)

    @staticmethod
    def get_product(id_product):
        return ProductRepository.get_by_id(id_product)

    @staticmethod
    def add_product(data):
        product = Product(
            name = data["name"],
            description = data["description"],
            category = data["category"],
            price = data["price"],
            quantity = data["quantity"]
        )
        return ProductRepository.create(product)