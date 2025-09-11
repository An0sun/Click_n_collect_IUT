from flask import Blueprint, jsonify, request
from services.product_service import ProductService

product_bp = Blueprint("products", __name__)

@product_bp.route("/products", methods=["GET"])
def get_products():
    products = ProductService.list_products()
    return jsonify([p.to_dict() for p in products])

@product_bp.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = ProductService.get_product(product_id)
    if not product:
        return jsonify({"error": "Produit non trouvé"}), 404
    return jsonify(product.to_dict())

@product_bp.route("/products", methods=["POST"])
def create_product():
    data = request.json
    product = ProductService.add_product(data)
    return jsonify(product.to_dict()), 201