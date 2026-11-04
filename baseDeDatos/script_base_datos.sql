SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8mb4 ;
USE `mydb` ;

-- -----------------------------------------------------
-- 1. Tabla `roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`roles` (
  `id_rol` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(150) NULL DEFAULT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- 2. Tabla `usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`usuarios` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `id_rol` INT NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `correo` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `creado_en` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE INDEX `idx_correo_unico` (`correo` ASC) VISIBLE,
  INDEX `idx_usuarios_rol` (`id_rol` ASC) VISIBLE,
  CONSTRAINT `fk_usuarios_roles`
    FOREIGN KEY (`id_rol`)
    REFERENCES `mydb`.`roles` (`id_rol`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- 3. Tabla `categorias`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`categorias` (
  `id_categoria` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `descripcion` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- 4. Tabla `productos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`productos` (
  `id_producto` INT NOT NULL AUTO_INCREMENT,
  `id_categoria` INT NOT NULL,
  `codigo_barras` VARCHAR(50) NULL DEFAULT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `unidad_medida` VARCHAR(20) NOT NULL,
  `stock_actual` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `stock_minimo` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `precio_compra` DECIMAL(10,2) NULL DEFAULT 0.00,
  `precio_venta` DECIMAL(10,2) NULL DEFAULT 0.00,
  PRIMARY KEY (`id_producto`),
  UNIQUE INDEX `idx_codigo_barras` (`codigo_barras` ASC) VISIBLE,
  INDEX `idx_productos_categoria` (`id_categoria` ASC) VISIBLE,
  CONSTRAINT `fk_productos_categorias`
    FOREIGN KEY (`id_categoria`)
    REFERENCES `mydb`.`categorias` (`id_categoria`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `chk_stock_positivo` CHECK (`stock_actual` >= 0 AND `stock_minimo` >= 0),
  CONSTRAINT `chk_precios_positivos` CHECK (`precio_compra` >= 0 AND `precio_venta` >= 0)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- 5. Tabla `movimientos_inventario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`movimientos_inventario` (
  `id_movimiento` INT NOT NULL AUTO_INCREMENT,
  `id_producto` INT NOT NULL,
  `id_usuario` INT NOT NULL,
  `tipo_movimiento` ENUM('Entrada', 'Salida') NOT NULL,
  `cantidad` DECIMAL(10,2) NOT NULL,
  `fecha_movimiento` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `observaciones` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id_movimiento`),
  INDEX `idx_mov_producto` (`id_producto` ASC) VISIBLE,
  INDEX `idx_mov_usuario` (`id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_movimientos_productos`
    FOREIGN KEY (`id_producto`)
    REFERENCES `mydb`.`productos` (`id_producto`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_movimientos_usuarios`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `mydb`.`usuarios` (`id_usuario`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `chk_cantidad_mov` CHECK (`cantidad` > 0)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- 6. Tabla `mermas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`mermas` (
  `id_merma` INT NOT NULL AUTO_INCREMENT,
  `id_producto` INT NOT NULL,
  `id_usuario` INT NOT NULL,
  `cantidad` DECIMAL(10,2) NOT NULL,
  `motivo` VARCHAR(150) NOT NULL,
  `fecha_registro` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_merma`),
  INDEX `idx_merma_producto` (`id_producto` ASC) VISIBLE,
  INDEX `idx_merma_usuario` (`id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_mermas_productos`
    FOREIGN KEY (`id_producto`)
    REFERENCES `mydb`.`productos` (`id_producto`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_mermas_usuarios`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `mydb`.`usuarios` (`id_usuario`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `chk_cantidad_merma` CHECK (`cantidad` > 0)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- 7. Tabla `cortes_caja`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`cortes_caja` (
  `id_corte` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `monto_inicial` DECIMAL(10,2) NOT NULL,
  `ventas_efectivo` DECIMAL(10,2) NOT NULL,
  `ventas_tarjeta` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `monto_final_real` DECIMAL(10,2) NOT NULL,
  `diferencia` DECIMAL(10,2) NOT NULL,
  `fecha_corte` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `observaciones` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id_corte`),
  INDEX `idx_corte_usuario` (`id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_cortes_usuarios`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `mydb`.`usuarios` (`id_usuario`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Datos semilla (Para pruebas iniciales)
-- -----------------------------------------------------
INSERT IGNORE INTO `mydb`.`roles` (`id_rol`, `nombre`, `descripcion`) VALUES
(1, 'Administrador', 'Acceso total al sistema'),
(2, 'Cajero', 'Acceso a ventas, corte de caja e inventario básico');

INSERT IGNORE INTO `mydb`.`usuarios` (`id_usuario`, `id_rol`, `nombre`, `correo`, `password_hash`, `activo`) VALUES
(1, 1, 'Administrador Imperio', 'admin@imperio.com', 'admin123', 1),
(2, 2, 'Empleado Turno', 'cajero@imperio.com', 'cajero123', 1);

INSERT IGNORE INTO `mydb`.`categorias` (`id_categoria`, `nombre`, `descripcion`) VALUES
(1, 'Bebidas y Clamatos', 'Bases, jugos y preparados'),
(2, 'Snacks y Botanas', 'Papas, cacahuates, gomitas y complementos'),
(3, 'Insumos y Desechables', 'Vasos, salsas, escarchadores y popotes');

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
