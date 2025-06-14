from app import ma
from ..models.reserva import Reserva

class ReservaSchema(ma.SQLAlchemyAutoSchema): 
    class Meta:
        model = Reserva
        load_instance = True