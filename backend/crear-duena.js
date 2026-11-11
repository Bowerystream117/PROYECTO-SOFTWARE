import conexion from "./Conexion BaseDatos/conexion.js";
import { proteger } from "./inicio de sesion/claves.js";

try {
  const [correo, nombre] = process.argv.slice(2);
  if (!correo || correo.length > 100 || !/^[^\s@]+@[^\s@]+$/.test(correo) ||
      !nombre?.trim() || nombre.trim().length > 100) {
    throw new Error('Uso: node --env-file=.env crear-duena.js correo "Nombre"');
  }
  process.stdin.setEncoding("utf8");
  let clave = "";
  for await (const parte of process.stdin) {
    clave += parte;
    if (clave.length > 130) throw new Error("La contraseña debe tener de 12 a 128 caracteres.");
  }
  clave = clave.replace(/\r?\n$/, "");
  if (clave.length < 12 || clave.length > 128) throw new Error("La contraseña debe tener de 12 a 128 caracteres.");
  const [resultado] = await conexion.execute(
    `INSERT INTO usuarios (id_rol,nombre,correo,password_hash)
     SELECT id_rol,?,?,? FROM roles WHERE nombre='Dueña' ORDER BY id_rol LIMIT 1`,
    [nombre.trim(), correo.trim(), await proteger(clave)]
  );
  if (!resultado.affectedRows) throw new Error("Primero importa el rol Dueña.");
  console.log("Cuenta de Dueña creada.");
} catch (error) {
  console.error(error.code === "ER_DUP_ENTRY" ? "Ya existe una cuenta con ese correo." : error.code || error.message);
  process.exitCode = 1;
} finally {
  await conexion.end();
}
