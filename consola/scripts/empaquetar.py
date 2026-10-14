#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-or-later
"""Construye el estilo importable y el proyecto de ejemplo, solo con la biblioteca estándar.

- dist/consola.zip: el contenido de theme/, para importarlo en eXeLearning.
- dist/ecuaciones-segundo-grado.elpx: el ejemplo, con el estilo dentro.
"""
from pathlib import Path
import json
import shutil
import zipfile
import xml.etree.ElementTree as ET

raiz = Path(__file__).resolve().parents[1]
estilo = raiz / "theme"
for nombre in ("config.xml", "style.css", "style.js", "screenshot.png"):
    assert (estilo / nombre).is_file(), f"Falta theme/{nombre}"
assert ET.parse(estilo / "config.xml").findtext("name") == "consola"
ET.parse(raiz / "content.xml")
dist = raiz / "dist"
dist.mkdir(exist_ok=True)
with zipfile.ZipFile(dist / "consola.zip", "w", zipfile.ZIP_DEFLATED) as paquete:
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
print(f"Construidos {dist / 'consola.zip'} y {dist / 'ecuaciones-segundo-grado.elpx'} ({len(rutas)} archivos)")
