import conexion from "../Conexion BaseDatos/conexion.js";

export async function obtenerInventario(req, res) {
    try {
        const [productos] = await conexion.execute(
            `SELECT 
                p.id_producto,
                p.id_categoria,
                p.codigo_barras,
                p.nombre,
                p.unidad_medida,
                p.stock_actual,
                p.stock_minimo,
                p.precio_compra,
                p.precio_venta,
                c.nombre AS categoria_nombre
             FROM productos p
             LEFT JOIN categorias c ON c.id_categoria = p.id_categoria`
        );

        res.json(productos);
    } catch (error) {
        console.error("Error al obtener el inventario:", error);
        res.status(500).json({ mensaje: "Error interno al consultar la base de datos." });
    }
}