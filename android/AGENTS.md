# Android: instrucciones para agentes

Vale para cualquier asistente. Lo enlaza el `AGENTS.md` de la raíz del repositorio.

- `theme/` es la fuente del estilo (nombre interno `android`); la raíz de la carpeta es el ejemplo exportado.
- Todo tiene que ser 100 % eXeLearning: nada de copias, suposiciones ni parches. El ejemplo es el común (`ejemplos/`), con lo propio del estilo en `scripts/estilo.py`; lo construye `herramientas/construir_ejemplo.py android …`.
- Material Design 3: los colores, como variables `--md-*` en `:root`, con su versión oscura en `prefers-color-scheme: dark`. Letra Roboto (`theme/fonts/`).
- `style.js` añade `html.and-js` (y `html.and-horizontal` si se eligió) en el `<head>` y monta la aplicación en `body.exe-web-site`: barra de estado, barra superior, búsqueda, contenido, barra de navegación, gestos, cajón del índice y el marco del móvil (`.and-movil`). Mueve nodos; no clona ni reescribe iDevices.
- El marco solo existe con `min-width: 50rem` y `min-height: 38rem`; por debajo, `.and-movil` es `display: contents` y la página es la pantalla. En horizontal (marco girado o móvil apaisado), la navegación es un raíl a la izquierda.
- La orientación se guarda en `localStorage` (`exe-estilo-android-orientacion`), siempre dentro de `try`.
- Validar con `herramientas/comprobar.py android`, `scripts/comprobar-navegador.cjs` en chromium, firefox y webkit, y `herramientas/accesibilidad.cjs`.
- Licencias: estilo AGPL-3.0-or-later (SPDX en cada archivo de código); ejemplo CC BY-SA 4.0; Roboto Apache 2.0.
