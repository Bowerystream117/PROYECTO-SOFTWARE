import { crearToken } from "./sesiones.js";
import conexion from "../Conexion BaseDatos/conexion.js";
import { comprobar, esHash, proteger } from "./claves.js";

export async function iniciarSesion(req, res) {
  const { correo: acceso, contrasena } = req.body || {};

  if (
    typeof acceso !== "string" ||
    typeof contrasena !== "string" ||
    !acceso.trim() ||
    !contrasena ||
    acceso.length > 100 ||
    contrasena.length > 128
  ) {
    return res.status(400).json({
      mensaje: "Escribe tu correo y contraseña."
    });
  }

  try {
    const [usuarios] = await conexion.execute(
      `SELECT
         u.id_usuario,
         u.nombre,
         u.correo,
         u.password_hash,
         r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.correo = ? AND u.activo = 1
       LIMIT 1`,
      [acceso.trim()]
    );

    const usuario = usuarios[0];

    const anterior = usuario?.password_hash;
    const hash = esHash(anterior);
    const contrasenaCorrecta = usuario && (hash ? await comprobar(contrasena, anterior) : contrasena === anterior);

    // Convierte "Dueña" en "duena" y "Empleado" en "empleado".
    const rol = usuario?.rol
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (
      !contrasenaCorrecta ||
      !["duena", "empleado"].includes(rol)
    ) {
      return res.status(401).json({
        mensaje:
          "Correo o contraseña incorrectos, o cuenta dada de baja."
      });
    }

    if (!hash) {
      const [cambio] = await conexion.execute(
        "UPDATE usuarios SET password_hash=? WHERE id_usuario=? AND activo=1 AND BINARY password_hash=?",
        [await proteger(contrasena), usuario.id_usuario, anterior]
      );
      if (!cambio.affectedRows) return res.status(401).json({ mensaje: "Vuelve a iniciar sesión." });
    }
    res.set("Cache-Control", "no-store");

    return res.json({
      id: usuario.id_usuario,
      token: crearToken(usuario.id_usuario),
      usuario: usuario.nombre,
      correo: usuario.correo,
      rol
    });
  } catch (error) {
    console.error(
      "Error de acceso MySQL:",
      error.code || error.message
    );

    return res.status(503).json({
      mensaje:
        "No se pudo consultar MySQL. Revisa la conexión y las tablas."
    });
  }
}
