import datetime
from app import db  

class Carrito(db.Model):
    __tablename__ = 'CARRITO'
    carrito_id     = db.Column(db.Integer, primary_key=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    usuario_rut    = db.Column(db.String(20), db.ForeignKey('USUARIO.rut'))
    items          = db.relationship('CarritoItem', backref='carrito', lazy=True, cascade='all, delete-orphan')
