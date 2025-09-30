from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal, Optional



class RegisterDTO(BaseModel) : 
    name : str = Field(min_length = 1, max_length = 30)
    first_name : str = Field(min_length = 1, max_length = 20)
    email : EmailStr
    password : str = Field(min_length = 8, max_length = 120)
    
    @field_validator("email")
    @classmethod
    def normalize_email(login_class, value : str) -> str :
        return value.lower().strip()
    
class LoginDTO(BaseModel) :
    email : EmailStr
    password : str = Field(min_length = 8, max_length = 128)

    @field_validator("email")
    @classmethod
    def normalize_email(login_class, value : str) -> str :
        return value.lower().strip()

class UpdateProfileDTO(BaseModel) : 
    name : Optional[str] = Field(default = None, min_length = 1, max_length = 20)
    first_name : Optional[str] = Field(default = None, min_length = 1, max_length = 20)

    
class PublicUserDTO(BaseModel) :
    id : int
    name : str
    first_name : str
    email : EmailStr
    role : Literal["CLIENT", "ADMIN"]

    class Config:
        from_attributes = True
