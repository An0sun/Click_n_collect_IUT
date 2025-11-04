from pydantic import BaseModel, Field, field_validator, field_serializer, ConfigDict
from decimal import Decimal
from typing import Literal, Optional

Category = Literal["Food", "Beverage"]

class ProductInDTO(BaseModel):
    """DTO for product creation."""
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=1, max_length=120)
    description: str = Field(min_length=1, max_length=255)
    category: Category
    price: Decimal = Field(max_digits=10, decimal_places=2)
    stock: int = Field(ge=0)

    @field_validator("name", "description")
    @classmethod
    def strip_non_empty(cls, v: str):
        v2 = v.strip()
        if not v2:
            raise ValueError("value must not be empty")
        return v2


class ProductUpdateDTO(BaseModel):
    """DTO for partial product update."""
    model_config = ConfigDict(extra="ignore")

    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = Field(default=None, min_length=1, max_length=255)
    category: Optional[Category] = None
    price: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2)
    stock: Optional[int] = Field(default=None, ge=0)

    @field_validator("name", "description")
    @classmethod
    def strip_non_empty_opt(cls, v: Optional[str]):
        if v is None:
            return v
        v2 = v.strip()
        if not v2:
            raise ValueError("value must not be empty")
        return v2


class ProductOutDTO(BaseModel):
    """DTO output for a product"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    category: Category
    price: Decimal = Field(max_digits=10, decimal_places=2)
    stock: int

    @field_serializer("price")
    def _ser_price(self, v: Decimal) -> float:
        return float(v)
