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
 let usuarios=[],usuarioEnEdicion=null,guardando=false;
 function mensaje(texto,error=false) { mensajeEstado.textContent=texto;mensajeEstado.classList.toggle("error",error); }
 function nuevo(enfocar=true) {
   usuarioEnEdicion=null;formularioUsuario.reset();elemento("tituloFormulario").textContent="Nuevo usuario";
   elemento("campoContrasena").required=true;botonCancelarEdicion.hidden=true;
   elemento("ayudaContrasena").textContent="Contraseña de 8 a 128 caracteres.";
   botonGuardarUsuario.textContent="Guardar usuario";
   if(enfocar) elemento("campoNombre").focus();
 }
 function editar(usuario) {
   if(guardando)return;
   nuevo(false);usuarioEnEdicion=usuario.id;
   for(const clave of ["nombre","correo","rol","estado"]) formularioUsuario.elements[clave].value=usuario[clave]||"";
   elemento("tituloFormulario").textContent="Editar usuario";elemento("campoContrasena").required=false;
   elemento("ayudaContrasena").textContent="Deja la contraseña vacía para conservar la actual.";
   botonGuardarUsuario.textContent="Guardar cambios";botonCancelarEdicion.hidden=false;elemento("campoNombre").focus();
 }
 async function cargarUsuarios() {
   usuarios=await servicioPerfiles.listar();
   const cuerpo=elemento("cuerpoUsuarios");cuerpo.replaceChildren();
   usuarios.forEach(usuario=>{
     const fila=document.createElement("tr");
     [usuario.nombre,usuario.correo,usuario.rol==="duena"?"Dueña":"Empleado"].forEach(valor=>{
       const celda=document.createElement("td");celda.textContent=valor;fila.append(celda);
     });
     const estado=document.createElement("td"),etiqueta=document.createElement("span");
     etiqueta.className="estado"+(usuario.estado==="baja"?" baja":"");etiqueta.textContent=usuario.estado==="activo"?"Activo":"Baja";estado.append(etiqueta);
     const acciones=document.createElement("td"),botonEditar=document.createElement("button");
     botonEditar.className="accion";botonEditar.textContent="Editar";botonEditar.setAttribute("aria-label","Editar "+usuario.nombre);
     botonEditar.addEventListener("click",()=>editar(usuario));acciones.append(botonEditar);fila.append(estado,acciones);cuerpo.append(fila);
   });
   if(!usuarios.length) {const fila=document.createElement("tr"),celda=document.createElement("td");celda.colSpan=5;celda.textContent="No hay usuarios registrados.";fila.append(celda);cuerpo.append(fila);}
 }
 botonNuevoUsuario.addEventListener("click",()=>{if(!guardando){nuevo();mensaje("");}});
 botonCancelarEdicion.addEventListener("click",()=>{if(!guardando){nuevo();mensaje("");}});
 formularioUsuario.addEventListener("submit",async evento=>{
   evento.preventDefault();if(guardando || !formularioUsuario.reportValidity())return;
   const datos=Object.fromEntries(new FormData(formularioUsuario));
   guardando=true;botonGuardarUsuario.disabled=true;botonNuevoUsuario.disabled=true;botonCancelarEdicion.disabled=true;
   try {
     await servicioPerfiles.guardar(datos,usuarioEnEdicion);nuevo();mensaje("Usuario guardado correctamente.");
     try {await cargarUsuarios();}catch(error){mensaje("Usuario guardado, pero no se pudo actualizar la tabla: "+error.message,true);}
   }catch(error){mensaje(error.message,true);}
   finally {guardando=false;botonGuardarUsuario.disabled=false;botonNuevoUsuario.disabled=false;botonCancelarEdicion.disabled=false;}
 });
 cargarUsuarios().catch(error=>{elemento("cuerpoUsuarios").replaceChildren();mensaje(error.message,true);});
})();