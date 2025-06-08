from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from ..models.usuario import Usuario
from ..schemas.update_profile_schema import UpdateProfileSchema
from app.utils import token_required
from .. import db
from flask_cors import cross_origin

bp = Blueprint('profile', __name__)

@bp.route('/<personaid>/update_profile', methods=['PUT'])
@cross_origin(origin="*")
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
    
    for field, value in update_data.items():
       setattr(user, field, value)
    db.session.commit()

    from ..schemas.usuario_schema import UsuarioSchema
    user_schema = UsuarioSchema()
    return user_schema.jsonify(user), 200