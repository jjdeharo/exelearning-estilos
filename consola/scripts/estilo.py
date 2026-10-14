# SPDX-License-Identifier: CC-BY-SA-4.0
"""Lo propio del estilo Consola en el ejemplo común (ejemplos/ecuaciones_segundo_grado.py)."""

NOMBRE = "Consola"

PRESENTACION = r"""<p>Es también el ejemplo del estilo <strong>Consola</strong> para eXeLearning, que presenta el recurso como una terminal de Linux: cada página es un archivo, el índice es la salida de la orden <code>tree</code> y la barra verde de abajo es la de <code>tmux</code>.</p>"""

COMO_MOVERSE = r"""
<ul>
<li>El índice de la izquierda muestra las páginas como las carpetas y los archivos de la orden <code>tree</code>. En el móvil se abre con el botón «Índice» de la barra inferior.</li>
<li>La barra verde lleva a la página anterior y a la siguiente.</li>
<li>Los botones «Ver solución» de los ejercicios muestran la resolución completa.</li>
<li>Al final de cada página hay un prompt en el que se pueden escribir órdenes, como en una terminal: <code>ls</code> lista las páginas, <code>cd</code> abre una, <code>grep</code> busca una palabra y <code>help</code> explica todo esto. El tabulador completa los nombres.</li>
</ul>"""

# Clases de caja del estilo para cada uso del ejemplo.
CLASES = {"ok": "cli-ok", "info": "cli-info", "aviso": "cli-warn", "error": "cli-fail", "destacado": "cli-marco"}

CREDITOS = r"""<li>Estilo: licencia <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener">GNU AGPL v3 o posterior</a>, la misma que eXeLearning.</li>
<li>Tipografía <a href="https://dejavu-fonts.github.io/" target="_blank" rel="noopener">DejaVu Sans Mono</a>, del proyecto DejaVu: licencia de Bitstream Vera, con los cambios de DejaVu en dominio público.</li>
<li>Colores: la paleta del <a href="https://en.wikipedia.org/wiki/Tango_Desktop_Project" target="_blank" rel="noopener">proyecto Tango</a>, la de GNOME Terminal.</li>"""
