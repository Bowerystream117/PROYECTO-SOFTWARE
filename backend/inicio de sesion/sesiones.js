import { randomUUID } from "node:crypto";
import conexion from "../Conexion BaseDatos/conexion.js";

const sesiones = new Map();
export function crearToken(id) {
  const ahora = Date.now();
  for (const [token, sesion] of sesiones) {
    if (sesion.vence <= ahora) sesiones.delete(token);
  }
  const token = randomUUID();
  sesiones.set(token, { id, vence: ahora + 8 * 60 * 60 * 1000 });
  return token;
}

export async function exigirDuena(req, res, next) {
  const token = req.get("Authorization")?.replace(/^Bearer /, "");
  const sesion = sesiones.get(token);
  if (!sesion || sesion.vence <= Date.now()) {
    return res.status(401).json({ mensaje: "Vuelve a iniciar sesión para modificar el inventario." });
  }
  try {
    const [filas] = await conexion.execute(
      "SELECT r.nombre FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol WHERE u.id_usuario=? AND u.activo=1",
      [sesion.id]);
    const rol = filas[0]?.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (rol !== "duena") return res.status(403).json({ mensaje: "Solo una cuenta de dueña activa puede modificar productos." });
    next();
  } catch (error) { next(error); }
}
