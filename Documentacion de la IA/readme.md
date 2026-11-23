"Aprendizaje y uso basico de Git y Github"
Modelo: ChatGPT Sol (Alto)

Prompt: Actua como un ingeniero en sistemas asi como un instructor y maestro que enseña el tema y topico de git y github, enseñando lo basico referente a como hacer commit, conectarse a github, las ramas y el como hacer un proyecto entre otros topicos vitales y fundamentales de git y github

Resultado: # **Curso práctico de Git y GitHub: de principiante a trabajo en equipo**

INGENIERÍA DE SOFTWARE · NIVEL BÁSICO A INTERMEDIO

Te enseñaré Git y GitHub como lo haría un ingeniero en sistemas y profesor universitario: explicando **qué es cada herramienta, para qué sirve, cómo se utiliza y qué sucede cuando ejecutas un comando**.

Trabajaremos con ejemplos de programación usando **Windows 11, Visual Studio Code y GitHub**, incluyendo situaciones reales de proyectos donde varios compañeros modifican archivos.

## **Programa del curso**

| Clase | Tema             | Lo que aprenderás                                 |
| ----- | ---------------- | ------------------------------------------------- |
| 1     | Fundamentos      | Git, GitHub, repositorios y control de versiones  |
| 2     | Instalación      | Configurar Git y conectarlo con tu identidad      |
| 3     | Commits          | Registrar y consultar cambios                     |
| 4     | GitHub           | Crear un repositorio y subir un proyecto          |
| 5     | Ramas            | Crear, cambiar, unir y eliminar ramas             |
| 6     | Colaboración     | Clone, pull, push y pull requests                 |
| 7     | Conflictos       | Resolver cambios incompatibles                    |
| 8     | Proyecto real    | Administrar código entre varios programadores     |
| 9     | Buenas prácticas | Seguridad, recuperación, historial y organización |

## **Clase 1. ¿Qué son Git y GitHub?**

Aunque suelen mencionarse juntos, son herramientas diferentes.

**GIT**

Sistema de control de versiones instalado en tu computadora.

Permite guardar versiones de tu código, recuperar cambios y trabajar con ramas, incluso sin internet.

**GITHUB**

Plataforma en internet que aloja repositorios Git.

Permite compartir proyectos, colaborar, revisar modificaciones y organizar el trabajo.

### **Ejemplo sencillo**

Imagina que estás desarrollando un sistema de inventarios.

El lunes creas el inicio de sesión. El martes agregas el inventario. El miércoles modificas el código y accidentalmente provocas un error.

Sin Git, podrías terminar creando carpetas como:

```
proyecto-final
proyecto-final-2
proyecto-final-ahora-si
proyecto-final-definitivo
```

Con Git conservas un historial organizado:

**Commit 1 — Proyecto inicial**

Primera versión funcional

**Commit 2 — Inicio de sesión**

Se agrega la autenticación

**Commit 3 — Inventario**

Se registran entradas y salidas

**Commit 4 — Corrección de errores**

Se corrige el cálculo del inventario

Cada commit permite identificar qué modificaciones se realizaron y comparar versiones anteriores del proyecto.

### **Vocabulario fundamental**

| Término      | Significado                                     |
| ------------ | ----------------------------------------------- |
| Repository   | Carpeta de proyecto administrada por Git        |
| Commit       | Registro de cambios guardado en el historial    |
| Branch       | Rama independiente de desarrollo                |
| `main`       | Nombre habitual de la rama principal            |
| `origin`     | Nombre convencional del repositorio remoto      |
| Push         | Enviar commits locales a GitHub                 |
| Pull         | Traer e integrar cambios del repositorio remoto |
| Clone        | Descargar una copia de un repositorio           |
| Merge        | Integrar los cambios de diferentes ramas        |
| Pull Request | Solicitud de revisión e integración de cambios  |

## **Clase 2. Instalar y configurar Git**

Para trabajar de forma profesional necesitaremos tres herramientas: Git, una cuenta de GitHub y Visual Studio Code.

