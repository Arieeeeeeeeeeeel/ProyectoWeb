from app import ma
from ..models.detalle_compra import DetalleCompra
from .producto_schema import ProductoCompradoSchema
from marshmallow import fields

class DetalleCompraSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = DetalleCompra
        load_instance = True
    
    producto_id = fields.Integer()
    cantidad = fields.Integer()
    precio_unitario = fields.Float()

    producto = fields.Nested(ProductoCompradoSchema)