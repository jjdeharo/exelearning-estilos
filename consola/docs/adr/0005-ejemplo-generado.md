# 5. El ejemplo se genera desde un script y lo exporta eXeLearning

- Estado: aceptada
- Fecha: 14-10-2026

## Contexto

El ejemplo tenía que ser como los de ATE: varias páginas, con test o ejercicios, y no el mismo tema que el suyo («El ciclo del agua»). Se eligió la resolución de ecuaciones de segundo grado, completas e incompletas.

## Decisión

- El contenido vive en `scripts/ejemplo.py`: 13 páginas con textos, ejemplos resueltos, siete ejercicios con el botón «Ver solución» del iDevice de texto, una actividad de ordenar (scrambled-list), un test de diez preguntas (iDevice «form») y la página de créditos con la descarga del `.elpx`.
- `construir_ejemplo.py` escribe `content.xml` con la estructura de eXeLearning 4 y lo exporta con su orden de línea (`elp:export … elpx`), que genera el HTML, dibuja las fórmulas y copia las bibliotecas y los iDevices.
- La gráfica de la parábola se dibuja con caracteres, como la terminal «dumb» de gnuplot, en 31 columnas para que quepa en un móvil de 320 px; tiene `role="img"` y una descripción.
- Las cuentas del ejemplo se comprobaron con un script (fracciones exactas) antes de publicarlas: las 27 ecuaciones, sus discriminantes y sus soluciones.

## Validación

- `comprobar.py`: 13 páginas, JSON válido, referencias locales, fórmulas con MathML y paquetes completos.
- `comprobar-navegador.cjs` en Chromium, Firefox y WebKit: árbol y ramas, prompt con la ruta, recorrido completo con «Siguiente» y «Anterior», «Ver solución», ordenar los pasos, test con 10/10 y móvil a 390 y 320 px sin desplazamiento horizontal.
- El `.elpx` final se importó y se volvió a exportar con eXeLearning (13 páginas, estilo aplicado).
- axe-core (WCAG 2.1 AA) a 1280 y 390 px: sin problemas propios. Quedan tres del iDevice de ordenar de eXeLearning (`aria-required-parent`, `list`, `nested-interactive`), que no dependen del estilo.

## Consecuencias

- Si el ejemplo se edita en eXeLearning, el `content.xml` guardado pasa a ser la fuente y `ejemplo.py` queda como punto de partida.
- Abrir el `.elpx` en el editor de escritorio es una comprobación pendiente de hacer a mano.
