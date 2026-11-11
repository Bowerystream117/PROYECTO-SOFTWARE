import rutasFinanzas from "./gestion de cuentas financieras/rutas.js";
import rutasCaja from "./corte de caja/rutas.js";
import rutasEntradasSalidas from "./entrada y salida de insumos/rutas.js";
import rutasUsuarios from "./administracion perfiles/rutas.js";
import express from "express";
import { fileURLToPath } from "node:url";
import conexion from "./Conexion BaseDatos/conexion.js";
import rutasInicioSesion from "./inicio de sesion/rutas.js";
import rutasInventario from "./gestion de inventario/rutas.js";
import rutasMermas from "./productos no aptos/rutas.js";
import rutasReportes from "./reporte de insumos, mermas y desperdicios/reporteInsumos.controller.js";

const app = express();
const puerto = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

app.use(express.json({ limit: "4kb" }));

app.use("/api/entradas-salidas", rutasEntradasSalidas);
// Compatibilidad con páginas anteriores.
app.use("/api/movimientos", rutasEntradasSalidas);
app.use("/api/caja", rutasCaja);
app.use("/api/finanzas", rutasFinanzas);
app.use("/api/usuarios", rutasUsuarios);
app.use("/api", rutasInicioSesion);
app.use("/api/inventario", rutasInventario );
app.use("/api/mermas", rutasMermas);
app.use("/api/reportes", rutasReportes);

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

  app.listen(puerto, host, () => {
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
