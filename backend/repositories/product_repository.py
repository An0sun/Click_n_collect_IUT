from typing import Optional, Iterable, Tuple
from sqlalchemy import select, func, desc, asc
from shared.extensions import db
from models.product_model import Product

class ProductRepository:
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

    def paginate(stmt, page: int, per_page: int):
        return db.paginate(stmt, page=page, per_page=per_page, error_out=False)

    def get_by_id(pid : int) -> Optional[Product]:
        return db.session.get(Product, pid)

    def create(p: Product) -> Product:
        db.session.add(p)
        db.session.commit()
        return p

    def delete(p: Product) -> None:
        db.session.delete(p)
        db.session.commit()

    def save() -> None:
        db.session.commit()

    def update_stock(product_id: int, new_stock: int) -> None:
        product = db.session.get(Product, product_id)
        if product:
            product.stock = new_stock
            db.session.commit()
