from typing import List, Optional
from sqlalchemy import select
from models.order_model import Order
from shared.extensions import db


class OrderRepository:
    """Repository layer — accès direct à la base de données pour les commandes"""

    @staticmethod
    def create(order: Order) -> Order:
        """Insère une commande et ses items dans la base"""
        db.session.add(order)
        db.session.commit()
        db.session.refresh(order)  

    @staticmethod
    def find_by_id(order_id: int) -> Optional[Order]:
        """Récupère une commande par son ID"""
        request = select(Order).where(Order.id == order_id)
        return db.session.scalars(request).one_or_none()

    @staticmethod
    def find_all() -> List[Order]:
        """Retourne toutes les commandes triées par date décroissante"""
        request = select(Order).order_by(Order.created_at.desc())
        return db.session.scalars(request).all()

    @staticmethod
    def delete(order_id: int) -> bool:
        """Supprime une commande si elle existe"""
        request = select(Order).where(Order.id == order_id)
        order = db.session.scalars(request).one_or_none()

        if not order:
            return False

        db.session.delete(order)
        db.session.commit()
        return True
