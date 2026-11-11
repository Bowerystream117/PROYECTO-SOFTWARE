"use strict";
window.servicioCaja={
 async solicitar(datos){
  const respuesta=await fetch('/api/caja/cortes',{
   method:datos?'POST':'GET',cache:'no-store',
   headers:{'Content-Type':'application/json',Authorization:'Bearer '+(sesionImperio.leer()?.token || '')},
   ...(datos?{body:JSON.stringify(datos)}:{})
  });
  if(!respuesta.headers.get('content-type')?.includes('application/json'))throw Error('Abre el programa desde http://localhost:3000.');
  const resultado=await respuesta.json();
  if(!respuesta.ok)throw Error(resultado.mensaje || 'No se pudo completar la operación.');
  return resultado;
 }
};
