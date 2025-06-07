from flask import Blueprint, jsonify
from ..models.usuario import Usuario
from ..models.compra import Compra
from ..schemas.compra_schema import CompraSchema
from app.utils import token_required

bp = Blueprint('purchases', __name__)

@bp.route('/<personaid>/purchases', methods=['GET'])
@token_required
def get_purchases(personaid):
    user = Usuario.query.get(personaid)
    if not user:
        return jsonify({'error':'Usuario no encontrado'}), 404
    compras = Compra.query.filter_by(usuario_rut=user.rut).all()

    compras_schema = CompraSchema(many=True)
    return compras_schema.jsonify(compras), 200