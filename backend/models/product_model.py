from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, Float, CheckConstraint
from shared.extensions import db


class Product(db.Model):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(16), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_product_price_nonneg"),
        CheckConstraint("stock >= 0", name="ck_product_stock_nonneg"),
    )