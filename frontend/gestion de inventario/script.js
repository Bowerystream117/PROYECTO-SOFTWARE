"use strict";
(async () => {
  const sesion = sesionImperio.leer();
  if (!sesion) {
    window.location.replace("../inicio de sesion/index.html");
    return;
  }
  const buscarElemento = id => document.getElementById(id);
  const cuerpoInventario = buscarElemento("cuerpoInventario");
  const campoBuscar = buscarElemento("campoBuscar");
  const selectorCategoria = buscarElemento("selectorCategoria");
  const botonNuevoProducto = buscarElemento("botonNuevoProducto");
  const botonCambiarVista = buscarElemento("botonCambiarVista");
  const botonCancelar = buscarElemento("botonCancelar");
  const dialogoProducto = buscarElemento("dialogoProducto");
  const formularioProducto = buscarElemento("formularioProducto");
  const campoNombre = buscarElemento("campoNombre");
  const campoCategoria = buscarElemento("campoCategoria");
  const campoStock = buscarElemento("campoStock");
  const campoMinimo = buscarElemento("campoMinimo");
  const mensajeEstado = buscarElemento("mensajeEstado");

  const vistaEmpleado = sessionStorage.getItem("imperioVistaEmpleado") === "true";
  let productoEnEdicion = null;
  let productos = [];
  async function solicitud(metodo, id, producto) {
    const ruta = "/api/inventario" + (id ? "/" + encodeURIComponent(id) : "");
    const respuesta = await fetch(ruta, {
      method: metodo,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + (sesion.token || "") },
      body: producto ? JSON.stringify(producto) : undefined
    });
    if (!respuesta.headers.get("content-type")?.includes("application/json")) {
      throw new Error("Abre el proyecto desde http://localhost:3000.");
    }
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje || "No se pudo completar la operación.");
    return datos;
  }
  async function cargarProductos() {
    const filas = await solicitud("GET");
    productos = filas.map(p => ({
      id: String(p.id_producto), nombre: p.nombre, unidad: p.unidad_medida,
      categoria: p.categoria_nombre, codigo: p.codigo_barras,
      compra: p.precio_compra, venta: p.precio_venta,
      stock: Number(p.stock_actual), minimo: Number(p.stock_minimo)
    }));
    actualizarCategorias();
    dibujarInventario();
  }
  async function refrescar(mensaje = "") {
    try {
      await cargarProductos();
      mensajeEstado.textContent = mensaje;
    } catch (error) {
      mensajeEstado.textContent = (mensaje ? mensaje + " " : "") + "No se pudo actualizar la lista. " + error.message;
    }
  }
  // Estos controles son solo de interfaz. El backend debe verificar cada permiso.
  function puedeEditar() { return sesion.rol === "duena" && !vistaEmpleado; }
  function normalizar(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  function actualizarCategorias() {
    const seleccion = selectorCategoria.value;
    selectorCategoria.replaceChildren(new Option("Categoría: Todas", ""));
    [...new Set(productos.map(p => p.categoria))].sort().forEach(categoria => {
      selectorCategoria.add(new Option(categoria, categoria));
    });
    selectorCategoria.value = [...selectorCategoria.options].some(o => o.value === seleccion) ? seleccion : "";
  }
  function crearCelda(fila, texto) {
    const celda = document.createElement("td");
    celda.textContent = texto;
    fila.append(celda);
    return celda;
  }
  function dibujarInventario() {
    const editar = puedeEditar();
    buscarElemento("tituloInventario").textContent = editar ? "Gestión de inventario" : "Consulta de inventario";
    buscarElemento("etiquetaConsulta").hidden = editar;
    buscarElemento("columnaAcciones").hidden = !editar;
    botonNuevoProducto.hidden = !editar;
    botonCambiarVista.hidden = sesion.rol !== "duena";
    botonCambiarVista.textContent = vistaEmpleado ? "Volver a Dueña" : "Cambiar a Empleado";
    document.querySelectorAll(".exclusivoDuena").forEach(elemento => elemento.hidden = !editar);
    const alertas = productos.filter(p => p.stock < p.minimo).length;
    buscarElemento("contadorAlertas").textContent = alertas + (alertas === 1 ? " alerta de stock" : " alertas de stock");
    const filtrados = productos.filter(p =>
      normalizar(p.nombre).includes(normalizar(campoBuscar.value.trim()))
      && (!selectorCategoria.value || p.categoria === selectorCategoria.value));
    cuerpoInventario.replaceChildren();
    filtrados.forEach(producto => {
      const fila = document.createElement("tr");
      const bajo = producto.stock < producto.minimo;
      crearCelda(fila, producto.nombre);
      crearCelda(fila, producto.categoria);
      crearCelda(fila, producto.unidad ?? "—");
      crearCelda(fila, producto.codigo ?? "—");
      crearCelda(fila, producto.compra ?? "—");
      crearCelda(fila, producto.venta ?? "—");

      crearCelda(fila, producto.stock.toLocaleString("es-MX"));
      crearCelda(fila, producto.minimo.toLocaleString("es-MX"));
      const celdaNivel = crearCelda(fila, "");
      const nivel = document.createElement("div");
      nivel.className = "nivel" + (bajo ? " bajo" : "");
      // Indicador visual: 100% equivale a dos veces el stock mínimo.
      const porcentaje = producto.minimo > 0
        ? Math.min(100, producto.stock / (producto.minimo * 2) * 100)
        : (producto.stock > 0 ? 100 : 0);
      nivel.setAttribute("aria-label", "Nivel: " + Math.round(porcentaje) + "% de la referencia visual");
      nivel.title = "Referencia visual: dos veces el stock mínimo";
      const relleno = document.createElement("span");
      relleno.style.width = porcentaje + "%";
      nivel.append(relleno);
      celdaNivel.append(nivel);
      const estado = document.createElement("span");
      estado.className = "etiqueta" + (bajo ? " alerta" : "");
      estado.textContent = bajo ? "Bajo" : "Normal";
      crearCelda(fila, "").append(estado);
      if (editar) {
        const acciones = crearCelda(fila, "");
        acciones.className = "celdaAcciones";
        const botonEditar = document.createElement("button");
        botonEditar.className = "accion";
        botonEditar.textContent = "Editar";
        botonEditar.setAttribute("aria-label", "Editar " + producto.nombre);
        botonEditar.addEventListener("click", () => abrirFormulario(producto));
        const botonEliminar = document.createElement("button");
        botonEliminar.className = "accion";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.setAttribute("aria-label", "Eliminar " + producto.nombre);
        botonEliminar.addEventListener("click", async () => {
          if (!puedeEditar()) return;
          if (window.confirm("¿Eliminar " + producto.nombre + "?")) {
            botonEliminar.disabled = true;
            try {
              await solicitud("DELETE", producto.id);
              await refrescar("Producto eliminado.");
            } catch (error) { mensajeEstado.textContent = error.message; }
            finally { botonEliminar.disabled = false; }
          }
        });
        acciones.append(botonEditar, document.createTextNode(" · "), botonEliminar);
      }
      cuerpoInventario.append(fila);
    });
    if (!filtrados.length) {
      const fila = document.createElement("tr");
      crearCelda(fila, "No hay productos que coincidan con los filtros.").colSpan = editar ? 11 : 10;
      cuerpoInventario.append(fila);
    }
  }
  function abrirFormulario(producto = null) {
    if (!puedeEditar()) return;
    productoEnEdicion = producto ? producto.id : null;
    formularioProducto.reset();
    buscarElemento("errorFormulario").textContent = "";
    buscarElemento("unidad").value = producto?.unidad ?? "";
    buscarElemento("codigo").value = producto?.codigo ?? "";
    buscarElemento("compra").value = producto?.compra ?? "";
    buscarElemento("venta").value = producto?.venta ?? "";

    buscarElemento("tituloDialogo").textContent = producto ? "Editar producto" : "Nuevo producto";
    campoNombre.value = producto?.nombre ?? "";
    campoCategoria.value = producto?.categoria ?? "";
    campoStock.value = producto?.stock ?? "";
    campoStock.disabled = Boolean(producto);
    buscarElemento("etiquetaStock").textContent = producto
      ? "Stock actual (se ajusta en Entradas y Salidas)"
      : "Stock inicial";
    campoMinimo.value = producto?.minimo ?? "";
    campoNombre.setCustomValidity("");
    campoCategoria.setCustomValidity("");
    dialogoProducto.showModal();
    campoNombre.focus();
  }
  formularioProducto.addEventListener("submit", async evento => {
    evento.preventDefault();
    if (!puedeEditar()) return;
    campoNombre.setCustomValidity(campoNombre.value.trim() ? "" : "Escribe el nombre.");
    campoCategoria.setCustomValidity(campoCategoria.value.trim() ? "" : "Escribe la categoría.");
    if (!formularioProducto.reportValidity()) return;
    const producto = {
      unidad: buscarElemento("unidad").value.trim() || null,
      codigo: buscarElemento("codigo").value.trim() || null,
      compra: buscarElemento("compra").value.trim() || null,
      venta: buscarElemento("venta").value.trim() || null,
      nombre: campoNombre.value.trim(), categoria: campoCategoria.value.trim(),
      minimo: Number(campoMinimo.value)
    };
    if (!productoEnEdicion) producto.stock = Number(campoStock.value);
    const guardar = buscarElemento("botonGuardar");
    if (guardar.disabled) return;
    guardar.disabled = true;
    botonCancelar.disabled = true;
    try {
      await solicitud(productoEnEdicion ? "PUT" : "POST", productoEnEdicion, producto);
      dialogoProducto.close();
      await refrescar("Producto guardado.");
    } catch (error) {
      buscarElemento("errorFormulario").textContent = error.message;
    } finally {
      guardar.disabled = false;
      botonCancelar.disabled = false;
    }
  });
  [campoNombre, campoCategoria].forEach(campo => campo.addEventListener("input", () => campo.setCustomValidity("")));
  botonNuevoProducto.addEventListener("click", () => abrirFormulario());
  botonCancelar.addEventListener("click", () => dialogoProducto.close());
  campoBuscar.addEventListener("input", dibujarInventario);
  selectorCategoria.addEventListener("change", dibujarInventario);
  dialogoProducto.addEventListener("cancel", evento => {
    if (buscarElemento("botonGuardar").disabled) evento.preventDefault();
  });
  await refrescar();
})();
