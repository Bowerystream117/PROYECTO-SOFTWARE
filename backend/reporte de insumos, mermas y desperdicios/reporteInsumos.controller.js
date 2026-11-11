import { Router } from "express";
import conexion from "../Conexion BaseDatos/conexion.js";
import { exigirDuena } from "../inicio de sesion/sesiones.js";
import { fechaValida, formatearMovimiento } from "../entrada y salida de insumos/servicio.js";
import { consultarMermas } from "../productos no aptos/rutas.js";
import { transaccion } from "../gestion de cuentas financieras/servicio.js";

const rutas = Router();

rutas.get("/", exigirDuena, async (req, res, next) => {
  const { desde = null, hasta = null } = req.query;
  if ((desde !== null && !fechaValida(desde)) || (hasta !== null && !fechaValida(hasta)) ||
      (desde && hasta && desde > hasta)) {
    return res.status(400).json({ mensaje: "Selecciona un rango de fechas válido." });
  }
  try {
    const resultado = await transaccion(conexion, async db => {
      const filtros = [desde, desde, hasta, hasta];
      const [movimientos] = await db.execute(
        `SELECT m.id_movimiento AS id, LOWER(m.tipo_movimiento) AS tipo, m.cantidad,
                DATE_FORMAT(m.fecha_movimiento,'%Y-%m-%d') AS fecha,
                DATE_FORMAT(m.fecha_movimiento,'%H:%i:%s') AS hora, m.observaciones,
                p.nombre AS producto, p.unidad_medida AS unidad, u.nombre AS usuario
         FROM movimientos_inventario m JOIN productos p USING (id_producto) JOIN usuarios u USING (id_usuario)
         WHERE (? IS NULL OR m.fecha_movimiento >= ?) AND (? IS NULL OR DATE(m.fecha_movimiento) <= ?)`, filtros
      );
      const mermas = await consultarMermas(db, desde, hasta);
      const [[{ ventas }]] = await db.execute(
        `SELECT COALESCE(SUM(ventas_efectivo + ventas_tarjeta), 0) AS ventas FROM cortes_caja
         WHERE (? IS NULL OR fecha_corte >= ?) AND (? IS NULL OR DATE(fecha_corte) <= ?)`, filtros
      );
      return { movimientos: [...movimientos.map(formatearMovimiento), ...mermas], ventas };
    });
    res.set("Cache-Control", "no-store").json(resultado);
  } catch (error) { next(error); }
});

export default rutas;
