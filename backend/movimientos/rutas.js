import { Router } from "express";
import conexion from "../Conexion BaseDatos/conexion.js";
import { exigirSesion } from "../inicio de sesion/sesiones.js";
import { registrarMovimiento } from "./servicio.js";

const rutas = Router();
rutas.use(exigirSesion);
rutas.get("/", async (_req, res, next) => {
  try {
    const [filas] = await conexion.execute(
      `SELECT m.id_movimiento AS id, LOWER(m.tipo_movimiento) AS tipo,
       m.cantidad, DATE_FORMAT(m.fecha_movimiento,'%Y-%m-%d') AS fecha,
       DATE_FORMAT(m.fecha_movimiento,'%H:%i') AS hora, m.observaciones,
       p.nombre AS producto, p.unidad_medida AS unidad, u.nombre AS usuario
       FROM movimientos_inventario m JOIN productos p ON p.id_producto=m.id_producto
       JOIN usuarios u ON u.id_usuario=m.id_usuario ORDER BY m.id_movimiento DESC LIMIT 200`);
    res.set("Cache-Control", "no-store").json(filas.map(fila => {
      let nota;
      try { nota = JSON.parse(fila.observaciones); } catch {}
      return nota?.formato === "imperio-movimiento-v1"
        ? { ...fila, detalle: nota.detalle, observaciones: nota.observaciones, producto: nota.producto, unidad: nota.unidad }
        : { ...fila, detalle: "—" };
    }));
  } catch (error) { next(error); }
});
rutas.post("/", async (req, res) => {
  try {
    const resultado = await registrarMovimiento(conexion, req.body || {}, req.idUsuario);
    res.status(201).json({ mensaje: "Movimiento registrado. Inventario actualizado.", ...resultado });
  } catch (error) {
    if (!error.estado) console.error("Movimientos:", error.code || error.message);
    res.status(error.estado || 500).json({ mensaje: error.estado ? error.message : "No se pudo guardar el movimiento. Consulta el historial antes de reintentarlo." });
  }
});
export default rutas;
