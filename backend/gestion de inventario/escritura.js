import conexion from "../Conexion BaseDatos/conexion.js";

function errorSolicitud(mensaje, estado = 400) {
  return Object.assign(new Error(mensaje), { estado });
}

function texto(valor, limite, etiqueta, opcional = false) {
  if (opcional && (valor == null || valor === "")) return null;
  if (typeof valor !== "string" || !valor.trim() || [...valor.trim()].length > limite) {
    throw errorSolicitud("Revisa el campo " + etiqueta + ".");
  }
  return valor.trim();
}

function decimal(valor, etiqueta, opcional = false) {
  if (opcional && (valor == null || valor === "")) return null;
  if (!["number", "string"].includes(typeof valor) || !/^\d{1,8}(\.\d{1,2})?$/.test(String(valor))) {
    throw errorSolicitud("Revisa " + etiqueta + ". Se admiten hasta ocho enteros y dos decimales.");
  }
  return valor;
}

export async function modificarInventario(req, res) {
  let db;
  try {
    const id = req.params.id;
    if (id !== undefined && !/^[1-9]\d{0,9}$/.test(id)) throw errorSolicitud("Producto inválido.");
    if (req.method === "DELETE") {
      const [resultado] = await conexion.execute("DELETE FROM productos WHERE id_producto = ?", [id]);
      if (!resultado.affectedRows) throw errorSolicitud("El producto ya no existe.", 404);
      return res.json({ mensaje: "Producto eliminado." });
    }
    const p = req.body || {};
    const categoria = texto(p.categoria, 50, "categoría");
    const valores = [
      texto(p.nombre, 100, "nombre"), texto(p.unidad, 20, "unidad"),
      texto(p.codigo, 50, "código de barras", true),
      decimal(p.stock, "el stock actual"), decimal(p.minimo, "el stock mínimo"),
      decimal(p.compra, "el precio de compra", true), decimal(p.venta, "el precio de venta", true)
    ];
    db = await conexion.getConnection();
    await db.beginTransaction();
    const [categorias] = await db.execute("SELECT id_categoria FROM categorias WHERE nombre = ? ORDER BY id_categoria LIMIT 1 FOR UPDATE", [categoria]);
    let categoriaId = categorias[0]?.id_categoria;
    if (!categoriaId) {
      const [nueva] = await db.execute("INSERT INTO categorias (nombre) VALUES (?)", [categoria]);
      categoriaId = nueva.insertId;
    }
    valores.push(categoriaId);
    if (id) {
      const [resultado] = await db.execute(
        "UPDATE productos SET nombre=?, unidad_medida=?, codigo_barras=?, stock_actual=?, stock_minimo=?, precio_compra=?, precio_venta=?, id_categoria=? WHERE id_producto=?",
        [...valores, id]);
      if (!resultado.affectedRows) throw errorSolicitud("El producto ya no existe.", 404);
    } else {
      await db.execute(
        "INSERT INTO productos (nombre, unidad_medida, codigo_barras, stock_actual, stock_minimo, precio_compra, precio_venta, id_categoria) VALUES (?,?,?,?,?,?,?,?)", valores);
    }
    await db.commit();
    return res.status(id ? 200 : 201).json({ mensaje: "Producto guardado." });
  } catch (error) {
    if (db) await db.rollback();
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ mensaje: "Ese código de barras ya está registrado." });
    if (error.code === "ER_ROW_IS_REFERENCED_2") return res.status(409).json({ mensaje: "El producto tiene registros asociados y no se puede eliminar." });
    if (!error.estado) console.error("Inventario:", error.code || error.message);
    return res.status(error.estado || 500).json({ mensaje: error.estado ? error.message : "No se pudo completar la operación. Vuelve a intentarlo." });
  } finally {
    db?.release();
  }
}
