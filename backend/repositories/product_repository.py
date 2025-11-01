from typing import Optional
from sqlalchemy import select, func, desc, asc, and_, or_
from shared.extensions import db
from models.product_model import Product

class ProductRepository:
    @staticmethod
    def build_query(
        q: Optional[str], 
        category: Optional[str], 
        sort: Optional[str],
        price_min: Optional[float] = None,
        price_max: Optional[float] = None,
        stock_state: Optional[str] = None
        ):
        """Return a SQLAlchemy selectable for filtered products."""
        stmt = select(Product).where(Product.is_deleted.is_(False))

        if q:
            like = f"%{q.lower()}%"
            stmt = stmt.where(
                or_(
                func.lower(Product.name).like(like),
                func.lower(Product.description).like(like),
                )
            )
        # filter by category
        if category:
            stmt = stmt.where(Product.category == category)
        # filter by price range
        if price_min is not None:
            stmt = stmt.where(Product.price >= price_min)
        if price_max is not None:
            stmt = stmt.where(Product.price <= price_max)
        # filter by stock state
        if stock_state == "IN_STOCK":
            stmt = stmt.where(Product.stock > 0)
        elif stock_state == "LOW":
            stmt = stmt.where(and_(Product.stock > 0, Product.stock < 5))
        elif stock_state == "OUT":
            stmt = stmt.where(Product.stock == 0)

        # sorting
        if sort:
            sort_map = {
                "name,asc": asc(Product.name),
                "name,desc": desc(Product.name),
                "price,asc": asc(Product.price),
                "price,desc": desc(Product.price),
                "stock,asc": asc(Product.stock),
                "stock,desc": desc(Product.stock),
            }
            order = sort_map.get(sort, desc(Product.id))
        else:
            order = desc(Product.id)
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
