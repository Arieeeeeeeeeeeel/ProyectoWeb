from .auth_routes import bp as auth_routes
from .user_routes import bp as user_routes
from .purchase_routes import bp as purchase_routes
from .recovery_routes import bp as recovery_routes
from .product_routes import bp as product_routes
from .vehicle_routes import bp as vehicle_routes
from .service_routes import bp as service_routes
from .admin_routes import bp as admin_routes
from .reserva_routes import bp as reserva_routes
from .flow_routes import bp as flow_routes  # <--- Agregar import
from .carrito_routes import bp as carrito_routes
from .ubicacion_routes import bp as ubicacion_routes

def init_app(app):
    app.register_blueprint(auth_routes, url_prefix='/auth')
    app.register_blueprint(user_routes, url_prefix='/profile')
    app.register_blueprint(purchase_routes, url_prefix='/purchases')
    app.register_blueprint(recovery_routes, url_prefix='/recovery')
    app.register_blueprint(product_routes, url_prefix='/products')
    app.register_blueprint(vehicle_routes, url_prefix='/vehicles')
    app.register_blueprint(service_routes, url_prefix='/services')
    app.register_blueprint(admin_routes, url_prefix='/admin')
    app.register_blueprint(reserva_routes, url_prefix='/reservas')
    app.register_blueprint(flow_routes, url_prefix='/api')  # <--- Registrar blueprint
    app.register_blueprint(carrito_routes, url_prefix='/cart')
    app.register_blueprint(ubicacion_routes, url_prefix='/ubicaciones')
