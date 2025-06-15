from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_mail import Mail
from flask_cors import CORS  # <-- Agregar CORS
from .config.config import Config


db = SQLAlchemy()
ma = Marshmallow()
mail = Mail()

def create_app():
    flask_app = Flask(__name__)
    flask_app.config.from_object(Config)
    
    db.init_app(flask_app)
    ma.init_app(flask_app)
    mail.init_app(flask_app)

    # Permitir CORS para todos los orígenes
    CORS(flask_app)

    from .routes import init_app 
    init_app(flask_app)

    return flask_app
