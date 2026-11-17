"use strict";
(() => {
 const sesion=sesionImperio.leer();
 if (!sesion || sesion.rol!=="duena" || sessionStorage.getItem("imperioVistaEmpleado")==="true") {
   location.replace("../gestion de inventario/index.html");return;
 }
 const elemento=id=>document.getElementById(id);
 const formularioUsuario=elemento("formularioUsuario"),mensajeEstado=elemento("mensajeEstado");
 const botonGuardarUsuario=elemento("botonGuardarUsuario"),botonNuevoUsuario=elemento("botonNuevoUsuario");
 const botonCancelarEdicion=elemento("botonCancelarEdicion");
 const buscarUsuario=elemento("buscarUsuario"), filtrarEstado=elemento("filtrarEstado");
 const campoContrasena=elemento("campoContrasena"), selectorEstado=elemento("selectorEstado");
 const camposPerfil=["nombre","correo","rol","estado"];
 let usuarios=[],usuarioEnEdicion=null,guardando=false,forzarClave=false;
 const normalizar=texto=>texto.normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase();
 function mensaje(texto,error=false) { mensajeEstado.textContent=texto;mensajeEstado.classList.toggle("error",error); }
 function nuevo(enfocar=true) {
   usuarioEnEdicion=null;formularioUsuario.reset();elemento("tituloFormulario").textContent="Nuevo usuario";
   camposPerfil.forEach(clave=>{formularioUsuario.elements[clave].disabled=false;});
   forzarClave=false;campoContrasena.required=true;botonCancelarEdicion.hidden=true;
   elemento("ayudaContrasena").textContent="Contraseña de 8 a 128 caracteres.";
   botonGuardarUsuario.textContent="Guardar usuario";
   if(enfocar) elemento("campoNombre").focus();
 }
 function revisarClave() {
   if (!usuarioEnEdicion) return;
   const reactivar=usuarioEnEdicion.estado==="baja" && selectorEstado.value==="activo";
   campoContrasena.required=reactivar || forzarClave;
   elemento("ayudaContrasena").textContent=reactivar
     ? "Escribe una contraseña nueva para reactivar esta cuenta."
     : forzarClave ? "Escribe la nueva contraseña de 8 a 128 caracteres."
       : "Deja la contraseña vacía para conservar la actual.";
 }
 function editar(usuario, accion) {
   if(guardando)return;
   nuevo(false);usuarioEnEdicion=usuario;
   for(const clave of camposPerfil) formularioUsuario.elements[clave].value=usuario[clave]||"";
   forzarClave=accion==="Cambiar contraseña";
   if (forzarClave) camposPerfil.forEach(clave=>{formularioUsuario.elements[clave].disabled=true;});
   if (accion==="Reactivar") selectorEstado.value="activo";
   elemento("tituloFormulario").textContent=accion+" · "+usuario.nombre;
   revisarClave();
   botonGuardarUsuario.textContent="Guardar cambios";botonCancelarEdicion.hidden=false;
   (accion==="Editar" ? elemento("campoNombre") : campoContrasena).focus();
 }
 async function cargarUsuarios() {
   usuarios=await servicioPerfiles.listar();
   mostrarUsuarios();
 }
 function mostrarUsuarios() {
   const consulta=normalizar(buscarUsuario.value.trim()), filtro=filtrarEstado.value;
   const visibles=usuarios.filter(usuario=>(!filtro || usuario.estado===filtro) &&
     normalizar(usuario.nombre+" "+usuario.correo).includes(consulta));
   const cuerpo=elemento("cuerpoUsuarios");cuerpo.replaceChildren();
   visibles.forEach(usuario=>{
     const fila=document.createElement("tr");
     [usuario.nombre,usuario.correo,usuario.rol==="duena"?"Dueña":"Empleado"].forEach(valor=>{
       const celda=document.createElement("td");celda.textContent=valor;fila.append(celda);
     });
     const estado=document.createElement("td"),etiqueta=document.createElement("span");
     etiqueta.className="estado"+(usuario.estado==="baja"?" baja":"");etiqueta.textContent=usuario.estado==="activo"?"Activo":"Inactivo";estado.append(etiqueta);
     const acciones=document.createElement("td"), grupo=document.createElement("div");
     grupo.className="accionesPerfil";
     for (const accion of ["Editar", usuario.estado==="baja" ? "Reactivar" : "Cambiar contraseña"]) {
       const boton=document.createElement("button");
       boton.type="button";boton.className="accion";boton.textContent=accion;
       boton.setAttribute("aria-label",accion+" · "+usuario.nombre);
       boton.addEventListener("click",()=>editar(usuario,accion));grupo.append(boton);
     }
     acciones.append(grupo);fila.append(estado,acciones);cuerpo.append(fila);
   });
   if(!visibles.length) {const fila=document.createElement("tr"),celda=document.createElement("td");celda.colSpan=5;celda.textContent="No hay usuarios para esta búsqueda.";fila.append(celda);cuerpo.append(fila);}
 }
 buscarUsuario.addEventListener("input",mostrarUsuarios);
 filtrarEstado.addEventListener("change",mostrarUsuarios);
 selectorEstado.addEventListener("change",revisarClave);
 botonNuevoUsuario.addEventListener("click",()=>{if(!guardando){nuevo();mensaje("");}});
 botonCancelarEdicion.addEventListener("click",()=>{if(!guardando){nuevo();mensaje("");}});
 formularioUsuario.addEventListener("submit",async evento=>{
   evento.preventDefault();if(guardando || !formularioUsuario.reportValidity())return;
   const datos=Object.fromEntries(new FormData(formularioUsuario));
   guardando=true;botonGuardarUsuario.disabled=true;botonNuevoUsuario.disabled=true;botonCancelarEdicion.disabled=true;
   try {
     if (forzarClave) await servicioPerfiles.cambiarContrasena(usuarioEnEdicion.id,datos.contrasena);
     else await servicioPerfiles.guardar(datos,usuarioEnEdicion?.id);
     if (Number(usuarioEnEdicion?.id)===Number(sesion.usuarioId) && datos.contrasena) {
       sesionImperio.cerrar();
       location.replace("../inicio de sesion/index.html");
       return;
     }
     nuevo();mensaje("Usuario guardado correctamente.");
     try {await cargarUsuarios();}catch(error){mensaje("Usuario guardado, pero no se pudo actualizar la tabla: "+error.message,true);}
   }catch(error){mensaje(error.message,true);}
   finally {guardando=false;botonGuardarUsuario.disabled=false;botonNuevoUsuario.disabled=false;botonCancelarEdicion.disabled=false;}
 });
 cargarUsuarios().catch(error=>{elemento("cuerpoUsuarios").replaceChildren();mensaje(error.message,true);});
})();
