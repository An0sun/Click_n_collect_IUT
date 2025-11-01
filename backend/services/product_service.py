from typing import Optional, Dict, Any
from models.product_model import Product
from repositories.product_repository import ProductRepository

class ProductService:
    @staticmethod
    def list(
        q: Optional[str],
        category: Optional[str],
        sort: Optional[str],
        page: int,
        per_page: int,
        price_min: Optional[float] = None,
        price_max: Optional[float] = None,
        stock_state: Optional[str] = None,
    ):
        """
        Extended list with optional filters for admin use.
        Filters & pagination are server-side.
        """
        stmt = ProductRepository.build_query(
            q=q,
            category=category,
            sort=sort,
            price_min=price_min,
            price_max=price_max,
            stock_state=stock_state,
        )
        return ProductRepository.paginate(stmt, page, per_page)

    @staticmethod
    def create(data: Dict[str, Any]) -> Product:
        data.pop("id", None)
        p = Product(**data)
        return ProductRepository.create(p)

    @staticmethod
    def update(pid: int, data: Dict[str, Any]) -> Optional[Product]:
        p = ProductRepository.get_by_id(pid)
        if not p or p.is_deleted:
            return None
        for k, v in data.items():
            setattr(p, k, v)
        ProductRepository.save()
        return p

    @staticmethod
    def delete(pid: int) -> bool:
        """Soft delete the product."""
        p = ProductRepository.get_by_id(pid)
        if not p or p.is_deleted:
            return False
        p.soft_delete()
        ProductRepository.save()
        return True
