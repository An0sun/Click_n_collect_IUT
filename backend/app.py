from flask import Flask
from flask_cors import CORS
from shared.db_connection import db
from controllers.product_controllers import product_bp

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
CORS(app)

with app.app_context():
    db.create_all()

app.register_blueprint(product_bp)

if __name__ == "__main__":
    app.run(debug=True)
