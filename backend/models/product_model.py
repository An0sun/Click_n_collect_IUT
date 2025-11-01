from shared.extensions import db
from datetime import datetime, timezone

class Product(db.Model):
    __tablename__ = "products"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(16), nullable=False)  
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)

    is_deleted = db.Column(db.Boolean, nullable=False, default=False)
    deleted_at = db.Column(db.DateTime(timezone=True), nullable=True)

    def soft_delete(self):
        if self.is_deleted:
            return
        self.is_deleted = True
        self.deleted_at = datetime.now(timezone.utc)

    __table_args__ = (
        db.CheckConstraint("price >= 0", name="ck_product_price_nonneg"),
        db.CheckConstraint("stock >= 0", name="ck_product_stock_nonneg"),
        db.CheckConstraint("category IN ('Food','Beverage')", name="ck_product_category_allowed"),
        db.Index("ix_products_not_deleted", "is_deleted"),
        db.Index("ix_products_category", "category"),
        db.Index("ix_products_price", "price"),
        db.Index("ix_products_stock", "stock"),
        db.Index("ix_products_name", "name"),
    )
