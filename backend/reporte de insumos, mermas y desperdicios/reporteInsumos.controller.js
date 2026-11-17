import { Router } from "express";
import conexion from "../Conexion BaseDatos/conexion.js";
import { exigirDuena } from "../inicio de sesion/sesiones.js";
import { fechaValida, formatearMovimiento } from "../entrada y salida de insumos/servicio.js";
import { transaccion } from "../gestion de cuentas financieras/servicio.js";
import { crearExcel } from "./excel.js";
import { crearPdf } from "./pdf.js";

const rutas = Router();
const tipos = ["entrada", "salida", "merma"];
const movimientosSql = `
  SELECT m.id_movimiento AS id, LOWER(m.tipo_movimiento) AS tipo, m.cantidad,
         m.fecha_movimiento AS fechaRegistro, m.observaciones, p.nombre AS producto,
         p.unidad_medida AS unidad, u.nombre AS usuario, NULL AS tipoBaja, NULL AS descripcion
  FROM movimientos_inventario m JOIN productos p USING (id_producto) JOIN usuarios u USING (id_usuario)
  WHERE (? IS NULL OR m.fecha_movimiento >= ?) AND (? IS NULL OR m.fecha_movimiento <= ?)
`;
const mermasSql = `
  SELECT m.id_merma AS id, 'merma' AS tipo, m.cantidad, m.fecha_registro AS fechaRegistro,
         NULL AS observaciones, COALESCE(r.producto,p.nombre) AS producto,
         COALESCE(r.unidad,p.unidad_medida) AS unidad, u.nombre AS usuario,
         m.motivo AS tipoBaja, r.descripcion
  FROM mermas m JOIN productos p USING (id_producto) JOIN usuarios u USING (id_usuario)
  LEFT JOIN mermas_registro r USING (id_merma)
  WHERE (? IS NULL OR m.fecha_registro >= ?) AND (? IS NULL OR m.fecha_registro <= ?)
`;

function entero(valor, maximo) {
  return typeof valor === "string" && /^[1-9]\d{0,8}$/.test(valor) && Number(valor) <= maximo;
}

async function generar(db, tipo, filtros, pagina, porPagina, completo = false) {
  const general = tipo === "todos";
  const resumen = {};
  if (tipo !== "merma") {
    const [conteos] = await db.execute(
      `SELECT LOWER(tipo_movimiento) AS tipo, COUNT(*) AS total FROM movimientos_inventario
       WHERE (? IS NULL OR fecha_movimiento >= ?) AND (? IS NULL OR fecha_movimiento <= ?)
       GROUP BY tipo_movimiento`, filtros
    );
    for (const clase of ["entrada", "salida"]) {
      if (general || clase === tipo) resumen[clase] = Number(conteos.find(c => c.tipo === clase)?.total || 0);
    }
  }
  if (general || tipo === "merma") {
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM mermas
       WHERE (? IS NULL OR fecha_registro >= ?) AND (? IS NULL OR fecha_registro <= ?)`, filtros
    );
    resumen.merma = Number(total);
  }
  let ventas;
  if (general) {
    const [[fila]] = await db.execute(
      `SELECT COALESCE(SUM(ventas_efectivo + ventas_tarjeta),0) AS ventas FROM cortes_caja
       WHERE (? IS NULL OR fecha_corte >= ?) AND (? IS NULL OR fecha_corte <= ?)`, filtros
    );
    ventas = fila.ventas;
  }
  const total = Object.values(resumen).reduce((suma, cantidad) => suma + cantidad, 0);
  const paginaActual = Math.min(pagina, Math.max(1, Math.ceil(total / porPagina)));
  return {
    movimientos: await leerMovimientos(db, tipo, filtros, completo ? undefined : porPagina, (paginaActual - 1) * porPagina),
    resumen, total, pagina: paginaActual, porPagina, ...(general && { ventas })
  };
}

async function leerMovimientos(db, tipo, filtros, limite, inicio = 0) {
  const general = tipo === "todos";
  const fuentes = general ? movimientosSql + " UNION ALL " + mermasSql
    : tipo === "merma" ? mermasSql
      : movimientosSql + " AND m.tipo_movimiento = ?";
  const parametros = general ? [...filtros, ...filtros] : [...filtros];
  if (!general && tipo !== "merma") parametros.push(tipo === "entrada" ? "Entrada" : "Salida");
  const [filas] = await db.execute(
    `SELECT r.*, DATE_FORMAT(fechaRegistro,'%Y-%m-%d') AS fecha,
            DATE_FORMAT(fechaRegistro,'%H:%i:%s') AS hora
     FROM (${fuentes}) r ORDER BY fechaRegistro DESC, tipo, id DESC
     ${limite ? "LIMIT ? OFFSET ?" : ""}`,
    limite ? [...parametros, limite, inicio] : parametros
  );
  return filas.map(fila => fila.tipo === "merma" ? fila : formatearMovimiento(fila));
}

rutas.get(["/", "/excel", "/pdf"], exigirDuena, async (req, res, next) => {
  const { desde = null, hasta = null, tipo = "todos", pagina = "1", porPagina = "25" } = req.query;
  if ((desde !== null && !fechaValida(desde)) || (hasta !== null && !fechaValida(hasta)) ||
      (desde && hasta && desde > hasta)) {
    return res.status(400).json({ mensaje: "Selecciona un rango de fechas válido." });
  }
  if (!(tipo === "todos" || tipos.includes(tipo)) || !entero(pagina, 999999999) || !entero(porPagina, 200)) {
    return res.status(400).json({ mensaje: "El tipo de reporte o la página no son válidos." });
  }
  try {
    const inicio = desde ? desde + " 00:00:00" : null;
    const fin = hasta ? hasta + " 23:59:59" : null;
    const formato = req.path.replace(/\/$/, "");
    if (formato === "/pdf") {
      const datos = await transaccion(conexion, db =>
        generar(db, tipo, [inicio, inicio, fin, fin], 1, 25, true));
      const archivo = await crearPdf(tipo, desde, hasta, datos);
      return res.set("Cache-Control", "no-store").type("application/pdf")
        .attachment("imperio-" + tipo + ".pdf").send(archivo);
    }
    if (formato === "/excel") {
      const movimientos = await leerMovimientos(conexion, tipo, [inicio, inicio, fin, fin]);
      const archivo = await crearExcel(tipo, desde, hasta, movimientos);
      return res.set("Cache-Control", "no-store").type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        .attachment("imperio-" + tipo + ".xlsx").send(Buffer.from(archivo));
    }
    const resultado = await transaccion(conexion, db =>
      generar(db, tipo, [inicio, inicio, fin, fin], Number(pagina), Number(porPagina)));
    res.set("Cache-Control", "no-store").json(resultado);
  } catch (error) { next(error); }
});

export default rutas;
