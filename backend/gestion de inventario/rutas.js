import { Router } from "express";
import { obtenerInventario } from "./controlador.js";

const rutas = Router();

rutas.get("/", obtenerInventario);

export default rutas;