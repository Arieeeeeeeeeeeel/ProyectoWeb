USE BD_lyl;

-- 1. Usuarios
INSERT INTO USUARIO (rut, nombre, apellido, correo, contrasena, telefono, region, comuna)
VALUES
('12.345.678-9', 'Juan', 'Pérez', 'juan.perez@example.com', 'hashed_pass1', '+56912345678', 'Metropolitana', 'Providencia'),
('98.765.432-1', 'María', 'González', 'maria.gonzalez@example.com', 'hashed_pass2', '+56987654321', 'Valparaíso', 'Viña del Mar');

-- 2. Vehículos
INSERT INTO VEHICULO (marca, modelo, ano, patente, tipo_combustible, color, apodo, usuario_rut)
VALUES
('Toyota', 'Corolla', 2020, 'ABC123', 'Gasolina', 'Blanco', 'MiCorolla', '12.345.678-9'),
('Ford', 'Fiesta', 2018, 'XYZ789', 'Diésel', 'Rojo', 'Pequeñín', '98.765.432-1');

-- 3. Servicios
INSERT INTO SERVICIO (nombre, descripcion, precio, duracion_estimada, a_domicilio)
VALUES
('Cambio de aceite mecánico', 'Cambio de aceite y filtro', 35000.00, 60, FALSE),
('Lavado y encerado visual', 'Lavado y encerado profesional', 20000.00, 45, TRUE),
('Revisión general mecánico', 'Chequeo de frenos, suspensión y motor', 50000.00, 90, FALSE);

-- 4. Productos
INSERT INTO PRODUCTO (nombre, descripcion, marca, modelo, ano_compatible, stock, precio, rating, imagen_url)
VALUES
('Filtro de aceite', 'Filtro compatible con varios modelos', 'Bosch', 'FiltroX', 2020, 50, 15000.00, 4.5, 'https://example.com/filtro.jpg'),
('Pastillas de freno', 'Juego de pastillas delanteras', 'Valeo', 'BrakePro', 2018, 30, 30000.00, 4.7, 'https://example.com/pastillas.jpg'),
('Cera automotriz', 'Cera para acabado brillante', 'Meguiar', 'WaxMax', NULL, 20, 10000.00, 4.2, 'https://example.com/cera.jpg');

-- 5. Ofertas
INSERT INTO OFERTA (tipo, descuento, fecha_inicio, fecha_fin, servicio_id, producto_id)
VALUES
('Promoción', 10.00, '2025-05-01', '2025-05-31', 1, NULL),
('Descuento', 15.00, '2025-06-01', '2025-06-15', NULL, 2);

-- 6. Carritos
INSERT INTO CARRITO (usuario_rut)
VALUES
('12.345.678-9'),
('98.765.432-1');

-- 7. Carrito Items
INSERT INTO CARRITO_ITEM (carrito_id, producto_id, cantidad)
VALUES
(1, 1, 2),
(1, 3, 1),
(2, 2, 4);

-- 8. Compras
INSERT INTO COMPRA (fecha_entrega_estim, total, estado_pago, usuario_rut)
VALUES
(DATE_ADD(NOW(), INTERVAL 3 DAY), 60000.00, 'pendiente', '12.345.678-9');

-- 9. Detalle de Compras
INSERT INTO DETALLE_COMPRA (compra_id, producto_id, cantidad, precio_unitario)
VALUES
(1, 1, 2, 15000.00),
(1, 3, 1, 10000.00);

-- 10. Reservas
INSERT INTO RESERVA (fecha_reserva, estado, ubicacion, notas, usuario_rut, vehiculo_id, servicio_id)
VALUES
('2025-06-10 10:00:00', 'pendiente', 'Taller Central', 'Cambio de aceite y filtro', '12.345.678-9', 1, 1),
('2025-06-12 14:00:00', 'confirmado', 'Taller Visual', 'Lavado completo y encerado', '98.765.432-1', 2, 2);