# 4. Fórmulas en LaTeX con el MathJax de eXeLearning

- Estado: aceptada (sustituye a la primera versión del mismo día)
- Fecha: 14-10-2026

## Contexto

El ejemplo es de matemáticas y todas sus fórmulas van en LaTeX (`\( … \)` y `\[ … \]`). En la primera versión se dejó «Añadir MathJax» desactivado: la exportación por línea de órdenes dibujaba las fórmulas en SVG, sin MathML para los lectores de pantalla, y un script propio añadía el MathML. Además, eXeLearning pedía MathJax en las páginas con actividades sin incluirlo (error 404). Juan José de Haro pidió usar el MathJax estándar de eXeLearning y nada de parches.

## Decisión

- El ejemplo tiene activada la opción «Añadir MathJax» (`pp_addMathJax=true`). La exportación incluye `libs/exe_math` y MathJax dibuja las fórmulas al abrir cada página, con su accesibilidad (MathML para lectores de pantalla y menú contextual).
- Se retira el script que añadía MathML.
- El estilo solo da a las fórmulas el color del texto y deja que las que van en línea aparte se desplacen en horizontal si son más anchas que la pantalla (`max-width: 100%; overflow-x: auto`); MathJax ya las hace enfocables (`tabindex="0"`).
- En el contenido, las comprobaciones largas van en línea aparte: una fórmula dentro del texto no se puede partir y no cabía en un móvil de 320 px.

## Consecuencias

- El ejemplo pesa unos 4,5 MB más (MathJax).
- Sin JavaScript, las fórmulas se ven como código LaTeX.
- Los dos fallos de eXeLearning encontrados con la opción desactivada (SVG sin MathML en la exportación por línea de órdenes; petición de MathJax que falla) quedan pendientes de comunicar a sus autores.
