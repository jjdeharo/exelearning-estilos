# Consola: instrucciones para agentes

Vale para cualquier asistente (Claude Code, Codex, Antigravity u otro). Lo enlaza el `AGENTS.md` de la raíz del repositorio.

- `theme/` es la fuente del estilo (nombre interno `consola`); la raíz es el ejemplo exportado y descomprimido.
- No modificar eXeLearning para arreglar el estilo. Si el fallo es de eXeLearning, se comprueba, se anota en `docs/adr/` y se prepara el aviso para sus autores.
- Paleta Tango y nada más; el rojo para texto es `--cli-rojo-texto`, porque el de Tango no llega a 4,5:1 sobre el fondo. Letra DejaVu Sans Mono (`theme/fonts/`), también en el editor (`body#tinymce`).
- `style.js` añade `html.cli-js` en el `<head>` y monta la ventana en `body.exe-web-site` después de los manejadores `ready` de eXeLearning. Mueve nodos (índice, cabecera, buscador, botones de navegación, contador, pie); no clona ni reescribe iDevices.
- La terminal del final de cada página (`construirTerminal` en `style.js`) admite `ls`, `cd`, `grep` y `help`, con mensajes en los cinco idiomas (`MENSAJES`). El tabulador solo completa con la línea escrita: vacía, deja pasar el foco.
- Sin JavaScript, en el editor o al imprimir, el contenido se lee como una página normal.
- Todo tiene que ser 100 % eXeLearning: nada de copias, suposiciones ni parches (ADR 4 y 5). El contenido del ejemplo está en `scripts/ejemplo.py`; `scripts/construir_ejemplo.py /ruta/a/exelearning-main` escribe un borrador, lo hace guardar al editor de eXeLearning (`scripts/normalizar.cjs`) y lo exporta con su orden de línea. Fórmulas con «Añadir MathJax»; iconos `mi-…` de eXeLearning. Después, `python3 scripts/empaquetar.py`.
- Validar con `python3 scripts/comprobar.py`, `scripts/comprobar-navegador.cjs` en chromium, firefox y webkit, y `scripts/accesibilidad.cjs` (ver README). Las cuentas del ejemplo se comprueban antes de cambiarlas.
- Licencias: estilo y scripts AGPL-3.0-or-later (línea SPDX al inicio de cada archivo de código); ejemplo CC BY-SA 4.0; DejaVu, licencia de Bitstream Vera; iconos de eXeLearning.
- Cada decisión, en `docs/adr/`, en castellano.
