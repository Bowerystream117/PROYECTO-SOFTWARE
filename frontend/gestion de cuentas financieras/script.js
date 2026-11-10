"use strict";
(() => {
  const {elemento,dinero,avisar,tabla,ejecutar,hoy}=uiImperio;
  try{operacionesImperio.autorizar(true);}catch{return;}
  const formulario=elemento("formulario"),dialogo=elemento("dialogo"),detalle=elemento("detalle");
  let seleccionado=null;
  const cuentas={"Caja Fija":"caja","Cuenta Bancaria Principal":"banco","Fondo para Proveedores":"proveedores"};
  async function actualizar(){
    const datos=await operacionesImperio.consultar();
    const vigentes=datos.finanzas.filter(item=>!item.anulado);
    const sumar=lista=>lista.reduce((total,item)=>total+(item.tipo==="ingreso"?1:-1)*Math.round(item.importe*100),0)/100;
    Object.entries(cuentas).forEach(([cuenta,id])=>elemento(id).textContent=dinero(sumar(vigentes.filter(item=>item.cuenta===cuenta))));
    elemento("balance").textContent=dinero(sumar(vigentes));
    const anteriores=vigentes.filter(item=>!Object.hasOwn(cuentas,item.cuenta));
    elemento("legado").hidden=!anteriores.length;
    elemento("legado").textContent=`El balance incluye ${dinero(sumar(anteriores))} de cuentas de la versión anterior (sin reclasificar). Se conservan con su nombre original en el historial.`;
    tabla(["Fecha","Concepto","Monto","Cuenta"],datos.finanzas.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha)||b.registradoEn.localeCompare(a.registradoEn)).map(item=>{
      const boton=document.createElement("button");boton.className="enlaceDetalle"+(item.anulado?" anulado":"");boton.textContent=item.concepto+(item.anulado?" (Anulado)":"");
      boton.onclick=()=>{seleccionado=item.id;elemento("textoDetalle").textContent=`${item.concepto}\n${item.tipo} · ${dinero(item.importe)} · ${item.cuenta}\nFecha: ${uiImperio.fechaCorta(item.fecha)}\nRegistró: ${item.usuario}\nClasificación: ${item.categoria||"Sin clasificar"}\nEstado: ${item.anulado?"Anulado: "+item.motivoAnulacion:"Vigente"}`;elemento("motivo").value="";elemento("motivo").disabled=!!item.anulado;elemento("anular").disabled=!!item.anulado;elemento("errorDetalle").textContent="";detalle.showModal();};
      return [uiImperio.fechaCorta(item.fecha),boton,(item.tipo==="egreso"?"− ":"+ ")+dinero(item.importe),item.cuenta];
    }));
  }
  elemento("nuevo").onclick=()=>{formulario.reset();elemento("fecha").value=hoy();elemento("mensajeDialogo").textContent="";dialogo.showModal();};
  elemento("cancelar").onclick=()=>dialogo.close();elemento("cerrarDetalle").onclick=()=>detalle.close();
  formulario.onsubmit=async evento=>{
    evento.preventDefault();const boton=formulario.querySelector("button");boton.disabled=true;
    try{await operacionesImperio.registrarFinanza({fecha:elemento("fecha").value,tipo:elemento("tipo").value,concepto:elemento("concepto").value,importe:Number(elemento("importe").value),cuenta:elemento("cuenta").value,categoria:elemento("categoria").value});dialogo.close();await actualizar();avisar("Registro guardado. Saldos actualizados.");}catch(error){elemento("mensajeDialogo").textContent=error.message;avisar(error.message,true);}finally{boton.disabled=false;}
  };
  elemento("anular").onclick=async()=>{
    elemento("anular").disabled=true;
    try{await operacionesImperio.anularFinanza(seleccionado,elemento("motivo").value);detalle.close();await actualizar();avisar("Movimiento anulado. Saldos actualizados.");}catch(error){elemento("errorDetalle").textContent=error.message;}finally{elemento("anular").disabled=false;}
  };
  window.addEventListener("storage",()=>ejecutar(actualizar));ejecutar(actualizar);
})();