[Icona Logo Git di Those Icons – scarica in PNG, SVG](https://images.openai.com/static-rsc-4/JvChqviamcg8gCGCWQhdU6IRmtuGLk87XfT7sWbLkywJO09QIS6dMZqOizsZt9CJxx0TnSNYRP3K4UY2DnX4ljIx4T3GSCuO4Uld3EJMDR6Q6iEHOp7sDx-qsLF7Uaxdju_jWOJEYHLrQzYc64fXZFHQmITd4spebp4mzVF4Dfk?purpose=inline)

**1. Instalar Git**

Descárgalo desde [Git para Windows](https://git-scm.com/downloads/win?utm_source=chatgpt.com). Para comenzar, puedes dejar las opciones recomendadas del instalador.

[GitHub Vs. Bitbucket: Which Code Hosting Platform is Best? - Hatica](https://images.openai.com/static-rsc-4/h6nY0yf7JsEycY0Sx4mRb8nNKCcIcOBcXiDBB5zoyQB53kJfJ3b9fumZfym32-9QtI9bMIOfte8A4pxGn5j31kvTkB5L6rFXiUBQgJque7-Zjv7CR_c2oXmVt6Bh1m44flmqva6djfbFywIxlr_rYABjp8Znp5gQnvWf0wXwtYs?purpose=inline)

**2. Crear una cuenta de GitHub**

Ingresa a [GitHub](https://github.com?utm_source=chatgpt.com) y crea una cuenta gratuita si todavía no tienes una.

[File:Visual Studio Code 1.35 icon.svg - Wikimedia Commons](https://images.openai.com/static-rsc-4/bwltRsn8xFpdSRcYQ3DdHauINNG_Ll8uEuWak3gU_Cd8IQKU8JMwJXvDy7WOSMXzw_LreGtysSFaVMfFopIshhFxhhA7optqpzdDNA41Fr3DZ8RT6oELKwe8M8zFoIi4_H68G4UOg124XH5x4eObz-mHD-E9xY_6m_hLlZ275hc?purpose=inline)

**3. Instalar Visual Studio Code**

Descárgalo desde [Visual Studio Code](https://code.visualstudio.com/?utm_source=chatgpt.com). Incluye una terminal y funciones visuales para trabajar con Git.

### **Paso 1. Abrir la terminal**

En Visual Studio Code selecciona:

**Terminal → New Terminal (Nueva terminal)**.

Puedes usar PowerShell o Git Bash. Para nuestros ejercicios utilizaremos comandos compatibles con ambas terminales.

### **Paso 2. Verificar la instalación**

Escribe:

```
git --version
```

Deberá aparecer una respuesta similar a:

```
git version 2.x.x
```

Esto confirma que Git está instalado.

### **Paso 3. Configurar tu identidad**

Ejecuta estos comandos reemplazando los datos de ejemplo por los tuyos:

```
git config --global user.name "Tu Nombre"
```

```
git config --global user.email "tucorreo@ejemplo.com"
```

Esto configura el nombre y correo que aparecerán asociados a tus commits. Para asociarlos a tu cuenta de GitHub, utiliza un correo verificado en ella, que también puede ser tu dirección privada `noreply` de GitHub.

Puedes comprobar la configuración mediante:

```
git config --global --list
```

**Importante:** configurar tu nombre y correo no significa que ya hayas iniciado sesión en GitHub. La autenticación se realizará al conectarte con el repositorio remoto.

## **Clase 3. Crear un proyecto y hacer tu primer commit**

Vamos a construir un repositorio desde cero.

### **Paso 1. Crear la carpeta del proyecto**

Desde la terminal:

```
mkdir mi-primer-proyecto
cd mi-primer-proyecto
```

Después abre esa carpeta en Visual Studio Code desde **Archivo → Abrir carpeta**.

### **Paso 2. Inicializar Git**

Ejecuta:

```
git init -b main
```

¿Qué acaba de suceder?

Git creó un repositorio local y estableció `main` como rama inicial. Internamente existe una carpeta oculta llamada `.git`, donde se administra el historial.

Este comando se ejecuta una sola vez al iniciar el repositorio, no cada vez que hagas modificaciones.

### **Paso 3. Crear tu primer archivo**

Dentro del proyecto crea un archivo llamado `README.md` con lo siguiente:

```
# Mi primer proyecto

Proyecto creado para aprender Git y GitHub.

## Funciones
- Registrar productos
- Consultar inventario
- Administrar usuarios
```

Un README es el documento de presentación y explicación de un proyecto.

### **Paso 4. Verificar los cambios**

Ejecuta:

```
git status
```

Git te mostrará que existe un archivo nuevo que todavía no forma parte de un commit.

### **Paso 5. Preparar el archivo**

Ejecuta:

```
git add README.md
```

Esto agrega el archivo al área de preparación o *staging area*.

También existe:

```
git add .
```

Este comando prepara todos los cambios detectados dentro del directorio actual y sus subdirectorios, incluyendo eliminaciones de archivos rastreados.

### **Paso 6. Crear un commit**

```
git commit -m "Agrega documentación inicial"
```

¡Acabas de crear tu primer commit!

Un commit es un registro local que representa una versión del proyecto. No significa que los archivos ya se hayan subido a GitHub.

### **¿Cómo funciona el recorrido de los cambios?**

**1. Archivos de trabajo**

Editas tu código en VS Code

git add

**2. Staging Area**

Seleccionas qué cambios guardar

git commit

**3. Repositorio local**

El commit queda registrado en tu computadora

git push

**4. GitHub**

El commit se publica en el repositorio remoto

Para consultar tu historial:

```
git log --oneline
```

Verás algo parecido a:

```
a3f91b2 Agrega documentación inicial
```

Los primeros caracteres representan una abreviatura del identificador del commit.

Referencia: documentación oficial de Git sobre inicialización, commits y repositorios.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://git-scm.com\&sz=32)

git-init Documentation+1



## **Clase 4. Conectar un proyecto local con GitHub**

Hasta este momento, nuestro proyecto solamente existe en la computadora. Ahora vamos a publicarlo en GitHub.

### **Paso 1. Crear el repositorio en GitHub**

Entra a [Crear nuevo repositorio](https://github.com/new?utm_source=chatgpt.com) e ingresa los datos:

**Ejemplo de configuración**

Repository name

mi-primer-proyecto

Description

Proyecto de práctica para Git y GitHub

Public

Private

Para un proyecto académico que no quieras mostrar públicamente, selecciona Private.

Como ya tenemos un proyecto local con un README y un commit, **no marques Initialize with README, .gitignore o License** al crear este repositorio. Así evitaremos generar historiales iniciales diferentes.

Pulsa **Create repository**.

### **Paso 2. Vincular el repositorio**

Regresa a la terminal de VS Code y ejecuta:

```
git remote add origin https://github.com/TU-USUARIO/mi-primer-proyecto.git
```

Reemplaza `TU-USUARIO` por tu nombre de usuario verdadero.

Aquí:

- `remote` administra conexiones remotas.
- `add` agrega una conexión nueva.
- `origin` es el nombre que damos a esa conexión.
- La URL identifica el repositorio de GitHub.

Comprueba la conexión configurada:

```
git remote -v
```

### **Paso 3. Subir el proyecto**

```
git push -u origin main
```

Este comando significa: envía los commits de la rama `main` al repositorio llamado `origin` y configura el seguimiento para futuros envíos.

Al ejecutarlo por primera vez, Git podría solicitar autenticación.

En Windows, Git Credential Manager puede abrir una ventana del navegador para iniciar sesión y autorizar el acceso. GitHub ya no acepta la contraseña normal de tu cuenta para autenticar operaciones Git mediante HTTPS; si utilizas autenticación manual, se requiere un token de acceso personal o un método compatible.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.github.com\&sz=32)

Documentación de GitHub+1



Una vez completado el envío, actualiza la página de GitHub y verás los archivos.

### **¿Qué sucede después?**

Cuando realices nuevos commits en la rama vinculada, normalmente bastará con:

```
git push
```

## **Clase 5. Las ramas (branches)**

Esta es una de las partes más importantes de Git.

Una rama permite desarrollar nuevas funciones sin modificar directamente la rama principal de trabajo.

Imagina un equipo de tres programadores:

- Javier desarrolla el inicio de sesión.
- Ana desarrolla el inventario.
- Carlos desarrolla el corte de caja.

Cada uno puede trabajar en su propia rama y proponer integrar sus modificaciones cuando estén terminadas.

### **Visualización del funcionamiento**

Ejemplo conceptual: dos ramas desarrollan funciones y luego sus cambios se integran en la rama principal.

### **Paso 1. Crear una rama**

```
git switch -c feature/login
```

Este comando crea una rama llamada `feature/login` y cambia inmediatamente a ella.

El prefijo `feature/` es una convención para identificar nuevas funciones.

### **Paso 2. Consultar las ramas**

```
git branch
```

Ejemplo de resultado:

```
* feature/login
  main
```

El asterisco indica tu rama actual.

### **Paso 3. Trabajar en la nueva rama**

Crea o modifica los archivos del inicio de sesión. Por ejemplo, crea `login.html`.

Una vez que hayas terminado una parte funcional:

```
git add .
git commit -m "Implementa formulario de inicio de sesion"
```

Este commit quedará en `feature/login`, no directamente en `main`.

### **Paso 4. Subir la rama a GitHub**

```
git push -u origin feature/login
```

Ahora la rama también estará disponible en GitHub.

### **Paso 5. Cambiar de rama**

```
git switch main
```

Para regresar a tu rama de trabajo:

```
git switch feature/login
```

Git actualiza los archivos del directorio de trabajo según la rama seleccionada. Antes de cambiar, guarda, confirma o aparta las modificaciones pendientes para evitar problemas.

### **Paso 6. Unir las ramas**

En un proyecto individual puedes integrar directamente una rama:

```
git switch main
git merge feature/login
git push origin main
```

`merge` incorpora a `main` los cambios de `feature/login`. A veces puede hacerlo sin generar un nuevo commit de integración, dependiendo del historial.

En proyectos colaborativos, lo recomendable es realizar la integración mediante un **Pull Request**, que veremos enseguida.

## **Clase 6. Trabajar en equipo: clone, pull y pull request**

Aquí es donde GitHub empieza a mostrar su verdadero valor para un estudiante de Ingeniería de Software.

### **¿Qué es clone?**

Supongamos que un compañero creó el repositorio del proyecto de inventarios y tú necesitas descargarlo.

Desde la carpeta donde deseas guardar el proyecto:

```
git clone https://github.com/USUARIO/proyecto-inventario.git
```

Después:

```
cd proyecto-inventario
```

`git clone` descarga el repositorio con sus archivos e historial y configura su conexión con el remoto.

No necesitas ejecutar `git init` ni volver a agregar `origin`.

### **¿Qué es pull?**

Supongamos que Ana modificó el inventario y sus cambios ya están en GitHub.

Tú tienes una copia anterior del código.

Para actualizar tu rama principal:

```
git switch main
git pull origin main
```

`git pull` obtiene e integra los cambios remotos. Puede ser necesario resolver conflictos si existen modificaciones incompatibles.

### **¿Qué es un Pull Request?**

Un **Pull Request (PR)** es una propuesta para integrar el contenido de una rama a otra, normalmente hacia `main`.

El flujo recomendado es:

**Crear rama**

feature/inventario

**Modificar archivos y hacer commits**

Guardar el trabajo localmente

**git push**

Enviar la rama a GitHub

**Abrir Pull Request**

Comparar los cambios contra main

**Revisión del equipo**

Verificar que el código sea correcto

**Merge hacia main**

Integración aprobada

Para abrir el PR, entra a tu repositorio en GitHub, busca la rama que subiste y utiliza **Compare & pull request** o entra en la sección **Pull requests → New pull request**. Selecciona `main` como destino y tu rama como origen.

Los PR permiten revisar diferencias, comentar código, solicitar correcciones y aprobar la integración.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.github.com\&sz=32)

GitHub Docs+1



### **Regla para trabajar con compañeros**

No conviene que todos editen directamente `main`. Es preferible que cada integrante tenga una rama para sus actividades y que los cambios sean revisados antes de integrarse.

## **Clase 7. ¿Qué son los conflictos y cómo resolverlos?**

Un conflicto de Git sucede cuando hay cambios que Git no puede combinar automáticamente.

Por ejemplo, tú y tu compañero modifican la misma línea del archivo `config.js` de forma diferente.

Git podría mostrar:

```
<<<<<<< HEAD
const puerto = 3000;
=======
const puerto = 4000;
>>>>>>> feature/configuracion
```

Estas marcas indican las dos versiones en conflicto. Debes revisar cuál es la correcta o combinar manualmente su contenido.

Si la decisión es conservar el puerto 3000, el resultado sería:

```
const puerto = 3000;
```

Después de eliminar las marcas de conflicto y guardar el archivo, ejecuta:

```
git add config.js
git status
```

Git te indicará el siguiente paso. Si estabas resolviendo un merge que necesita un commit:

```
git commit -m "Resuelve conflicto de configuracion"
```

**Atención:** no debes eliminar una de las versiones automáticamente sin revisar qué hace el código. Cuando las modificaciones son de dos compañeros, lo ideal es consultar qué solución corresponde al proyecto.

## **Clase 8. Aplicación a un proyecto real: Sistema Imperio**

Vamos a relacionar el contenido con el sistema de gestión de inventarios, ventas, usuarios y finanzas que has venido desarrollando.

Una estructura razonable del repositorio sería:

```
PROYECTO-SOFTWARE/
│
├── frontend/
│   ├── index.html
│   ├── css/
│   └── js/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── rutas/
│
├── database/
│   └── esquema.sql
│
├── AI/
│   └── README.md
│
├── .gitignore
└── README.md
```

Esta es una estructura ilustrativa, no una instrucción para reorganizar inmediatamente los archivos de tu proyecto actual.

### **¿Qué ramas podríamos utilizar?**

| Rama                 | Responsabilidad                                  |
| -------------------- | ------------------------------------------------ |
| `main`               | Versión principal estable                        |
| `feature/login`      | Autenticación y usuarios                         |
| `feature/inventario` | Gestión de productos                             |
| `feature/corte-caja` | Corte de caja                                    |
| `feature/finanzas`   | Cuentas y movimientos financieros                |
| `feature/mermas`     | Registro y reportes de mermas                    |
| `docs/uso-ia`        | Documentación del uso de inteligencia artificial |

Cada desarrollador trabaja en su módulo, realiza commits y abre PR cuando termina.

### **¿Y si ya existe el proyecto en tu computadora?**

Primero entra a su carpeta principal y ejecuta:

```
git status
```

Si Git reconoce el repositorio, **no vuelvas a ejecutar&#x20;**`git init`. Solamente debes comprobar su configuración y sus conexiones.

Si el proyecto todavía no tiene Git inicializado, entonces sí puedes usar el procedimiento de las clases anteriores.

### **Una herramienta fundamental: .gitignore**

En sistemas que usan Node.js, MySQL y variables de entorno, es esencial evitar subir archivos innecesarios o confidenciales.

Crea un archivo `.gitignore` en la raíz del proyecto:

```
node_modules/
.env
.env.*
!.env.example
dist/
*.log
```

Así Git ignorará, entre otros elementos, dependencias de Node.js y archivos de configuración de entorno no rastreados.

Importante: `.gitignore` no elimina automáticamente archivos que ya estaban registrados en Git. Si alguna contraseña o token se subió por error, debes revocarlo o cambiarlo y tratar el incidente de seguridad.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.github.com\&sz=32)

GitHub Enterprise Cloud Docs+1



### **¿Cómo organizar las actividades en GitHub?**

GitHub también dispone de **Issues** y **Projects**.

Un Issue representa una tarea, mejora o error. Projects permite administrarlos mediante tableros, tablas y hojas de ruta.

Por ejemplo, puedes organizar el trabajo en cuatro columnas:

Pendiente

Agregar reportes

Validar entradas

En proceso

Corte de caja

En revisión

Login

Terminado

Base de datos

Es una forma de gestionar un proyecto académico como un equipo de desarrollo profesional.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.github.com\&sz=32)

Documentación de GitHub+1



## **Clase 9. Comandos que debes dominar**

Esta será tu hoja de consulta rápida.

| Comando                        | Función                                                |
| ------------------------------ | ------------------------------------------------------ |
| `git init`                     | Inicializa un repositorio local                        |
| `git status`                   | Consulta los cambios pendientes                        |
| `git add .`                    | Prepara los cambios del directorio actual              |
| `git commit -m "mensaje"`      | Registra los cambios preparados                        |
| `git log --oneline`            | Muestra el historial resumido                          |
| `git diff`                     | Muestra cambios sin preparar                           |
| `git branch`                   | Lista las ramas locales                                |
| `git switch -c nombre`         | Crea y selecciona una rama                             |
| `git switch main`              | Cambia a la rama principal                             |
| `git clone URL`                | Clona un repositorio                                   |
| `git remote -v`                | Consulta las conexiones remotas                        |
| `git fetch`                    | Descarga referencias y cambios remotos sin integrarlos |
| `git pull`                     | Obtiene e integra cambios remotos                      |
| `git push`                     | Publica commits locales                                |
| `git merge nombre`             | Integra otra rama                                      |
| `git stash`                    | Aparta temporalmente cambios locales                   |
| `git restore archivo`          | Descarta cambios no preparados de ese archivo          |
| `git restore --staged archivo` | Retira el archivo del área de preparación              |
| `git revert HASH`              | Crea un commit que revierte otro commit                |

Ten especial cuidado con `git restore`: puede descartar modificaciones que todavía no has guardado en un commit.

### **Errores comunes**

| Error                          | Qué significa y cómo actuar                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| `not a git repository`         | No estás dentro de un repositorio Git. Verifica la carpeta                                    |
| `nothing to commit`            | No hay cambios preparados pendientes de confirmar                                             |
| `remote origin already exists` | Ya existe una conexión llamada `origin`; revisa con `git remote -v`                           |
| `no upstream branch`           | La rama todavía no tiene seguimiento remoto; normalmente usa `git push -u origin nombre-rama` |
| `non-fast-forward`             | El remoto tiene commits que tu rama local no incorpora; primero revisa y sincroniza           |
| `Authentication failed`        | Revisa tu método de autenticación y tus permisos en GitHub                                    |
| `merge conflict`               | Existen cambios incompatibles que debes resolver                                              |

## **Práctica de evaluación**

Como instructor, no me interesa solamente que memorices comandos; lo importante es que entiendas qué problema resuelve cada uno.

**Examen rápido: fundamentos**

Selecciona una respuesta por pregunta.

0/4

1\. Modificaste tres archivos y quieres guardar esos cambios en el historial local. ¿Qué debes utilizar?

git pull

git add y git commit

git clone

2\. Tu compañero subió cambios nuevos a main. ¿Cómo actualizas tu rama main local?

git pull origin main

git init

git commit

3\. Quieres desarrollar el módulo de ventas sin cambiar directamente main. ¿Qué haces?

Eliminas main

Creas otro repositorio

Creas una rama de trabajo

4\. Terminaste tu rama y quieres que tu equipo revise los cambios antes de unirlos a main. ¿Qué utilizas?

Pull Request

git init

git status

Calificar mis respuestas

## **¿Qué deberías practicar primero?**

Te propongo trabajar con este orden: primero crear un repositorio local, después realizar tres commits, subirlo a GitHub, crear una rama y finalmente completar un Pull Request. Cuando puedas hacer todo eso sin consultar las instrucciones constantemente, tendrás dominado el flujo esencial de Git y GitHub.

Como siguiente ejercicio, podemos utilizar el proyecto **Sistema Imperio** para aprender paso a paso cómo incorporar cambios de tus compañeros sin afectar las versiones que ya funcionan.&#x20;

![Captura 1](./capturas/captura_1)