from typing import Optional, Iterable, Tuple
from sqlalchemy import select, func, desc, asc
from shared.extensions import db
from models.product_model import Product

class ProductRepository:
    @staticmethod
    def build_query(q: Optional[str], category: Optional[str], sort: Optional[str]):
        stmt = select(Product)
        if q:
            q_like = f"%{q.lower()}%"
            stmt = stmt.where(
                func.lower(Product.name).like(q_like) |
                func.lower(Product.description).like(q_like)
            )
        if category:
            stmt = stmt.where(Product.category == category)

        order = {
            "name_asc":  asc(Product.name),
            "name_desc": desc(Product.name),
            "price_asc": asc(Product.price),
            "price_desc":desc(Product.price),
            "stock_desc":desc(Product.stock),
        }.get(sort or "", desc(Product.id))
        return stmt.order_by(order)

    @staticmethod
    def paginate(stmt, page: int, per_page: int):
        return db.paginate(stmt, page=page, per_page=per_page, error_out=False)

    @staticmethod
    def get_by_id(pid: int) -> Optional[Product]:
        return db.session.get(Product, pid)

    @staticmethod
    def create(p: Product) -> Product:
        db.session.add(p)
        db.session.commit()
        return p

    @staticmethod
    def delete(p: Product) -> None:
        db.session.delete(p)
        db.session.commit()

    @staticmethod
    def save() -> None:
        db.session.commit()
