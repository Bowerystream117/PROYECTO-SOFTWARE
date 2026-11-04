"use strict";
// Esta opción solo cambia el servicio de perfiles; el resto requiere integrar su backend.
window.configuracionPerfiles={modo:"demo",urlApi:"/api"};
window.servicioPerfiles={
  async solicitar(ruta,opciones={}) {
    const respuesta=await fetch(configuracionPerfiles.urlApi+ruta,{credentials:"include",...opciones,
      headers:{"Content-Type":"application/json",...opciones.headers}});
    if (!respuesta.ok) throw new Error("No se pudo completar la operación ("+respuesta.status+").");
    return respuesta.json();
  },
  async listar() {
    return configuracionPerfiles.modo==="demo"?usuariosImperio.listar():this.solicitar("/usuarios");
  },
  async guardar(datos,id) {
    if (configuracionPerfiles.modo==="demo") return usuariosImperio.guardar(datos,id);
    const envio={...datos};if (id && !envio.contrasena) delete envio.contrasena;
    return this.solicitar("/usuarios"+(id?"/"+encodeURIComponent(id):""),{
      method:id?"PUT":"POST",body:JSON.stringify(envio)
    });
  }
};
