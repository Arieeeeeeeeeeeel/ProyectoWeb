from app import ma
from ..models.oferta import Oferta

class OfertaSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Oferta
        load_instance = True