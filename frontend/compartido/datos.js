"use strict";
// Un único documento permite guardar stock e historial en la misma escritura.
window.datosImperio = (() => {
  const clave = "imperioDatosDemoV2";
  const iniciales = [
    {id:"1",nombre:"Camarón (kg)",categoria:"Mariscos",stock:4,minimo:5},
    {id:"2",nombre:"Clamato Imperio (L)",categoria:"Clamatos",stock:18,minimo:10},
    {id:"3",nombre:"Fresa (kg)",categoria:"Repostería",stock:2,minimo:3},
    {id:"4",nombre:"Harina para waffles (kg)",categoria:"Repostería",stock:12,minimo:6}
  ];
  function leer() {
    const guardado = localStorage.getItem(clave);
    const anterior = localStorage.getItem("imperioProductosDemoV1");
    const datos = guardado ? JSON.parse(guardado)
      : {productos: anterior ? JSON.parse(anterior) : structuredClone(iniciales), movimientos:[]};
    if (!Array.isArray(datos.productos) || !Array.isArray(datos.movimientos)
      || !datos.productos.every(p => p && typeof p.id === "string"
        && typeof p.nombre === "string" && typeof p.categoria === "string"
        && Number.isFinite(p.stock) && p.stock >= 0 && Number.isFinite(p.minimo) && p.minimo >= 0)) {
      throw new Error("Los datos locales no son válidos. Conserva una copia antes de restablecerlos.");
    }
    return datos;
  }
  function guardar(datos) { localStorage.setItem(clave, JSON.stringify(datos)); }
  function unidad(producto) {
    return producto.unidad || producto.nombre.match(/\((kg|g|L|ml|pza)\)$/i)?.[1] || "pza";
  }
  function registrar(movimiento) {
    const sesion = sesionImperio.leer();
    if (!sesion) throw new Error("Inicia sesión para registrar movimientos.");
    const datos = leer();
    const producto = datos.productos.find(p => p.id === movimiento.productoId);
    if (!producto) throw new Error("El producto ya no está disponible.");
    if (!["entrada","salida"].includes(movimiento.tipo)) throw new Error("Tipo inválido.");
    if (!Number.isFinite(movimiento.cantidad) || movimiento.cantidad <= 0
      || Math.abs(movimiento.cantidad * 100 - Math.round(movimiento.cantidad * 100)) > 0.00001) {
      throw new Error("La cantidad debe ser mayor que cero y tener máximo dos decimales.");
    }
    if (!movimiento.detalle.trim()) throw new Error("Escribe el proveedor o motivo.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(movimiento.fecha)
      || !Number.isFinite(Date.parse(movimiento.fecha))
      || new Date(movimiento.fecha).toISOString().slice(0,10) !== movimiento.fecha) throw new Error("Fecha inválida.");
    if (movimiento.tipo === "salida" && movimiento.cantidad > producto.stock) {
      throw new Error("Stock insuficiente. Disponible: " + producto.stock + " " + unidad(producto) + ".");
    }
    producto.stock = Math.round((producto.stock + (movimiento.tipo === "entrada" ? 1 : -1) * movimiento.cantidad) * 100) / 100;
    const registro = {...movimiento, id:crypto.randomUUID(), producto:producto.nombre,
      unidad:unidad(producto), usuario:sesion.usuario, turnoId:sesion.turnoId,
      registradoEn:new Date().toISOString()};
    datos.movimientos.push(registro);
    guardar(datos);
    return registro;
  }
  return {leer, guardar, registrar, unidad};
})();
