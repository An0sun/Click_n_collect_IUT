from werkzeug.exceptions import NotFound, UnprocessableEntity, Conflict, Unauthorized, Forbidden


class UserNotFound(NotFound):
    """Levée quand un utilisateur n’existe pas."""
    def __init__(self, description: str = "User not found."):
        super().__init__(description=description)


class InvalidUser(UnprocessableEntity):
    """Levée quand les données de l'utilisateur sont invalides ou incomplètes."""
    def __init__(self, description: str = "Invalid user data."):
        super().__init__(description=description)


class DuplicateUser(Conflict):
    """Levée quand un utilisateur avec les mêmes informations existe déjà."""
    def __init__(self, description: str = "User already exists."):
        super().__init__(description=description)


class InvalidCredentials(Unauthorized):
    """Levée quand les identifiants fournis sont incorrects."""
    def __init__(self, description: str = "Invalid email or password."):
        super().__init__(description=description)


class AccessDenied(Forbidden):
    """Levée quand un utilisateur tente d'accéder à une ressource non autorisée."""
    def __init__(self, description: str = "Access denied."):
        super().__init__(description=description)
