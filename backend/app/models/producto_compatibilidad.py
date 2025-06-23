from .. import db

class ProductoCompatibilidad(db.Model):
    __tablename__ = 'PRODUCTO_COMPATIBILIDAD'
    producto_id = db.Column(db.Integer, db.ForeignKey('PRODUCTO.producto_id', ondelete='CASCADE'), primary_key=True)
    marca_auto = db.Column(db.String(50), primary_key=True)
    modelo_auto = db.Column(db.String(50), primary_key=True)
    ano_desde = db.Column(db.Integer, primary_key=True)
    ano_hasta = db.Column(db.Integer)
