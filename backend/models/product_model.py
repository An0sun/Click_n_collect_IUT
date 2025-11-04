from shared.extensions import db
from sqlalchemy import CheckConstraint, Index, Numeric

class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(16), nullable=False)  # "Food" | "Beverage"
    price = db.Column(Numeric(10, 2), nullable=False)    # décimal pour la monnaie
    stock = db.Column(db.Integer, nullable=False, default=0)

    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_product_price_nonneg"),
        CheckConstraint("stock >= 0", name="ck_product_stock_nonneg"),
        CheckConstraint("category IN ('Food','Beverage')", name="ck_product_category_allowed"),
        Index("ix_products_category", "category"),
        Index("ix_products_name", "name"),
    )
