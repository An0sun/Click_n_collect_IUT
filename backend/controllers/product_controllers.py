from flask import Blueprint, request, jsonify

from dtos.product_dto import ProductInDTO, ProductOutDTO, ProductUpdateDTO
from services.product_service import ProductService
from pydantic import ValidationError


bp = Blueprint("products", __name__, url_prefix="/api/products")

def api_error(code: str, message: str, details=None, status=400):
    body = {"error_code": code, "message": message}
    if details is not None:
        body["details"] = details
    return jsonify(body), status

@bp.get("/")
def list_products():
    q = (request.args.get("q") or "").strip() or None
    category = (request.args.get("category") or "").strip() or None
    sort = (request.args.get("sort") or "").strip() or None
    stock_state = ((request.args.get("stockState") or "").strip() or None)
    if stock_state:
        stock_state = stock_state.upper()

    def to_float(x):
        try:
            return float(x)
        except (TypeError, ValueError):
            return None
    price_min = to_float(request.args.get("priceMin"))
    price_max = to_float(request.args.get("priceMax"))

    try:
        page = max(int(request.args.get("page", 1)), 1)
        # keep backward compatibility: prefer size, accept per_page
        size = request.args.get("size")
        per_page = int(size) if size is not None else int(request.args.get("per_page", 20))
        per_page = min(max(per_page, 1), 100)
    except ValueError:
        return api_error("BAD_PAGINATION", "page/size must be integers")

    pagination = ProductService.list(
        q=q,
        category=category,
        sort=sort,
        page=page,
        per_page=per_page,
        price_min=price_min,
        price_max=price_max,
        stock_state=stock_state,
    )
    items = [
        ProductOutDTO.model_validate(
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "category": p.category,
                "price": p.price,
                "stock": p.stock,
            }
        ).model_dump(mode="json")
        for p in pagination.items
    ]

    return (
        jsonify(
            {
                "items": items,
                "page": page,
                "size": per_page,
                "per_page": per_page, # backward compatibility
                "total": pagination.total,
                "pages": pagination.pages,
            }
        ),
        200,
    )


@bp.post("/")
def create_product():
    data = request.get_json(silent=True) or {}
    try:
        payload = ProductInDTO.model_validate(data).model_dump()
    except ValidationError as e:
        return api_error("VALIDATION_ERROR", "invalid body during creation", e.errors(), 400)
    except Exception as e:
        return api_error("INVALID_BODY", "invalid body during creation", str(e), 400)

    p = ProductService.create(payload)
    return jsonify({"message": "created", "id": p.id}), 201


@bp.patch("/<int:pid>")
@bp.put("/<int:pid>")
def update_product(pid: int):
    data = request.get_json(silent=True) or {}
    try:
        payload = ProductUpdateDTO.model_validate(data).model_dump(
            exclude_none=True
        )
        if not payload:
            return api_error("EMPTY_UPDATE", "no fields to update")
    except ValidationError as e:
        return api_error("VALIDATION_ERROR", "invalid body during update", e.errors(), 400)
    except Exception as e:
        return api_error("INVALID_BODY", "invalid body", str(e), 400)

    p = ProductService.update(pid, payload)
    if not p:
        return api_error("NOT_FOUND", "product not found", status=404)

    return (
        jsonify(
            ProductOutDTO.model_validate(
                {
                    "id": p.id,
                    "name": p.name,
                    "description": p.description,
                    "category": p.category,
                    "price": p.price,
                    "stock": p.stock,
                }
            ).model_dump(mode="json")
        ),
        200,
    )


@bp.delete("/<int:pid>")
def delete_product(pid: int):
    ok = ProductService.delete(pid)
    if not ok:
        return api_error("NOT_FOUND", "product not found", status=404)
    return jsonify({"message": "deleted"}), 200