from .auth import bp as auth_routes
from .user_routes import bp as user_routes
from .purhcase_routes import bp as purchase_routes
from .recovery import bp as recovery_routes

def init_app(app):
    app.register_blueprint(auth_routes, url_prefix='/auth')
    app.register_blueprint(user_routes, url_prefix='/profile')
    app.register_blueprint(purchase_routes, url_prefix='/purchases')
    app.register_blueprint(recovery_routes, url_prefix='/recovery')