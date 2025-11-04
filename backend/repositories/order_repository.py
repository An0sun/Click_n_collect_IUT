from typing import Any, Dict, List, Optional
from sqlalchemy import select
from models.order_model import Order
from shared.extensions import db


class OrderRepository:
    def create(order: Order) -> Order:
        db.session.add(order)
        db.session.commit()
        db.session.refresh(order)  
        return order

    def find_by_id(order_id: int) -> Optional[Order]:
        request = select(Order).where(Order.id == order_id)
        return db.session.scalars(request).one_or_none()

    def find_by_email(email : str) -> List[Order] :
        request = select(Order).where(Order.email == email).order_by(Order.created_at.desc())
        return db.session.scalars(request).all()
    
    def find_all() -> List[Order]:
        request = select(Order).order_by(Order.created_at.desc())
        return db.session.scalars(request).all()

    def delete(order_id: int) -> bool:
        request = select(Order).where(Order.id == order_id)
        order = db.session.scalars(request).one_or_none()

        if not order:
            return False

        db.session.delete(order)
        db.session.commit()
        return True
    
    def patch(order_id : int, changes : Dict[str, Any]) -> Optional[Order] :
        ALLOWED_FIELDS = {"status", "customer_name", "email", "total"}
        order = Order.query.get(order_id)
        if not order :
            return None

        for field in ALLOWED_FIELDS :
            if field in changes :
                if field == "total" :
                    order.total = float(changes["total"])
                else :
                    setattr(order, field, changes[field])

        try :
            db.session.commit()
            db.session.refresh(order)
            return order
        except Exception :
            db.session.rollback()
            raise
