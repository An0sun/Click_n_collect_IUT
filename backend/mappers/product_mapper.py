from models.product_model import Product
from dtos.product_dto import ProductInDTO, ProductUpdateDTO, ProductOutDTO


def product_to_dto(product: Product) -> ProductOutDTO:
    return ProductOutDTO(
        id=product.id,
        name=product.name,
        description=product.description,
        category=product.category,
        price=product.price,
        stock=product.stock,
    )

def dto_to_product(product_dto: ProductInDTO) -> Product:
    return Product(
        name=product_dto.name,
        description=product_dto.description,
        category=product_dto.category,
        price=product_dto.price,
        stock=product_dto.stock,
    )

def update_model_from_dto(product: Product, update_dto: ProductUpdateDTO) -> Product:
    for field, value in update_dto.model_dump(exclude_none=True).items():
        setattr(product, field, value)
    return product
