USE mydb;

CREATE TABLE IF NOT EXISTS movimientos_financieros (
  id_movimiento_financiero INT NOT NULL AUTO_INCREMENT,
  cuenta ENUM('caja_fija', 'banco_principal', 'fondo_proveedores') NOT NULL,
  tipo ENUM('ingreso', 'egreso') NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  concepto VARCHAR(150) NOT NULL,
  fecha_movimiento DATETIME NOT NULL,
  id_usuario INT NOT NULL,
  referencia VARCHAR(64) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  PRIMARY KEY (id_movimiento_financiero),
  UNIQUE KEY uq_movimientos_financieros_referencia (referencia),
  KEY ix_movimientos_financieros_cuenta_fecha (cuenta, fecha_movimiento),
  CONSTRAINT chk_movimientos_financieros_monto CHECK (monto > 0),
  CONSTRAINT fk_movimientos_financieros_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
