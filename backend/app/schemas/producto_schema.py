from app import ma
from ..models.producto import Producto
from marshmallow import fields

class ProductoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Producto
        load_instance = True

class ProductoCompradoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Producto
        load_instance = True
        exclude = ('imagen_url', 'rating', 'stock', 'precio')
    
    producto_id = fields.Integer(attribute='id')
    nombre = fields.String()
    descripcion = fields.String()
    marca = fields.String()
    modelo = fields.String()
    ano_compatible = fields.Integer()
