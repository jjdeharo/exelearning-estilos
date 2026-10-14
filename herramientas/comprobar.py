#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-or-later
"""Comprueba los metadatos de un estilo, el content.xml, las referencias del HTML y los paquetes.

Uso: python3 herramientas/comprobar.py CARPETA_DEL_ESTILO   (después de empaquetar.py)
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

raiz = Path(sys.argv[1]).resolve()
estilo = ET.parse(raiz / "theme/config.xml")
nombre_estilo = estilo.findtext("name")
assert nombre_estilo == raiz.name, "La carpeta se llama como el estilo"
assert estilo.findtext("compatibility") == "4.0.5"

fuente = ET.parse(raiz / "content.xml")
ns = {"e": "http://www.intef.es/xsd/ode"}
paginas = fuente.findall(".//e:odeNavStructure", ns)
assert len(paginas) == 13, f"Se esperaban 13 páginas y hay {len(paginas)}"
for elemento in fuente.iter():
    if elemento.tag.endswith("jsonProperties") and (elemento.text or "").strip():
        json.loads(elemento.text)
tema = [p.findtext("e:value", namespaces=ns) for p in fuente.findall(".//e:odeProperty", ns) if p.findtext("e:key", namespaces=ns) == "pp_theme"]
assert tema == [nombre_estilo], "El ejemplo usa su estilo"


class Referencias(HTMLParser):
    """Cada src y href local del HTML apunta a un archivo que existe dentro del paquete."""

    def handle_starttag(self, etiqueta, atributos):
        for clave, valor in atributos:
            if clave not in ("src", "href", "poster") or not valor:
                continue
            url = urlsplit(valor)
            if url.scheme or url.netloc or not url.path:
                continue
            destino = (self.pagina.parent / unquote(url.path)).resolve()
            assert destino.is_relative_to(raiz), f"Referencia fuera del paquete: {valor}"
            assert destino.exists(), f"Falta un recurso en {self.pagina.name}: {valor}"
        datos = dict(atributos).get("data-idevice-json-data")
        if datos:
            json.loads(datos)


mathjax = raiz / "libs/exe_math/tex-mml-svg.js"
assert mathjax.is_file(), "El ejemplo lleva el MathJax de eXeLearning («Añadir MathJax»)"
con_formulas = 0
for pagina in [raiz / "index.html", *sorted((raiz / "html").glob("*.html"))]:
    codigo = pagina.read_text()
    analizador = Referencias()
    analizador.pagina = pagina
    analizador.feed(codigo)
    if "\\(" in codigo or "\\[" in codigo:
        con_formulas += 1
        assert "exe_math/tex-mml-svg.js" in codigo, f"{pagina.name} tiene fórmulas y no carga MathJax"
assert con_formulas >= 10, "Las fórmulas del ejemplo están en LaTeX"

with zipfile.ZipFile(raiz / f"dist/{nombre_estilo}.zip") as paquete:
    nombres = set(paquete.namelist())
    assert {"config.xml", "style.css", "style.js", "screenshot.png"} <= nombres
    # Cada tipografía que declara style.css va en el paquete.
    for fuente in re.findall(r"url\((fonts/[^)]+)\)", paquete.read("style.css").decode()):
        assert fuente in nombres, f"Falta {fuente} en el paquete del estilo"
    assert not any(n.startswith("icons/") for n in nombres), "Los iconos son los de eXeLearning, no copias"
    assert not any(n.startswith("theme/") for n in nombres), "El ZIP lleva el estilo en la raíz"
with zipfile.ZipFile(raiz / "dist/ecuaciones-segundo-grado.elpx") as paquete:
    nombres = set(paquete.namelist())
    assert {"content.xml", "content.dtd", "index.html", "theme/config.xml", "theme/style.css"} <= nombres
print(f"CORRECTO ({nombre_estilo}): {len(paginas)} páginas, {con_formulas} con fórmulas y MathJax de eXeLearning, referencias locales y paquetes.")
