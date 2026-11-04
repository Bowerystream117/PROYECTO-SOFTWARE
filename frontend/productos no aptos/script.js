"use strict";
(() => {
  const {elemento,avisar,tabla,ejecutar,hoy}=uiImperio;
  const sesion=sesionImperio.leer(); if(!sesion)return;
  const esDuena=sesion.rol==="duena" && sessionStorage.getItem("imperioVistaEmpleado")!=="true";
  const formulario=elemento("formulario"),selector=elemento("producto");
  let productos=[];
  document.body.classList.toggle("vistaEmpleado",!esDuena);
  elemento("panelDuena").hidden=!esDuena;
  function disponible(){
    const producto=productos.find(item=>item.id===selector.value);
    const unidad=producto?datosImperio.unidad(producto):"";
    // Solo la unidad del inventario: cambiar kg a piezas sin conversión dañaría el stock.
    elemento("unidad").replaceChildren(new Option(unidad,unidad));
    elemento("disponible").textContent=producto?`Disponible: ${producto.stock} ${unidad}`:"No hay productos registrados.";
    formulario.querySelector('[type="submit"]').disabled=!producto;
  }
  function limpiar(){formulario.reset();elemento("fecha").value=hoy();disponible();}
  async function actualizar(){
    const datos=await operacionesImperio.consultar(),seleccionado=selector.value;
    productos=datos.productos;
    selector.replaceChildren(...productos.map(item=>new Option(item.nombre,item.id)));
    if(productos.some(item=>item.id===seleccionado))selector.value=seleccionado;
    disponible();
    if(!esDuena)return;
    const mermas=datos.movimientos.filter(item=>item.origen==="merma");
    const mes=hoy().slice(0,7),mensuales=mermas.filter(item=>item.fecha.startsWith(mes));
    elemento("totalMermas").textContent=mensuales.length;
    elemento("caducidad").textContent=mensuales.filter(item=>item.tipoBaja==="Caducidad").length;
    elemento("dano").textContent=mensuales.filter(item=>item.tipoBaja==="Daño").length;
    elemento("otros").textContent=mensuales.filter(item=>!["Caducidad","Daño"].includes(item.tipoBaja)).length;
    tabla(["Fecha","Producto","Cantidad","Tipo"],mermas.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha)||b.registradoEn.localeCompare(a.registradoEn)).map(item=>[uiImperio.fechaCorta(item.fecha),item.producto,`${item.cantidad} ${item.unidad}`,item.tipoBaja||"Otros"]));
  }
  formulario.onsubmit=evento=>{evento.preventDefault();ejecutar(async()=>{
    const boton=formulario.querySelector('[type="submit"]');boton.disabled=true;
    try{await operacionesImperio.registrarMerma({productoId:selector.value,cantidad:Number(elemento("cantidad").value),unidad:elemento("unidad").value,fecha:elemento("fecha").value,tipoBaja:elemento("tipoBaja").value,descripcion:elemento("descripcion").value});limpiar();await actualizar();avisar("Merma registrada. Existencias actualizadas.");}finally{boton.disabled=!productos.length;}
  });};
  selector.onchange=disponible;elemento("cancelar").onclick=()=>{limpiar();avisar("");};
  window.addEventListener("storage",()=>ejecutar(actualizar));elemento("fecha").value=hoy();ejecutar(actualizar);
})();
