class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:axeler8@localhost/BD_lyl'
    SQLALCHEMY_TRACK_MODIFICATIONS = False 
    SECRET_KEY = 'root'
# Flask-Mail (Gmail)
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'send.mailslyl@gmail.com'
    MAIL_PASSWORD = 'uzse upnt gyzc srsg'
    MAIL_DEFAULT_SENDER = ('Soporte LYL', MAIL_USERNAME)