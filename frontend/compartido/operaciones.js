"use strict";
window.operacionesImperio = (() => {
  function autorizar(soloDuena = false) {
    const sesion = sesionImperio.leer();
    if (!sesion || (soloDuena && (sesion.rol !== "duena" || sessionStorage.getItem("imperioVistaEmpleado") === "true"))) {
      throw new Error("No tienes permiso para esta operación.");
    }
    return sesion;
  }

  async function solicitar(ruta, datos, comoArchivo = false) {
    const sesion = autorizar();
    const respuesta = await fetch("/api/" + ruta, {
      method: datos ? "POST" : "GET",
      cache: "no-store",
      headers: { Authorization: "Bearer " + sesion.token, ...(datos && { "Content-Type": "application/json" }) },
      body: datos ? JSON.stringify(datos) : undefined
    });
    if (comoArchivo && respuesta.ok) return respuesta.blob();
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

  function filtrosReporte({ desde, hasta, tipo }) {
    const filtros = new URLSearchParams({ tipo });
    if (desde) filtros.set("desde", desde);
    if (hasta) filtros.set("hasta", hasta);
    return filtros;
  }

  async function reporte(criterios, pagina = 1, porPagina = 25) {
    const filtros = filtrosReporte(criterios);
    filtros.set("pagina", pagina);
    filtros.set("porPagina", porPagina);
    const datos = await solicitar("reportes?" + filtros);
    if (!datos?.resumen || !Array.isArray(datos.movimientos) ||
        !Number.isInteger(datos.total) || !Number.isInteger(datos.pagina) ||
        !Number.isInteger(datos.porPagina)) {
      throw new Error("El servidor devolvió un formato de reporte incompatible. Reinicia Imperio y vuelve a cargar esta página.");
    }
    return datos;
  }

  return {
    autorizar, productos, reporte,
    reporteExcel: filtros => solicitar("reportes/excel?" + filtrosReporte(filtros), undefined, true),
    reportePdf: filtros => solicitar("reportes/pdf?" + filtrosReporte(filtros), undefined, true),
    mermas: () => solicitar("mermas"),
    registrarMerma: datos => solicitar("mermas", datos)
  };
})();
