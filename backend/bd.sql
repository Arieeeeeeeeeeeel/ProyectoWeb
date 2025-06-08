-- 1. Tablas

CREATE DATABASE IF NOT EXISTS BD_lyl;
USE BD_lyl;

CREATE TABLE USUARIO (
  personaid       INT            NOT NULL AUTO_INCREMENT,
  rut             VARCHAR(20)    NOT NULL UNIQUE,
  nombre          VARCHAR(100)   NOT NULL,
  apellido        VARCHAR(100)   NOT NULL,
  correo          VARCHAR(150)   NOT NULL UNIQUE,
  contrasena      VARCHAR(255)   NOT NULL,
  telefono        VARCHAR(20)    NOT NULL,
  region          VARCHAR(100)   NOT NULL,
  comuna          VARCHAR(100)   NOT NULL,
  fecha_registro  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (personaid)
) ENGINE=InnoDB;

CREATE TABLE VEHICULO (
  vehiculo_id      INT         NOT NULL AUTO_INCREMENT,
  marca            VARCHAR(50) NOT NULL,
  modelo           VARCHAR(50) NOT NULL,
  ano              INT         NOT NULL,
  patente          VARCHAR(20) NOT NULL,
  tipo_combustible VARCHAR(50) NOT NULL,
  color            VARCHAR(30) NOT NULL,
  apodo            VARCHAR(50),
  usuario_rut      VARCHAR(20) NOT NULL,
  PRIMARY KEY (vehiculo_id),
  INDEX idx_usuario_rut (usuario_rut),
  CONSTRAINT fk_veh_usuario FOREIGN KEY (usuario_rut)
    REFERENCES USUARIO(rut)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE SERVICIO (
  servicio_id       INT            NOT NULL AUTO_INCREMENT,
  nombre            VARCHAR(100)   NOT NULL,
  descripcion       TEXT,
  precio            DECIMAL(10,2)  NOT NULL,
  duracion_estimada INT,
  a_domicilio       BOOLEAN        NOT NULL DEFAULT FALSE,
  PRIMARY KEY (servicio_id)
) ENGINE=InnoDB;

CREATE TABLE PRODUCTO (
  producto_id     INT           NOT NULL AUTO_INCREMENT,
  nombre          VARCHAR(100)  NOT NULL,
  descripcion     TEXT,
  marca           VARCHAR(50),
  modelo          VARCHAR(50),
  ano_compatible  INT,
  stock           INT           NOT NULL DEFAULT 0,
  precio          DECIMAL(10,2) NOT NULL,
  rating          DECIMAL(3,2),
  imagen_url      VARCHAR(255),
  PRIMARY KEY (producto_id)
) ENGINE=InnoDB;

CREATE TABLE OFERTA (
  oferta_id     INT            NOT NULL AUTO_INCREMENT,
  tipo          VARCHAR(50),
  descuento     DECIMAL(5,2),
  fecha_inicio  DATE,
  fecha_fin     DATE,
  servicio_id   INT,
  producto_id   INT,
  PRIMARY KEY (oferta_id),
  INDEX idx_oferta_servicio (servicio_id),
  INDEX idx_oferta_producto (producto_id),
  CONSTRAINT fk_oferta_servicio FOREIGN KEY (servicio_id)
    REFERENCES SERVICIO(servicio_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_oferta_producto FOREIGN KEY (producto_id)
    REFERENCES PRODUCTO(producto_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE CARRITO (
  carrito_id      INT         NOT NULL AUTO_INCREMENT,
  fecha_creacion  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuario_rut     VARCHAR(20),
  PRIMARY KEY (carrito_id),
  INDEX idx_carrito_usuario (usuario_rut),
  CONSTRAINT fk_carrito_usuario FOREIGN KEY (usuario_rut)
    REFERENCES USUARIO(rut)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE CARRITO_ITEM (
  carrito_id   INT NOT NULL,
  producto_id  INT NOT NULL,
  cantidad     INT NOT NULL,
  PRIMARY KEY (carrito_id, producto_id),
  INDEX idx_ci_carrito (carrito_id),
  INDEX idx_ci_producto (producto_id),
  CONSTRAINT fk_ci_carrito FOREIGN KEY (carrito_id)
    REFERENCES CARRITO(carrito_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_ci_producto FOREIGN KEY (producto_id)
    REFERENCES PRODUCTO(producto_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE COMPRA (
  compra_id            INT            NOT NULL AUTO_INCREMENT,
  fecha_compra         DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_entrega_estim  DATETIME,
  total                DECIMAL(10,2)  NOT NULL,
  estado_pago          VARCHAR(50)    NOT NULL,
  usuario_rut          VARCHAR(20)    NOT NULL,
  PRIMARY KEY (compra_id),
  INDEX idx_compra_usuario (usuario_rut),
  CONSTRAINT fk_compra_usuario FOREIGN KEY (usuario_rut)
    REFERENCES USUARIO(rut)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE DETALLE_COMPRA (
  compra_id       INT            NOT NULL,
  producto_id     INT            NOT NULL,
  cantidad        INT            NOT NULL,
  precio_unitario DECIMAL(10,2)  NOT NULL,
  PRIMARY KEY (compra_id, producto_id),
  INDEX idx_dc_compra (compra_id),
  INDEX idx_dc_producto (producto_id),
  CONSTRAINT fk_dc_compra FOREIGN KEY (compra_id)
    REFERENCES COMPRA(compra_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_dc_producto FOREIGN KEY (producto_id)
    REFERENCES PRODUCTO(producto_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE RESERVA (
  reserva_id    INT         NOT NULL AUTO_INCREMENT,
  fecha_reserva DATETIME    NOT NULL,
  estado        VARCHAR(50) NOT NULL,
  ubicacion     VARCHAR(255) NOT NULL,
  notas         TEXT,
  usuario_rut   VARCHAR(20) NOT NULL,
  vehiculo_id   INT         NOT NULL,
  servicio_id   INT         NOT NULL,
  PRIMARY KEY (reserva_id),
  INDEX idx_reserva_usuario (usuario_rut),
  INDEX idx_reserva_vehiculo (vehiculo_id),
  INDEX idx_reserva_servicio (servicio_id),
  CONSTRAINT fk_reserva_usuario FOREIGN KEY (usuario_rut)
    REFERENCES USUARIO(rut)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_reserva_vehiculo FOREIGN KEY (vehiculo_id)
    REFERENCES VEHICULO(vehiculo_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_reserva_servicio FOREIGN KEY (servicio_id)
    REFERENCES SERVICIO(servicio_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;


-- 2. Datos de prueba

INSERT INTO USUARIO (rut, nombre, apellido, correo, contrasena, telefono, region, comuna) VALUES
 ('11.111.111-1', 'Juan',   'Pérez',  'juan.perez@mail.cl',   'hashclave1', '912345678', 'Metropolitana', 'Santiago'),
 ('22.222.222-2', 'María',  'Gómez',  'maria.gomez@mail.cl',  'hashclave2', '923456789', 'Valparaíso',    'Viña del Mar'),
 ('33.333.333-3', 'Carlos', 'Rojas',  'carlos.rojas@mail.cl', 'hashclave3', '934567890', 'Biobío',         'Concepción');

INSERT INTO VEHICULO (marca, modelo, ano, patente, tipo_combustible, color, apodo, usuario_rut) VALUES
 ('Toyota', 'Corolla', 2020, 'ABC123', 'Gasolina', 'Blanco', 'MiCorolla', '11.111.111-1'),
 ('Honda',  'Civic',   2018, 'XYZ987', 'Diésel',   'Negro',  'Civi',      '22.222.222-2');

INSERT INTO SERVICIO (nombre, descripcion, precio, duracion_estimada, a_domicilio) VALUES
 ('Cambio de aceite', 'Servicio completo de cambio de aceite y filtro', 45.00, 1, FALSE),
 ('Lavado premium',   'Lavado exterior e interior con cera',             30.00, 2, TRUE);

INSERT INTO PRODUCTO (nombre, descripcion, marca, modelo, ano_compatible, stock, precio, rating, imagen_url) VALUES
 ('Filtro de aire', 'Filtro de aire para motor', 'Bosch', 'A123', 2020, 50, 15.99, 4.5, 'http://.../filtro.jpg'),
 ('Bujía',         'Bujía de alta performance', 'NGK',   'B456', 2018, 80,  9.49, 4.7, 'http://.../bujia.jpg');

INSERT INTO OFERTA (tipo, descuento, fecha_inicio, fecha_fin, servicio_id, producto_id) VALUES
 ('Temporada', 10.00, '2025-06-01', '2025-06-30', 1, NULL),
 ('Especial',   5.00, '2025-06-05', '2025-06-20', NULL, 2);

INSERT INTO CARRITO (usuario_rut) VALUES
 ('11.111.111-1');

INSERT INTO CARRITO_ITEM (carrito_id, producto_id, cantidad) VALUES
 (1, 1, 2),
 (1, 2, 1);

INSERT INTO COMPRA (fecha_entrega_estim, total, estado_pago, usuario_rut) VALUES
 ('2025-06-10 15:00:00', 41.47, 'Pagado', '11.111.111-1');

INSERT INTO DETALLE_COMPRA (compra_id, producto_id, cantidad, precio_unitario) VALUES
 (1, 1, 2, 15.99),
 (1, 2, 1,  9.49);

INSERT INTO RESERVA (fecha_reserva, estado, ubicacion, notas, usuario_rut, vehiculo_id, servicio_id) VALUES
 ('2025-06-12 10:30:00', 'Confirmada', 'Taller Central, Stgo.', 'Sin observaciones', '22.222.222-2', 2, 1);
