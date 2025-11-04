from enum import Enum


class UserRole(str, Enum):
    CLIENT = "CLIENT"
    ADMIN = "ADMIN"