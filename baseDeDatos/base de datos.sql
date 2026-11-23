USE mydb;

CREATE TABLE IF NOT EXISTS movimientos_financieros (
    id_movimiento_financiero INT NOT NULL AUTO_INCREMENT,
    cuenta ENUM('caja_fija', 'banco_principal', 'fondo_proveedores') NOT NULL,
    tipo ENUM('ingreso', 'egreso') NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    concepto VARCHAR(150) NOT NULL,
    fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    PRIMARY KEY (id_movimiento_financiero),
    KEY idx_fin_cuenta_fecha (cuenta, fecha_movimiento),
    KEY idx_fin_usuario (id_usuario),
    CONSTRAINT fk_fin_mov_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_fin_monto_positivo CHECK (monto > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
