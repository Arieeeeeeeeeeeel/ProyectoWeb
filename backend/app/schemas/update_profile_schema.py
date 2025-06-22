from app import ma
from marshmallow import fields, validate

class UpdateProfileSchema(ma.Schema):
    usuario = fields.String(validate=validate.Length(min=1))
    region = fields.String(validate=validate.Length(min=1))
    comuna = fields.String(validate=validate.Length(min=1))
    correo = fields.Email(validate=validate.Length(min=1))
    telefono = fields.String(validate=validate.Length(min=7, max=20))