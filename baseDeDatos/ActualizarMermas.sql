USE mydb;

CREATE TABLE IF NOT EXISTS mermas_registro (
  id_merma INT NOT NULL,
  solicitud CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  producto VARCHAR(100) NOT NULL,
  unidad VARCHAR(20) NOT NULL,
  descripcion VARCHAR(160) NOT NULL DEFAULT '',
  PRIMARY KEY (id_merma),
  UNIQUE KEY uq_mermas_solicitud (solicitud),
  CONSTRAINT fk_mermas_registro_merma
    FOREIGN KEY (id_merma) REFERENCES mermas (id_merma) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
