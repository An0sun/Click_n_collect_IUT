from .product_controllers import bp as product_bp
from .user_controllers import user_bp as bp_user
from .auth_controllers import auth_bp as bp_auth

def register_blueprints(app) :
    app.register_blueprint(product_bp)
    app.register_blueprint(bp_user)
    app.register_blueprint(bp_auth)
