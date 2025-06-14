from app import ma
from ..models.vehiculo import Vehiculo

class VehiculoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Vehiculo
        load_instance = True