import { exigirDuena } from "../inicio de sesion/sesiones.js";
import { modificarInventario } from "./escritura.js";
import { Router } from "express";
import { obtenerInventario } from "./controlador.js";

const rutas = Router();

rutas.get("/", obtenerInventario);
rutas.post("/", exigirDuena, modificarInventario);
rutas.put("/:id", exigirDuena, modificarInventario);
rutas.delete("/:id", exigirDuena, modificarInventario);

export default rutas;