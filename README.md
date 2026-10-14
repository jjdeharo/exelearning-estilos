# Estilos de eXeLearning

Estilos para [eXeLearning](https://exelearning.net/) 4.0.5 o posterior, de Juan José de Haro. Cada estilo tiene su carpeta, con el estilo y un recurso de ejemplo para verlo funcionando.

**Web:** https://jjdeharo.github.io/exelearning-estilos/

| Estilo | Qué es | Ejemplo |
|---|---|---|
| [Consola](consola/) | El recurso como una terminal de Linux: `tree`, el prompt de bash, la barra de `tmux` y una línea de órdenes con `ls`, `cd`, `grep` y `help` | [Ecuaciones de segundo grado](https://jjdeharo.github.io/exelearning-estilos/consola/) |

## Cómo usar un estilo

**Lo más sencillo: partir del ejemplo.** Se descarga el `.elpx` del ejemplo y se abre en eXeLearning, que ofrece instalar el estilo. Después se sustituye el contenido por el propio, o se aplica el estilo a otro proyecto.

**Instalar solo el estilo.** Se descarga su `.zip` y, en eXeLearning, se importa desde el panel de estilos, en la pestaña de estilos importados.

Los paquetes de cada estilo están en su página de la web (`<estilo>/descargas/`) y, por versiones, en [las publicaciones del repositorio](https://github.com/jjdeharo/exelearning-estilos/releases).

## Organización

| Ruta | Qué es |
|---|---|
| `index.html` | La portada de la web, con todos los estilos |
| `<estilo>/` | Un estilo: `theme/` es el estilo y la raíz de la carpeta, el ejemplo exportado. Cada una tiene su README, sus scripts y su registro de decisiones |
| `.github/workflows/pages.yml` | Al subir cambios, empaqueta y comprueba cada estilo y publica la web |
| `.github/workflows/version.yml` | Al subir una etiqueta `<estilo>-v<versión>`, publica los paquetes de esa versión |
| `docs/adr/` | Decisiones que afectan a todo el repositorio |

Cada carpeta de estilo tiene que incluir `scripts/empaquetar.py`, que deja el estilo y el ejemplo en `dist/`, y `scripts/comprobar.py`.

## Licencias

Salvo que la carpeta de un estilo diga otra cosa: el código, [GNU AGPL v3 o posterior](LICENSE); los recursos de ejemplo, [CC BY-SA 4.0](LICENSE-CONTENIDOS). Las tipografías, iconos y bibliotecas de terceros conservan sus licencias, indicadas en cada estilo.

Hechos con Claude Code (Anthropic), con la dirección y la revisión de su autor: [nivel 4 del MIAE, cocreación](https://jjdeharo.github.io/miae/?nivel=4).
