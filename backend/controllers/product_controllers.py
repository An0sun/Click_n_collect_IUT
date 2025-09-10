from flask import Blueprint, request, jsonify
from repositories.product_repository import ProductRepository
from models.product_model import Product

bp = Blueprint("products", __name__, url_prefix="/api/products")

@bp.get("/")
def list_products():
    products = ProductRepository.list_all()
    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "category": p.category,
            "price": p.price,
            "stock": p.stock,
        } for p in products
    ])

@bp.post("/")
def create_product():
    data = request.get_json()
    product = Product(
        name=data["name"],
        description=data["description"],
        category=data["category"],
        price=data["price"],
        stock=data["stock"]
    )
    ProductRepository.create(product)
    return jsonify({"message": "Produit créé", "id": product.id}), 201
