class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:Cachulo1500_@localhost/BD_lyl'
    SQLALCHEMY_TRACK_MODIFICATIONS = False 
    SECRET_KEY = 'root'
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = False
    MAIL_USE_SSL = True
    MAIL_USERNAME = 'send.mailslyl@gmail.com'  # Cambiar por tu correo
    MAIL_PASSWORD = 'Web y Movil'  # Cambiar por tu contraseña
    MAIL_DEFAULT_SENDER = 'send.mailslyl@gmail.com'
