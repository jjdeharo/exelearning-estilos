# 4. Fórmulas en LaTeX, dibujadas al exportar, con MathML para los lectores de pantalla

- Estado: aceptada
- Fecha: 14-10-2026

## Contexto

El ejemplo es de matemáticas y se pidió con todas las fórmulas en LaTeX. eXeLearning admite LaTeX en los textos y en los iDevices de juego (`\( … \)` y `\[ … \]`). Con la opción «Añadir MathJax» desactivada (la de serie), la exportación dibuja cada fórmula en SVG y no incluye MathJax, unos 4,5 MB.

## Decisión

- Mantener «Añadir MathJax» desactivado (`pp_addMathJax=false`) y dejar que eXeLearning dibuje las fórmulas.
- El estilo da a las fórmulas el color del texto y centra las que van en línea aparte.
- `construir_ejemplo.py` añade a cada fórmula dibujada su MathML, generado con el MathJax que trae eXeLearning (`mathjax-full` 3.2.2, `scripts/mathml.cjs`), y marca el SVG con `aria-hidden="true"`. También dentro de los datos de las actividades.

## Evidencia

- La exportación por línea de órdenes (`ServerLatexPreRenderer.ts`) intenta sacar el MathML de un elemento «assistive-mml» que no se genera, y deja solo el SVG, con `role="img"` y sin texto alternativo. axe-core lo marcaba (`svg-img-alt`) en 10 páginas. La exportación desde el navegador (`public/app/common/LatexPreRenderer.js`) sí tiene una segunda vía, `MathJax.tex2mml`. Comprobado en eXeLearning 33a6e4b7 (rama feature/sirena-mermaid-editor sobre main, 06-10-2026), con `dist/cli.js` compilado el 29-09-2026.
- Tras añadir el MathML, axe-core no encuentra ningún problema en las fórmulas.

## Riesgos conocidos

- **Petición de MathJax que falla (404)** en las páginas con actividades: al arrancar, `common.js` busca LaTeX sin dibujar en todo el HTML, también dentro de los atributos `data-idevice-json-data`, donde las fórmulas ya dibujadas conservan su LaTeX en `data-latex` con las comillas escapadas, y la expresión que debería descartarlas no las reconoce. Pide `libs/exe_math/tex-mml-svg.js`, que la exportación no incluye. No se nota en pantalla: las fórmulas ya están dibujadas. Es un fallo de eXeLearning, pendiente de comunicar a sus autores; `comprobar-navegador.cjs` lo ignora de forma explícita.
- Si alguien edita el ejemplo y lo exporta desde el navegador, el MathML lo pone eXeLearning; si lo exporta por línea de órdenes, hay que volver a pasar `construir_ejemplo.py` o se pierde.

## Alternativas descartadas

- **Activar «Añadir MathJax»**: resuelve las dos cosas, pero suma unos 4,5 MB al ejemplo y lo hace depender de JavaScript para leer cualquier fórmula.
- **Usar el LaTeX como texto alternativo** (`aria-label`): los lectores de pantalla leerían el código, no la fórmula.
