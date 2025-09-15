# controllers/__init__.py
from flask import Flask

def register_blueprints(app: Flask):
    # produits
    from controllers.product_controller import bp as products_bp
    app.register_blueprint(products_bp)

    # auth
    from controllers.auth_controller import auth_bp
    app.register_blueprint(auth_bp)

    # users
    from controllers.user_controller import bp as users_bp
    app.register_blueprint(users_bp)

    # (plus tard) orders
    # from controllers.order_controller import bp as orders_bp
    # app.register_blueprint(orders_bp)
