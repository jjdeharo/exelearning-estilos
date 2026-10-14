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
- **Abrir el ejemplo en eXeLearning en línea**: `static.exelearning.dev` con la dirección del `.elpx` publicado en Pages, porque el proxy de GitHub que usan los estilos de ATE sirve el repositorio entero y aquí cada ejemplo está en una subcarpeta.

## Alternativas descartadas

- **Un repositorio por estilo**, como ATE: más repositorios que mantener, y Juan José de Haro pidió uno solo.
- **Guardar los paquetes en el repositorio**: duplica archivos binarios en cada cambio.

## Consecuencias

- La web tiene una portada (`index.html`) con todos los estilos; cada estilo nuevo se añade allí.
- Los enlaces de la versión anterior, `jjdeharo/exelearning-style-consola`, los redirige GitHub, pero los de Pages no: nunca llegaron a publicarse.
