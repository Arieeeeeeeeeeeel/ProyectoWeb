from flask import Blueprint, jsonify, request
from ..models.vehiculo import Vehiculo
from ..models.usuario import Usuario
from .. import db
from ..config.config import Config
from app.utils import token_required

bp = Blueprint('vehicle', __name__)

@bp.route('/<int:car_id>/data', methods=['GET'])
@token_required
def vehicle_data(car_id):
    v = Vehiculo.query.get(car_id)
    if not v:
        return jsonify({'error':'Vehículo no encontrado'}), 404
    return jsonify({
        'vehiculo_id': v.vehiculo_id,
        'marca': v.marca,
        'modelo': v.modelo,
        'ano': v.ano,
        'patente': v.patente,
        'tipo_combustible': v.tipo_combustible,
        'color': v.color,
        'apodo': v.apodo,
        'usuario_rut': v.usuario_rut
    }), 200

@bp.route('/<personaid>/new_car', methods=['POST'])
@token_required
def new_car(personaid):
    user = Usuario.query.get(personaid)
    if not user:
        return jsonify({'error':'Usuario no encontrado'}), 404
    data = request.get_json()
    required = ['marca','modelo','ano','patente','tipo_combustible','color']
    if any(f not in data for f in required):
        return jsonify({'error':'Faltan datos del vehículo'}), 400
    v = Vehiculo(
        usuario_rut=user.rut,
        marca=data['marca'],
        modelo=data['modelo'],
        ano=data['ano'],
        patente=data['patente'],
        tipo_combustible=data['tipo_combustible'],
        color=data['color'],
        apodo=data.get('apodo')
    )
    db.session.add(v)
    db.session.commit()
    return jsonify({'message':f'Vehículo creado para {personaid}','vehiculo_id':v.vehiculo_id}), 201
