from flask import Blueprint, jsonify, request, make_response
from ..models.vehiculo import Vehiculo
from ..models.usuario import Usuario
from .. import db
from ..config.config import Config
from app.utils import token_required
import bleach

bp = Blueprint('vehicle', __name__)


@bp.route('/<int:personaid>/new_car', methods=['POST', 'OPTIONS'])
def new_car(personaid):
    if request.method == 'OPTIONS':
        response = make_response('', 200)
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response
    return _new_car_impl(personaid)

@token_required
def _new_car_impl(current_user, personaid):
    user = Usuario.query.get(personaid)
    if not user:
        return jsonify({'error':'Usuario no encontrado'}), 404
    data = request.get_json()
    required = ['marca','modelo','ano','patente','tipo_combustible','color']
    if any(f not in data for f in required):
        return jsonify({'error':'Faltan datos del vehículo'}), 400
    v = Vehiculo(
        usuario_id=user.personaid,
        marca=bleach.clean(data['marca']),
        modelo=bleach.clean(data['modelo']),
        ano=data['ano'],
        patente=bleach.clean(data['patente']),
        tipo_combustible=bleach.clean(data['tipo_combustible']),
        color=bleach.clean(data['color']),
        apodo=bleach.clean(data.get('apodo','')) if data.get('apodo') else None
    )
    db.session.add(v)
    db.session.commit()
    return jsonify({'message':f'Vehículo creado para {personaid}','vehiculo_id':v.vehiculo_id}), 201

@bp.route('/user/<int:personaid>', methods=['GET', 'OPTIONS'])
def get_vehicles_by_user(personaid):
    if request.method == 'OPTIONS':
        response = make_response('', 200)
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response
    return _get_vehicles_by_user_impl(personaid)

@token_required
def _get_vehicles_by_user_impl(current_user, personaid):
    user = Usuario.query.get(personaid)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    vehicles = Vehiculo.query.filter_by(usuario_id=user.personaid).all()
    return jsonify([
        {
            'vehiculo_id': v.vehiculo_id,
            'marca': v.marca,
            'modelo': v.modelo,
            'ano': v.ano,
            'patente': v.patente,
            'tipo_combustible': v.tipo_combustible,
            'color': v.color,
            'apodo': v.apodo,
            'usuario_id': v.usuario_id
        } for v in vehicles
    ]), 200

@bp.route('/<int:vehiculo_id>', methods=['DELETE', 'OPTIONS'])
def delete_vehicle(vehiculo_id):
    if request.method == 'OPTIONS':
        response = make_response('', 200)
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response
    return _delete_vehicle_impl(vehiculo_id)

@token_required
def _delete_vehicle_impl(current_user, vehiculo_id):
    v = Vehiculo.query.get(vehiculo_id)
    if not v:
        return jsonify({'error': 'Vehículo no encontrado'}), 404
    # Solo permitir borrar si el vehículo pertenece al usuario autenticado
    if v.usuario_id != current_user.personaid:
        return jsonify({'error': 'No autorizado para eliminar este vehículo'}), 403
    db.session.delete(v)
    db.session.commit()
    return jsonify({'message': 'Vehículo eliminado correctamente'}), 200
