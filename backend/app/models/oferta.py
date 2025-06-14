from .. import db

class Oferta(db.Model):
    __tablename__ = 'OFERTA'
    oferta_id    = db.Column(db.Integer, primary_key=True)
    tipo         = db.Column(db.String(50))
    descuento    = db.Column(db.Numeric(5,2))
    fecha_inicio = db.Column(db.Date)
    fecha_fin    = db.Column(db.Date)
    servicio_id  = db.Column(db.Integer, db.ForeignKey('SERVICIO.servicio_id'))
    producto_id  = db.Column(db.Integer, db.ForeignKey('PRODUCTO.producto_id'))