from flask import Blueprint, request, jsonify
from app.models.ubicacion import Direccion
from app.models.usuario import Usuario
from app import db
from app.utils import token_required
import bleach

bp = Blueprint('direccion', __name__)

@bp.route('/api/ubicaciones', methods=['GET'])
@token_required
def get_direcciones(current_user):
    direcciones = Direccion.query.filter_by(usuario_id=current_user.personaid).all()
    return jsonify([
        {
            'direccion_id': d.direccion_id,
            'calle': d.calle,
            'ciudad': d.ciudad,
            'codigoPostal': d.codigo_postal,
            'esPrincipal': d.es_principal
        } for d in direcciones
    ])

@bp.route('/api/ubicaciones', methods=['POST'])
@token_required
def add_direccion(current_user):
    data = request.get_json()
    if data.get('esPrincipal'):
        Direccion.query.filter_by(usuario_id=current_user.personaid).update({'es_principal': False})
    direccion = Direccion(
        usuario_id=current_user.personaid,
        calle=bleach.clean(data['calle']),
        ciudad=bleach.clean(data['ciudad']),
        codigo_postal=bleach.clean(data['codigoPostal']),
        es_principal=data.get('esPrincipal', False)
    )
    db.session.add(direccion)
    db.session.commit()
    return jsonify({'message': 'Dirección agregada', 'direccion_id': direccion.direccion_id}), 201

@bp.route('/api/ubicaciones/<int:direccion_id>', methods=['DELETE'])
@token_required
def delete_direccion(current_user, direccion_id):
    direccion = Direccion.query.filter_by(direccion_id=direccion_id, usuario_id=current_user.personaid).first()
    if not direccion:
        return jsonify({'error': 'Dirección no encontrada'}), 404
    db.session.delete(direccion)
    db.session.commit()
    return jsonify({'message': 'Dirección eliminada'})

@bp.route('/api/ubicaciones/<int:direccion_id>/default', methods=['PUT'])
@token_required
def set_default_direccion(current_user, direccion_id):
    Direccion.query.filter_by(usuario_id=current_user.personaid).update({'es_principal': False})
    direccion = Direccion.query.filter_by(direccion_id=direccion_id, usuario_id=current_user.personaid).first()
    if not direccion:
        return jsonify({'error': 'Dirección no encontrada'}), 404
    direccion.es_principal = True
    db.session.commit()
    return jsonify({'message': 'Dirección marcada como principal'})
