"use strict";
// Adaptador local: la UI usa promesas para permitir reemplazarlo por fetch a Express.
window.operacionesImperio = (() => {
  function autorizar(soloDuena = false) {
    const sesion = sesionImperio.leer();
    if (!sesion || (soloDuena && (sesion.rol !== "duena" || sessionStorage.getItem("imperioVistaEmpleado") === "true"))) throw new Error("No tienes permiso para esta operación.");
    return sesion;
  }
  function fechaValida(fecha) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !Number.isFinite(Date.parse(fecha)) || new Date(fecha).toISOString().slice(0,10) !== fecha) throw new Error("Fecha inválida.");
  }
  function positivo(valor) {
    if (!Number.isFinite(valor) || valor <= 0 || !Number.isSafeInteger(Math.round(valor*100)) || Math.abs(valor*100-Math.round(valor*100)) > 0.00001) throw new Error("Usa un valor positivo con máximo dos decimales.");
  }
  async function consultar() {
    autorizar();
    const datos = datosImperio.leer();
    if (datos.finanzas !== undefined && !Array.isArray(datos.finanzas)) throw new Error("Datos financieros inválidos.");
    return {...datos, finanzas: datos.finanzas || []};
  }
  async function registrarMerma(entrada) {
    autorizar();
    // Usa la operación existente: stock e historial se guardan juntos una sola vez.
    const tipoBaja = entrada.tipoBaja || "Otros";
    if (!["Caducidad","Daño","Otros"].includes(tipoBaja)) throw new Error("Tipo de baja inválido.");
    const descripcion = (entrada.descripcion ?? entrada.detalle ?? "").trim();
    if (descripcion.length > 160) throw new Error("La descripción admite hasta 160 caracteres.");
    const producto = datosImperio.leer().productos.find(item => item.id === entrada.productoId);
    if (!producto) throw new Error("El producto ya no está disponible.");
    if (entrada.unidad && entrada.unidad !== datosImperio.unidad(producto)) throw new Error("La unidad debe coincidir con Inventario.");
    return datosImperio.registrar({...entrada, tipoBaja, descripcion, detalle:descripcion || tipoBaja, tipo:"salida", origen:"merma"});
  }
  async function registrarFinanza(entrada) {
    const sesion = autorizar(true);
    positivo(entrada.importe); fechaValida(entrada.fecha);
    if (!["ingreso","egreso"].includes(entrada.tipo) || !["Caja Fija","Cuenta Bancaria Principal","Fondo para Proveedores"].includes(entrada.cuenta)) throw new Error("Tipo o cuenta inválidos.");
    const categoria = entrada.categoria || "Otros";
    if (!["Otros","Venta","Compra de insumos","Depósito"].includes(categoria)) throw new Error("Clasificación inválida.");
    if (categoria === "Venta" && entrada.tipo !== "ingreso") throw new Error("Una venta debe registrarse como ingreso.");
    const concepto = entrada.concepto.trim();
    if (!concepto || concepto.length > 160) throw new Error("Escribe un concepto de hasta 160 caracteres.");
    const datos = await consultar();
    const registro = {...entrada,concepto,categoria,id:crypto.randomUUID(),usuario:sesion.usuario,turnoId:sesion.turnoId,registradoEn:new Date().toISOString(),anulado:false};
    datos.finanzas.push(registro); datosImperio.guardar(datos); return registro;
  }
  async function anularFinanza(id, motivo) {
    autorizar(true);
    if (!motivo || !motivo.trim() || motivo.trim().length > 160) throw new Error("Escribe un motivo de hasta 160 caracteres.");
    const datos = await consultar();
    const registro = datos.finanzas.find(item => item.id === id);
    if (!registro || registro.anulado) throw new Error("El movimiento no existe o ya está anulado.");
    registro.anulado = true; registro.motivoAnulacion = motivo.trim();
    registro.anuladoPor = autorizar(true).usuario; registro.anuladoEn = new Date().toISOString();
    datosImperio.guardar(datos);
  }
  return {autorizar, consultar, registrarMerma, registrarFinanza, anularFinanza};
})();
