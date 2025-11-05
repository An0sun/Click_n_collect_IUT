from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal, Optional
from enums.user_role import UserRole


class RegisterDTO(BaseModel) : 
    name : str = Field(min_length = 1, max_length = 30)
    first_name : str = Field(min_length = 1, max_length = 20)
    email : EmailStr
    password : str = Field(min_length = 8, max_length = 120)
    
    @field_validator("email")
    @classmethod
    def normalize_and_check_domain(cls, value: str) -> str :
        v = value.lower().strip()
        try :
            local, domain = v.split("@", 1)
        except ValueError :
            raise ValueError("Invalid email")
        if domain != "iut.univ-paris8.fr":
            raise ValueError(f"Email must end with @iut.univ-paris8.fr")
        return v
    

class LoginDTO(BaseModel) :
    email : EmailStr
    password : str = Field(min_length = 8, max_length = 128)

    @field_validator("email")
    @classmethod
    def normalize_and_check_domain(cls, value : str) -> str :
        v = value.lower().strip()
        try :
            _, domain = v.split("@", 1)
        except ValueError :
            raise ValueError("Invalid email")
        if domain != "iut.univ-paris8.fr":
            raise ValueError(f"Email must end with @iut.univ-paris8.fr")
        return v

class UpdateProfileDTO(BaseModel) : 
    name : Optional[str] = Field(default = None, min_length = 1, max_length = 20)
    first_name : Optional[str] = Field(default = None, min_length = 1, max_length = 20)

class PublicUserDTO(BaseModel) :
    id : int
    name : str
    first_name : str
    email : EmailStr
    role: UserRole  

    class Config:
        from_attributes = True
