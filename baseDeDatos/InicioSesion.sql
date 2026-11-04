CREATE DATABASE IF NOT EXISTS mydb CHARACTER SET utf8mb4;
USE mydb;
CREATE TABLE IF NOT EXISTS roles (
 id_rol INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(50) NOT NULL, descripcion VARCHAR(150)
);
CREATE TABLE IF NOT EXISTS usuarios (
 id_usuario INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 id_rol INT NOT NULL, nombre VARCHAR(100) NOT NULL,
 correo VARCHAR(100) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL,
 activo TINYINT NOT NULL DEFAULT 1, creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_usuarios_roles FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);
INSERT INTO roles (nombre,descripcion)
SELECT 'Dueña','La dueña del local' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre='Dueña');
INSERT INTO roles (nombre,descripcion)
SELECT 'Empleado','Empleado General de la Tienda' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre='Empleado');

INSERT INTO usuarios (id_rol,nombre,correo,password_hash)
SELECT id_rol,'Monica Muñoz','Monica@Correo.com','A123456@' FROM roles
WHERE nombre='Dueña' AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo='Monica@Correo.com') LIMIT 1;

INSERT INTO usuarios (id_rol,nombre,correo,password_hash)
SELECT id_rol,'Javier Lopez','Javier@Correo.com','A123456@' FROM roles
WHERE nombre='Empleado' AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo='Javier@Correo.com') LIMIT 1;