from flask import Blueprint, jsonify, request
from ..models.reserva import Reserva
from ..models.servicio import Servicio
from app.utils import token_required
from .. import db
import datetime
bp = Blueprint('service', __name__)

def serialize_reserva(r):
    return {
        'reserva_id': r.reserva_id,
        'fecha_reserva': r.fecha_reserva.isoformat(),
        'estado': r.estado,
        'ubicacion': r.ubicacion,
        'notas': r.notas,
        'servicio': r.servicio.nombre
    }

@bp.route('/<int:car_id>/mechanic_services', methods=['GET'])
@token_required
def list_mechanic_services(car_id):
    reservas = Reserva.query.filter_by(vehiculo_id=car_id)\
        .join(Servicio).filter(Servicio.nombre.ilike('%mecánico%')).all()
    return jsonify([serialize_reserva(r) for r in reservas]), 200

@bp.route('/<int:car_id>/visual_services', methods=['GET'])
@token_required
def list_visual_services(car_id):
    reservas = Reserva.query.filter_by(vehiculo_id=car_id)\
        .join(Servicio).filter(Servicio.nombre.ilike('%visual%')).all()
    return jsonify([serialize_reserva(r) for r in reservas]), 200

@bp.route('/mechanic_services', methods=['GET'])
def get_all_mechanic_services():
    servicios = Servicio.query.filter(Servicio.nombre.ilike('%mecánico%')).all()
    return jsonify([
        {'servicio_id': s.servicio_id, 'nombre': s.nombre, 'precio': float(s.precio)}
        for s in servicios
    ]), 200

@bp.route('/visual_services', methods=['GET'])
def get_all_visual_services():
    servicios = Servicio.query.filter(Servicio.nombre.ilike('%visual%')).all()
    return jsonify([
        {'servicio_id': s.servicio_id, 'nombre': s.nombre, 'precio': float(s.precio)}
        for s in servicios
    ]), 200

@bp.route('/<int:car_id>/mechanic_services', methods=['POST'])
@token_required
def create_mechanic_service(car_id):
    data = request.get_json()
    for f in ['usuario_rut','servicio_id','fecha_reserva','ubicacion']:
        if f not in data:
            return jsonify({'error':f'{f} requerido'}), 400
    fecha = datetime.datetime.fromisoformat(data['fecha_reserva'])
    res = Reserva(
        vehiculo_id=car_id,
        usuario_rut=data['usuario_rut'],
        servicio_id=data['servicio_id'],
        fecha_reserva=fecha,
        ubicacion=data['ubicacion'],
        notas=data.get('notas'),
        estado='pendiente'
    )
    db.session.add(res)
    db.session.commit()
    return jsonify({'message':'Reserva mecánica creada','reserva_id':res.reserva_id}), 201

@bp.route('/<int:car_id>/visual_services', methods=['POST'])
@token_required
def create_visual_service(car_id):
    data = request.get_json()
    for f in ['usuario_rut','servicio_id','fecha_reserva','ubicacion']:
        if f not in data:
            return jsonify({'error':f'{f} requerido'}), 400
    fecha = datetime.datetime.fromisoformat(data['fecha_reserva'])
    res = Reserva(
        vehiculo_id=car_id,
        usuario_rut=data['usuario_rut'],
        servicio_id=data['servicio_id'],
        fecha_reserva=fecha,
        ubicacion=data['ubicacion'],
        notas=data.get('notas'),
        estado='pendiente'
    )
    db.session.add(res)
    db.session.commit()
    return jsonify({'message':'Reserva visual creada','reserva_id':res.reserva_id}), 201

@bp.route('/mechanic_services/<int:mechanic_services_id>', methods=['POST'])
@token_required
def update_mechanic_service(mechanic_services_id):
    r = Reserva.query.get(mechanic_services_id)
    if not r:
        return jsonify({'error':'Reserva no encontrada'}),404
    data = request.get_json()
    if 'estado' in data:
        r.estado = data['estado']
        db.session.commit()
    return jsonify({'message':'Reserva mecánica actualizada'}),200

@bp.route('/visual_services/<int:visual_services_id>', methods=['POST'])
@token_required
def update_visual_service(visual_services_id):
    r = Reserva.query.get(visual_services_id)
    if not r:
        return jsonify({'error':'Reserva no encontrada'}),404
    data = request.get_json()
    if 'estado' in data:
        r.estado = data['estado']
        db.session.commit()
    return jsonify({'message':'Reserva visual actualizada'}),200