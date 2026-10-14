# 3. Licencias: AGPL para el estilo, CC BY-SA para el ejemplo

- Estado: aceptada
- Fecha: 14-10-2026

## Contexto

La guía «Vibe coding responsable» de Juan José de Haro propone AGPL v3 para el código y CC BY-SA 4.0 para los contenidos, salvo indicación en contra. Los estilos de ATE usan CC0. El estilo incorpora una tipografía de terceros; los iconos son los de eXeLearning.

## Decisión

- Estilo y scripts: **AGPL-3.0-or-later**, la de la guía y la de eXeLearning, con línea SPDX en cada archivo de código.
- Ejemplo «Ecuaciones de segundo grado»: **CC BY-SA 4.0** (`LICENSE-CONTENIDOS`), también en los metadatos del proyecto.
- DejaVu Sans Mono: licencia de Bitstream Vera y cambios de DejaVu en dominio público; texto completo en `theme/fonts/LICENSE.txt`, descargado del repositorio del proyecto DejaVu.
- Todo se acredita dentro del propio estilo (`config.xml`, cabecera de `style.css`) para que viaje con el ZIP, y en la página de créditos del ejemplo.

## Alternativas descartadas

- **CC0, como los estilos de ATE**: la guía de su autor pide licencias con reconocimiento y copyleft.
- **MIT para el estilo**: no protege las mejoras como la AGPL de eXeLearning.

## Consecuencias

- Los recursos que alguien exporte con el estilo llevan `style.css` y `style.js` bajo AGPL, como ya llevan las bibliotecas de eXeLearning; su contenido sigue siendo de quien lo escribe.
