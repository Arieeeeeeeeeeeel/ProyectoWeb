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

---

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