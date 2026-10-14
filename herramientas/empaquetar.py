#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-or-later
"""Construye el estilo importable y el proyecto de ejemplo de un estilo, solo con la biblioteca estándar.

- <estilo>/dist/<estilo>.zip: el contenido de theme/, para importarlo en eXeLearning.
- <estilo>/dist/ecuaciones-segundo-grado.elpx: el ejemplo, con el estilo dentro.

Uso: python3 herramientas/empaquetar.py CARPETA_DEL_ESTILO
"""
from pathlib import Path
import json
import sys
import zipfile
import xml.etree.ElementTree as ET

raiz = Path(sys.argv[1]).resolve()
estilo = raiz / "theme"
for nombre in ("config.xml", "style.css", "style.js", "screenshot.png"):
    assert (estilo / nombre).is_file(), f"Falta theme/{nombre}"
nombre_estilo = ET.parse(estilo / "config.xml").findtext("name")
assert nombre_estilo == raiz.name, "La carpeta se llama como el estilo"
ET.parse(raiz / "content.xml")
dist = raiz / "dist"
dist.mkdir(exist_ok=True)
with zipfile.ZipFile(dist / f"{nombre_estilo}.zip", "w", zipfile.ZIP_DEFLATED) as paquete:
    for archivo in sorted(estilo.rglob("*")):
        if archivo.is_file() and not archivo.name.startswith("."):
            paquete.write(archivo, archivo.relative_to(estilo))
archivos = [raiz / nombre for nombre in ("index.html", "content.xml", "content.dtd", "search_index.js", "screenshot.png")]
for carpeta in ("theme", "content", "html", "idevices", "libs"):
    archivos.extend(archivo for archivo in (raiz / carpeta).rglob("*") if archivo.is_file() and not archivo.name.startswith("."))
rutas = sorted(set(archivo.relative_to(raiz).as_posix() for archivo in archivos if archivo.exists()))
(raiz / "libs/elpx-manifest.js").write_text("window.__ELPX_MANIFEST__=" + json.dumps({"version": 1, "files": rutas}, ensure_ascii=False) + ";\n")
if "libs/elpx-manifest.js" not in rutas:
    rutas.append("libs/elpx-manifest.js")
with zipfile.ZipFile(dist / "ecuaciones-segundo-grado.elpx", "w", zipfile.ZIP_DEFLATED) as paquete:
    for nombre in sorted(rutas):
        paquete.write(raiz / nombre, nombre)
print(f"Construidos {dist / (nombre_estilo + '.zip')} y {dist / 'ecuaciones-segundo-grado.elpx'} ({len(rutas)} archivos)")
