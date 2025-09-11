from sqlalchemy import select
from shared.db import get_session
from models.product import Product

SEED = [
    Product(id=1, name="Espresso", description="Short & strong", category="Beverage", price=1.8, stock=20),
    Product(id=2, name="Latte", description="Milky coffee", category="Beverage", price=3.2, stock=15),
    Product(id=3, name="Croissant", description="Beurre AOP", category="Food", price=1.4, stock=12),
    Product(id=4, name="Pain au chocolat", description="Pâte feuilletée, chocolat", category="Food", price=1.6, stock=0),
]

def seed_products_if_empty():
    with get_session() as s:
        exists = s.scalars(select(Product).limit(1)).first()
        if exists:
            return
        s.add_all(SEED)
        s.commit()
