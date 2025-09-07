from repositories.product_repository import ProductRepository
from models.product_model import Product

class ProductService:

    @staticmethod
    def list_products():
        return ProductRepository.get_all()
    
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