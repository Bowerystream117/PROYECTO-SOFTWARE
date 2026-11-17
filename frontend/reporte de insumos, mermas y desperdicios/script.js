"use strict";
(() => {
  const { elemento, tabla, csv, descargar, ejecutar, dinero, avisar, hoy, fechaCorta } = uiImperio;
  try { operacionesImperio.autorizar(true); } catch { return; }
  const encabezados = ["Fecha", "Tipo", "Producto", "Cantidad", "Unidad", "Usuario", "Observación"];
  const titulos = {
    todos: "Movimientos generales", entrada: "Entradas de insumos",
    salida: "Salidas de insumos", merma: "Mermas y desperdicios"
  };
  const indicadores = { entrada: "Entradas", salida: "Salidas", merma: "Mermas", ventas: "Ventas en cortes (MXN)" };
  const botones = ["filtrar", "anterior", "siguiente", "exportarExcel", "exportar", "imprimir"];
  let filtros;
  let resultado;
  let ocupado = false;

  function controles() {
    botones.forEach(id => { elemento(id).disabled = ocupado || (id !== "filtrar" && !resultado); });
    if (!ocupado && resultado) {
      elemento("anterior").disabled = resultado.pagina <= 1;
      elemento("siguiente").disabled = resultado.pagina * resultado.porPagina >= resultado.total;
    }
  }

  async function procesar(tarea) {
    if (ocupado) return;
    ocupado = true;
    controles();
    try { await ejecutar(tarea); }
    finally { ocupado = false; controles(); }
  }

  function periodo({ desde, hasta }) {
    if (desde && hasta) return fechaCorta(desde) + " al " + fechaCorta(hasta);
    if (desde) return "Desde " + fechaCorta(desde);
    if (hasta) return "Hasta " + fechaCorta(hasta);
    return "Todo el período registrado";
  }

  function filas(datos) {
    return datos.map(m => [
      fechaCorta(m.fecha), { entrada: "Entrada", salida: "Salida", merma: "Merma" }[m.tipo],
      m.producto, m.cantidad, m.unidad, m.usuario, m.descripcion || m.tipoBaja || m.observaciones || m.detalle || ""
    ]);
  }

  function metricas(datos, destino) {
    destino.replaceChildren();
    const valores = Object.entries(datos.resumen);
    if (datos.ventas !== undefined) valores.push(["ventas", dinero(Number(datos.ventas))]);
    for (const [clave, valor] of valores) {
      const tarjeta = document.createElement("article");
      tarjeta.className = "indicador";
      const nombre = document.createElement("span");
      const total = document.createElement("strong");
      nombre.textContent = indicadores[clave];
      total.textContent = valor;
      tarjeta.append(nombre, total);
      destino.append(tarjeta);
    }
  }

  async function actualizar(nuevosFiltros, pagina = 1) {
    const datos = await operacionesImperio.reporte(nuevosFiltros, pagina);
    filtros = nuevosFiltros;
    resultado = datos;
    elemento("tituloResultados").textContent = titulos[filtros.tipo];
    elemento("rangoResultados").textContent = periodo(filtros);
    metricas(datos, elemento("indicadores"));
    tabla(encabezados, filas(datos.movimientos));
    const inicio = (datos.pagina - 1) * datos.porPagina;
    elemento("pagina").textContent = datos.total
      ? (inicio + 1) + "–" + (inicio + datos.movimientos.length) + " de " + datos.total
      : "0 registros";
    avisar("");
  }

  function filtrar() {
    return procesar(() => actualizar({
      desde: elemento("desde").value, hasta: elemento("hasta").value, tipo: elemento("reporte").value
    }));
  }

  async function reporteCompleto() {
    const datos = await operacionesImperio.reporte(filtros, 1, 200);
    const registros = [...datos.movimientos];
    for (let pagina = 2; (pagina - 1) * datos.porPagina < datos.total; pagina++) {
      const lote = await operacionesImperio.reporte(filtros, pagina, datos.porPagina);
      if (lote.pagina !== pagina || lote.total !== datos.total) {
        throw new Error("El reporte cambió durante la descarga. Vuelve a generarlo.");
      }
      registros.push(...lote.movimientos);
    }
    return { ...datos, movimientos: registros };
  }

  elemento("filtros").onsubmit = evento => { evento.preventDefault(); filtrar(); };
  elemento("anterior").onclick = () => procesar(() => actualizar(filtros, resultado.pagina - 1));
  elemento("siguiente").onclick = () => procesar(() => actualizar(filtros, resultado.pagina + 1));
  elemento("exportarExcel").onclick = () => procesar(async () => {
    avisar("Preparando el archivo de Excel…");
    const archivo = await operacionesImperio.reporteExcel(filtros);
    descargar(archivo, "imperio-" + filtros.tipo + "-" + hoy() + ".xlsx");
    avisar("");
  });
  elemento("exportar").onclick = () => procesar(async () => {
    avisar("Preparando el CSV…");
    const datos = await reporteCompleto();
    csv(encabezados, filas(datos.movimientos), "imperio-" + filtros.tipo + "-" + hoy());
    avisar("");
  });
  elemento("imprimir").onclick = () => procesar(async () => {
    avisar("Preparando el PDF…");
    const archivo = await operacionesImperio.reportePdf(filtros);
    descargar(archivo, "imperio-" + filtros.tipo + "-" + hoy() + ".pdf");
    avisar("");
  });
  filtrar();
})();
