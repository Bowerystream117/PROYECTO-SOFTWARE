# PROYECTO-SOFTWARE: SISTEMA DE GESTIÓN DE INVENTARIOS - IMPERIO | CLAMATOS Y SNACKS

##  INTEGRANTES
* ERICK IVAN SANCHEZ AGUIRRE
* SANTIAGO DE LA PEÑA MARTINEZ
* CARLOS EMANUEL MUÑOZ PADILLA
* RICARDO DANIEL JASSO TORRES

##  DESCRIPCIÓN DEL PROYECTO
**Imperio | Clamatos & Snacks** es una empresa del sector gastronómico fundada en 2022 en la ciudad de Saltillo, Coahuila. Bajo la dirección de su propietaria, la C. Mónica Muñoz, el negocio surgió con el propósito de ofrecer una propuesta artesanal que combina la frescura de la coctelería de mariscos con la innovación en snacks dulces y de temporada.

Este repositorio contiene la arquitectura, la base de datos, el backend y el desarrollo modular del sistema de software diseñado para automatizar y optimizar sus procesos de control de inventarios, entradas y salidas de insumos, perfiles y operaciones financieras.

##  ESTRUCTURA GENERAL DEL REPOSITORIO
El proyecto se encuentra organizado en las siguientes carpetas y módulos principales:

- **`Documentacion de la IA/`**
  - `IA TEXTO.txt`
- **`backend/`**
  - `administracion perfiles`
  - `corte de caja`
  - `entrada y salida de insumos`
  - `gestion de cuentas financieras`
  - `gestion de inventario`
  - `inicio de sesion`
  - `productos no aptos`
  - `reporte de insumos, mermas y desperdicios`
  - `db.js`
  - `package-lock.json`
  - `package.json`
  - `server.js`
- **`baseDeDatos/`**
  - `ScriptBaseDatos.sql`
  - `ActualizarFinanzas.sql`
  - `InicioSesion.sql`
- **`frontend/`**
  - `administracion perfiles`
  - `compartido`
  - `corte de caja`
  - `entrada y salida de insumos`
  - `gestion de cuentas financieras`
  - `gestion de inventario`
  - `inicio de sesion`
  - `productos no aptos`
  - `reporte de insumos, mermas y desperdicios`

## Actualizar MySQL para usar Finanzas

Si `mydb` ya contiene datos, ejecuta únicamente `baseDeDatos/ActualizarFinanzas.sql` desde Workbench con una cuenta que tenga permiso para crear tablas. La migración se puede ejecutar de nuevo y conserva los usuarios, productos, movimientos y cortes existentes.

Para una instalación con una base vacía, ejecuta primero `baseDeDatos/ScriptBaseDatos.sql` y después `baseDeDatos/ActualizarFinanzas.sql`. Reserva `ScriptBaseDatos.sql` para bases vacías, ya que elimina y recrea las tablas principales.

El stock inicial se captura al crear un producto. Usa Entradas y Salidas para cambiar las existencias de un producto que ya está registrado.

##  MÓDULOS PRINCIPALES DEL SISTEMA
1. **Inicio de Sesión y Perfiles:** Autenticación segura de usuarios y administración de roles (Dueña / Empleado).
2. **Gestión de Inventario:** Control de stock de productos y gestión de artículos.
3. **Entradas y Salidas de Insumos:** Registro detallado de los movimientos del almacén.
4. **Productos no Aptos / Mermas:** Control y registro de productos que ya no cumplen con los estándares para su venta.
5. **Corte de Caja y Finanzas:** Módulos diseñados para el control financiero y la realización del corte de caja diario.
6. **Reportes:** Generación de informes sobre insumos, mermas y desperdicios.
DESCRIPCION
Imperio | Clamatos & Snacks es una empresa del sector gastronómico fundada en 2022
en la ciudad de Saltillo, Coahuila. Bajo la dirección de su propietaria, la C. Mónica
Muñoz, el negocio surgió con el propósito de ofrecer una propuesta artesanal que
combina la frescura de la coctelería de mariscos con la innovación en snacks dulces y de
temporada.
