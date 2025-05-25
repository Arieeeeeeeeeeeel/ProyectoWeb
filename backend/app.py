# app.py
from flask import Flask, request, jsonify, Blueprint
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import jwt

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:axeler8@localhost/BD_lyl'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'xd'

db = SQLAlchemy(app)

# Models
class Usuario(db.Model):
    __tablename__ = 'USUARIO'
    rut = db.Column(db.String(20), primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    correo = db.Column(db.String(150), unique=True, nullable=False)
    contrasena = db.Column(db.String(255), nullable=False)
    telefono = db.Column(db.String(20))
    region = db.Column(db.String(100))
    comuna = db.Column(db.String(100))
    fecha_registro = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Vehiculo(db.Model):
    __tablename__ = 'VEHICULO'
    vehiculo_id = db.Column(db.Integer, primary_key=True)
    marca = db.Column(db.String(50))
    modelo = db.Column(db.String(50))
    ano = db.Column(db.Integer)
    patente = db.Column(db.String(20))
    tipo_combustible = db.Column(db.String(50))
    color = db.Column(db.String(30))
    apodo = db.Column(db.String(50))
    usuario_rut = db.Column(db.String(20), db.ForeignKey('USUARIO.rut'))
    usuario = db.relationship('Usuario', backref='vehiculos')

class Servicio(db.Model):
    __tablename__ = 'SERVICIO'
    servicio_id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    precio = db.Column(db.Numeric(10,2), nullable=False)
    duracion_estimada = db.Column(db.Integer)
    a_domicilio = db.Column(db.Boolean, default=False)

class Producto(db.Model):
    __tablename__ = 'PRODUCTO'
    producto_id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    marca = db.Column(db.String(50))
    modelo = db.Column(db.String(50))
    ano_compatible = db.Column(db.Integer)
    stock = db.Column(db.Integer, default=0)
    precio = db.Column(db.Numeric(10,2), nullable=False)
    rating = db.Column(db.Numeric(3,2))
    imagen_url = db.Column(db.String(255))

class Oferta(db.Model):
    __tablename__ = 'OFERTA'
    oferta_id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(50))
    descuento = db.Column(db.Numeric(5,2))
    fecha_inicio = db.Column(db.Date)
    fecha_fin = db.Column(db.Date)
    servicio_id = db.Column(db.Integer, db.ForeignKey('SERVICIO.servicio_id'))
    producto_id = db.Column(db.Integer, db.ForeignKey('PRODUCTO.producto_id'))

class Carrito(db.Model):
    __tablename__ = 'CARRITO'
    carrito_id = db.Column(db.Integer, primary_key=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    usuario_rut = db.Column(db.String(20), db.ForeignKey('USUARIO.rut'))
    items = db.relationship('CarritoItem', backref='carrito', cascade='all, delete-orphan')

class CarritoItem(db.Model):
    __tablename__ = 'CARRITO_ITEM'
    carrito_id = db.Column(db.Integer, db.ForeignKey('CARRITO.carrito_id'), primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('PRODUCTO.producto_id'), primary_key=True)
    cantidad = db.Column(db.Integer, nullable=False)

class Compra(db.Model):
    __tablename__ = 'COMPRA'
    compra_id = db.Column(db.Integer, primary_key=True)
    fecha_compra = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    fecha_entrega_estim = db.Column(db.DateTime)
    total = db.Column(db.Numeric(10,2), nullable=False)
    estado_pago = db.Column(db.String(50))
    usuario_rut = db.Column(db.String(20), db.ForeignKey('USUARIO.rut'))
    detalles = db.relationship('DetalleCompra', backref='compra', cascade='all, delete-orphan')

class DetalleCompra(db.Model):
    __tablename__ = 'DETALLE_COMPRA'
    compra_id = db.Column(db.Integer, db.ForeignKey('COMPRA.compra_id'), primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('PRODUCTO.producto_id'), primary_key=True)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Numeric(10,2), nullable=False)

class Reserva(db.Model):
    __tablename__ = 'RESERVA'
    reserva_id = db.Column(db.Integer, primary_key=True)
    fecha_reserva = db.Column(db.DateTime, nullable=False)
    estado = db.Column(db.String(50))
    ubicacion = db.Column(db.String(255))
    notas = db.Column(db.Text)
    usuario_rut = db.Column(db.String(20), db.ForeignKey('USUARIO.rut'))
    vehiculo_id = db.Column(db.Integer, db.ForeignKey('VEHICULO.vehiculo_id'))
    servicio_id = db.Column(db.Integer, db.ForeignKey('SERVICIO.servicio_id'))

# Recovery tokens (tabla adicional)
class RecoveryToken(db.Model):
    __tablename__ = 'RECOVERY_TOKEN'
    id = db.Column(db.Integer, primary_key=True)
    usuario_rut = db.Column(db.String(20), db.ForeignKey('USUARIO.rut'))
    token = db.Column(db.String(255), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)



