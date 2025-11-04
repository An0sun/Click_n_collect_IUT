from models.product_model import Product
from dtos.product_dto import ProductInDTO, ProductUpdateDTO, ProductOutDTO


def product_to_dto(product: Product) -> ProductOutDTO:
    # Prefer model_validate so Pydantic can construct from model/ORM
    return ProductOutDTO.model_validate(product)


def dto_to_product_data(dto: ProductInDTO) -> dict:
    return dto.model_dump()


def dto_to_update_data(dto: ProductUpdateDTO) -> dict:
    return dto.model_dump(exclude_none=True)


def dto_to_product(dto: ProductInDTO) -> Product:
    return Product(**dto.model_dump())


def update_model_from_dto(product: Product, update_dto: ProductUpdateDTO) -> Product:
    for field, value in update_dto.model_dump(exclude_none=True).items():
        setattr(product, field, value)
    return product
