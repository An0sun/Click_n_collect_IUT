from pydantic import BaseModel, Field, field_validator
from typing import Literal, Optional

Category = Literal["Food", "Beverage"]

class ProductInDTO(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str = Field(min_length=1, max_length=255)
    category: Category
    price: float
    stock: int

    @field_validator("price")
    @classmethod
    def non_negative_price(cls, v): 
        if v < 0: raise ValueError("price must be >= 0")
        return v

    @field_validator("stock")
    @classmethod
    def non_negative_stock(cls, v):
        if v < 0: raise ValueError("stock must be >= 0")
        return v

class ProductUpdateDTO(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = Field(default=None, min_length=1, max_length=255)
    category: Optional[Category] = None
    price: Optional[float] = None
    stock: Optional[int] = None

    @field_validator("price")
    @classmethod
    def non_negative_price(cls, v): 
        if v is not None and v < 0: raise ValueError("price must be >= 0")
        return v

    @field_validator("stock")
    @classmethod
    def non_negative_stock(cls, v):
        if v is not None and v < 0: raise ValueError("stock must be >= 0")
        return v

class ProductOutDTO(BaseModel):
    id: int
    name: str
    description: str
    category: Category
    price: float
    stock: int
