"use strict";
(() => {
  if (!sesionImperio.leer()) return;
  const formularios = [...document.querySelectorAll("form[data-tipo]")];
  const estado = document.getElementById("mensajeEstado");
  const historial = document.getElementById("cuerpoHistorial");
  let productos = [];
  let ocupado = false;
  let disponible = false;
  const hoy = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
  const mensaje = (texto, error = false) => {
    estado.textContent = texto;
    estado.classList.toggle("error", error);
  };
  async function solicitar(ruta, datos) {
    const respuesta = await fetch(ruta, {
      method: datos ? "POST" : "GET",
      cache: "no-store",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + (sesionImperio.leer()?.token || "") },
      ...(datos ? { body: JSON.stringify(datos) } : {})
    });
    if (!respuesta.headers.get("content-type")?.includes("application/json")) {
      throw new Error("Abre Imperio desde http://localhost:3000 e inicia sesión.");
    }
    const resultado = await respuesta.json();
    if (!respuesta.ok) throw new Error(resultado.mensaje || "No se pudo completar la solicitud.");
    return resultado;
  }
  function seleccionar(formulario) {
    const campos = formulario.elements;
    const producto = productos.find(p => String(p.id_producto) === campos.producto.value);
    campos.unidad.value = producto?.unidad_medida || "";
    campos.cantidad.setCustomValidity("");
    campos.cantidad.max = formulario.dataset.tipo === "salida" && producto ? producto.stock_actual : "99999999.99";
    const sufijo = formulario.dataset.tipo === "entrada" ? "Entrada" : "Salida";
    document.getElementById("stock" + sufijo).textContent = producto
      ? "Disponible: " + producto.stock_actual + " " + producto.unidad_medida : "Selecciona un producto del inventario.";
    formulario.querySelector("button").disabled = ocupado || !disponible || !producto ||
      (formulario.dataset.tipo === "salida" && Number(producto.stock_actual) <= 0);
  }
  function controles() {
    formularios.forEach(f => {
      [...f.elements].forEach(c => { c.disabled = ocupado || !disponible; });
      seleccionar(f);
    });
  }
  async function actualizar() {
    const [catalogo, registros] = await Promise.all([
      solicitar("/api/inventario"), solicitar("/api/movimientos")
    ]);
    productos = catalogo;
    formularios.forEach(f => {
      const anterior = f.elements.producto.value;
      f.elements.producto.replaceChildren(new Option("Selecciona un producto", ""));
      productos.forEach(p => f.elements.producto.add(new Option(p.nombre + (p.codigo_barras ? " · " + p.codigo_barras : ""), p.id_producto)));
      if (productos.some(p => String(p.id_producto) === anterior)) f.elements.producto.value = anterior;
    });
    historial.replaceChildren();
    registros.forEach(m => {
      const fila = document.createElement("tr");
      [m.hora, m.tipo === "entrada" ? "Entrada" : "Salida", m.producto,
        m.cantidad + " " + m.unidad, m.detalle, m.usuario, m.fecha, m.observaciones || "—"].forEach(valor => {
        const celda = document.createElement("td");
        celda.textContent = valor; fila.append(celda);
      });
      historial.append(fila);
    });
    if (!registros.length) {
      const fila = document.createElement("tr"), celda = document.createElement("td");
      celda.colSpan = 8; celda.textContent = "Todavía no hay movimientos registrados.";
      fila.append(celda); historial.append(fila);
    }
    disponible = true;
  }
  formularios.forEach(f => {
    f.elements.fecha.value = hoy();
    f.elements.fecha.max = hoy();
    f.elements.producto.addEventListener("change", () => seleccionar(f));
    f.elements.detalle.addEventListener("input", () => f.elements.detalle.setCustomValidity(""));
    f.addEventListener("submit", async evento => {
      evento.preventDefault();
      if (ocupado || !disponible) return;
      const c = f.elements;
      c.detalle.setCustomValidity(c.detalle.value.trim() ? "" : "Completa este campo.");
      if (!f.reportValidity()) return;
      const datos = { tipo: f.dataset.tipo, productoId: c.producto.value, cantidad: c.cantidad.value,
        detalle: c.detalle.value.trim(), fecha: c.fecha.value, observaciones: c.observaciones.value.trim() };
      ocupado = true; controles();
      let guardado = false;
      try {
        const resultado = await solicitar("/api/movimientos", datos);
        guardado = true;
        f.reset(); c.fecha.value = hoy();
        mensaje(resultado.mensaje);
      } catch (error) { mensaje(error.message, true); }
      try {
        await actualizar();
      } catch {
        disponible = false;
        mensaje(guardado
          ? "El movimiento se guardó, pero no se pudo actualizar la pantalla. Recarga para consultar el inventario."
          : "No se pudo actualizar la pantalla. Recarga y consulta el historial antes de reintentar.", true);
      } finally { ocupado = false; controles(); }
    });
  });
  controles();
  actualizar().then(() => {
    controles();
    if (!productos.length) mensaje("No hay productos registrados. La dueña debe agregarlos desde Inventario.");
  }).catch(error => { mensaje(error.message, true); controles(); });
})();
