import datetime
from .. import db  

class Carrito(db.Model):
    __tablename__ = 'CARRITO'
    carrito_id     = db.Column(db.Integer, primary_key=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    usuario_id     = db.Column(db.Integer, db.ForeignKey('USUARIO.personaid'))
    items          = db.relationship('CarritoItem', backref='carrito', lazy=True, cascade='all, delete-orphan')
