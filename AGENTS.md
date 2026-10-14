# Estilos de eXeLearning: instrucciones para agentes

Vale para cualquier asistente (Claude Code, Codex, Antigravity u otro). `CLAUDE.md` es un enlace a este archivo.

- Un estilo por carpeta, con el nombre interno del estilo (`consola/` para `theme/config.xml` con `<name>consola</name>`). Cada carpeta tiene su propio `AGENTS.md`: léelo antes de tocar ese estilo.
- Todo tiene que ser 100 % compatible con eXeLearning: nada de copias, suposiciones ni parches. El ejemplo lo guarda el editor real (`herramientas/construir_ejemplo.py <estilo> /ruta/a/exelearning-main`, que usa `herramientas/normalizar.cjs`), las fórmulas van con «Añadir MathJax» y los iconos de caja son los de eXeLearning (`mi-…`). La skill `estilos-exelearning` resume cómo funciona eXeLearning por dentro.
- El ejemplo es común (`ejemplos/`); cada estilo pone lo suyo en `<estilo>/scripts/estilo.py`. `herramientas/empaquetar.py <estilo>` deja `<estilo>.zip` y el `.elpx` en `<estilo>/dist/`, y `herramientas/comprobar.py <estilo>` lo revisa: los usa la publicación de la web.
- Un estilo nuevo se añade también a `index.html` y a la tabla de `README.md`.
- Las versiones son por estilo: etiqueta `<estilo>-v<versión>`. La versión cambia con el estilo, no al cambiar solo el ejemplo; se actualiza también en su `theme/config.xml`.
- Las decisiones de todo el repositorio, en `docs/adr/`; las de un estilo, en `<estilo>/docs/adr/`. En castellano.
- En GitHub no figura Claude como colaborador: nada de `Co-Authored-By` en los commits.
