from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from ..models.usuario import Usuario
from ..schemas.update_profile_schema import UpdateProfileSchema
from app.utils import token_required
from .. import db

bp = Blueprint('user', __name__)

@bp.route('/<personaid>/update_profile', methods=['PUT'])
@token_required
def update_profile(personaid):
    user = Usuario.query.get(personaid)
    if not user:
        return jsonify({'error':'Usuario no encontrado'}), 404
    
    data = request.get_json()
    update_schema = UpdateProfileSchema()
    try:
        update_data = update_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400
    
    for field in update_data:
        setattr(user, field, update_data[field])

    db.session.commit()
    return jsonify({'message':f'Perfil de {personaid} actualizado'}), 200
