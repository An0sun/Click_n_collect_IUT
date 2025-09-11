from typing import Optional, Dict, Any
from models.product_model import Product
from repositories.product_repository import ProductRepository

class ProductService:
    @staticmethod
    def list(q: Optional[str], category: Optional[str], sort: Optional[str],
             page: int, per_page: int):
        stmt = ProductRepository.build_query(q, category, sort)
        return ProductRepository.paginate(stmt, page, per_page)

    @staticmethod
    def create(data: Dict[str, Any]) -> Product:
        # Règles métier supplémentaires si besoin
        p = Product(**data)
        return ProductRepository.create(p)

    @staticmethod
    def update(pid: int, data: Dict[str, Any]) -> Optional[Product]:
        p = ProductRepository.get_by_id(pid)
        if not p:
            return None
        for k, v in data.items():
            setattr(p, k, v)
        ProductRepository.save()
        return p

    @staticmethod
    def delete(pid: int) -> bool:
        p = ProductRepository.get_by_id(pid)
        if not p:
            return False
        ProductRepository.delete(p)
        return True
