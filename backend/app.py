from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import jwt
from functools import wraps


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', None)
        if not auth:
            return jsonify({'error': 'Token faltante'}), 401
        parts = auth.split()
        if parts[0].lower() != 'bearer' or len(parts) != 2:
            return jsonify({'error': 'Formato de token inválido'}), 401
        token = parts[1]
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            # opcionalmente puedes cargar aquí al usuario y pasarlo a la función
            request.user = Usuario.query.get(data['personaid'])
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirado'}), 401
        except Exception:
            return jsonify({'error': 'Token inválido'}), 401
        return f(*args, **kwargs)
    return decorated


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:axeler8@localhost/BD_lyl'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'root'

db = SQLAlchemy(app)


class Usuario(db.Model):
    __tablename__ = 'USUARIO'
    personaid      = db.Column(db.Integer, primary_key=True)
    rut            = db.Column(db.String(20), unique=True, nullable=False)
    nombre         = db.Column(db.String(100), nullable=False)
    apellido       = db.Column(db.String(100), nullable=False)
    correo         = db.Column(db.String(150), unique=True, nullable=False)
    contrasena     = db.Column(db.String(255), nullable=False)
    telefono       = db.Column(db.String(20), nullable=False)
    region         = db.Column(db.String(100), nullable=False)
    comuna         = db.Column(db.String(100), nullable=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    vehiculos      = db.relationship('Vehiculo', backref='usuario', lazy=True)
    compras        = db.relationship('Compra', backref='usuario', lazy=True)
    reservas       = db.relationship('Reserva', backref='usuario', lazy=True)

class Vehiculo(db.Model):
    __tablename__ = 'VEHICULO'
    vehiculo_id      = db.Column(db.Integer, primary_key=True)
    marca            = db.Column(db.String(50), nullable=False)
    modelo           = db.Column(db.String(50), nullable=False)
    ano              = db.Column(db.Integer, nullable=False)
    patente          = db.Column(db.String(20), nullable=False)
    tipo_combustible = db.Column(db.String(50), nullable=False)
    color            = db.Column(db.String(30), nullable=False)
    apodo            = db.Column(db.String(50))
    usuario_rut      = db.Column(db.String(20), db.ForeignKey('USUARIO.rut'), nullable=False)
    reservas         = db.relationship('Reserva', backref='vehiculo', lazy=True)

class Servicio(db.Model):
    __tablename__ = 'SERVICIO'
    servicio_id       = db.Column(db.Integer, primary_key=True)
    nombre            = db.Column(db.String(100), nullable=False)
    descripcion       = db.Column(db.Text)
    precio            = db.Column(db.Numeric(10,2), nullable=False)
    duracion_estimada = db.Column(db.Integer)
    a_domicilio       = db.Column(db.Boolean, default=False)
    reservas          = db.relationship('Reserva', backref='servicio', lazy=True)
    ofertas           = db.relationship('Oferta', backref='servicio', lazy=True)

class Producto(db.Model):
    __tablename__ = 'PRODUCTO'
    producto_id    = db.Column(db.Integer, primary_key=True)
    nombre         = db.Column(db.String(100), nullable=False)
    descripcion    = db.Column(db.Text)
    marca          = db.Column(db.String(50))
    modelo         = db.Column(db.String(50))
    ano_compatible = db.Column(db.Integer)
    stock          = db.Column(db.Integer, default=0)
    precio         = db.Column(db.Numeric(10,2), nullable=False)
    rating         = db.Column(db.Numeric(3,2))
    imagen_url     = db.Column(db.String(255))
    ofertas        = db.relationship('Oferta', backref='producto', lazy=True)

class Oferta(db.Model):
    __tablename__ = 'OFERTA'
    oferta_id    = db.Column(db.Integer, primary_key=True)
    tipo         = db.Column(db.String(50))
    descuento    = db.Column(db.Numeric(5,2))
    fecha_inicio = db.Column(db.Date)
    fecha_fin    = db.Column(db.Date)
    servicio_id  = db.Column(db.Integer, db.ForeignKey('SERVICIO.servicio_id'))
    producto_id  = db.Column(db.Integer, db.ForeignKey('PRODUCTO.producto_id'))

class Carrito(db.Model):
    __tablename__ = 'CARRITO'
    carrito_id     = db.Column(db.Integer, primary_key=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    usuario_rut    = db.Column(db.String(20), db.ForeignKey('USUARIO.rut'))
    items          = db.relationship('CarritoItem', backref='carrito', lazy=True, cascade='all, delete-orphan')

class CarritoItem(db.Model):
    __tablename__ = 'CARRITO_ITEM'
    carrito_id   = db.Column(db.Integer, db.ForeignKey('CARRITO.carrito_id'), primary_key=True)
    producto_id  = db.Column(db.Integer, db.ForeignKey('PRODUCTO.producto_id'), primary_key=True)
    cantidad     = db.Column(db.Integer, nullable=False)

class Compra(db.Model):
    __tablename__ = 'COMPRA'
    compra_id           = db.Column(db.Integer, primary_key=True)
    fecha_compra        = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    fecha_entrega_estim = db.Column(db.DateTime)
    total               = db.Column(db.Numeric(10,2), nullable=False)
    estado_pago         = db.Column(db.String(50), nullable=False)
    usuario_rut         = db.Column(db.String(20), db.ForeignKey('USUARIO.rut'), nullable=False)
    detalles            = db.relationship('DetalleCompra', backref='compra', lazy=True, cascade='all, delete-orphan')

class DetalleCompra(db.Model):
    __tablename__ = 'DETALLE_COMPRA'
    compra_id       = db.Column(db.Integer, db.ForeignKey('COMPRA.compra_id'), primary_key=True)
    producto_id     = db.Column(db.Integer, db.ForeignKey('PRODUCTO.producto_id'), primary_key=True)
    cantidad        = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Numeric(10,2), nullable=False)

class Reserva(db.Model):
    __tablename__ = 'RESERVA'
    reserva_id    = db.Column(db.Integer, primary_key=True)
    fecha_reserva = db.Column(db.DateTime, nullable=False)
    estado        = db.Column(db.String(50), nullable=False)
    ubicacion     = db.Column(db.String(255), nullable=False)
    notas         = db.Column(db.Text)
    usuario_rut   = db.Column(db.String(20), db.ForeignKey('USUARIO.rut'), nullable=False)
    vehiculo_id   = db.Column(db.Integer, db.ForeignKey('VEHICULO.vehiculo_id'), nullable=False)
    servicio_id   = db.Column(db.Integer, db.ForeignKey('SERVICIO.servicio_id'), nullable=False)


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    required = ['rut','nombre','apellido','correo','contrasena','telefono','region','comuna']
    if any(field not in data for field in required):
        return jsonify({'error':'Faltan datos obligatorios'}), 400
    if Usuario.query.filter_by(rut=data['rut']).first() or Usuario.query.filter_by(correo=data['correo']).first():
        return jsonify({'error':'Usuario ya existe'}), 400
    user = Usuario(
        rut=data['rut'],
        nombre=data['nombre'],
        apellido=data['apellido'],
        correo=data['correo'],
        contrasena=generate_password_hash(data['contrasena']),
        telefono=data['telefono'],
        region=data['region'],
        comuna=data['comuna']
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message':'Usuario creado','personaid':user.personaid}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data.get('correo') or not data.get('contrasena'):
        return jsonify({'error':'Correo y contraseña requeridos'}), 400
    user = Usuario.query.filter_by(correo=data['correo']).first()
    if not user or not check_password_hash(user.contrasena, data['contrasena']):
        return jsonify({'error':'Credenciales inválidas'}), 401
    token = jwt.encode(
        {'personaid': user.personaid, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    return jsonify({'token': token}), 200


@app.route('/<personaid>/signout', methods=['POST'])
@token_required
def signout(personaid):
    return jsonify({'message':f'Usuario {personaid} ha cerrado sesión'}), 200


@app.route('/recovery', methods=['POST'])
def start_recovery():
    data = request.get_json()
    if not data.get('correo'):
        return jsonify({'error':'Correo requerido'}), 400

    return jsonify({'message':'Recovery token enviado'}), 200

@app.route('/<personaid>/recovery', methods=['PUT'])
def complete_recovery(personaid):
    data = request.get_json()
    if not data.get('token') or not data.get('nueva_contrasena'):
        return jsonify({'error':'Token y nueva_contrasena requeridos'}), 400
   
    return jsonify({'message':f'Contraseña actualizada para {personaid}'}), 200


@app.route('/<personaid>/update_profile', methods=['PUT'])
@token_required
def update_profile(personaid):
    user = Usuario.query.get(personaid)
    if not user:
        return jsonify({'error':'Usuario no encontrado'}), 404
    data = request.get_json()
    for field in ['nombre','apellido','telefono','region','comuna','correo']:
        if field in data:
            setattr(user, field, data[field])
    db.session.commit()
    return jsonify({'message':f'Perfil de {personaid} actualizado'}), 200


@app.route('/<personaid>/purchases', methods=['GET'])
@token_required
def get_purchases(personaid):
    user = Usuario.query.get(personaid)
    if not user:
        return jsonify({'error':'Usuario no encontrado'}), 404
    compras = Compra.query.filter_by(usuario_rut=user.rut).all()
    result = []
    for c in compras:
        detalles = [
            {'producto_id': d.producto_id, 'cantidad': d.cantidad, 'precio_unitario': float(d.precio_unitario)}
            for d in c.detalles
        ]
        result.append({
            'compra_id': c.compra_id,
            'total': float(c.total),
            'estado_pago': c.estado_pago,
            'items': detalles
        })
    return jsonify(result), 200


@app.route('/<personaid>/purchase', methods=['POST'])
@token_required
def create_purchase(personaid):
    user = Usuario.query.get(personaid)
    if not user:
        return jsonify({'error':'Usuario no encontrado'}), 404
    data = request.get_json()
    if 'items' not in data or not isinstance(data['items'], list):
        return jsonify({'error':'Items requeridos'}), 400

    compra = Compra(usuario_rut=user.rut, estado_pago='pendiente', total=0)
    db.session.add(compra)
    db.session.commit() 

    total = 0
    detalles = []
    for it in data['items']:
        prod = Producto.query.get(it.get('producto_id'))
        qty = it.get('cantidad', 0)
        if not prod or qty < 1:
            continue
        subtotal = float(prod.precio) * qty
        total += subtotal
        detalle = DetalleCompra(
            compra_id=compra.compra_id,
            producto_id=prod.producto_id,
            cantidad=qty,
            precio_unitario=prod.precio
        )
        db.session.add(detalle)
        detalles.append({'producto_id': prod.producto_id, 'cantidad': qty, 'subtotal': subtotal})

    compra.total = total
    db.session.commit()

    return jsonify({
        'message': f'Compra creada para {personaid}',
        'compra_id': compra.compra_id,
        'detalles': detalles,
        'total': total
    }), 201


@app.route('/purchase/<int:purchase_id>', methods=['POST'])
@token_required
def update_purchase(purchase_id):
    compra = Compra.query.get(purchase_id)
    if not compra:
        return jsonify({'error': 'Compra no encontrada'}), 404
    data = request.get_json()
    if 'estado_pago' in data:
        compra.estado_pago = data['estado_pago']
        db.session.commit()
    return jsonify({'message': f'Compra {purchase_id} actualizada'}), 200


@app.route('/<int:car_id>/data', methods=['GET'])
@token_required
def vehicle_data(car_id):
    v = Vehiculo.query.get(car_id)
    if not v:
        return jsonify({'error':'Vehículo no encontrado'}), 404
    return jsonify({
        'vehiculo_id': v.vehiculo_id,
        'marca': v.marca,
        'modelo': v.modelo,
        'ano': v.ano,
        'patente': v.patente,
        'tipo_combustible': v.tipo_combustible,
        'color': v.color,
        'apodo': v.apodo,
        'usuario_rut': v.usuario_rut
    }), 200


def serialize_reserva(r):
    return {
        'reserva_id': r.reserva_id,
        'fecha_reserva': r.fecha_reserva.isoformat(),
        'estado': r.estado,
        'ubicacion': r.ubicacion,
        'notas': r.notas,
        'servicio': r.servicio.nombre
    }

@app.route('/<int:car_id>/mechanic_services', methods=['GET'])
@token_required
def list_mechanic_services(car_id):
    reservas = Reserva.query.filter_by(vehiculo_id=car_id)\
        .join(Servicio).filter(Servicio.nombre.ilike('%mecánico%')).all()
    return jsonify([serialize_reserva(r) for r in reservas]), 200

@app.route('/<int:car_id>/visual_services', methods=['GET'])
@token_required
def list_visual_services(car_id):
    reservas = Reserva.query.filter_by(vehiculo_id=car_id)\
        .join(Servicio).filter(Servicio.nombre.ilike('%visual%')).all()
    return jsonify([serialize_reserva(r) for r in reservas]), 200


@app.route('/<personaid>/new_car', methods=['POST'])
@token_required
def new_car(personaid):
    user = Usuario.query.get(personaid)
    if not user:
        return jsonify({'error':'Usuario no encontrado'}), 404
    data = request.get_json()
    required = ['marca','modelo','ano','patente','tipo_combustible','color']
    if any(f not in data for f in required):
        return jsonify({'error':'Faltan datos del vehículo'}), 400
    v = Vehiculo(
        usuario_rut=user.rut,
        marca=data['marca'],
        modelo=data['modelo'],
        ano=data['ano'],
        patente=data['patente'],
        tipo_combustible=data['tipo_combustible'],
        color=data['color'],
        apodo=data.get('apodo')
    )
    db.session.add(v)
    db.session.commit()
    return jsonify({'message':f'Vehículo creado para {personaid}','vehiculo_id':v.vehiculo_id}), 201


@app.route('/<int:car_id>/mechanic_services', methods=['POST'])
@token_required
def create_mechanic_service(car_id):
    data = request.get_json()
    for f in ['usuario_rut','servicio_id','fecha_reserva','ubicacion']:
        if f not in data:
            return jsonify({'error':f'{f} requerido'}), 400
    fecha = datetime.datetime.fromisoformat(data['fecha_reserva'])
    res = Reserva(
        vehiculo_id=car_id,
        usuario_rut=data['usuario_rut'],
        servicio_id=data['servicio_id'],
        fecha_reserva=fecha,
        ubicacion=data['ubicacion'],
        notas=data.get('notas'),
        estado='pendiente'
    )
    db.session.add(res)
    db.session.commit()
    return jsonify({'message':'Reserva mecánica creada','reserva_id':res.reserva_id}), 201

@app.route('/<int:car_id>/visual_services', methods=['POST'])
@token_required
def create_visual_service(car_id):
    data = request.get_json()
    for f in ['usuario_rut','servicio_id','fecha_reserva','ubicacion']:
        if f not in data:
            return jsonify({'error':f'{f} requerido'}), 400
    fecha = datetime.datetime.fromisoformat(data['fecha_reserva'])
    res = Reserva(
        vehiculo_id=car_id,
        usuario_rut=data['usuario_rut'],
        servicio_id=data['servicio_id'],
        fecha_reserva=fecha,
        ubicacion=data['ubicacion'],
        notas=data.get('notas'),
        estado='pendiente'
    )
    db.session.add(res)
    db.session.commit()
    return jsonify({'message':'Reserva visual creada','reserva_id':res.reserva_id}), 201

@app.route('/mechanic_services/<int:mechanic_services_id>', methods=['POST'])
@token_required
def update_mechanic_service(mechanic_services_id):
    r = Reserva.query.get(mechanic_services_id)
    if not r:
        return jsonify({'error':'Reserva no encontrada'}),404
    data = request.get_json()
    if 'estado' in data:
        r.estado = data['estado']
        db.session.commit()
    return jsonify({'message':'Reserva mecánica actualizada'}),200

@app.route('/visual_services/<int:visual_services_id>', methods=['POST'])
@token_required
def update_visual_service(visual_services_id):
    r = Reserva.query.get(visual_services_id)
    if not r:
        return jsonify({'error':'Reserva no encontrada'}),404
    data = request.get_json()
    if 'estado' in data:
        r.estado = data['estado']
        db.session.commit()
    return jsonify({'message':'Reserva visual actualizada'}),200


@app.route('/mechanic_services', methods=['GET'])
def get_all_mechanic_services():
    servicios = Servicio.query.filter(Servicio.nombre.ilike('%mecánico%')).all()
    return jsonify([
        {'servicio_id': s.servicio_id, 'nombre': s.nombre, 'precio': float(s.precio)}
        for s in servicios
    ]), 200

@app.route('/visual_services', methods=['GET'])
def get_all_visual_services():
    servicios = Servicio.query.filter(Servicio.nombre.ilike('%visual%')).all()
    return jsonify([
        {'servicio_id': s.servicio_id, 'nombre': s.nombre, 'precio': float(s.precio)}
        for s in servicios
    ]), 200


@app.route('/products', methods=['GET'])
def get_products():
    prods = Producto.query.all()
    return jsonify([
        {'producto_id': p.producto_id, 'nombre': p.nombre, 'precio': float(p.precio)}
        for p in prods
    ]), 200

@app.route('/products/<int:producto_id>', methods=['GET'])
def get_product(producto_id):
    p = Producto.query.get(producto_id)
    if not p:
        return jsonify({'error':'Producto no encontrado'}), 404
    return jsonify({
        'producto_id': p.producto_id,
        'nombre': p.nombre,
        'descripcion': p.descripcion,
        'marca': p.marca,
        'modelo': p.modelo,
        'ano_compatible': p.ano_compatible,
        'stock': p.stock,
        'precio': float(p.precio),
        'rating': float(p.rating),
        'imagen_url': p.imagen_url
    }), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
