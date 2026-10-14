#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-or-later
"""Construye el recurso de ejemplo con el propio eXeLearning.

1. Escribe un borrador de content.xml con el contenido de scripts/ejemplo.py:
   páginas, cajas y los datos de cada iDevice, sin HTML.
2. Lo abre en el editor de eXeLearning (la versión estática, en un navegador
   automático), entra en la edición de cada iDevice y lo guarda, y descarga el
   proyecto. Así el HTML, los mensajes y el formato de cada iDevice son los que
   genera su propio editor (scripts/normalizar.cjs).
3. Exporta ese proyecto con la orden de línea de eXeLearning y copia en esta
   carpeta las páginas, las bibliotecas y los iDevices.

Uso:
    python3 scripts/construir_ejemplo.py /ruta/a/exelearning

La ruta es una copia de eXeLearning con el editor estático compilado
(`bun run build:static`, que deja dist/static y dist/cli.js) y bun instalado.
Hace falta también Playwright (NODE_PATH con su instalación).
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from xml.sax.saxutils import escape
import copy
import json
import os
import shutil
import subprocess
import sys
import tempfile
import threading
import zipfile

sys.path.insert(0, str(Path(__file__).resolve().parent))
import ejemplo  # noqa: E402

RAIZ = Path(__file__).resolve().parents[1]
contador = 0


def nuevo_id():
    """Identificadores fijos con la forma de los de eXeLearning: fecha, hora y seis letras."""
    global contador
    contador += 1
    letras = ""
    n = contador
    for _ in range(6):
        letras = chr(65 + n % 26) + letras
        n //= 26
    return f"20261014{120000 + contador:06d}{letras}"


def cdata(texto):
    return "<![CDATA[" + texto.replace("]]>", "]]]]><![CDATA[>") + "]]>"


def propiedades(etiqueta, pares, sangria):
    hueco = " " * sangria
    plural = etiqueta[:-1] + "ies" if etiqueta.endswith("y") else etiqueta + "s"
    lineas = [f"{hueco}<{plural}>"]
    for clave, valor in pares:
        lineas += [f"{hueco}  <{etiqueta}>", f"{hueco}    <key>{clave}</key>",
                   f"{hueco}    <value>{escape(valor)}</value>", f"{hueco}  </{etiqueta}>"]
    lineas.append(f"{hueco}</{plural}>")
    return "\n".join(lineas)


# ---------- Datos de cada iDevice: los campos que lee su editor ----------
# Los mensajes, el HTML y los campos que falten los pone el editor al guardar.

def datos_texto(caja, ident):
    solucion = (caja["solucion"] or "").strip()
    return {
        "ideviceId": ident,
        "textTextarea": caja["html"].strip(),
        "textFeedbackInput": caja["boton"] if solucion else "",
        "textFeedbackTextarea": solucion,
    }


def datos_ordenar(caja, ident):
    return {
        "typeGame": "ScrambledList",
        "instructions": caja["instrucciones"],
        "options": caja["opciones"],
        "textAfter": "",
        "isScorm": 0,
        "repeatActivity": True,
        "weighted": 100,
        "evaluation": False,
        "evaluationID": "",
        "time": 0,
    }


def datos_test(caja, ident):
    preguntas = []
    for orden, pregunta in enumerate(caja["preguntas"]):
        completa = {"activityType": "", "baseText": "", "feedbackRight": "", "feedbackWrong": "",
                    "suggestion": "", "selectionType": "single", "answers": [], "answer": "1",
                    "order": orden, "customScore": 1, "time": 0}
        completa.update(copy.deepcopy(pregunta))
        preguntas.append(completa)
    return {
        "ideviceId": ident,
        "id": ident,
        "eXeFormInstructions": caja["instrucciones"],
        "questionsData": preguntas,
        "questionsRandom": False,
        "percentageQuestions": "100",
        "time": "0",
        "passRate": 5,
        "addBtnAnswers": True,
        "isScorm": 0,
        "repeatActivity": True,
        "weighted": 100,
        "evaluation": False,
        "evaluationID": "",
    }


DATOS = {
    "text": datos_texto,
    "scrambled-list": datos_ordenar,
    "form": datos_test,
    "download-source-file": lambda caja, ident: None,
}


def componente(pagina_id, bloque_id, caja):
    ident = nuevo_id()
    datos = DATOS[caja["tipo"]](caja, ident)
    json_datos = json.dumps(datos, ensure_ascii=False) if datos is not None else ""
    return "\n".join([
        "        <odeComponent>",
        f"          <odePageId>{pagina_id}</odePageId>",
        f"          <odeBlockId>{bloque_id}</odeBlockId>",
        f"          <odeIdeviceId>{ident}</odeIdeviceId>",
        f"          <odeIdeviceTypeName>{caja['tipo']}</odeIdeviceTypeName>",
        "          <htmlView></htmlView>",
        f"          <jsonProperties>{cdata(json_datos) if json_datos else ''}</jsonProperties>",
        "          <odeComponentsOrder>1</odeComponentsOrder>",
        propiedades("odeComponentsProperty", [("visibility", "true"), ("teacherOnly", "false"), ("cssClass", "")], 10),
        "        </odeComponent>",
    ])


def bloque(pagina_id, caja, orden):
    bloque_id = nuevo_id()
    pares = [("visibility", "true"), ("teacherOnly", "false"), ("allowToggle", "true"),
             ("minimized", "false"), ("cssClass", caja.get("clase", ""))]
    return "\n".join([
        "    <odePagStructure>",
        f"      <odePageId>{pagina_id}</odePageId>",
        f"      <odeBlockId>{bloque_id}</odeBlockId>",
        f"      <blockName>{escape(caja['titulo'])}</blockName>",
        # «mi-»: los Material Symbols de eXeLearning, válidos con cualquier estilo.
        f"      <iconName>mi-{caja['icono']}</iconName>",
        f"      <odePagStructureOrder>{orden}</odePagStructureOrder>",
        propiedades("odePagStructureProperty", pares, 6),
        "      <odeComponents>",
        componente(pagina_id, bloque_id, caja),
        "      </odeComponents>",
        "    </odePagStructure>",
    ])


def paginas_en_orden(lista, madre=None):
    """Recorre el árbol en orden de lectura, con la página de la que cuelga cada una."""
    for orden, pagina in enumerate(lista):
        yield pagina, madre, orden
        yield from paginas_en_orden(pagina.get("hijas", []), pagina)


def borrador_content_xml(tema):
    recorrido = list(paginas_en_orden(ejemplo.PAGINAS))
    for numero, (pagina, _, _) in enumerate(recorrido, 1):
        pagina["id"] = f"page-ejemplo-{numero:02d}"
    estructuras = []
    for pagina, madre, orden in recorrido:
        pares = [("titlePage", pagina["titulo"]), ("visibility", "true"), ("highlight", "false"),
                 ("hidePageTitle", "false"), ("editableInPage", "false"), ("titleNode", pagina["titulo"]),
                 ("titleHtml", ""), ("description", "")]
        estructuras.append("\n".join([
            "<odeNavStructure>",
            f"  <odePageId>{pagina['id']}</odePageId>",
            f"  <odeParentPageId>{madre['id'] if madre else ''}</odeParentPageId>",
            f"  <pageName>{escape(pagina['titulo'])}</pageName>",
            f"  <odeNavStructureOrder>{orden}</odeNavStructureOrder>",
            propiedades("odeNavStructureProperty", pares, 2),
            "  <odePagStructures>",
            *[bloque(pagina["id"], caja, i + 1) for i, caja in enumerate(pagina["cajas"])],
            "  </odePagStructures>",
            "</odeNavStructure>",
        ]))
    metadatos = propiedades("odeProperty", [
        ("pp_title", ejemplo.TITULO), ("pp_author", ejemplo.AUTORIA), ("pp_description", ejemplo.DESCRIPCION),
        ("pp_lang", "es"), ("pp_license", ejemplo.LICENCIA), ("pp_licenseUrl", ejemplo.LICENCIA_URL),
        ("pp_theme", tema), ("pp_addExeLink", "true"), ("pp_addPagination", "true"),
        ("pp_addSearchBox", "true"), ("pp_addAccessibilityToolbar", "false"),
        # Las fórmulas, con el MathJax de eXeLearning («Añadir MathJax» en las propiedades).
        ("pp_addMathJax", "true"), ("exportSource", "true"),
    ], 0)
    return "\n".join([
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<ode xmlns="http://www.intef.es/xsd/ode" version="2.0">',
        propiedades("userPreference", [("theme", tema)], 0),
        metadatos,
        "<odeNavStructures>", *estructuras, "</odeNavStructures>",
        "</ode>", "",
    ])


# ---------- El editor de eXeLearning y su orden de línea ----------

def servir(carpeta):
    """Sirve el editor estático en un puerto libre de 127.0.0.1 mientras dura la construcción."""
    class Silencioso(SimpleHTTPRequestHandler):
        def log_message(self, *argumentos):
            pass

    servidor = ThreadingHTTPServer(("127.0.0.1", 0), partial(Silencioso, directory=str(carpeta)))
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    return servidor


def construir(exelearning):
    tema = nombre_del_estilo()
    with tempfile.TemporaryDirectory() as temporal:
        temporal = Path(temporal)
        borrador = temporal / "borrador.elpx"
        with zipfile.ZipFile(borrador, "w", zipfile.ZIP_DEFLATED) as paquete:
            paquete.writestr("content.xml", borrador_content_xml(tema))
            for archivo in sorted((RAIZ / "theme").rglob("*")):
                if archivo.is_file():
                    paquete.write(archivo, "theme/" + archivo.relative_to(RAIZ / "theme").as_posix())

        # 2. El editor guarda cada iDevice y descarga el proyecto.
        guardado = temporal / "guardado.elpx"
        servidor = servir(exelearning / "dist/static")
        try:
            url = f"http://127.0.0.1:{servidor.server_address[1]}/"
            subprocess.run(["node", str(RAIZ / "scripts/normalizar.cjs"), url, str(borrador), str(guardado)], check=True)
        finally:
            servidor.shutdown()
        with zipfile.ZipFile(guardado) as paquete:
            (RAIZ / "content.xml").write_bytes(paquete.read("content.xml"))

        # 3. La exportación, con la orden de línea, desde el proyecto que guardó el editor.
        salida = temporal / "salida.elpx"
        bun = shutil.which("bun") or str(Path.home() / ".bun/bin/bun")
        subprocess.run([bun, "dist/cli.js", "elp:export", str(guardado), str(salida), "elpx"],
                       cwd=exelearning, check=True, env=dict(os.environ, PUBLIC_DIR="public"))
        extraido = temporal / "extraido"
        with zipfile.ZipFile(salida) as paquete:
            paquete.extractall(extraido)
        for nombre in ("index.html", "html", "search_index.js", "libs", "idevices", "content", "content.dtd"):
            destino = RAIZ / nombre
            if destino.is_dir():
                shutil.rmtree(destino)
            elif destino.exists():
                destino.unlink()
            origen = extraido / nombre
            if origen.is_dir():
                shutil.copytree(origen, destino)
            elif origen.exists():
                shutil.copy2(origen, destino)
        print("Exportado con eXeLearning:", ", ".join(sorted(p.name for p in extraido.iterdir())))


def nombre_del_estilo():
    import xml.etree.ElementTree as ET
    return ET.parse(RAIZ / "theme/config.xml").findtext("name")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    construir(Path(sys.argv[1]).resolve())
