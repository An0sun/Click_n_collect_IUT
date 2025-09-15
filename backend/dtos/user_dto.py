# dtos/user_dtos.py (compléments)
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, Literal


class UserOutDTO(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role: Literal["client", "admin"]
    created_at: datetime


class UserUpdateDTO(BaseModel):
    first_name: Optional[str] = Field(default=None, min_length=1, max_length=80)
    last_name: Optional[str] = Field(default=None, min_length=1, max_length=80)
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)


class RoleUpdateDTO(BaseModel):
    role: Literal["client", "admin"]
