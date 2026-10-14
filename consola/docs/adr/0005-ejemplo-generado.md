# 5. El ejemplo lo guarda el editor de eXeLearning

- Estado: aceptada (sustituye a la primera versión del mismo día)
- Fecha: 14-10-2026

## Contexto

El ejemplo tenía que ser como los de ATE: varias páginas, con ejercicios y alguna actividad, y no el mismo tema que el suyo. Se eligió la resolución de ecuaciones de segundo grado, completas e incompletas.

En la primera versión, un script escribía el `content.xml` completo, con el HTML de cada iDevice hecho a mano, una plantilla del cuestionario copiada de un proyecto de pruebas y mensajes inventados. Juan José de Haro pidió compatibilidad total con eXeLearning, sin copias, suposiciones ni parches. Al revisarlo aparecieron diferencias reales: el editor de texto guarda el contenido envuelto de otra forma y los mensajes de eXeLearning no eran los que se habían puesto («Pulsa aquí para empezar», no «Haz clic aquí para empezar»).

## Decisión

- El contenido vive en `scripts/ejemplo.py`. `construir_ejemplo.py` escribe con él un **borrador** que solo lleva páginas, cajas y los datos de cada iDevice, sin HTML.
- `scripts/normalizar.cjs` abre el borrador en el **editor de eXeLearning** (la versión estática de la rama `main`, servida en local) con un navegador automático: acepta instalar el estilo, entra en «Editar» y «Guardar» de cada uno de los 40 iDevices y descarga el proyecto. El HTML, los campos y los mensajes los genera así el propio editor de cada iDevice, como si los guardara una persona.
- Ese proyecto se exporta con la orden de línea de la misma versión de eXeLearning (`elp:export … elpx`). El `content.xml` del repositorio es el que guardó el editor.
- Los iconos de las cajas son los Material Symbols de eXeLearning (`mi-…`), todos del catálogo que ofrece el editor.
- La gráfica de la parábola se dibuja con caracteres, como la terminal «dumb» de gnuplot, en 31 columnas para que quepa en un móvil de 320 px.
- Las cuentas del ejemplo se comprobaron con un script (fracciones exactas): las 27 ecuaciones, sus discriminantes y sus soluciones.

## Validación

- `normalizar.cjs`: el editor guarda los 40 iDevices de las 13 páginas sin avisos.
- `comprobar.py`, `comprobar-navegador.cjs` en Chromium, Firefox y WebKit (árbol, prompt, terminal, soluciones, ordenar, test con 10/10, MathJax sin LaTeX a la vista, móvil a 390 y 320 px) y `accesibilidad.cjs` (axe-core).

## Consecuencias

- Construir el ejemplo necesita una copia de eXeLearning con el editor estático compilado y Playwright.
- Si el ejemplo se edita a mano en eXeLearning, el `content.xml` guardado pasa a ser la fuente y `ejemplo.py` queda como punto de partida.
