from werkzeug.exceptions import NotFound, UnprocessableEntity, Conflict, Unauthorized, Forbidden


class UserNotFound(NotFound):
    def __init__(self, description: str = "User not found."):
        super().__init__(description=description)


class InvalidUser(UnprocessableEntity):
    def __init__(self, description: str = "Invalid user data."):
        super().__init__(description=description)


class DuplicateUser(Conflict):
    def __init__(self, description: str = "User already exists."):
        super().__init__(description=description)


class InvalidCredentials(Unauthorized):
    def __init__(self, description: str = "Invalid email or password."):
        super().__init__(description=description)


class AccessDenied(Forbidden):
    def __init__(self, description: str = "Access denied."):
        super().__init__(description=description)
