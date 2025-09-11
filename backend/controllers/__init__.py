from .product_controllers import bp as product_bp

def register_blueprints(app):
    app.register_blueprint(product_bp)
