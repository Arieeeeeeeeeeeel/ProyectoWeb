from app import ma 
from ..models.usuario import Usuario
from marshmallow import fields, validate

class UsuarioSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Usuario
        load_instance = True

    # Validaciones específicas para los campos
    correo = fields.Email(required=True)  # Validación de formato de correo
    contrasena = fields.String(required=True, load_only=True, validate=validate.Length(min=6))  # `load_only=True` para que no se incluya en las respuestas
    rut = fields.String(required=True)
    telefono = fields.String(required=True)
    region = fields.String(required=True)
    comuna = fields.String(required=True)
    nombre = fields.String(required=True)
    apellido = fields.String(required=True)