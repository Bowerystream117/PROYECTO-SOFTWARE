# Imperio en el Wi-Fi del negocio

Instala Node.js, MySQL y Caddy en la computadora que quedará encendida durante la operación. Reserva su IP local en el router. Los dispositivos de trabajo deben estar conectados a una red que permita llegar a esa computadora.

1. Configura la base y crea la cuenta de Dueña según el README principal. En MySQL Workbench, con una cuenta administradora, crea el usuario de la aplicación si aún no existe. Usa el nombre de tu base en ambos comandos y una contraseña propia en el primero.

   ```sql
   CREATE USER 'imperio_app'@'127.0.0.1' IDENTIFIED BY 'REEMPLAZAR';
   GRANT SELECT, INSERT, UPDATE ON mydb.* TO 'imperio_app'@'127.0.0.1';
   GRANT DELETE ON mydb.productos TO 'imperio_app'@'127.0.0.1';
   ```

2. En `backend/.env` configura ese usuario y conserva `HOST=127.0.0.1`, `PORT=3000` y `DB_HOST=127.0.0.1`. Arranca con `npm.cmd start` en la carpeta `backend`.
3. Desde la raíz del repositorio, usa la IP reservada y arranca Caddy. Permite el puerto TCP 443 de Caddy para la red privada en el Firewall de Windows.

   ```powershell
   $env:IMPERIO_IP_LOCAL = '192.168.1.50'
   caddy run --config operacion/Caddyfile
   ```

4. En cada dispositivo de trabajo, instala como de confianza el certificado raíz público de esa instalación de Caddy. Caddy indica la ubicación en su registro. Copia solamente `root.crt`. Abre la dirección HTTPS de la IP reservada y verifica que el navegador acepte el certificado.
5. Para iniciar automáticamente en Windows, crea dos tareas en el Programador de tareas. Usa la carpeta `backend` como carpeta inicial para la tarea de `npm.cmd start`. Para Caddy, ejecuta los dos comandos anteriores en un script local con la raíz del repositorio como carpeta inicial. Ejecuta Caddy siempre bajo la misma cuenta de Windows para preservar su certificado.

## Respaldo y restauración

Desde la computadora del negocio, guarda un perfil de conexión de MySQL bajo la cuenta de Windows que ejecutará el respaldo. Usa una cuenta MySQL con acceso de lectura a la base y los permisos de respaldo correspondientes.

```powershell
mysql_config_editor set --login-path=imperio-respaldo --host=127.0.0.1 --user=imperio_respaldo --password
.\operacion\respaldar.ps1 -Carpeta 'D:\Respaldos\Imperio' -Base mydb
```

Si las herramientas de MySQL no están en PATH, usa sus rutas completas y pasa la de `mysqldump.exe` con `-Programa`. En el Programador de tareas, programa el comando del respaldo cada noche y revisa que se cree un archivo `.sql`. Guarda una copia fuera de la computadora del negocio.

Para probar una restauración, crea una base vacía de prueba y selecciónala por nombre. El respaldo se genera sin instrucciones para cambiar a la base operativa.

```text
mysql --user=root --password imperio_prueba
SOURCE D:/Respaldos/Imperio/imperio-FECHA.sql
```

Compara productos, movimientos, mermas y usuarios con el respaldo esperado y abre una instancia de prueba de la app con esa base. En dos dispositivos del Wi-Fi, confirma el acceso por HTTPS, registra un movimiento en uno y verifica la actualización de Inventario en el otro.
