from flask import Blueprint, jsonify, request
from ..models.producto import Producto
from ..models.valoracion_producto import ValoracionProducto
from .. import db
from app.utils import token_required
from app.models.producto_compatibilidad import ProductoCompatibilidad

bp = Blueprint('product', __name__)

@bp.route('', methods=['GET'])
@bp.route('/', methods=['GET'])
def get_products():
    prods = Producto.query.all()
    # Obtener compatibilidad para todos los productos
    from app.models.producto_compatibilidad import ProductoCompatibilidad
    compat_map = {}
    for c in ProductoCompatibilidad.query.all():
        compat_map.setdefault(c.producto_id, []).append({
            'marca_auto': c.marca_auto,
            'modelo_auto': c.modelo_auto,
            'ano_desde': c.ano_desde,
            'ano_hasta': c.ano_hasta
        })
    return jsonify([
        {
            'producto_id': p.producto_id,
            'nombre': p.nombre,
            'descripcion': p.descripcion,
            'marca': p.marca,
            'modelo': p.modelo,
            'stock': p.stock,
            'precio': float(p.precio),
            'rating': float(p.rating) if p.rating is not None else 0,
            'imagen_url': p.imagen_url,
            'en_oferta': getattr(p, 'en_oferta', False),
            'mostrar_en_inicio': getattr(p, 'mostrar_en_inicio', False),
            'compatibilidad': compat_map.get(p.producto_id, [])
        }
        for p in prods
    ]), 200

@bp.route('/<int:producto_id>', methods=['GET', 'OPTIONS'])
def get_product(producto_id):
    if request.method == 'OPTIONS':
        return '', 200
    p = Producto.query.get(producto_id)
    if not p:
        return jsonify({'error': 'Producto no encontrado'}), 404
    # Obtener valoración del usuario autenticado si hay token
    user_valoracion = None
    auth = request.headers.get('Authorization', None)
    if auth and auth.lower().startswith('bearer '):
        from app.utils import token_required
        try:
            token = auth.split()[1]
            import jwt
            from flask import current_app as app
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            from ..models.usuario import Usuario
            usuario = Usuario.query.get(data['personaid'])
            if usuario:
                valoracion = ValoracionProducto.query.filter_by(producto_id=producto_id, usuario_id=usuario.personaid).first()
                if valoracion:
                    user_valoracion = float(valoracion.rating)
        except Exception:
            pass
    # Obtener compatibilidades
    from app.models.producto_compatibilidad import ProductoCompatibilidad
    compat = ProductoCompatibilidad.query.filter_by(producto_id=producto_id).all()
    compat_list = [
        {
            'marca_auto': c.marca_auto,
            'modelo_auto': c.modelo_auto,
            'ano_desde': c.ano_desde,
            'ano_hasta': c.ano_hasta
        } for c in compat
    ]
    return jsonify({
        'producto_id': p.producto_id,
        'nombre': p.nombre,
        'descripcion': p.descripcion,
        'marca': p.marca,
        'modelo': p.modelo,
        'stock': p.stock,
        'precio': float(p.precio),
        'rating': float(p.rating) if p.rating is not None else 0,
        'imagen_url': p.imagen_url,
        'en_oferta': getattr(p, 'en_oferta', False),
        'mostrar_en_inicio': getattr(p, 'mostrar_en_inicio', False),
        'user_valoracion': user_valoracion,
        'compatibilidad': compat_list
    }), 200

@bp.route('', methods=['POST'])
@bp.route('/', methods=['POST'])
@token_required
def crear_producto(current_user):
    data = request.get_json()
    compat = data.get('compatibilidad', [])
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
    # Guardar compatibilidad
    for c in compat:
        pc = ProductoCompatibilidad(
            producto_id=p.producto_id,
            marca_auto=c.get('marca_auto'),
            modelo_auto=c.get('modelo_auto'),
            ano_desde=c.get('ano_desde'),
            ano_hasta=c.get('ano_hasta')
        )
        db.session.add(pc)
    db.session.commit()
    return jsonify({'message':'Producto creado','producto_id':p.producto_id}), 201

