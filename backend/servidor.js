import rutasMovimientos from "./movimientos/rutas.js";
import rutasUsuarios from "./administracion perfiles/rutas.js";
import express from "express";
import { fileURLToPath } from "node:url";
import conexion from "./Conexion BaseDatos/conexion.js";
import rutasInicioSesion from "./inicio de sesion/rutas.js";
import rutasInventario from "./gestion de inventario/rutas.js";

const app = express();
const puerto = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "4kb" }));

app.use("/api/movimientos", rutasMovimientos);
app.use("/api/usuarios", rutasUsuarios);
app.use("/api", rutasInicioSesion);
app.use("/api/inventario", rutasInventario );

app.get("/", (_req, res) => {
  res.redirect("/inicio%20de%20sesion/index.html");
});

const carpetaFrontend = fileURLToPath(
  new URL("../frontend/", import.meta.url)
);

app.use(express.static(carpetaFrontend));

app.use((error, _req, res, _next) => {
  res.status(error.status || 500).json({
    mensaje: "Solicitud inválida."
  });
});

try {
  await conexion.query("SELECT 1");

  app.listen(puerto, "127.0.0.1", () => {
    console.log(`Imperio: http://localhost:${puerto}`);
  });
} catch (error) {
  console.error(
    "No se pudo conectar a MySQL. Revisa .env y el servicio MySQL:",
    error.code || error.message
  );

  await conexion.end();
  process.exitCode = 1;
}