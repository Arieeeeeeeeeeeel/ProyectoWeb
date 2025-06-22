from flask import Blueprint, request, jsonify
from ..models.producto import Producto
from ..models.usuario import Usuario
from ..models.reserva import Reserva
from .. import db
from app.utils import token_required

bp = Blueprint('admin', __name__)

# --- PRODUCTOS ---
@bp.route('/productos', methods=['POST'])
@token_required
def crear_producto(current_user):
    data = request.get_json()
    p = Producto(
        nombre=data['nombre'],
        descripcion=data.get('descripcion',''),
        marca=data.get('marca',''),
        modelo=data.get('modelo',''),
        stock=data.get('stock',0),
        precio=data.get('precio',0),
        rating=data.get('rating',0),
        imagen_url=data.get('imagen_url',''),
        en_oferta=data.get('en_oferta',False),
        mostrar_en_inicio=data.get('mostrar_en_inicio',False)
    )
    db.session.add(p)
    db.session.commit()
    return jsonify({'message':'Producto creado','producto_id':p.producto_id}), 201

@bp.route('/productos/<int:producto_id>', methods=['PUT'])
@token_required
def editar_producto(current_user, producto_id):
    p = Producto.query.get(producto_id)
    if not p:
        return jsonify({'error':'Producto no encontrado'}),404
    data = request.get_json()
    for k,v in data.items():
        if hasattr(p,k):
            setattr(p,k,v)
    db.session.commit()
    return jsonify({'message':'Producto actualizado'}),200

@bp.route('/productos/<int:producto_id>', methods=['DELETE'])
@token_required
def eliminar_producto(current_user, producto_id):
    p = Producto.query.get(producto_id)
    if not p:
        return jsonify({'error':'Producto no encontrado'}),404
    db.session.delete(p)
    db.session.commit()
    return jsonify({'message':'Producto eliminado'}),200

# --- USUARIOS ---
@bp.route('/usuarios', methods=['GET'])
@token_required
def listar_usuarios(current_user):
    usuarios = Usuario.query.all()
    return jsonify([
        {'id':u.personaid,'nombre':u.usuario,'email':u.correo}
        for u in usuarios
    ]),200

@bp.route('/usuarios/<int:usuario_id>', methods=['DELETE'])
@token_required
def eliminar_usuario(current_user, usuario_id):
    u = Usuario.query.get(usuario_id)
    if not u:
        return jsonify({'error':'Usuario no encontrado'}),404
    # Verificar si tiene reservas asociadas
    reservas = Reserva.query.filter_by(usuario_rut=u.rut).all()
    if reservas:
        return jsonify({'error':'No se puede eliminar el usuario porque tiene reservas asociadas.'}), 400
    # Eliminar vehículos asociados
    from ..models.vehiculo import Vehiculo
    Vehiculo.query.filter_by(usuario_rut=u.rut).delete()
    db.session.delete(u)
    db.session.commit()
    return jsonify({'message':'Usuario eliminado'}),200

# --- RESERVAS ---
@bp.route('/reservas', methods=['GET'])
@token_required
def listar_reservas(current_user):
    from ..models.servicio import Servicio
    reservas = Reserva.query.all()
    return jsonify([
        {
            'id': r.reserva_id,
            'cliente': r.usuario_id,  # Mostrar el ID del usuario
            'fecha': r.fecha_reserva.isoformat(),
            'detalle': r.notas,
            'servicio_nombre': r.servicio.nombre if hasattr(r, 'servicio') and r.servicio else None,
            'vehiculo': {
                'marca': r.vehiculo.marca if r.vehiculo else None,
                'modelo': r.vehiculo.modelo if r.vehiculo else None,
                'patente': r.vehiculo.patente if r.vehiculo else None,
                'ano': r.vehiculo.ano if r.vehiculo else None
            } if hasattr(r, 'vehiculo') and r.vehiculo else None,
            'color': r.color if hasattr(r, 'color') else None,
            'ubicacion': r.ubicacion if hasattr(r, 'ubicacion') else None
        }
        for r in reservas
    ]), 200

@bp.route('/reservas/<int:reserva_id>', methods=['DELETE'])
@token_required
def eliminar_reserva(current_user, reserva_id):
    r = Reserva.query.get(reserva_id)
    if not r:
        return jsonify({'error':'Reserva no encontrada'}),404
    db.session.delete(r)
    db.session.commit()
    return jsonify({'message':'Reserva eliminada'}),200

# --- ESTADÍSTICAS ---
@bp.route('/stats', methods=['GET'])
@token_required
def estadisticas(current_user):
    total_usuarios = Usuario.query.count()
    total_productos = Producto.query.count()
    total_ofertas = Producto.query.filter_by(en_oferta=True).count() if hasattr(Producto,'en_oferta') else 0
    total_reservas = Reserva.query.count()
    return jsonify({
        'total_usuarios':total_usuarios,
        'total_productos':total_productos,
        'total_ofertas':total_ofertas,
        'total_reservas':total_reservas
    }),200

# --- Cambios para usar usuario_id en vez de usuario_rut en admin_routes.py ---
# Busca y reemplaza en todas las queries y respuestas
