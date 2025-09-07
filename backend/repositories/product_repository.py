from models.product_model import Product
from shared.db_connection import db

class ProductRepository:

    @staticmethod
    def get_all():
        return Product.query.all()
    
    @staticmethod
    def get_by_id(id_product):
        return Product.query.get(id_product)
    
    @staticmethod
    def create(product):
        db.session.add(product)
        db.session.commit()
        return product