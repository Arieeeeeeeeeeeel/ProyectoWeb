from app import ma
from marshmallow import fields, validate

class LoginSchema(ma.Schema):
    correo = fields.Email(required=True)
    contrasena = fields.String(required=True, load_only=True, validate=validate.Length(min=6))