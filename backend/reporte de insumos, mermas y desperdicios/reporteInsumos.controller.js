const pool = require('./db'); // Ajusta la ruta a tu archivo de conexión

// 1. Registrar una nueva merma, desperdicio o salida de insumo
const registrarMermaDesperdicio = async (req, res) => {
    const { id_insumo, tipo_registro, cantidad, motivo, responsable, observaciones } = req.body;

    if (!id_insumo || !tipo_registro || !cantidad || cantidad <= 0 || !motivo || !responsable) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Faltan campos obligatorios o la cantidad es inválida.'
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Verificar existencia y stock actual del insumo
        const [insumos] = await connection.query(
            'SELECT nombre, stock_actual, costo_unitario FROM insumos WHERE id_insumo = ? FOR UPDATE',
            [id_insumo]
        );

        if (insumos.length === 0) {
            await connection.rollback();
            return res.status(404).json({ ok: false, mensaje: 'El insumo no existe.' });
        }

        const insumo = insumos[0];

        if ( parseFloat(insumo.stock_actual) < parseFloat(cantidad) ) {
            await connection.rollback();
            return res.status(400).json({
                ok: false,
                mensaje: `Stock insuficiente para ${insumo.nombre}. Stock actual: ${insumo.stock_actual}`
            });
        }

        // Calcular el impacto económico de la merma/desperdicio
        const costo_total = (parseFloat(cantidad) * parseFloat(insumo.costo_unitario)).toFixed(2);

        // Insertar el reporte
        const [resultado] = await connection.query(
            `INSERT INTO mermas_desperdicios 
            (id_insumo, tipo_registro, cantidad, costo_total, motivo, responsable, observaciones) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id_insumo, tipo_registro, cantidad, costo_total, motivo, responsable, observaciones || null]
        );

        // Descontar del stock actual del insumo
        await connection.query(
            'UPDATE insumos SET stock_actual = stock_actual - ? WHERE id_insumo = ?',
            [cantidad, id_insumo]
        );

        await connection.commit();

        res.status(201).json({
            ok: true,
            mensaje: 'Registro guardado y stock actualizado correctamente.',
            id_reporte: resultado.insertId,
            costo_calculado: costo_total
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al registrar merma:', error);
        res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
    } finally {
        connection.release();
    }
};

// 2. Obtener el reporte detallado con filtros (Fechas, Tipo, Categoría)
const obtenerReporteGeneral = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, tipo_registro, categoria } = req.query;

        let query = `
            SELECT 
                m.id_reporte,
                i.codigo,
                i.nombre AS nombre_insumo,
                i.categoria,
                i.unidad_medida,
                m.tipo_registro,
                m.cantidad,
                i.costo_unitario,
                m.costo_total,
                m.motivo,
                m.responsable,
                DATE_FORMAT(m.fecha_registro, '%Y-%m-%d %H:%i:%s') AS fecha_registro,
                m.observaciones
            FROM mermas_desperdicios m
            INNER JOIN insumos i ON m.id_insumo = i.id_insumo
            WHERE 1=1
        `;
        const params = [];

        if (fechaInicio && fechaFin) {
            query += ` AND DATE(m.fecha_registro) BETWEEN ? AND ?`;
            params.push(fechaInicio, fechaFin);
        }
        if (tipo_registro) {
            query += ` AND m.tipo_registro = ?`;
            params.push(tipo_registro);
        }
        if (categoria) {
            query += ` AND i.categoria = ?`;
            params.push(categoria);
        }

        query += ` ORDER BY m.fecha_registro DESC`;

        const [registros] = await pool.query(query, params);

        // Calcular KPIs / Totales para el encabezado del reporte
        const resumen = registros.reduce((acc, item) => {
            const costo = parseFloat(item.costo_total);
            acc.costo_total_general += costo;
            if (item.tipo_registro === 'MERMA') acc.total_mermas += costo;
            if (item.tipo_registro === 'DESPERDICIO') acc.total_desperdicios += costo;
            if (item.tipo_registro === 'USO_INSUMO') acc.total_uso += costo;
            return acc;
        }, {
            total_registros: registros.length,
            costo_total_general: 0,
            total_mermas: 0,
            total_desperdicios: 0,
            total_uso: 0
        });

        res.json({
            ok: true,
            resumen,
            datos: registros
        });

    } catch (error) {
        console.error('Error al obtener reporte:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al generar el reporte.' });
    }
};

// 3. Obtener estado actual de insumos y alertas de stock bajo
const obtenerEstadoInsumos = async (req, res) => {
    try {
        const [insumos] = await pool.query(`
            SELECT 
                id_insumo, codigo, nombre, categoria, unidad_medida,
                stock_actual, stock_minimo, costo_unitario,
                (stock_actual * costo_unitario) AS valor_inventario,
                CASE 
                    WHEN stock_actual <= 0 THEN 'AGOTADO'
                    WHEN stock_actual <= stock_minimo THEN 'STOCK_BAJO'
                    ELSE 'OPTIMO'
                END AS estado_stock
            FROM insumos
            ORDER BY estado_stock ASC, nombre ASC
        `);

        res.json({ ok: true, insumos });
    } catch (error) {
        console.error('Error al consultar insumos:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al consultar el inventario de insumos.' });
    }
};

module.exports = {
    registrarMermaDesperdicio,
    obtenerReporteGeneral,
    obtenerEstadoInsumos
};
