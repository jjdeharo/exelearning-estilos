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
- **Abrir el ejemplo en eXeLearning en línea**: `static.exelearning.dev/?url=` con la dirección del `.elpx` publicado en Pages (que permite la carga desde otros sitios, `Access-Control-Allow-Origin: *`). El enlace va solo en el ejemplo publicado (`<estilo>/edit-in-exelearning.js`, que `herramientas/empaquetar.py` enlaza desde sus páginas), nunca en el estilo, como en los de ATE. Un primer intento falló con «Ocurrió un error inesperado al procesar el archivo» y se atribuyó a eXeLearning, pero el fallo venía del `content.xml` escrito a mano: desde que el ejemplo lo guarda el editor de eXeLearning (ADR 5 de Consola), se abre igual que el de eXeTexto (pide instalar el estilo y carga las páginas). Comprobado el 14-10-2026 con los dos estilos.

## Alternativas descartadas

- **Un repositorio por estilo**, como ATE: más repositorios que mantener, y Juan José de Haro pidió uno solo.
- **Guardar los paquetes en el repositorio**: duplica archivos binarios en cada cambio.

## Consecuencias

- La web tiene una portada (`index.html`) con todos los estilos; cada estilo nuevo se añade allí.
- Los enlaces de la versión anterior, `jjdeharo/exelearning-style-consola`, los redirige GitHub, pero los de Pages no: nunca llegaron a publicarse.