with app.app_context():
    db.create_all()


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    required = ['rut','nombre','apellido','correo','contrasena','telefono','region','comuna']
    if any(field not in data for field in required):
        return jsonify({'error':'Faltan datos obligatorios'}),400
    if Usuario.query.get(data['rut']) or Usuario.query.filter_by(correo=data['correo']).first():
        return jsonify({'error':'Usuario ya existe'}),400
    user = Usuario(
        rut=data['rut'], nombre=data['nombre'], apellido=data['apellido'],
        correo=data['correo'], contrasena=generate_password_hash(data['contrasena']),
        telefono=data['telefono'], region=data['region'], comuna=data['comuna']
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message':'Usuario creado','rut':user.rut}),201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data.get('correo') or not data.get('contrasena'):
        return jsonify({'error':'Correo y contraseña requeridos'}),400
    user = Usuario.query.filter_by(correo=data['correo']).first()
    if not user or not check_password_hash(user.contrasena, data['contrasena']):
        return jsonify({'error':'Credenciales inválidas'}),401
    token = jwt.encode({'rut':user.rut,'exp':datetime.datetime.utcnow()+datetime.timedelta(hours=24)},app.config['SECRET_KEY'],algorithm='HS256')
    return jsonify({'token':token}),200


@app.route('/<rut>/signout', methods=['POST'])
def signout(rut):
    return jsonify({'message':f'Usuario {rut} ha cerrado sesión'}),200


@app.route('/recovery', methods=['POST'])
def start_recovery():
    data=request.get_json()
    if not data.get('correo'):
        return jsonify({'error':'Correo requerido'}),400

    return jsonify({'message':'Recovery token enviado'}),200

@app.route('/<rut>/recovery', methods=['PUT'])
def complete_recovery(rut):
    data=request.get_json()
    if not data.get('token') or not data.get('nueva_contrasena'):
        return jsonify({'error':'Token y nueva_contrasena requeridos'}),400

    return jsonify({'message':f'Contraseña actualizada para {rut}'}),200


@app.route('/<rut>/update_profile', methods=['PUT'])
def update_profile(rut):
    user=Usuario.query.get(rut)
    if not user:
        return jsonify({'error':'Usuario no encontrado'}),404
    data=request.get_json()
    for field in ['nombre','apellido','telefono','region','comuna','correo']:
        if field in data:
            setattr(user,field,data[field])
    db.session.commit()
    return jsonify({'message':f'Perfil de {rut} actualizado'}),200


@app.route('/<rut>/purchases', methods=['GET'])
def get_purchases(rut):
    compras=Compra.query.filter_by(usuario_rut=rut).all()
    result=[]
    for c in compras:
        detalles=[{'producto_id':d.producto_id,'cantidad':d.cantidad,'precio_unitario':float(d.precio_unitario)} for d in c.detalles]
        result.append({'compra_id':c.compra_id,'total':float(c.total),'estado_pago':c.estado_pago,'items':detalles})
    return jsonify(result),200


@app.route('/<rut>/purchase', methods=['POST'])
def create_purchase(rut):
    data=request.get_json()
    if 'items' not in data or not isinstance(data['items'],list):
        return jsonify({'error':'Items requeridos'}),400
    total=0
    compra=Compra(usuario_rut=rut,estado_pago='pendiente',total=0)
    db.session.add(compra)
    db.session.flush()
    for it in data['items']:
        prod=Producto.query.get(it.get('producto_id'))
        cantidad=it.get('cantidad',0)
        if not prod or cantidad<1:
            continue
        total+=float(prod.precio)*cantidad
        detalle=DetalleCompra(compra_id=compra.compra_id,producto_id=prod.producto_id,cantidad=cantidad,precio_unitario=prod.precio)
        db.session.add(detalle)
    compra.total=total
    db.session.commit()
    return jsonify({'message':f'Compra creada para {rut}','compra_id':compra.compra_id}),201


@app.route('/<int:purchase_id>', methods=['POST'])
def update_purchase(purchase_id):
    compra=Compra.query.get(purchase_id)
    if not compra:
        return jsonify({'error':'Compra no encontrada'}),404
    data=request.get_json()
    if 'estado_pago' in data:
        compra.estado_pago=data['estado_pago']
        db.session.commit()
    return jsonify({'message':f'Compra {purchase_id} actualizada'}),200


@app.route('/<int:car_id>/data', methods=['GET'])
def vehicle_data(car_id):
    v=Vehiculo.query.get(car_id)
    if not v:
        return jsonify({'error':'Vehículo no encontrado'}),404
    return jsonify({
        'vehiculo_id':v.vehiculo_id,'marca':v.marca,'modelo':v.modelo,'ano':v.ano,'patente':v.patente,
        'tipo_combustible':v.tipo_combustible,'color':v.color,'apodo':v.apodo,'usuario_rut':v.usuario_rut
    }),200


def serialize_reserva(r):return{'reserva_id':r.reserva_id,'fecha_reserva':r.fecha_reserva.isoformat(),'estado':r.estado,'ubicacion':r.ubicacion,'notas':r.notas,'servicio':r.servicio.nombre}

@app.route('/<int:car_id>/mechanic_services', methods=['GET'])
def list_mechanic_services(car_id):
    reservas=Reserva.query.filter_by(vehiculo_id=car_id).join(Servicio).filter(Servicio.nombre.ilike('%mecánico%')).all()
    return jsonify([serialize_reserva(r) for r in reservas]),200

@app.route('/<int:car_id>/visual_services', methods=['GET'])
def list_visual_services(car_id):
    reservas=Reserva.query.filter_by(vehiculo_id=car_id).join(Servicio).filter(Servicio.nombre.ilike('%visual%')).all()
    return jsonify([serialize_reserva(r) for r in reservas]),200


@app.route('/<rut>/new_car', methods=['POST'])
def new_car(rut):
    data=request.get_json()
    required=['marca','modelo','ano','patente','tipo_combustible','color']
    if any(f not in data for f in required):
        return jsonify({'error':'Faltan datos del vehículo'}),400
    v=Vehiculo(usuario_rut=rut,**{k:data[k] for k in required},apodo=data.get('apodo'))
    db.session.add(v);
    db.session.commit()
    return jsonify({'message':f'Vehículo creado para {rut}','vehiculo_id':v.vehiculo_id}),201


@app.route('/<int:car_id>/mechanic_services', methods=['POST'])
def create_mechanic_service(car_id):
    data=request.get_json()
    for f in ['usuario_rut','servicio_id','fecha_reserva','ubicacion']:
        if f not in data:
            return jsonify({'error':f'{f} requerido'}),400
    res=Reserva(vehiculo_id=car_id,usuario_rut=data['usuario_rut'],servicio_id=data['servicio_id'],fecha_reserva=datetime.datetime.fromisoformat(data['fecha_reserva']),ubicacion=data['ubicacion'],notas=data.get('notas'),estado='pendiente')
    db.session.add(res);db.session.commit()
    return jsonify({'message':'Reserva mecánica creada','reserva_id':res.reserva_id}),201

@app.route('/<int:car_id>/visual_services', methods=['POST'])
def create_visual_service(car_id):
    data=request.get_json()
    for f in ['usuario_rut','servicio_id','fecha_reserva','ubicacion']:
        if f not in data:
            return jsonify({'error':f'{f} requerido'}),400
    res=Reserva(vehiculo_id=car_id,usuario_rut=data['usuario_rut'],servicio_id=data['servicio_id'],fecha_reserva=datetime.datetime.fromisoformat(data['fecha_reserva']),ubicacion=data['ubicacion'],notas=data.get('notas'),estado='pendiente')
    db.session.add(res);db.session.commit()
    return jsonify({'message':'Reserva visual creada','reserva_id':res.reserva_id}),201

@app.route('/<int:mechanic_services_id>', methods=['POST'])
def update_mechanic_service(mechanic_services_id):
    r=Reserva.query.get(mechanic_services_id)
    if not r:return jsonify({'error':'Reserva no encontrada'}),404
    data=request.get_json()
    if 'estado' in data: r.estado=data['estado']
    db.session.commit()
    return jsonify({'message':'Reserva mecánica actualizada'}),200

@app.route('/<int:visual_services_id>', methods=['POST'])
def update_visual_service(visual_services_id):
    r=Reserva.query.get(visual_services_id)
    if not r:return jsonify({'error':'Reserva no encontrada'}),404
    data=request.get_json()
    if 'estado' in data: r.estado=data['estado']
    db.session.commit()
    return jsonify({'message':'Reserva visual actualizada'}),200


@app.route('/mechanic_services', methods=['GET'])
def get_all_mechanic_services():
    servicios=Servicio.query.filter(Servicio.nombre.ilike('%mecánico%')).all()
    return jsonify([{'servicio_id':s.servicio_id,'nombre':s.nombre,'precio':float(s.precio)} for s in servicios]),200

@app.route('/visual_services', methods=['GET'])
def get_all_visual_services():
    servicios=Servicio.query.filter(Servicio.nombre.ilike('%visual%')).all()
    return jsonify([{'servicio_id':s.servicio_id,'nombre':s.nombre,'precio':float(s.precio)} for s in servicios]),200


@app.route('/products', methods=['GET'])
def get_products():
    prods=Producto.query.all()
    return jsonify([{'producto_id':p.producto_id,'nombre':p.nombre,'precio':float(p.precio)} for p in prods]),200

@app.route('/product', methods=['GET'])
def get_product():
    pid=request.args.get('id')
    if not pid: return jsonify({'error':'id requerido'}),400
    p=Producto.query.get(pid)
    if not p: return jsonify({'error':'Producto no encontrado'}),404
    return jsonify({'producto_id':p.producto_id,'nombre':p.nombre,'descripcion':p.descripcion,'marca':p.marca,'modelo':p.modelo,'ano_compatible':p.ano_compatible,'stock':p.stock,'precio':float(p.precio),'rating':float(p.rating),'imagen_url':p.imagen_url}),200

if __name__=='__main__':
    with app.app_context(): db.create_all()
    app.run(debug=True)