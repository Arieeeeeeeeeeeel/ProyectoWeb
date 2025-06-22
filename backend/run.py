from app import create_app
# Importa todos los modelos para que SQLAlchemy registre las relaciones correctamente
from app.models import usuario, vehiculo, compra, detalle_compra, producto, oferta, reserva, servicio, carrito, carrito_item, valoracion_producto, producto_compatibilidad, ubicacion

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)