from flask import Blueprint, request, jsonify
from ..models.reserva import Reserva
from .. import db
from app.utils import token_required
from datetime import datetime
import sys  # <-- Agregar para debug
import bleach

bp = Blueprint('reserva', __name__)

@bp.route('', methods=['POST'])
@bp.route('/', methods=['POST'])
@token_required
def crear_reserva(current_user):
    data = request.get_json()
    print('DEBUG: JSON recibido:', data, file=sys.stderr)
    try:
        fecha_reserva = datetime.fromisoformat(data['fecha_reserva'])
        ubicacion = bleach.clean(data['ubicacion'])
        notas = bleach.clean(data.get('notas', ''))
        usuario_id = data['usuario_id']
        vehiculo_id = data['vehiculo_id']
        servicio_id = data['servicio_id']
        color = bleach.clean(data.get('color', '')) if data.get('color') else None
        nombre_completo = bleach.clean(data['nombre_completo'])
        print('DEBUG: fecha_reserva:', fecha_reserva, file=sys.stderr)
        print('DEBUG: ubicacion:', ubicacion, file=sys.stderr)
        print('DEBUG: usuario_id:', usuario_id, file=sys.stderr)
        print('DEBUG: vehiculo_id:', vehiculo_id, file=sys.stderr)
        print('DEBUG: servicio_id:', servicio_id, file=sys.stderr)
        reserva = Reserva(
            fecha_reserva=fecha_reserva,
            ubicacion=ubicacion,
            notas=notas,
            usuario_id=usuario_id,
            vehiculo_id=vehiculo_id,
            servicio_id=servicio_id,
            nombre_completo=nombre_completo,
            color=color
        )
        db.session.add(reserva)
        db.session.commit()
        return jsonify({'message': 'Reserva creada', 'reserva_id': reserva.reserva_id}), 201
    except Exception as e:
        db.session.rollback()
        print('DEBUG: Error al crear reserva:', str(e), file=sys.stderr)
        return jsonify({'error': str(e)}), 400

@bp.route('/nombre_completo/<int:usuario_id>', methods=['GET'])
@token_required
def obtener_nombre_completo(current_user, usuario_id):
    # Busca la última reserva del usuario y retorna el nombre completo si existe
    reserva = Reserva.query.filter_by(usuario_id=usuario_id).order_by(Reserva.reserva_id.desc()).first()
    if reserva:
        return jsonify({'nombre_completo': reserva.nombre_completo})
    else:
        return jsonify({'nombre_completo': ''})

@bp.route('/fecha/<fecha>', methods=['GET'])
def reservas_por_fecha(fecha):
    from ..models.vehiculo import Vehiculo
    from datetime import datetime
    try:
        fecha_dt = datetime.strptime(fecha, '%Y-%m-%d')
    except ValueError:
        return {'error': 'Formato de fecha inválido. Use YYYY-MM-DD.'}, 400
    reservas = Reserva.query.filter(Reserva.fecha_reserva.between(f'{fecha} 00:00:00', f'{fecha} 23:59:59')).all()
    return [
        {
            'hora': r.fecha_reserva.strftime('%H:%M'),
            'servicio': r.servicio_id,
            'usuario': r.usuario_id,
            'vehiculo_id': r.vehiculo_id
        }
        for r in reservas
    ], 200
