from app import ma
from ..models.carrito import Carrito

class CarritoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Carrito
        load_instance = True