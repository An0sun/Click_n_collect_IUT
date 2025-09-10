from models.product_model import Product
from shared.extensions import db

class ProductRepository:
    @staticmethod
    def list_all():
        return Product.query.all()

    @staticmethod
    def get_by_id(pid: int):
        return db.session.get(Product, pid)

    @staticmethod
    def create(product: Product):
        db.session.add(product)
        db.session.commit()
        return product

    @staticmethod
    def update(product: Product):
        db.session.commit()
        return product

    @staticmethod
    def delete(product: Product):
        db.session.delete(product)
        db.session.commit()
