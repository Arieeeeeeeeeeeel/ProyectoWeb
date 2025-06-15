from flask import Blueprint, request, jsonify
from ..models.reserva import Reserva
from .. import db
from app.utils import token_required
from datetime import datetime

bp = Blueprint('reserva', __name__)

@bp.route('', methods=['POST'])
@bp.route('/', methods=['POST'])
@token_required
def crear_reserva():
    data = request.get_json()
    try:
        fecha_reserva = datetime.fromisoformat(data['fecha_reserva'])
        estado = data.get('estado', 'pendiente')
        ubicacion = data['ubicacion']
        notas = data.get('notas', '')
        usuario_rut = data['usuario_rut']
        vehiculo_id = data['vehiculo_id']
        servicio_id = data['servicio_id']
        reserva = Reserva(
            fecha_reserva=fecha_reserva,
            estado=estado,
            ubicacion=ubicacion,
            notas=notas,
            usuario_rut=usuario_rut,
            vehiculo_id=vehiculo_id,
            servicio_id=servicio_id
        )
        db.session.add(reserva)
        db.session.commit()
        return jsonify({'message': 'Reserva creada', 'reserva_id': reserva.reserva_id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
