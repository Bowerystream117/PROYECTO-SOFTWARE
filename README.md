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
  - `ActualizarMermas.sql`
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

## Configurar MySQL y arrancar el proyecto

Si `mydb` ya contiene datos de este proyecto, ejecuta `baseDeDatos/ActualizarFinanzas.sql` y `baseDeDatos/ActualizarMermas.sql` desde Workbench con una cuenta que pueda crear tablas. Las migraciones se pueden ejecutar de nuevo y conservan los registros existentes.

Para una instalación con una base vacía, ejecuta primero `baseDeDatos/ScriptBaseDatos.sql` y después ambas migraciones. Reserva `ScriptBaseDatos.sql` para bases vacías, ya que elimina y recrea las tablas principales.

Con Node.js 22 o posterior, abre PowerShell en `backend`, copia `.env.example` a `.env` y configura la conexión de MySQL. Luego instala las dependencias con `npm.cmd ci`.

Para una base nueva, crea la primera cuenta de Dueña. Ejecuta esto en PowerShell 7 y reemplaza el correo y el nombre:

```powershell
(Read-Host -MaskInput 'Contraseña de al menos 12 caracteres') | node --env-file=.env crear-duena.js duena@example.com 'Dueña'
```

Para una base existente, ejecuta `node --env-file=.env migrar-claves.js` para proteger todas las contraseñas antiguas. Cambia las contraseñas de las cuentas de prueba o dales de baja desde Perfiles antes de usar datos reales. Las contraseñas que se hayan compartido antes necesitan un cambio aunque estén protegidas en la base.

Arranca con `npm.cmd start` y abre [http://127.0.0.1:3000](http://127.0.0.1:3000). Para compartir la app, configura un servidor con HTTPS, MySQL y respaldos. Define `HOST=0.0.0.0` si tu plataforma lo requiere.

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
