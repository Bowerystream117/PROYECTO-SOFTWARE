import { Router } from "express";
import conexion from "../Conexion BaseDatos/conexion.js";
import { exigirDuena, exigirSesion } from "../inicio de sesion/sesiones.js";
import { centesimas, validarFechaMovimiento } from "../entrada y salida de insumos/servicio.js";
import { decimal } from "../corte de caja/servicio.js";
import { transaccion } from "../gestion de cuentas financieras/servicio.js";

const rutas = Router();
const fallo = (mensaje, estado = 400) => Object.assign(new Error(mensaje), { estado });
const tipos = ["Caducidad", "Daño", "Otros"];

export async function consultarMermas(db, desde = null, hasta = null) {
  const [filas] = await db.execute(
    `SELECT 'merma' AS tipo, m.id_merma AS id, m.motivo AS tipoBaja, m.cantidad,
            DATE_FORMAT(m.fecha_registro,'%Y-%m-%d') AS fecha,
            DATE_FORMAT(m.fecha_registro,'%H:%i:%s') AS hora,
            COALESCE(r.producto,p.nombre) AS producto, COALESCE(r.unidad,p.unidad_medida) AS unidad,
            COALESCE(r.descripcion,'') AS descripcion, u.nombre AS usuario
     FROM mermas m JOIN productos p USING (id_producto) JOIN usuarios u USING (id_usuario)
     LEFT JOIN mermas_registro r USING (id_merma)
     WHERE (? IS NULL OR m.fecha_registro >= ?) AND (? IS NULL OR DATE(m.fecha_registro) <= ?)
     ORDER BY m.fecha_registro DESC, m.id_merma DESC`, [desde, desde, hasta, hasta]
  );
  return filas;
}

rutas.get("/", exigirDuena, async (_req, res, next) => {
  try {
    res.set("Cache-Control", "no-store").json(await consultarMermas(conexion));
  } catch (error) { next(error); }
});

rutas.post("/", exigirSesion, async (req, res, next) => {
  try {
    const { productoId, cantidad, fecha, tipoBaja, descripcion = "", solicitud } = req.body || {};
    if (!/^[1-9]\d{0,9}$/.test(String(productoId))) throw fallo("Selecciona un producto registrado.");
    if (!tipos.includes(tipoBaja) || typeof descripcion !== "string" || descripcion.trim().length > 160) {
      throw fallo("Revisa el tipo de baja y la descripción.");
    }
    if (typeof solicitud !== "string" || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(solicitud)) {
      throw fallo("Identificador de operación inválido.");
    }
    validarFechaMovimiento(fecha);
    const unidades = centesimas(cantidad);
    if (unidades <= 0) throw fallo("La cantidad debe ser mayor que cero.");
    const nota = descripcion.trim();
    const id = await transaccion(conexion, async db => {
      const [[producto]] = await db.execute(
        "SELECT nombre, unidad_medida, stock_actual FROM productos WHERE id_producto=? FOR UPDATE", [productoId]
      );
      if (!producto) throw fallo("El producto ya no existe.", 404);
      const [[previa]] = await db.execute(
        `SELECT m.id_merma, m.id_producto, m.id_usuario, m.cantidad, m.motivo, r.descripcion,
                DATE_FORMAT(m.fecha_registro,'%Y-%m-%d') AS fecha
         FROM mermas_registro r JOIN mermas m USING (id_merma) WHERE r.solicitud=?`, [solicitud]
      );
      if (previa) {
        if (previa.id_producto !== Number(productoId) || previa.id_usuario !== req.idUsuario ||
            previa.cantidad !== decimal(unidades) || previa.motivo !== tipoBaja ||
            previa.descripcion !== nota || previa.fecha !== fecha) {
          throw fallo("Este identificador ya corresponde a otra merma.", 409);
        }
        return previa.id_merma;
      }
      const stock = centesimas(producto.stock_actual);
      if (unidades > stock) throw fallo("Existencias insuficientes para registrar la merma.", 409);
      const [registro] = await db.execute(
        `INSERT INTO mermas (id_producto,id_usuario,cantidad,motivo,fecha_registro)
         VALUES (?,?,?,?,CONCAT(?, ' ', TIME(CURRENT_TIMESTAMP)))`,
        [productoId, req.idUsuario, decimal(unidades), tipoBaja, fecha]
      );
      await db.execute(
        "INSERT INTO mermas_registro (id_merma,solicitud,producto,unidad,descripcion) VALUES (?,?,?,?,?)",
        [registro.insertId, solicitud, producto.nombre, producto.unidad_medida, nota]
      );
      await db.execute("UPDATE productos SET stock_actual=? WHERE id_producto=?", [decimal(stock - unidades), productoId]);
      return registro.insertId;
    });
    res.status(201).json({ id, mensaje: "Merma registrada. Existencias actualizadas." });
  } catch (error) { next(error); }
});

rutas.use((error, _req, res, _next) => {
  if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ mensaje: "La solicitud ya fue registrada." });
  if (!error.estado) console.error("Mermas:", error.code || error.message);
  res.status(error.estado || 500).json({ mensaje: error.estado ? error.message : "No se pudo consultar o guardar la merma." });
});

export default rutas;
