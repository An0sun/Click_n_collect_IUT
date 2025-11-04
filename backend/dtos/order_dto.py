from pydantic import BaseModel, Field, EmailStr
from typing import List
from datetime import datetime


class OrderItemDTO(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    price: float

class OrderInDTO(BaseModel):
    customer_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    total: float
    items: List[OrderItemDTO]

class OrderOutDTO(OrderInDTO):
    id: int
    created_at: datetime