import json
import os
import tempfile

from backend.app import create_app
from backend.shared.extensions import db


def make_app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    with app.app_context():
        db.create_all()
    return app


def test_create_product_with_image_url():
    app = make_app()
    client = app.test_client()

    payload = {
        "name": "Test",
        "description": "Desc",
        "category": "Food",
        "price": 1.5,
        "stock": 2,
        "image_url": "https://example.com/a.jpg",
    }
    rv = client.post("/products/", data=json.dumps(payload), content_type="application/json")
    assert rv.status_code == 201
    data = rv.get_json()
    assert data["image_url"] == payload["image_url"]


def test_update_product_image_url():
    app = make_app()
    client = app.test_client()

    payload = {
        "name": "Test",
        "description": "Desc",
        "category": "Food",
        "price": 1.5,
        "stock": 2,
    }
    rv = client.post("/products/", data=json.dumps(payload), content_type="application/json")
    assert rv.status_code == 201
    data = rv.get_json()
    pid = data["id"]

    patch = {"image_url": "https://example.com/b.png"}
    rv2 = client.patch(f"/products/{pid}", data=json.dumps(patch), content_type="application/json")
    assert rv2.status_code == 200
    data2 = rv2.get_json()
    assert data2["image_url"] == patch["image_url"]

