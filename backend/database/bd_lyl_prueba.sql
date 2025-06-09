
-- Crear base de datos y usarla
CREATE DATABASE IF NOT EXISTS BD_lyl;
USE BD_lyl;

-- Tablas
CREATE TABLE USUARIO (
  personaid       INT            NOT NULL AUTO_INCREMENT,
  rut             VARCHAR(20)    NOT NULL UNIQUE,
  usuario         VARCHAR(100)   NOT NULL,
  correo          VARCHAR(150)   NOT NULL UNIQUE,
  contrasena      VARCHAR(255)   NOT NULL,
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

-- Datos de prueba
INSERT INTO USUARIO (rut, usuario, correo, contrasena, region, comuna)
VALUES 
('11111111-1', 'Juan Pérez', 'juan@example.com', 'hashed123', 'Valparaíso', 'Viña del Mar'),
('22222222-2', 'Ana López', 'ana@example.com', 'hashed456', 'Región Metropolitana', 'Santiago');

INSERT INTO VEHICULO (marca, modelo, ano, patente, tipo_combustible, color, apodo, usuario_rut)
VALUES 
('Toyota', 'Corolla', 2015, 'ABCD12', 'Gasolina', 'Rojo', 'Mi Toyo', '11111111-1'),
('Chevrolet', 'Spark', 2018, 'XYZ987', 'Eléctrico', 'Azul', 'Sparky', '22222222-2');

INSERT INTO SERVICIO (nombre, descripcion, precio, duracion_estimada, a_domicilio)
VALUES 
('Cambio de aceite', 'Incluye filtro y revisión básica.', 29990, 45, FALSE),
('Lavado Full', 'Lavado exterior e interior completo.', 19990, 30, TRUE);

INSERT INTO PRODUCTO (nombre, descripcion, marca, modelo, ano_compatible, stock, precio, rating, imagen_url)
VALUES 
('Filtro de aceite', 'Filtro compatible con autos medianos.', 'Bosch', 'F123', 2015, 10, 5990, 4.5, 'https://example.com/filtro.jpg'),
('Aceite sintético 5W30', 'Aceite premium para motor.', 'Shell', 'S5W30', 2015, 20, 12990, 4.8, 'https://example.com/aceite.jpg');

INSERT INTO CARRITO (usuario_rut)
VALUES 
('11111111-1'),
('22222222-2');

INSERT INTO CARRITO_ITEM (carrito_id, producto_id, cantidad)
VALUES 
(1, 1, 2),
(2, 2, 1);

INSERT INTO COMPRA (fecha_entrega_estim, total, estado_pago, usuario_rut)
VALUES 
(DATE_ADD(NOW(), INTERVAL 2 DAY), 18980, 'Pagado', '11111111-1'),
(DATE_ADD(NOW(), INTERVAL 3 DAY), 12990, 'Pendiente', '22222222-2');

INSERT INTO DETALLE_COMPRA (compra_id, producto_id, cantidad, precio_unitario)
VALUES 
(1, 1, 2, 5990),
(2, 2, 1, 12990);

INSERT INTO RESERVA (fecha_reserva, estado, ubicacion, notas, usuario_rut, vehiculo_id, servicio_id)
VALUES 
(NOW(), 'Confirmada', 'Casa Juan, Viña del Mar', 'Llevar filtro', '11111111-1', 1, 1),
(DATE_ADD(NOW(), INTERVAL 1 DAY), 'Pendiente', 'Estacionamiento Ana, Santiago', 'Auto eléctrico', '22222222-2', 2, 2);
