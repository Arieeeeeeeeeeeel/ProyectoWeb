from .. import db

class CarritoItem(db.Model):
    __tablename__ = 'CARRITO_ITEM'
    carrito_id   = db.Column(db.Integer, db.ForeignKey('CARRITO.carrito_id'), primary_key=True)
    producto_id  = db.Column(db.Integer, db.ForeignKey('PRODUCTO.producto_id'), primary_key=True)
    cantidad     = db.Column(db.Integer, nullable=False)