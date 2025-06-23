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

@bp.route('/servicios', methods=['GET'])
def get_all_services():
    servicios = Servicio.query.all()
    return jsonify([
        {'servicio_id': s.servicio_id, 'nombre': s.nombre, 'precio': float(s.precio)}
        for s in servicios
    ]), 200