@bp.route('/<int:producto_id>', methods=['PUT'])
@token_required
def editar_producto(current_user, producto_id):
    p = Producto.query.get(producto_id)
    if not p:
        return jsonify({'error':'Producto no encontrado'}),404
    data = request.get_json()
    print('==== [LOG] PUT /products/<id> data recibido:', data, flush=True)
    compat = data.get('compatibilidad', [])
    print('==== [LOG] compatibilidad recibida:', compat, flush=True)
    for k,v in data.items():
        if hasattr(p,k):
            setattr(p,k,v)
    db.session.commit()
    # Actualizar compatibilidad
    if compat is not None:
        from ..models.producto_compatibilidad import ProductoCompatibilidad
        ProductoCompatibilidad.query.filter_by(producto_id=producto_id).delete()
        print('==== [LOG] compatibilidad previa eliminada', flush=True)
        for c in compat:
            print('==== [LOG] agregando compatibilidad:', c, flush=True)
            pc = ProductoCompatibilidad(
                producto_id=producto_id,
                marca_auto=c.get('marca_auto'),
                modelo_auto=c.get('modelo_auto'),
                ano_desde=c.get('ano_desde'),
                ano_hasta=c.get('ano_hasta')
            )
            db.session.add(pc)
        db.session.commit()
        print('==== [LOG] compatibilidad nueva guardada', flush=True)
    return jsonify({'message':'Producto actualizado'}),200

@bp.route('/<int:producto_id>', methods=['DELETE'])
@token_required
def eliminar_producto(current_user, producto_id):
    p = Producto.query.get(producto_id)
    if not p:
        return jsonify({'error':'Producto no encontrado'}),404
    db.session.delete(p)
    db.session.commit()
    return jsonify({'message':'Producto eliminado'}),200

@bp.route('/update_stock', methods=['POST'])
@token_required
def update_stock(current_user):
    data = request.get_json()
    items = data.get('items', [])

    for item in items:
        producto_id = item.get('producto_id')
        cantidad = item.get('cantidad', 0)
        producto = Producto.query.filter_by(producto_id=producto_id).first()
        if producto and producto.stock >= cantidad:
            producto.stock -= cantidad
        else:
            return jsonify({"error": f"Stock insuficiente para producto {producto_id}"}), 400

    db.session.commit()
    return jsonify({"message": "Stock actualizado correctamente"}), 200

@bp.route('/<int:producto_id>/valorar', methods=['POST'])
@token_required
def valorar_producto(current_user, producto_id):
    print('==== [DEBUG] valoracion: current_user:', current_user, flush=True)
    print('==== [DEBUG] valoracion: headers:', dict(request.headers), flush=True)
    print('==== [DEBUG] valoracion: json:', request.get_json(), flush=True)
    data = request.get_json()
    nuevo_rating = data.get('rating')
    if nuevo_rating is None:
        return jsonify({'error': 'Se requiere un valor de rating'}), 400
    try:
        nuevo_rating = float(nuevo_rating)
        if not (0 <= nuevo_rating <= 5):
            return jsonify({'error': 'El rating debe estar entre 0 y 5'}), 400
    except Exception:
        return jsonify({'error': 'Rating inválido'}), 400
    p = Producto.query.get(producto_id)
    if not p:
        return jsonify({'error': 'Producto no encontrado'}), 404
    usuario = current_user  # Usar el usuario autenticado pasado por el decorador
    print('==== [DEBUG] valoracion: usuario:', usuario, flush=True)
    if not usuario:
        return jsonify({'error': 'Usuario no autenticado'}), 401
    # Buscar si ya existe una valoración de este usuario para este producto
    valoracion = ValoracionProducto.query.filter_by(producto_id=producto_id, usuario_id=usuario.personaid).first()
    if valoracion:
        valoracion.rating = nuevo_rating
    else:
        valoracion = ValoracionProducto(producto_id=producto_id, usuario_id=usuario.personaid, rating=nuevo_rating)
        db.session.add(valoracion)
    db.session.commit()
    # Calcular el promedio
    valoraciones = ValoracionProducto.query.filter_by(producto_id=producto_id).all()
    if valoraciones:
        promedio = sum([float(v.rating) for v in valoraciones]) / len(valoraciones)
        p.rating = promedio
        db.session.commit()
    # Devolver también el user_valoracion
    return jsonify({'message': 'Valoración registrada', 'rating': float(p.rating), 'user_valoracion': nuevo_rating}), 200