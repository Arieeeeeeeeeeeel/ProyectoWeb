# Proyecto LYL

Aplicación web para gestión de servicios automotrices, compras y reservas.

## Integrantes
- Carlos Abarza
- Martín Cevallos
- Ignacio Cuevas
- Vicente Morales
- Ariel Villar

---

## Descripción General
Sistema web que permite a los usuarios gestionar vehículos, comprar productos, reservar servicios,administrar direcciones de envío, entre otras cosas

---

## Frontend

- **Tecnologías:** Angular + Ionic + SCSS
- **Estilos:**
  - Uso de Ionic para componentes y SCSS para personalización.
  - Clases globales en `src/global.scss` para adaptar estilos a la maqueta.

### Ejecución
```sh
cd frontend
npm install
ionic serve
```

---

## Backend

- **Tecnologías:** Flask, SQLAlchemy, Marshmallow
- **Base de datos:** MySQL/MariaDB
- **Autenticación:** JWT

### Ejecución
```sh
cd backend
python3 3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

### Creación de la base de datos
```sh
mysql -u usuario -p < backend/database/bd.sql
```
### Poblado de la base de datos
```sh
mysql -u usuario -p BD_lyl < backend/database/insert.sql
```



## Documentación Técnica

Consulta la [Documentación Técnica](TECHNICAL_README.md) para detalles de arquitectura y configuración.