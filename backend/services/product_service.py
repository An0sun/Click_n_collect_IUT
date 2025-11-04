from typing import Optional, Dict, Any
from models.product_model import Product
from repositories.product_repository import ProductRepository

_ALLOWED_FIELDS = {"name", "description", "category", "price", "stock"}

class ProductService:
    @staticmethod
    def list(
        q: Optional[str],
        category: Optional[str],
        sort: Optional[str],
        page: int,
        per_page: int,
    ):
        stmt = ProductRepository.build_query(q=q, category=category, sort=sort)
        return ProductRepository.paginate(stmt, page, per_page)

    @staticmethod
    def create(data: Dict[str, Any]) -> Product:
        data.pop("id", None)
        p = Product(**data)
        return ProductRepository.create(p)

    @staticmethod
    def update(pid: int, data: Dict[str, Any]) -> Optional[Product]:
        p = ProductRepository.get_by_id(pid)
        if not p:
            return None
        for k in _ALLOWED_FIELDS & data.keys():
            setattr(p, k, data[k])
        ProductRepository.save()
        return p

    @staticmethod
    def delete(pid: int) -> bool:
        p = ProductRepository.get_by_id(pid)
        if not p:
            return False
        ProductRepository.delete(p)
        return True
    
    @staticmethod
    def get(pid: int) -> Optional[Product]:
        return ProductRepository.get_by_id(pid)
