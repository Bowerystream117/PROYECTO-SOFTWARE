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
  - `servidor.js` (entrada usada por `npm.cmd start`)
  - `.env.example`
  - `crear-duena.js`
  - `migrar-claves.js`
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

- **`operacion/`**
  - `README.md` (instalación en red local)
  - `Caddyfile` (HTTPS local)
  - `respaldar.ps1` (respaldo de MySQL)

## Configurar MySQL y arrancar el proyecto

Si `mydb` ya contiene datos de este proyecto, ejecuta `baseDeDatos/ActualizarFinanzas.sql` y `baseDeDatos/ActualizarMermas.sql` desde Workbench con una cuenta que pueda crear tablas. Las migraciones se pueden ejecutar de nuevo y conservan los registros existentes.

Para una instalación con una base vacía, ejecuta primero `baseDeDatos/ScriptBaseDatos.sql` y después ambas migraciones. Reserva `ScriptBaseDatos.sql` para bases vacías, ya que elimina y recrea las tablas principales.

Los scripts SQL usan `mydb`. Si usarás otro nombre, como `imperio_equipo`, ajusta las instrucciones `CREATE DATABASE` y `USE` antes de ejecutarlos y configura ese mismo nombre en `DB_NAME`.

Con MySQL 8.0 o posterior y Node.js 22 o posterior, abre PowerShell en `backend` y prepara la configuración local:

```powershell
Copy-Item .env.example .env
notepad .env
npm.cmd ci
```

Completa `DB_USER` y `DB_PASSWORD` con una cuenta MySQL existente que tenga los permisos de la aplicación. La [guía de operación](operacion/README.md) incluye los comandos para crearla. Conserva tu `.env` cuando actualices una instalación existente.

Para una base nueva, crea la primera cuenta de Dueña. Ejecuta esto en PowerShell 7 y reemplaza el correo y el nombre:

```powershell
(Read-Host -MaskInput 'Contraseña de al menos 12 caracteres') | node --env-file=.env crear-duena.js duena@example.com 'Dueña'
```

En Windows PowerShell 5.1 puedes capturar la contraseña así:

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$claveImperio = Read-Host 'Contraseña de al menos 12 caracteres' -AsSecureString
try {
  ([System.Net.NetworkCredential]::new('', $claveImperio)).Password | node --env-file=.env crear-duena.js duena@example.com 'Dueña'
} finally {
  Remove-Variable claveImperio
}
```

Para una base existente, ejecuta `node --env-file=.env migrar-claves.js` para proteger todas las contraseñas antiguas. Cambia las contraseñas de las cuentas de prueba o dales de baja desde Perfiles antes de usar datos reales. Las contraseñas que se hayan compartido antes necesitan un cambio aunque estén protegidas en la base.

Arranca con `npm.cmd start` y abre [http://127.0.0.1:3000](http://127.0.0.1:3000). Para usar varios dispositivos en el Wi-Fi del negocio, sigue la [guía de operación en red local](operacion/README.md).

En Perfiles, la Dueña puede cambiar contraseñas y buscar cuentas en el historial de inactivos. Reactivar una cuenta requiere una contraseña nueva y mantiene el mismo usuario y sus registros. Si la Dueña pierde el acceso, recupera su cuenta activa desde la computadora de Imperio con este comando en PowerShell 7, dentro de `backend`:

```powershell
(Read-Host -MaskInput 'Nueva contraseña de al menos 12 caracteres') | node --env-file=.env crear-duena.js duena@example.com --restablecer
```

El stock inicial se captura al crear un producto. Usa Entradas y Salidas para cambiar las existencias de un producto que ya está registrado.

## Uso y actualización

Inventario consulta el stock cada cinco segundos mientras la pestaña está visible. Conserva los filtros y suspende la actualización durante la edición de un producto. Las demás pantallas consultan los datos al abrirlas o al realizar sus operaciones.

Reportes permite filtrar por tipo y fechas, consultar páginas de resultados y exportar los registros filtrados a Excel, CSV y PDF. Excel conserva fechas y cantidades con formato. El PDF se abre en una vista previa, usa A4 vertical en escala de grises y repite la marca de agua, los encabezados y la numeración en cada hoja. Desde el visor se puede guardar o imprimir. El navegador debe permitir abrir la pestaña de vista previa.

Para actualizar una copia del repositorio después de integrar los cambios en `main`, detén el servidor con `Ctrl+C` y ejecuta desde la raíz:

```powershell
git switch main
git pull --ff-only origin main
cd backend
npm.cmd ci
npm.cmd start
```

Recarga las páginas de los dispositivos conectados. Reiniciar el servidor termina las sesiones y el sistema muestra «Tu sesión expiró» al consultar una operación protegida. Usa el botón «Iniciar sesión» para continuar.

Las computadoras y celulares que usan la instancia compartida acceden a su dirección HTTPS en el Wi-Fi del negocio. Una instalación independiente de MySQL tiene sus propios datos.

##  MÓDULOS PRINCIPALES DEL SISTEMA
1. **Inicio de Sesión y Perfiles:** Autenticación segura de usuarios y administración de roles (Dueña / Empleado).
2. **Gestión de Inventario:** Control de stock de productos y gestión de artículos.
3. **Entradas y Salidas de Insumos:** Registro detallado de los movimientos del almacén.
4. **Productos no Aptos / Mermas:** Control y registro de productos que ya no cumplen con los estándares para su venta.
5. **Corte de Caja y Finanzas:** Módulos diseñados para el control financiero y la realización del corte de caja diario.
6. **Reportes:** Generación de informes sobre insumos, mermas y desperdicios, con exportación a Excel, CSV y PDF.
