from typing import Optional, Dict, Any
from models.product_model import Product
from repositories.product_repository import ProductRepository
from exceptions.product_exceptions import ProductNotFound, InvalidProduct

class ProductService:
    def list(
        q: Optional[str],
        category: Optional[str],
        sort: Optional[str],
        page: int,
        per_page: int
    ):
        try:
            page = max(int(page), 1)
            per_page = min(max(int(per_page), 1), 100)
        except (ValueError, TypeError):
            raise InvalidProduct("page and per_page must be valid integers")

        stmt = ProductRepository.build_query(q, category, sort)
        return ProductRepository.paginate(stmt, page, per_page)
    
    def create(data: Dict[str, Any]) -> Product:
        data.pop('id', None)
        if not data.get("name") or not data.get("price"):
            raise InvalidProduct()
        p = Product(**data)
        return ProductRepository.create(p)

    def update(pid: int, data: Dict[str, Any]) -> Optional[Product]:
        if not data or not any(value is not None for value in data.values()):
            raise InvalidProduct()
        product = ProductRepository.get_by_id(pid)
        if not product:
            raise ProductNotFound()

        for key, value in data.items():
            setattr(product, key, value)

        ProductRepository.save()
        return product

    def delete(pid: int) -> bool:
        p = ProductRepository.get_by_id(pid)
        if not p:
            raise ProductNotFound()
        ProductRepository.delete(p)
        return True
