from app import ma
from ..models.carrito_item import CarritoItem
from app.schemas.producto_schema import ProductoSchema

class CarritoItemSchema(ma.SQLAlchemyAutoSchema):
    producto = ma.Nested(ProductoSchema)
    class Meta:
        model = CarritoItem
        load_instance = True