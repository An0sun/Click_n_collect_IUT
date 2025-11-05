from .product_controllers import bp as product_bp
from .user_controllers import user_bp as bp_user
from .auth_controllers import auth_bp as bp_auth
from .order_controllers import bp_orders
from .sse.order_sse_controller import bp_order_sse
from .sse.product_sse_controller import bp_inventory_sse
def register_blueprints(app) :
    app.register_blueprint(product_bp)
    app.register_blueprint(bp_user)
    app.register_blueprint(bp_auth)
    app.register_blueprint(bp_orders)
    app.register_blueprint(bp_order_sse)
    app.register_blueprint(bp_inventory_sse)
