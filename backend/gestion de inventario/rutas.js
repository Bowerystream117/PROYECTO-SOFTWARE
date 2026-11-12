import { exigirDuena } from "../inicio de sesion/sesiones.js";
import { modificarInventario } from "./escritura.js";
import { Router } from "express";
import { obtenerInventario } from "./controlador.js";
import conexion from "../Conexion BaseDatos/conexion.js";
import { unidades } from "./unidades.js";

const rutas = Router();

rutas.get("/", obtenerInventario);
rutas.get("/opciones", exigirDuena, async (_req, res, next) => {
  try {
    const [filas] = await conexion.execute("SELECT DISTINCT nombre FROM categorias ORDER BY nombre");
    res.json({ unidades, categorias: filas.map(fila => fila.nombre) });
  } catch (error) { next(error); }
});
rutas.post("/", exigirDuena, modificarInventario);
rutas.put("/:id", exigirDuena, modificarInventario);
rutas.delete("/:id", exigirDuena, modificarInventario);

export default rutas;
