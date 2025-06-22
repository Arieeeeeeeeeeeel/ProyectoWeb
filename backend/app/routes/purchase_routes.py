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
def get_purchases(current_user, personaid):
    user = Usuario.query.get(personaid)
    if not user:
        return jsonify({'error':'Usuario no encontrado'}), 404
    compras = Compra.query.filter_by(usuario_id=user.personaid).all()

    compras_schema = CompraSchema(many=True)
    return compras_schema.jsonify(compras), 200

@bp.route('/<personaid>/purchase', methods=['POST'])
@token_required
def create_purchase(current_user, personaid):
    print(f'DEBUG: POST /purchases/{{personaid}}/purchase llamado con personaid={personaid}')
    user = Usuario.query.get(personaid)
    if not user:
        print('DEBUG: Usuario no encontrado')
        return jsonify({'error':'Usuario no encontrado'}), 404
    data = request.get_json()
    print(f'DEBUG: data recibida: {data}')
    if 'items' not in data or not isinstance(data['items'], list):
        print('DEBUG: Items no válidos o no presentes')
        return jsonify({'error':'Items requeridos'}), 400

    direccion_envio = data.get('direccion_envio')
    compra = Compra(usuario_id=user.personaid, estado_pago='pendiente', total=0, direccion_envio=direccion_envio)
    db.session.add(compra)
    db.session.commit() 

    total = 0
    detalles = []
    try:
        for it in data['items']:
            print(f'DEBUG: procesando item: {it}')
            prod = Producto.query.get(it.get('producto_id'))
            if not prod:
                print(f'DEBUG: Producto no encontrado: {it.get("producto_id")}', flush=True)
                continue
            cantidad = it.get('cantidad', 1)
            if prod.stock < cantidad:
                db.session.rollback()
                return jsonify({'error': f'Stock insuficiente para producto {prod.producto_id}'}), 400
            prod.stock -= cantidad
            subtotal = float(prod.precio) * cantidad
            total += subtotal
            detalle = DetalleCompra(compra_id=compra.compra_id, producto_id=prod.producto_id, cantidad=cantidad, precio_unitario=prod.precio)
            db.session.add(detalle)
            detalles.append(detalle)
        compra.total = total
        compra.estado_pago = 'pagado'
        db.session.commit()
        print(f'DEBUG: Compra creada con id={compra.compra_id}, total={total}, detalles={len(detalles)}')
        return jsonify({'message':'Compra registrada','compra_id':compra.compra_id}), 201
    except Exception as e:
        db.session.rollback()
        print(f'Error al registrar compra: {e}')
        return jsonify({'error': 'Error al registrar la compra'}), 500

@bp.route('/purchase/<int:purchase_id>', methods=['POST'])
@token_required
def update_purchase(current_user, purchase_id):
    compra = Compra.query.get(purchase_id)
    if not compra:
        return jsonify({'error': 'Compra no encontrada'}), 404
    data = request.get_json()
    if 'estado_pago' in data:
        compra.estado_pago = data['estado_pago']
        db.session.commit()
    return jsonify({'message': f'Compra {purchase_id} actualizada'}), 200
