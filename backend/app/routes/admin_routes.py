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
def crear_producto():
    data = request.get_json()
    # Convertir ano_compatible a None si viene vacío o string vacío
    ano_compatible = data.get('ano_compatible')
    if ano_compatible in (None, '', ' '):
        ano_compatible = None
    else:
        try:
            ano_compatible = int(ano_compatible)
        except Exception:
            ano_compatible = None
    p = Producto(
        nombre=data['nombre'],
        descripcion=data.get('descripcion',''),
        marca=data.get('marca',''),
        modelo=data.get('modelo',''),
        ano_compatible=ano_compatible,
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
def editar_producto(producto_id):
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
def eliminar_producto(producto_id):
    p = Producto.query.get(producto_id)
    if not p:
        return jsonify({'error':'Producto no encontrado'}),404
    db.session.delete(p)
    db.session.commit()
    return jsonify({'message':'Producto eliminado'}),200

# --- USUARIOS ---
@bp.route('/usuarios', methods=['GET'])
@token_required
def listar_usuarios():
    usuarios = Usuario.query.all()
    return jsonify([
        {'id':u.personaid,'nombre':u.usuario,'email':u.correo}
        for u in usuarios
    ]),200

@bp.route('/usuarios/<int:usuario_id>', methods=['DELETE'])
@token_required
def eliminar_usuario(usuario_id):
    u = Usuario.query.get(usuario_id)
    if not u:
        return jsonify({'error':'Usuario no encontrado'}),404
    db.session.delete(u)
    db.session.commit()
    return jsonify({'message':'Usuario eliminado'}),200

# --- RESERVAS ---
@bp.route('/reservas', methods=['GET'])
@token_required
def listar_reservas():
    reservas = Reserva.query.all()
    return jsonify([
        {'id':r.reserva_id,'cliente':r.usuario_rut,'fecha':r.fecha_reserva.isoformat(),'estado':r.estado,'detalle':r.notas}
        for r in reservas
    ]),200

@bp.route('/reservas/<int:reserva_id>', methods=['DELETE'])
@token_required
def eliminar_reserva(reserva_id):
    r = Reserva.query.get(reserva_id)
    if not r:
        return jsonify({'error':'Reserva no encontrada'}),404
    db.session.delete(r)
    db.session.commit()
    return jsonify({'message':'Reserva eliminada'}),200

# --- ESTADÍSTICAS ---
@bp.route('/stats', methods=['GET'])
@token_required
def estadisticas():
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
