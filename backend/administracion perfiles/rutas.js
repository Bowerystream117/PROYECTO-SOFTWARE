import { Router } from "express";
import conexion from "../Conexion BaseDatos/conexion.js";
import { exigirDuena } from "../inicio de sesion/sesiones.js";

const rutas = Router();
rutas.use(exigirDuena);

rutas.get("/", async (_req, res, next) => {
  try {
    const [usuarios] = await conexion.execute(
      `SELECT u.id_usuario AS id, u.nombre, u.correo,
              IF(r.nombre='Dueña','duena','empleado') AS rol,
              IF(u.activo=1,'activo','baja') AS estado
       FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol ORDER BY u.nombre, u.id_usuario`);
    res.set("Cache-Control", "no-store").json(usuarios);
  } catch (error) { next(error); }
});

async function guardar(req, res, next) {
  const { id } = req.params;
  const datos = req.body || {};
  const nombre = typeof datos.nombre === "string" ? datos.nombre.trim() : "";
  const correo = typeof datos.correo === "string" ? datos.correo.trim() : "";
  const clave = datos.contrasena ?? "";
  if (!nombre || nombre.length > 100) return res.status(400).json({ mensaje: "Escribe un nombre válido." });
  if (!correo || correo.length > 100 || !/^[^\s@]+@[^\s@]+$/.test(correo)) {
    return res.status(400).json({ mensaje: "El correo no es válido." });
  }
  if (typeof clave !== "string" || ((!id || clave) && (clave.length < 8 || clave.length > 128))) {
    return res.status(400).json({ mensaje: "Escribe una contraseña de 8 a 128 caracteres." });
  }
  if (!["duena", "empleado"].includes(datos.rol) || !["activo", "baja"].includes(datos.estado)) {
    return res.status(400).json({ mensaje: "Selecciona un rol y un estado válidos." });
  }
  if (id && !/^[1-9]\d{0,9}$/.test(id)) return res.status(400).json({ mensaje: "Usuario inválido." });
  if (Number(id) === req.idUsuario && (datos.rol !== "duena" || datos.estado !== "activo")) {
    return res.status(409).json({ mensaje: "Tu propia cuenta debe conservar el rol de dueña y el estado activo." });
  }
  try {
    const [roles] = await conexion.execute("SELECT id_rol FROM roles WHERE nombre=? LIMIT 1",
      [datos.rol === "duena" ? "Dueña" : "Empleado"]);
    if (!roles.length) return res.status(409).json({ mensaje: "El rol seleccionado falta en la tabla roles." });
    const valores = [nombre, correo, roles[0].id_rol, datos.estado === "activo" ? 1 : 2];
    if (clave) valores.push(clave);
    if (id) {
      const cambioClave = clave ? ", password_hash=?" : "";
      const [resultado] = await conexion.execute(
        "UPDATE usuarios SET nombre=?, correo=?, id_rol=?, activo=?" + cambioClave + " WHERE id_usuario=?", [...valores, id]);
      if (!resultado.affectedRows) return res.status(404).json({ mensaje: "El usuario ya no existe." });
    } else {
      await conexion.execute("INSERT INTO usuarios (nombre,correo,id_rol,activo,password_hash) VALUES (?,?,?,?,?)", valores);
    }
    res.status(id ? 200 : 201).json({ mensaje: "Usuario guardado." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ mensaje: "El correo ya está registrado." });
    next(error);
  }
}
rutas.post("/", guardar);
rutas.put("/:id", guardar);
export default rutas;
