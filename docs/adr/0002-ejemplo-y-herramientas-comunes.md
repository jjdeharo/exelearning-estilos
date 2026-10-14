# 2. Un ejemplo y unas herramientas comunes a los estilos

- Estado: aceptada
- Fecha: 14-10-2026

## Contexto

El segundo estilo, Android, se pidió con el mismo ejemplo que Consola. El ejemplo tenía partes propias de Consola (la presentación, cómo moverse con la terminal, los créditos y las clases de caja `cli-…`), y los scripts de construcción vivían dentro de `consola/`.

## Decisión

- El contenido del ejemplo pasa a `ejemplos/ecuaciones_segundo_grado.py`, como una función que recibe lo propio de cada estilo.
- Cada estilo pone lo suyo en `<estilo>/scripts/estilo.py`: nombre, párrafo de presentación, cómo moverse, créditos del estilo y qué clase de caja usa para cada caso del ejemplo (`ok`, `info`, `aviso`, `error`, `destacado`).
- Las herramientas que no dependen del estilo pasan a `herramientas/` y reciben la carpeta del estilo: `construir_ejemplo.py` (borrador, editor de eXeLearning y exportación), `normalizar.cjs`, `empaquetar.py`, `comprobar.py` y `accesibilidad.cjs`. Cada estilo conserva sus pruebas en el navegador, que sí dependen de su interfaz.
- La publicación (`pages.yml`) y las versiones (`version.yml`) usan esas herramientas para cada carpeta con `theme/config.xml`.

## Consecuencias

- Un estilo nuevo con el mismo ejemplo solo necesita `theme/`, `scripts/estilo.py`, sus pruebas y su documentación.
- Un cambio en el contenido del ejemplo se aplica a todos los estilos al reconstruirlos.
