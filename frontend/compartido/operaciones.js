"use strict";
window.operacionesImperio = (() => {
  function autorizar(soloDuena = false) {
    const sesion = sesionImperio.leer();
    if (!sesion || (soloDuena && (sesion.rol !== "duena" || sessionStorage.getItem("imperioVistaEmpleado") === "true"))) {
      throw new Error("No tienes permiso para esta operación.");
    }
    return sesion;
  }

  async function solicitar(ruta, datos) {
    const sesion = autorizar();
    const respuesta = await fetch("/api/" + ruta, {
      method: datos ? "POST" : "GET",
      cache: "no-store",
      headers: { Authorization: "Bearer " + sesion.token, ...(datos && { "Content-Type": "application/json" }) },
      body: datos ? JSON.stringify(datos) : undefined
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok) throw new Error(resultado.mensaje || "No se pudo completar la operación.");
    return resultado;
  }

  async function productos() {
    const filas = await solicitar("inventario");
    return filas.map(p => ({
      id: String(p.id_producto), nombre: p.nombre, unidad: p.unidad_medida, stock: Number(p.stock_actual)
    }));
  }

  function reporte(desde, hasta) {
    const filtros = new URLSearchParams();
    if (desde) filtros.set("desde", desde);
    if (hasta) filtros.set("hasta", hasta);
    return solicitar("reportes?" + filtros);
  }

  return {
    autorizar, productos, reporte,
    mermas: () => solicitar("mermas"),
    registrarMerma: datos => solicitar("mermas", datos)
  };
})();
