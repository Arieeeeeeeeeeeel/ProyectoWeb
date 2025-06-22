-- 1. Tablas

CREATE DATABASE IF NOT EXISTS BD_lyl;
USE BD_lyl;

CREATE TABLE USUARIO (
  personaid       INT            NOT NULL AUTO_INCREMENT,
  rut             VARCHAR(20)    NOT NULL UNIQUE,
  usuario         VARCHAR(100)   NOT NULL,
  correo          VARCHAR(150)   NOT NULL UNIQUE,
  contrasena      VARCHAR(255)   NOT NULL,
  region          VARCHAR(100)   NOT NULL,
  comuna          VARCHAR(100)   NOT NULL,
  telefono        VARCHAR(20)    NULL, -- <--- NUEVO CAMPO
  ultimo_token_recuperacion VARCHAR(512) NULL,
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
  usuario_id       INT         NOT NULL,
  PRIMARY KEY (vehiculo_id),
  INDEX idx_usuario_id (usuario_id),
  CONSTRAINT fk_veh_usuario FOREIGN KEY (usuario_id)
    REFERENCES USUARIO(personaid)
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
  en_oferta       BOOLEAN       NOT NULL DEFAULT FALSE, -- Nuevo campo
  mostrar_en_inicio BOOLEAN     NOT NULL DEFAULT FALSE, -- Nuevo campo
  PRIMARY KEY (producto_id)
) ENGINE=InnoDB;

CREATE TABLE CARRITO (
  carrito_id      INT         NOT NULL AUTO_INCREMENT,
  fecha_creacion  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuario_id      INT,
  PRIMARY KEY (carrito_id),
  INDEX idx_carrito_usuario (usuario_id),
  CONSTRAINT fk_carrito_usuario FOREIGN KEY (usuario_id)
    REFERENCES USUARIO(personaid)
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
  total                DECIMAL(10,2)  NOT NULL,
  estado_pago          VARCHAR(50)    NOT NULL,
  usuario_id           INT            NOT NULL,
  direccion_envio      VARCHAR(255), -- Dirección de despacho textual
  PRIMARY KEY (compra_id),
  INDEX idx_compra_usuario (usuario_id),
  CONSTRAINT fk_compra_usuario FOREIGN KEY (usuario_id)
    REFERENCES USUARIO(personaid)
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


CREATE TABLE  PRODUCTO_COMPATIBILIDAD (
  producto_id INT NOT NULL,
  marca_auto VARCHAR(50) NOT NULL,
  modelo_auto VARCHAR(50) NOT NULL,
  ano_desde INT,
  ano_hasta INT,
  PRIMARY KEY (producto_id, marca_auto, modelo_auto, ano_desde),
  FOREIGN KEY (producto_id) REFERENCES PRODUCTO(producto_id) ON DELETE CASCADE
);

CREATE TABLE RESERVA (
  reserva_id      INT           NOT NULL AUTO_INCREMENT,
  fecha_reserva   DATETIME      NOT NULL,
  ubicacion       VARCHAR(255)  NOT NULL,
  notas           TEXT,
  usuario_id      INT           NOT NULL,
  vehiculo_id     INT           NOT NULL,
  servicio_id     INT           NOT NULL,
  nombre_completo VARCHAR(255)  NOT NULL,
  color           VARCHAR(30), -- Nuevo campo para color solicitado
  PRIMARY KEY (reserva_id),
  CONSTRAINT fk_reserva_usuario FOREIGN KEY (usuario_id)
    REFERENCES USUARIO(personaid)
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

CREATE TABLE VALORACION_PRODUCTO (
  id INT NOT NULL AUTO_INCREMENT,
  producto_id INT NOT NULL,
  usuario_id INT NOT NULL,
  rating DECIMAL(3,2) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_producto_usuario (producto_id, usuario_id),
  CONSTRAINT fk_valoracion_producto FOREIGN KEY (producto_id) REFERENCES PRODUCTO(producto_id) ON DELETE CASCADE,
  CONSTRAINT fk_valoracion_usuario FOREIGN KEY (usuario_id) REFERENCES USUARIO(personaid) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE DIRECCION (
  direccion_id INT NOT NULL AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  calle VARCHAR(255) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  codigo_postal VARCHAR(20) NOT NULL,
  es_principal BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (direccion_id),
  FOREIGN KEY (usuario_id) REFERENCES USUARIO(personaid) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Usuario administrador por defecto
INSERT INTO USUARIO (rut, usuario, correo, contrasena, region, comuna, fecha_registro)
VALUES ('1-9', 'Administrador', 'admin@admin.com',
  'scrypt:32768:8:1$XainujzOjI3TM1k7$2773fcd72845bfdf2001f3624802f91c0a3e5ea488dde7bbe76fcb683530f10ff4e58247b2afa94086ccad2f00438345019fd8f3730f832e0c740745d0ad9aed',
  'Metropolitana', 'Santiago', NOW());
-- Contraseña por defecto: admin123 (hash válido Werkzeug)