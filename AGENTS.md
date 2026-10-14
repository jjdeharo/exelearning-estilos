# Estilos de eXeLearning: instrucciones para agentes

Vale para cualquier asistente (Claude Code, Codex, Antigravity u otro). `CLAUDE.md` es un enlace a este archivo.

- Un estilo por carpeta, con el nombre interno del estilo (`consola/` para `theme/config.xml` con `<name>consola</name>`). Cada carpeta tiene su propio `AGENTS.md`: léelo antes de tocar ese estilo.
- Cada carpeta incluye `scripts/empaquetar.py` (deja `<estilo>.zip` y el `.elpx` del ejemplo en `dist/`) y `scripts/comprobar.py`: los usa la publicación de la web.
- Un estilo nuevo se añade también a `index.html` y a la tabla de `README.md`.
- Las versiones son por estilo: etiqueta `<estilo>-v<versión>`. La versión cambia con el estilo, no al cambiar solo el ejemplo; se actualiza también en su `theme/config.xml`.
- Las decisiones de todo el repositorio, en `docs/adr/`; las de un estilo, en `<estilo>/docs/adr/`. En castellano.
- En GitHub no figura Claude como colaborador: nada de `Co-Authored-By` en los commits.
