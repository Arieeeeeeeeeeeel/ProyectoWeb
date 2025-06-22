from flask import Blueprint, request, jsonify
from app import db
from app.models.carrito import Carrito
from app.models.carrito_item import CarritoItem
from app.models.producto import Producto
from app.schemas.carrito_schema import CarritoSchema
from app.schemas.carrito_item_schema import CarritoItemSchema
from app.utils import token_required

bp = Blueprint('carrito', __name__)

# Obtener el carrito del usuario (por personaid)
@bp.route('/carrito/<int:usuario_id>', methods=['GET'])
@token_required
def get_carrito(current_user, usuario_id):
    carrito = Carrito.query.filter_by(usuario_id=usuario_id).first()
    if not carrito:
        return jsonify({'carrito': None, 'items': []}), 200
    items = CarritoItem.query.filter_by(carrito_id=carrito.carrito_id).all()
    return jsonify({
        'carrito': CarritoSchema().dump(carrito),
        'items': CarritoItemSchema(many=True).dump(items)
    }), 200

# Agregar o actualizar un item en el carrito
@bp.route('/carrito/<int:usuario_id>/item', methods=['POST'])
@token_required
def add_or_update_item(current_user, usuario_id):
    data = request.get_json()
    producto_id = data.get('producto_id')
    cantidad = data.get('cantidad', 1)
    if not producto_id:
        return jsonify({'error': 'producto_id requerido'}), 400
    # Obtener o crear carrito
    carrito = Carrito.query.filter_by(usuario_id=usuario_id).first()
    if not carrito:
        carrito = Carrito(usuario_id=usuario_id)
        db.session.add(carrito)
        db.session.commit()
    # Buscar item existente
    item = CarritoItem.query.filter_by(carrito_id=carrito.carrito_id, producto_id=producto_id).first()
    if item:
        item.cantidad = cantidad
    else:
        item = CarritoItem(carrito_id=carrito.carrito_id, producto_id=producto_id, cantidad=cantidad)
        db.session.add(item)
    db.session.commit()
    return jsonify({'success': True}), 200

# Eliminar un item del carrito
@bp.route('/carrito/<int:usuario_id>/item/<int:producto_id>', methods=['DELETE'])
@token_required
def remove_item(current_user, usuario_id, producto_id):
    carrito = Carrito.query.filter_by(usuario_id=usuario_id).first()
    if not carrito:
        return jsonify({'error': 'Carrito no encontrado'}), 404
    item = CarritoItem.query.filter_by(carrito_id=carrito.carrito_id, producto_id=producto_id).first()
    if not item:
        return jsonify({'error': 'Item no encontrado'}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({'success': True}), 200

# Vaciar el carrito
@bp.route('/carrito/<int:usuario_id>/vaciar', methods=['POST'])
@token_required
def clear_carrito(current_user, usuario_id):
    carrito = Carrito.query.filter_by(usuario_id=usuario_id).first()
    if not carrito:
        return jsonify({'success': True}), 200
    CarritoItem.query.filter_by(carrito_id=carrito.carrito_id).delete()
    db.session.commit()
    return jsonify({'success': True}), 200
