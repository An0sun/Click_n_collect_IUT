import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from shared.swagger import init_swagger

from shared.extensions import db, bcrypt, jwt
from shared.errors import register_error_handlers
from controllers import register_blueprints

def create_app():
    load_dotenv()
    app = Flask(__name__, instance_relative_config=True)

    app.url_map.strict_slashes = False

    # Config
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(app.instance_path, "app.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret")
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"
    os.makedirs(app.instance_path, exist_ok=True)

    # Extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    CORS(
        app,
        resources={r"/*": {"origins": "http://localhost:4200"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"]
    )
    with app.app_context():
        from models import product_model, user_model, order_model
        db.create_all()

    # Blueprints + erreurs
    register_blueprints(app)
    register_error_handlers(app)

    init_swagger(app)

    @app.route("/")
    def home():
        return jsonify({"message": "Bienvenue sur l’API Click & Collect 🚀"})

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)