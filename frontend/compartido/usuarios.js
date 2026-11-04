"use strict";
// Solo DEMO: no usar datos ni contraseñas reales en este almacenamiento local.
window.usuariosImperio = (() => {
  const clave="imperioUsuariosDemoV1";
  const normalizar=valor=>valor.trim().toLowerCase();
  function leer() {
    const texto=localStorage.getItem(clave);
    if (texto) {
      const lista=JSON.parse(texto);
      if (!Array.isArray(lista)) throw new Error("Los usuarios locales no tienen un formato válido.");
      return lista;
    }
    const lista=[
      {id:"duena-demo",nombre:"Mónica Muñoz",usuario:"duena",correo:"duena@imperio.demo",contrasena:"Duena123!",rol:"duena",estado:"activo",ultimoAcceso:null},
      {id:"empleado-demo",nombre:"Empleado de prueba",usuario:"empleado",correo:"empleado@imperio.demo",contrasena:"Empleado123!",rol:"empleado",estado:"activo",ultimoAcceso:null}
    ];
    localStorage.setItem(clave,JSON.stringify(lista));return lista;
  }
  const publico=({contrasena,...usuario})=>usuario;
  function exigirDuena() {
    const sesion=sesionImperio.leer();
    if (!sesion || sesion.rol!=="duena" || sessionStorage.getItem("imperioVistaEmpleado")==="true") {
      throw new Error("Solo la dueña puede administrar perfiles.");
    }
    return sesion;
  }
  function guardar(datos,id=null) {
    const sesion=exigirDuena(),lista=leer();
    const anterior=id?lista.find(u=>u.id===id):null;
    if (id && !anterior) throw new Error("El usuario ya no existe.");
    const nombre=datos.nombre.trim(),usuario=normalizar(datos.usuario),correo=normalizar(datos.correo||"");
    if (!nombre || nombre.length>80) throw new Error("Escribe un nombre de hasta 80 caracteres.");
    if (!/^[a-z0-9._-]{3,40}$/.test(usuario)) throw new Error("Usuario: 3 a 40 letras sin acentos, números, punto, guion o guion bajo.");
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) throw new Error("Escribe un correo válido.");
    if (!["duena","empleado"].includes(datos.rol) || !["activo","baja"].includes(datos.estado)) throw new Error("Rol o estado inválido.");
    if ((!id || datos.contrasena) && (datos.contrasena.length<8 || datos.contrasena.length>128)) throw new Error("La contraseña debe tener de 8 a 128 caracteres.");
    if (lista.some(u=>u.id!==id && (normalizar(u.usuario)===usuario || (correo && normalizar(u.correo||"")===correo)))) {
      throw new Error("Ese usuario o correo ya está registrado.");
    }
    if (anterior && (anterior.id===sesion.usuarioId || anterior.usuario===sesion.usuario)
      && (datos.rol!=="duena" || datos.estado!=="activo")) throw new Error("No puedes quitarte el rol de dueña ni dar de baja tu propia cuenta.");
    const cuenta={id:id||crypto.randomUUID(),nombre,usuario,correo,
      contrasena:datos.contrasena || anterior?.contrasena,
      rol:datos.rol,estado:datos.estado,ultimoAcceso:anterior?.ultimoAcceso||null};
    const nuevas=id?lista.map(u=>u.id===id?cuenta:u):[...lista,cuenta];
    if (!nuevas.some(u=>u.rol==="duena" && u.estado==="activo")) throw new Error("Debe quedar al menos una dueña activa.");
    localStorage.setItem(clave,JSON.stringify(nuevas));return publico(cuenta);
  }
  return {
    leer,
    listar() { exigirDuena();return leer().map(publico); },
    guardar,
    autenticar(identificador,contrasena) {
      const lista=leer(),buscado=normalizar(identificador);
      const cuenta=lista.find(u=>(u.usuario===buscado || (u.correo && u.correo===buscado)) && u.contrasena===contrasena && u.estado==="activo");
      if (!cuenta) throw new Error("Usuario, correo o contraseña incorrectos, o cuenta dada de baja.");
      cuenta.ultimoAcceso=new Date().toISOString();
      localStorage.setItem(clave,JSON.stringify(lista));return publico(cuenta);
    }
  };
})();
