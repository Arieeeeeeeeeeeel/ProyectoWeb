from .. import db

class Producto(db.Model):
    __tablename__ = 'PRODUCTO'
    producto_id    = db.Column(db.Integer, primary_key=True)
    nombre         = db.Column(db.String(100), nullable=False)
    descripcion    = db.Column(db.Text)
    marca          = db.Column(db.String(50))
    modelo         = db.Column(db.String(50))
    stock          = db.Column(db.Integer, default=0)
    precio         = db.Column(db.Numeric(10,2), nullable=False)
    rating         = db.Column(db.Numeric(3,2))
    imagen_url     = db.Column(db.String(255))
    en_oferta      = db.Column(db.Boolean, default=False)  # Nuevo campo
    mostrar_en_inicio = db.Column(db.Boolean, default=False)  # Nuevo campo
    ofertas        = db.relationship('Oferta', backref='producto', lazy=True)
