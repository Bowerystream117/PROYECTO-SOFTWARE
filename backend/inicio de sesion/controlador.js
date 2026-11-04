import conexion from "../Conexion BaseDatos/conexion.js";

export async function iniciarSesion(req, res) {
  const { correo, contrasena } = req.body || {};

  if (
    typeof correo !== "string" ||
    typeof contrasena !== "string" ||
    !correo.trim() ||
    !contrasena ||
    correo.length > 100 ||
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
      [correo.trim()]
    );

    const usuario = usuarios[0];

    // Comparación directa, sin hash.
    const contrasenaCorrecta =
      usuario && usuario.password_hash === contrasena;

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

    res.set("Cache-Control", "no-store");

    return res.json({
      id: usuario.id_usuario,
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