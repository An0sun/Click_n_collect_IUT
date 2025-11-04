from typing import Optional, Dict, Any

from models.product_model import Product
from repositories.product_repository import ProductRepository
from exceptions.product_exceptions import ProductNotFound, InvalidProduct

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
        # normalize pagination params
        try:
            page = max(int(page), 1)
            per_page = min(max(int(per_page), 1), 100)
        except (ValueError, TypeError):
            raise InvalidProduct("page and per_page must be valid integers")

        stmt = ProductRepository.build_query(q=q, category=category, sort=sort)
        return ProductRepository.paginate(stmt, page, per_page)

    @staticmethod
    def create(data: Dict[str, Any]) -> Product:
        data.pop("id", None)
        # basic validation
        if not data.get("name") or data.get("price") is None:
            raise InvalidProduct("Missing required fields: name and price")
        p = Product(**data)
        return ProductRepository.create(p)

    @staticmethod
    def update(pid: int, data: Dict[str, Any]) -> Optional[Product]:
        if not data or not any(value is not None for value in data.values()):
            raise InvalidProduct("No fields to update")

        product = ProductRepository.get_by_id(pid)
        if not product:
            raise ProductNotFound()

        # Only update allowed fields
        for k in _ALLOWED_FIELDS & set(data.keys()):
            setattr(product, k, data[k])

        ProductRepository.save()
        return product

    @staticmethod
    def delete(pid: int) -> bool:
        p = ProductRepository.get_by_id(pid)
        if not p:
            raise ProductNotFound()
        ProductRepository.delete(p)
        return True

    @staticmethod
    def get(pid: int) -> Optional[Product]:
        return ProductRepository.get_by_id(pid)
