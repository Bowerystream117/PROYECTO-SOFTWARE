"use strict";
(() => {
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
  const claveProductos = "imperioProductosDemoV1";
  const vistaEmpleado = sessionStorage.getItem("imperioVistaEmpleado") === "true";
  let productoEnEdicion = null;
  let productos = [
    { id: "1", nombre: "Camarón (kg)", categoria: "Mariscos", stock: 4, minimo: 5 },
    { id: "2", nombre: "Clamato Imperio (L)", categoria: "Clamatos", stock: 18, minimo: 10 },
    { id: "3", nombre: "Fresa (kg)", categoria: "Repostería", stock: 2, minimo: 3 },
    { id: "4", nombre: "Harina para waffles (kg)", categoria: "Repostería", stock: 12, minimo: 6 }
  ];
  const productoValido = p => p && typeof p.id === "string"
    && typeof p.nombre === "string" && p.nombre.trim()
    && typeof p.categoria === "string" && p.categoria.trim()
    && Number.isFinite(p.stock) && p.stock >= 0
    && Number.isFinite(p.minimo) && p.minimo >= 0;
  try { productos = datosImperio.leer().productos; }
  catch (error) { mensajeEstado.textContent = error.message; return; }
  // Estos controles son solo de interfaz. El backend debe verificar cada permiso.
  function puedeEditar() { return sesion.rol === "duena" && !vistaEmpleado; }
  function normalizar(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  function guardarProductos(nuevaLista) {
    try {
      const datos = datosImperio.leer();
      datos.productos = nuevaLista;
      datosImperio.guardar(datos);
      productos = nuevaLista;
      actualizarCategorias();
      dibujarInventario();
      return true;
    } catch {
      mensajeEstado.textContent = "No se guardaron los cambios. Revisa el almacenamiento del navegador.";
      return false;
    }
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
        botonEliminar.addEventListener("click", () => {
          if (!puedeEditar()) return;
          if (window.confirm("¿Eliminar " + producto.nombre + "?")) {
            if (guardarProductos(productos.filter(p => p.id !== producto.id))) {
              mensajeEstado.textContent = "Producto eliminado.";
            }
          }
        });
        acciones.append(botonEditar, document.createTextNode(" · "), botonEliminar);
      }
      cuerpoInventario.append(fila);
    });
    if (!filtrados.length) {
      const fila = document.createElement("tr");
      crearCelda(fila, "No hay productos que coincidan con los filtros.").colSpan = editar ? 7 : 6;
      cuerpoInventario.append(fila);
    }
  }
  function abrirFormulario(producto = null) {
    if (!puedeEditar()) return;
    productoEnEdicion = producto ? producto.id : null;
    formularioProducto.reset();
    buscarElemento("tituloDialogo").textContent = producto ? "Editar producto" : "Nuevo producto";
    campoNombre.value = producto?.nombre ?? "";
    campoCategoria.value = producto?.categoria ?? "";
    campoStock.value = producto?.stock ?? "";
    campoMinimo.value = producto?.minimo ?? "";
    campoNombre.setCustomValidity("");
    campoCategoria.setCustomValidity("");
    dialogoProducto.showModal();
    campoNombre.focus();
  }
  formularioProducto.addEventListener("submit", evento => {
    evento.preventDefault();
    if (!puedeEditar()) return;
    campoNombre.setCustomValidity(campoNombre.value.trim() ? "" : "Escribe el nombre.");
    campoCategoria.setCustomValidity(campoCategoria.value.trim() ? "" : "Escribe la categoría.");
    if (!formularioProducto.reportValidity()) return;
    const producto = {
      id: productoEnEdicion ?? crypto.randomUUID(),
      nombre: campoNombre.value.trim(), categoria: campoCategoria.value.trim(),
      stock: Number(campoStock.value), minimo: Number(campoMinimo.value)
    };
    if (!productoValido(producto)) return;
    const nuevaLista = productoEnEdicion
      ? productos.map(p => p.id === productoEnEdicion ? producto : p)
      : [...productos, producto];
    if (guardarProductos(nuevaLista)) {
      dialogoProducto.close();
      mensajeEstado.textContent = "Producto guardado.";
    }
  });
  [campoNombre, campoCategoria].forEach(campo => campo.addEventListener("input", () => campo.setCustomValidity("")));
  botonNuevoProducto.addEventListener("click", () => abrirFormulario());
  botonCancelar.addEventListener("click", () => dialogoProducto.close());
  campoBuscar.addEventListener("input", dibujarInventario);
  selectorCategoria.addEventListener("change", dibujarInventario);
  window.addEventListener("storage", () => {
    try { productos=datosImperio.leer().productos; dialogoProducto.close(); actualizarCategorias(); dibujarInventario(); }
    catch (error) { mensajeEstado.textContent=error.message; }
  });
  actualizarCategorias();
  dibujarInventario();
})();
