from app import ma
from ..models.carrito_item import CarritoItem

class CarritoItemSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = CarritoItem
        load_instance = True