from marshmallow import Schema, fields

class ProductoCompatibilidadSchema(Schema):
    producto_id = fields.Int(required=True)
    marca_auto = fields.Str(required=True)
    modelo_auto = fields.Str(required=True)
    ano_desde = fields.Int(required=True)
    ano_hasta = fields.Int(required=False)
