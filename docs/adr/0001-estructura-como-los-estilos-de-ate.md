# 1. Repositorio con la estructura de los estilos del Área de Tecnología Educativa

- Estado: aceptada
- Fecha: 14-10-2026

## Contexto

Juan José de Haro quería un estilo «como los de Ernesto», los estilos de eXeLearning que Ernesto Serrano publica en el Área de Tecnología Educativa del Gobierno de Canarias (eXeTexto, Boost, Libro…). Esos repositorios tienen una forma de trabajar probada: el estilo en `theme/`, la raíz como un ejemplo exportado que se publica en GitHub Pages y se abre en eXeLearning en línea, y una acción que publica el ZIP del estilo y el `.elpx` del ejemplo.

## Decisión

Seguir la misma estructura que `ateeducacion/exelearning-style-teletext` (consultado en su versión 1.0.0 del 13-10-2026): `theme/` con el estilo, la raíz con el ejemplo, un script de empaquetado, comprobaciones estáticas y en el navegador, y el enlace «Editar en eXeLearning» fuera del estilo. Los scripts son propios, en castellano, inspirados en los suyos (CC0).

El nombre del repositorio, `exelearning-style-consola`, sigue su convención, con el nombre del estilo en castellano.

## Alternativas descartadas

- **Solo el ZIP del estilo**: sin ejemplo publicado no se ve cómo queda ni se puede probar antes de instalarlo.
- **Un ejemplo hecho a mano en el editor**: no se puede regenerar ni revisar como texto. El ejemplo sale de `scripts/ejemplo.py` (ver ADR 5).

## Consecuencias

- Quien conozca los estilos de ATE reconoce la organización.
- El ejemplo publicado y el `.elpx` dependen de la exportación de eXeLearning; al cambiar de versión de eXeLearning conviene volver a exportar.
