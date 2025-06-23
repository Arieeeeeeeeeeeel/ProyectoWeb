# Documentación Técnica — Proyecto LYL

## Arquitectura General

- **Frontend:** Angular + Ionic + SCSS
- **Backend:** Flask + SQLAlchemy + Marshmallow
- **Base de Datos:** MySQL/MariaDB
- **Autenticación:** JWT
- **Migraciones:** Manuales (bd.sql)

---

## Estructura de Carpetas

```
backend/
  app/
    routes/         # Blueprints de Flask
    models/         # Modelos SQLAlchemy
    schemas/        # Marshmallow
    utils.py        # Utilidades y decoradores
    config/         # Configuración
  database/         # Scripts SQL
frontend/
  src/              # Código Angular/Ionic
otros/
  Especificación de requerimientos.pdf
```
## Variables de entorno

Para configurar la conexión a la base de datos y la clave secreta de JWT, debes editar el archivo `backend/app/config/config.py`.

- Cambia el usuario y la contraseña de la base de datos en la variable de conexión.
- Cambia la `SECRET_KEY` para mayor seguridad.

Ejemplo:
```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://usuario:contraseña@localhost/BD_lyl'
SECRET_KEY = 'tu_clave_secreta'
```

## Modelos Principales

- **Usuario:** Registro, autenticación, perfil.
- **Vehículo:** Autos asociados a usuarios.
- **Producto:** Catálogo de repuestos y servicios.
- **Reserva:** Reservas de servicios.
- **Compra:** Gestión de compras y carrito.
- **Dirección:** Direcciones de envío de usuarios.

---

## Seguridad

- Contraseñas hasheadas con bcrypt.
- JWT para autenticación y autorización.
- Sanitización de entradas con bleach para prevenir XSS.
- Rate limiting en login con Flask-Limiter.
- Validación de datos con Marshmallow.
- CORS restringido a `http://localhost:8100`.