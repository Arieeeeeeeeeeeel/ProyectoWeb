from app import ma
from ..models.compra import Compra
from marshmallow import fields
from .detalle_compra_schema import DetalleCompraSchema

class CompraSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Compra
        load_instance = True
    
    detalles = fields.Nested(DetalleCompraSchema, many=True)  # 'many=True' porque es una lista de detalles
    compra_id = fields.Integer()
    total = fields.Float()
    estado_pago = fields.String()
    fecha_compra = fields.DateTime()
    fecha_entrega_estim = fields.DateTime()