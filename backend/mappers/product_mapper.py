from models.product_model import Product
from dto.product_dto import ProductInDTO, ProductUpdateDTO, ProductOutDTO

def product_to_dto(p: Product) -> ProductOutDTO:
    return ProductOutDTO.model_validate(p) 

def dto_to_product_data(dto: ProductInDTO) -> dict:
    return dto.model_dump()

def dto_to_update_data(dto: ProductUpdateDTO) -> dict:
    return dto.model_dump(exclude_none=True)
