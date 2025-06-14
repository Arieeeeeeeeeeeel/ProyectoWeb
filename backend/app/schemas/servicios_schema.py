from app import ma
from ..models.servicio import Servicio

class ServicioSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Servicio
        load_instance = True