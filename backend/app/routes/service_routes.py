from flask import Blueprint, jsonify, request
from ..models.reserva import Reserva
from ..models.servicio import Servicio
from app.utils import token_required

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