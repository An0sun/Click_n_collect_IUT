from datetime import datetime
from enum import Enum
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Enum as SAEnum, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from shared.extensions import db


class UserRole(str, Enum) : 
    CLIENT = "CLIENT"
    ADMIN = "ADMIN"

class User(db.Model) : 
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    name = db.Column(db.String(30), nullable = False)
    first_name = db.Column(db.String(20), nullable = False)
    email = db.Column(db.String(50), nullable = False)
    password_hash = db.Column(String(255), nullable = False)
    role = db.Column(SAEnum(UserRole), nullable = False, default = UserRole.CLIENT)