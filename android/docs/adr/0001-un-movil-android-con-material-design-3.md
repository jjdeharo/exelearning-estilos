# 1. Un móvil Android con Material Design 3, que se puede girar

- Estado: aceptada
- Fecha: 14-10-2026

## Contexto

Juan José de Haro pidió un segundo estilo, con el mismo ejemplo que Consola, que represente un móvil Android y se pueda poner en vertical y en horizontal.

## Decisión

- **Aspecto de Android actual**: Material Design 3, con un esquema de color propio a partir del verde de Android (#3ddc84), en claro y oscuro según el sistema, y la letra Roboto (paquete `fonts-roboto` de Debian, Apache 2.0), reducida a WOFF2 (unos 20 KB por variante: normal, media y cursiva).
- **Estructura de una aplicación**: barra superior pequeña (menú, nombre del recurso en dos líneas como mucho, búsqueda), cajón de navegación modal con el índice, tarjetas para las cajas (rellenas para las actividades) y barra de navegación inferior con cuatro destinos: Anterior, Inicio, Índice y Siguiente, con «Siguiente» resaltado porque es el paso habitual.
- **Dos formas de verse**: con al menos 50 × 38 rem, el móvil se dibuja sobre el escritorio (proporción 9:19,5, barra de estado con la hora, cámara, botones laterales y barra de gestos) y la página se desplaza dentro de su pantalla; por debajo, la página es la pantalla del móvil y las barras se quedan fijas al desplazarse.
- **Girar**: un botón flotante «Girar» fuera del móvil. El cuerpo gira 90° y, al terminar, la pantalla se recoloca en horizontal, como en un Android con giro automático; sin animación si el sistema pide reducir el movimiento. La orientación se recuerda en el navegador.
- **Horizontal**: la barra de navegación pasa a ser un raíl a la izquierda, como indica Material para pantallas apaisadas; también en un móvil de verdad puesto en horizontal. Con la barra abajo, la página se quedaba en menos de la mitad de la altura.
- **Iconos**: los de las cajas son los de eXeLearning (Material Symbols, `mi-…`), en el verde del estilo. Los de la interfaz se dibujan con trazos sencillos en `style.js`, sin copiar ningún juego de iconos.
- **Clases de caja**: `md-ok`, `md-info`, `md-warn`, `md-error` (contenedores de Material) y `md-highlight` (tarjeta enmarcada).

## Alternativas descartadas

- **Botón flotante «Siguiente» además de la barra**: duplicaba un destino.
- **Botones del sistema (◁ ○ ▢) como navegación**: confunden en un móvil de verdad, que ya tiene los suyos.
- **Cambiar el tamaño del marco sin girarlo**: no parecía un giro.

## Validación

`scripts/comprobar-navegador.cjs` en Chromium, Firefox y WebKit: marco y barra de estado, recorrido con Siguiente, Anterior e Inicio, cajón (menú, botón Índice, Escape, velo y foco), búsqueda, giro y memoria de la orientación, soluciones, ordenar, test con 10/10, MathJax sin LaTeX a la vista, y móvil de 412, 360 y 320 px y apaisado sin desplazamiento horizontal. axe-core: sin problemas del estilo.

## Riesgos conocidos

- axe-core marca como sin etiqueta, solo en pantallas estrechas, las opciones del test que son únicamente una fórmula. La etiqueta existe y MathJax le añade MathML; pasa igual en Consola. Viene de la combinación del cuestionario de eXeLearning con MathJax y no se ha tocado.
