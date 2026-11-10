import { Router } from "express";
import { iniciarSesion } from "./controlador.js";

const rutas = Router();

rutas.post("/login", iniciarSesion);

export default rutas;