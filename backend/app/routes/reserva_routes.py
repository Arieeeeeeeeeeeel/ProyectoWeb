from flask import Blueprint, request, jsonify
from ..models.reserva import Reserva
from .. import db
from app.utils import token_required
from datetime import datetime
import sys  # <-- Agregar para debug

bp = Blueprint('reserva', __name__)

@bp.route('', methods=['POST'])
@bp.route('/', methods=['POST'])
@token_required
def crear_reserva():
    data = request.get_json()
    print('DEBUG: JSON recibido:', data, file=sys.stderr)
    try:
        fecha_reserva = datetime.fromisoformat(data['fecha_reserva'])
        estado = data.get('estado', 'pendiente')
        ubicacion = data['ubicacion']
        notas = data.get('notas', '')
        usuario_rut = data['usuario_rut']
        vehiculo_id = data['vehiculo_id']
        servicio_id = data['servicio_id']
        print('DEBUG: fecha_reserva:', fecha_reserva, file=sys.stderr)
        print('DEBUG: estado:', estado, file=sys.stderr)
        print('DEBUG: ubicacion:', ubicacion, file=sys.stderr)
        print('DEBUG: usuario_rut:', usuario_rut, file=sys.stderr)
        print('DEBUG: vehiculo_id:', vehiculo_id, file=sys.stderr)
        print('DEBUG: servicio_id:', servicio_id, file=sys.stderr)
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
        print('DEBUG: Error al crear reserva:', str(e), file=sys.stderr)
        return jsonify({'error': str(e)}), 400
