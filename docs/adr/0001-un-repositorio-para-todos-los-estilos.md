# 1. Un repositorio para todos los estilos

- Estado: aceptada
- Fecha: 14-10-2026

## Contexto

El primer estilo, Consola, se creó en su propio repositorio, como hace el Área de Tecnología Educativa del Gobierno de Canarias con los suyos. Ese mismo día, Juan José de Haro pidió un repositorio para todos sus estilos, y una carpeta para ellos en local.

## Decisión

- Repositorio `jjdeharo/exelearning-estilos`, clonado en `~/Documentos/github/exelearning-estilos`, con una carpeta por estilo. Se renombró el repositorio de Consola en lugar de crear otro, para conservar su historia.
- Dentro de cada carpeta, la organización de los estilos de ATE: `theme/` y el ejemplo exportado en la raíz de la carpeta.
- **Web**: GitHub Pages publicada desde una acción (`pages.yml`), que empaqueta cada estilo y deja sus paquetes en `<estilo>/descargas/`. Así los enlaces de descarga no dependen de la última publicación del repositorio, que puede ser de otro estilo, y los paquetes no se guardan en el repositorio.
- **Versiones** por estilo, con etiquetas `<estilo>-v<versión>` (`version.yml`).
- **Sin enlace para abrir el ejemplo en eXeLearning en línea**, de momento. Se probó el 14-10-2026 en `static.exelearning.dev` (versión nightly del 06-10-2026) de tres formas: con la dirección del `.elpx` publicado en Pages, con el `.elpx` de una versión de eXeTexto servido por `github-proxy.exelearning.dev` y con una rama que tenía el ejemplo en su raíz. En las tres, el proyecto se carga, pero sale «Ocurrió un error inesperado al procesar el archivo» (`Cannot read properties of undefined (reading 'compose')` en `reloadStructureMenu`, o `this.importElp is not a function`). El mismo `.elpx` cargado desde el propio programa entra sin errores. El ejemplo de eXeTexto abierto desde su rama principal sí funciona, y no se encontró la diferencia: es un fallo de eXeLearning en línea pendiente de comunicar. Además, `static.exelearning.dev` se queda con el `&branch=` de la dirección del proxy si no se codifica como `%26`. Mientras tanto, la web ofrece descargar el `.elpx`.

## Alternativas descartadas

- **Un repositorio por estilo**, como ATE: más repositorios que mantener, y Juan José de Haro pidió uno solo.
- **Guardar los paquetes en el repositorio**: duplica archivos binarios en cada cambio.

## Consecuencias

- La web tiene una portada (`index.html`) con todos los estilos; cada estilo nuevo se añade allí.
- Los enlaces de la versión anterior, `jjdeharo/exelearning-style-consola`, los redirige GitHub, pero los de Pages no: nunca llegaron a publicarse.
