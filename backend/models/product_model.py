from shared.extensions import db

class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(16), nullable=False)  # 'Food' | 'Beverage'
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)

    __table_args__ = (
        db.CheckConstraint("price >= 0", name="ck_product_price_nonneg"),
        db.CheckConstraint("stock >= 0", name="ck_product_stock_nonneg"),
    )
