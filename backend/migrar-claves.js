import conexion from "./Conexion BaseDatos/conexion.js";
import { esHash, proteger } from "./inicio de sesion/claves.js";

try {
  const [usuarios] = await conexion.execute("SELECT id_usuario,password_hash FROM usuarios");
  let migradas = 0;
  for (const { id_usuario, password_hash } of usuarios) {
    if (esHash(password_hash)) continue;
    const [cambio] = await conexion.execute(
      "UPDATE usuarios SET password_hash=? WHERE id_usuario=? AND BINARY password_hash=?",
      [await proteger(password_hash), id_usuario, password_hash]
    );
    migradas += cambio.affectedRows;
  }
  console.log("Contraseñas migradas:", migradas);
} catch (error) {
  console.error("No se pudo completar la migración:", error.code || error.name);
  process.exitCode = 1;
} finally {
  await conexion.end();
}
