from flask import Blueprint, request, jsonify
from ..models.usuario import Usuario
from ..models.compra import Compra
from ..schemas.compra_schema import CompraSchema
from app.utils import token_required
from .. import db
from ..models.detalle_compra import DetalleCompra
from ..models.producto import Producto

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

@bp.route('/<personaid>/purchase', methods=['POST'])
@token_required
def create_purchase(personaid):
    user = Usuario.query.get(personaid)
    if not user:
        return jsonify({'error':'Usuario no encontrado'}), 404
    data = request.get_json()
    if 'items' not in data or not isinstance(data['items'], list):
        return jsonify({'error':'Items requeridos'}), 400

    compra = Compra(usuario_rut=user.rut, estado_pago='pendiente', total=0)
    db.session.add(compra)
    db.session.commit() 

    total = 0
    detalles = []
    for it in data['items']:
        prod = Producto.query.get(it.get('producto_id'))
        qty = it.get('cantidad', 0)
        if not prod or qty < 1:
            continue
        subtotal = float(prod.precio) * qty
        total += subtotal
        detalle = DetalleCompra(
            compra_id=compra.compra_id,
            producto_id=prod.producto_id,
            cantidad=qty,
            precio_unitario=prod.precio
        )
        db.session.add(detalle)
        detalles.append({'producto_id': prod.producto_id, 'cantidad': qty, 'subtotal': subtotal})

    compra.total = total
    db.session.commit()

    return jsonify({
        'message': f'Compra creada para {personaid}',
        'compra_id': compra.compra_id,
        'detalles': detalles,
        'total': total
    }), 201

@bp.route('/purchase/<int:purchase_id>', methods=['POST'])
@token_required
def update_purchase(purchase_id):
    compra = Compra.query.get(purchase_id)
    if not compra:
        return jsonify({'error': 'Compra no encontrada'}), 404
    data = request.get_json()
    if 'estado_pago' in data:
        compra.estado_pago = data['estado_pago']
        db.session.commit()
    return jsonify({'message': f'Compra {purchase_id} actualizada'}), 200
