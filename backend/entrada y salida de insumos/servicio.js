// Importes en centésimas para evitar errores de redondeo binario.
const fallo = (mensaje, estado = 400) => Object.assign(new Error(mensaje), { estado });
export function centesimas(valor) {
  if (!["string", "number"].includes(typeof valor) || !/^\d{1,8}(\.\d{1,2})?$/.test(String(valor))) {
    throw fallo("La cantidad debe tener hasta ocho enteros y dos decimales.");
  }
  const [entero, fraccion = ""] = String(valor).split(".");
  return Number(entero) * 100 + Number(fraccion.padEnd(2, "0"));
}
const decimal = valor => (valor / 100).toFixed(2);

export async function registrarMovimiento(pool, datos, idUsuario) {
  const { productoId, tipo, cantidad, fecha } = datos;
  if (!/^[1-9]\d{0,9}$/.test(String(productoId))) throw fallo("Selecciona un producto registrado.");
  if (!["entrada", "salida"].includes(tipo)) throw fallo("Tipo de movimiento inválido.");
  const unidades = centesimas(cantidad);
  if (unidades <= 0) throw fallo("La cantidad debe ser mayor que cero.");
  const detalle = typeof datos.detalle === "string" ? datos.detalle.trim() : "";
  const observaciones = typeof datos.observaciones === "string" ? datos.observaciones.trim() : "";
  if (!detalle || detalle.length > 120 || observaciones.length > 300) throw fallo("Revisa el proveedor, motivo y las observaciones.");
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
  if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
      Number(fecha.slice(0, 4)) < 1000 || isNaN(Date.parse(fecha)) ||
      new Date(fecha).toISOString().slice(0, 10) !== fecha || fecha > hoy) {
    throw fallo("Selecciona una fecha válida que no sea futura.");
  }
  const db = await pool.getConnection();
  try {
    await db.beginTransaction();
    // El bloqueo serializa los movimientos del mismo producto hasta confirmar.
    const [filas] = await db.execute(
      "SELECT id_producto, nombre, unidad_medida, stock_actual FROM productos WHERE id_producto=? FOR UPDATE",
      [productoId]);
    const producto = filas[0];
    if (!producto) throw fallo("El producto ya no existe en la base de datos.", 404);
    const stock = centesimas(producto.stock_actual);
    if (tipo === "salida" && unidades > stock) throw fallo(
      "Existencias insuficientes. Disponible: " + decimal(stock) + " " + producto.unidad_medida + ".", 409);
    const nuevoStock = stock + (tipo === "entrada" ? unidades : -unidades);
    if (nuevoStock > 9999999999) throw fallo("La entrada supera el máximo permitido de inventario.");
    // Se conservan proveedor/motivo y unidad histórica en el campo TEXT existente.
    const nota = JSON.stringify({ formato: "imperio-movimiento-v1", detalle, observaciones,
      producto: producto.nombre, unidad: producto.unidad_medida });
    const [registro] = await db.execute(
      "INSERT INTO movimientos_inventario (id_producto,id_usuario,tipo_movimiento,cantidad,fecha_movimiento,observaciones) VALUES (?,?,?,?,CONCAT(?, ' ', TIME(CURRENT_TIMESTAMP)),?)",
      [productoId, idUsuario, tipo === "entrada" ? "Entrada" : "Salida", decimal(unidades), fecha, nota]);
    await db.execute("UPDATE productos SET stock_actual=? WHERE id_producto=?", [decimal(nuevoStock), productoId]);
    await db.commit();
    return { id: registro.insertId, stock: decimal(nuevoStock), unidad: producto.unidad_medida };
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    db.release();
  }
}
