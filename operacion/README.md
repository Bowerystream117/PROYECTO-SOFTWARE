# Imperio en el Wi-Fi del negocio

Instala Node.js, MySQL y [Caddy para Windows](https://caddyserver.com/docs/install) en la computadora que quedará encendida durante la operación. Reserva su IP local en el router. Los dispositivos de trabajo deben estar conectados a una red que permita llegar a esa computadora. Caddy se instala por separado del repositorio. Los ejemplos usan `caddy` en PATH. Si guardaste `caddy.exe` en otra carpeta, invócalo con `& 'C:\ruta\caddy.exe'`.

1. Importa la base y las migraciones según el README principal. En MySQL Workbench, con una cuenta administradora, crea el usuario de la aplicación si aún no existe. Sustituye `mydb` por el nombre real de tu base en los permisos y usa una contraseña propia.

   ```sql
   CREATE USER 'imperio_app'@'127.0.0.1' IDENTIFIED BY 'REEMPLAZAR';
   GRANT SELECT, INSERT, UPDATE ON mydb.* TO 'imperio_app'@'127.0.0.1';
   GRANT DELETE ON mydb.productos TO 'imperio_app'@'127.0.0.1';
   ```

2. En `backend/.env` configura ese usuario, su contraseña y el nombre real en `DB_NAME`. Conserva `HOST=127.0.0.1`, `PORT=3000` y `DB_HOST=127.0.0.1`. Crea la cuenta de Dueña según el README principal y arranca con `npm.cmd start` en la carpeta `backend`.
3. Desde la raíz del repositorio, usa la IP reservada y arranca Caddy. Permite el puerto TCP 443 de Caddy para la red privada en el Firewall de Windows.

   ```powershell
   $env:IMPERIO_IP_LOCAL = '192.168.1.50'
   caddy run --config operacion/Caddyfile
   ```

   Sustituye `192.168.1.50` por la IPv4 del adaptador Wi-Fi o Ethernet conectado al router, que puedes consultar con `ipconfig`. La IP depende de la red. Al cambiarla, actualiza `IMPERIO_IP_LOCAL` y reinicia Caddy. Mantén abiertos Imperio y Caddy durante la operación.

4. En cada dispositivo de trabajo, instala como de confianza el certificado raíz público de esa instalación de Caddy. Caddy indica la ubicación en su registro. Copia solamente `root.crt`. Abre la dirección HTTPS de la IP reservada y verifica que el navegador acepte el certificado.
5. Para iniciar automáticamente en Windows, crea dos tareas en el Programador de tareas. Usa la carpeta `backend` como carpeta inicial para la tarea de `npm.cmd start`. Para Caddy, ejecuta los dos comandos anteriores en un script local con la raíz del repositorio como carpeta inicial. Ejecuta Caddy siempre bajo la misma cuenta de Windows para preservar su certificado.

El certificado público suele estar en `%APPDATA%\Caddy\pki\authorities\local\root.crt` bajo la cuenta que ejecuta Caddy. Instálalo en cada dispositivo de trabajo:

- En iPhone, abre el archivo, instala el perfil desde Configuración y activa la confianza total en General → Información → Config. certificados de confianza. [Instrucciones de Apple](https://support.apple.com/es-lamr/102390)
- En Android, busca «Instalar certificado» en Ajustes y elige «Certificado de CA». Los nombres del menú cambian según la marca y la versión. [Ayuda de Google](https://support.google.com/pixelphone/answer/2844832?hl=es)
- En Windows, abre el certificado y usa el asistente para importarlo en «Entidades de certificación raíz de confianza» del usuario que abrirá la app. [Almacenes de certificados de Windows](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/certificate-stores)

Abre `https://IP-RESERVADA` en los dispositivos y confirma el acceso sin advertencias de certificado. Esta confianza permite validar los certificados que emita esa instalación de Caddy.

## Respaldo y restauración

Desde Workbench con la cuenta administradora, prepara una cuenta MySQL para el respaldo y sustituye el nombre de la base y la contraseña:

```sql
CREATE USER 'imperio_respaldo'@'127.0.0.1' IDENTIFIED BY 'REEMPLAZAR';
GRANT SELECT, SHOW VIEW, TRIGGER ON mydb.* TO 'imperio_respaldo'@'127.0.0.1';
```

Desde la computadora del negocio, guarda un perfil de conexión de MySQL bajo la cuenta de Windows que ejecutará el respaldo. Ejecuta estos comandos en PowerShell desde la raíz del repositorio y usa el nombre real de la base:

```powershell
mysql_config_editor set --login-path=imperio-respaldo --host=127.0.0.1 --user=imperio_respaldo --password
.\operacion\respaldar.ps1 -Carpeta 'D:\Respaldos\Imperio' -Base mydb
```

Si las herramientas de MySQL no están en PATH, usa sus rutas completas y pasa la de `mysqldump.exe` con `-Programa`. En el Programador de tareas, programa el comando del respaldo cada noche y revisa que se cree un archivo `.sql`. Guarda una copia fuera de la computadora del negocio.

Para probar una restauración, crea `imperio_prueba` como base vacía en Workbench. Abre el cliente MySQL desde PowerShell:

```text
mysql --user=root --password imperio_prueba
```

Dentro del cliente MySQL, importa el archivo generado, sustituyendo su fecha y ruta:

```sql
SOURCE D:/Respaldos/Imperio/imperio-FECHA.sql
```

Compara productos, movimientos, mermas y usuarios con el respaldo esperado y abre una instancia de prueba de la app con esa base. En dos dispositivos del Wi-Fi, confirma el acceso por HTTPS, registra un movimiento en uno y verifica la actualización de Inventario en el otro.
