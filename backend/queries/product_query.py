from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator
from flask import request

Category = Literal["Food", "Beverage"]
SortField = Literal["name", "price", "stock", "created_at"]

class ProductListQuery(BaseModel):
    
    q: Optional[str] = None
    category: Optional[Category] = None
    sort: Optional[SortField] = None
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=10, ge=1, le=100)

    @field_validator("q", "category", "sort", mode="before")
    @classmethod
    def clean_empty(cls, v):
        if v is None:
            return None
        s = str(v).strip()
        return s or None

    @classmethod
    def from_request(cls) -> "ProductListQuery":
        return cls.model_validate(request.args.to_dict(flat=True))
