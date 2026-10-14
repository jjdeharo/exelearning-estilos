#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-or-later
"""Construye el proyecto de ejemplo y lo exporta con eXeLearning.

1. Escribe content.xml a partir de scripts/ejemplo.py.
2. Lo empaqueta con el estilo (theme/) en un .elpx provisional.
3. Lo exporta con la orden de línea de eXeLearning, que dibuja las fórmulas,
   y copia en la raíz del repositorio las páginas HTML, las bibliotecas y los
   iDevices.

Uso:
    python3 scripts/construir_ejemplo.py /ruta/a/exelearning

La ruta es la de una copia de eXeLearning con la orden ya compilada
(dist/cli.js) y bun instalado. Sin ruta, solo escribe content.xml.
"""
from pathlib import Path
from xml.sax.saxutils import escape
import copy
import html
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile

sys.path.insert(0, str(Path(__file__).resolve().parent))
import ejemplo  # noqa: E402

RAIZ = Path(__file__).resolve().parents[1]
FECHA = "2026-10-14T12:00:00.000Z"
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


# ---------- HTML y JSON de cada tipo de iDevice ----------

def idevice_texto(caja, ident):
    contenido = caja["html"].strip()
    solucion = (caja["solucion"] or "").strip()
    # «Ver solución|Ocultar solución»: eXeLearning cambia el rótulo al desplegar.
    boton = caja["boton"]
    cuerpo = contenido
    if solucion:
        valor = html.escape(boton, quote=True)
        cuerpo += ('<div class="iDevice_buttons feedback-button js-required">'
                   f'<input type="button" class="feedbacktooglebutton" value="{valor}"></div>'
                   f'<div class="feedback js-feedback js-hidden">{solucion}</div>')
    vista = ('<div class="exe-text-template"><div class="textIdeviceContent"><div class="exe-text-activity">'
             f'<div>{cuerpo}<p class="clearfix"> </p></div></div></div></div>')
    datos = {
        "ideviceId": ident,
        "textInfoDurationInput": "",
        "textInfoDurationTextInput": "Duración:",
        "textInfoParticipantsInput": "",
        "textInfoParticipantsTextInput": "Agrupar:",
        "textTextarea": contenido,
        "textFeedbackInput": boton if solucion else "Mostrar comentarios",
        "textFeedbackTextarea": solucion,
    }
    return vista, datos


MENSAJES_COMUNES = {
    "msgScoreScorm": "La puntuación no se puede guardar porque esta página no forma parte de un paquete SCORM.",
    "msgYouLastScore": "La última puntuación guardada es",
    "msgOnlySaveScore": "¡Solo puedes guardar la puntuación una vez!",
    "msgOnlySave": "Solo puedes guardar una vez",
    "msgOnlySaveAuto": "La puntuación se guardará después de cada pregunta. Solo puedes jugar una vez.",
    "msgSaveAuto": "La puntuación se guardará automáticamente después de cada pregunta.",
    "msgSeveralScore": "Puedes guardar la puntuación tantas veces como quieras",
    "msgPlaySeveralTimes": "Puedes hacer esta actividad tantas veces como quieras",
    "msgActityComply": "Ya has hecho esta actividad.",
    "msgUncompletedActivity": "Actividad sin completar",
    "msgSuccessfulActivity": "Actividad superada. Puntuación: %s",
    "msgUnsuccessfulActivity": "Actividad no superada. Puntuación: %s",
    "msgStartGame": "Haz clic aquí para empezar",
    "msgTime": "Tiempo por pregunta",
}


def idevice_ordenar(caja, ident):
    opciones = caja["opciones"]
    textos = {"buttonText": "Comprobar", "rightText": "¡Correcto!", "wrongText": "Aún no. El orden correcto es:"}
    vista = (f'<div class="exe-sortableList" id="sl{ident}" scorm=false>'
             f'<div class="game-evaluation-ids js-hidden" data-id="{ident}" data-evaluationid=""></div>'
             f'<div class="exe-sortableList-instructions">{caja["instrucciones"]}</div>'
             '<ul class="exe-sortableList-list">' + "".join(f"<li>{o}</li>" for o in opciones) + "</ul>"
             f'<div style="display:none"><p class="exe-sortableList-buttonText">{textos["buttonText"]}</p>'
             f'<p class="exe-sortableList-rightText">{textos["rightText"]}</p>'
             f'<p class="exe-sortableList-wrongText">{textos["wrongText"]}</p></div>'
             '<div class="exe-scorm-message"></div></div>')
    mensajes = dict(MENSAJES_COMUNES, msgSaveScore="Guardar la puntuación", msgSubmit="Enviar",
                    msgCheck="Comprobar", msgTestFailed="No has superado la prueba. Inténtalo de nuevo")
    datos = {
        "typeGame": "ScrambledList", "instructions": caja["instrucciones"], "textAfter": "", "afterElement": "",
        "options": opciones, "time": 0, **textos, "isScorm": 0, "textButtonScorm": "Guardar puntuación",
        "repeatActivity": True, "weighted": 100, "evaluation": False, "evaluationID": "",
        "main": f"sl{ident}", "msgs": mensajes,
    }
    return vista, datos


def idevice_test(caja, ident):
    preguntas = []
    for orden, pregunta in enumerate(caja["preguntas"]):
        completa = {
            "id": f"{ident}Q{orden + 1:02d}", "activityType": "", "baseText": "", "feedbackRight": "",
            "feedbackWrong": "", "suggestion": "", "wrongAnswersValue": "", "selectionType": "single",
            "answers": [], "answer": "1", "capitalization": False, "strict": False, "order": orden,
            "customScore": 1, "time": 0,
        }
        completa.update(copy.deepcopy(pregunta))
        preguntas.append(completa)
    mensajes = dict(
        MENSAJES_COMUNES,
        msgYouScore="Tu puntuación", msgScore="Puntuación", msgWeight="Peso", msgTypeGame="Cuestionario",
        msgSaveScore="Guardar puntuación", msgResult="Resultado", msgCheck="Comprobar", msgReset="Reiniciar",
        msgShowAnswers="Mostrar respuestas", msgTestResultPass="Has superado el test",
        msgTestResultNotPass="No has superado el test. Inténtalo de nuevo",
        msgTrueFalseHelp="Indica si la afirmación es verdadera o falsa",
        msgDropdownHelp="Elige la respuesta correcta entre las opciones",
        msgFillHelp="Completa los espacios en blanco",
        msgSingleSelectionHelp="Opción múltiple con una sola respuesta correcta",
        msgMultipleSelectionHelp="Opción múltiple con varias respuestas correctas",
        msgPlayStart="Haz clic aquí para empezar", msgTrue="Verdadero", msgFalse="Falso",
        msgOk="Correcto", msgKO="Incorrecto", msgSuggestion="Pista", msgHide="Ocultar",
        msgNext="Siguiente", msgPrevious="Anterior",
        msgPassScore="Puntuación mínima para superar la actividad: %s",
    )
    datos = {
        "ideviceId": ident, "evaluation": False, "evaluationID": "", "repeatActivity": True, "isScorm": 0,
        "textButtonScorm": "Guardar puntuación", "weighted": 100, "msgs": mensajes, "id": ident,
        "questionsRandom": False, "percentageQuestions": "100", "time": "0",
        "eXeFormInstructions": caja["instrucciones"], "questionsData": preguntas, "passRate": 5,
        "addBtnAnswers": True, "eXeIdeviceTextAfter": "",
    }
    plantilla = (RAIZ / "scripts/plantillas/form.html").read_text()
    vista = plantilla.replace("{id}", ident).replace("{instrucciones}", caja["instrucciones"])
    return vista, datos


def idevice_descarga(caja, ident):
    vista = (
        '<div class="exe-download-package-instructions"><table class="exe-table">'
        "<caption>Información general de este recurso educativo</caption><tbody>"
        f"<tr><th>Título</th><td>{ejemplo.TITULO}</td></tr>"
        f"<tr><th>Descripción</th><td>{ejemplo.DESCRIPCION}</td></tr>"
        f"<tr><th>Autoría</th><td>{ejemplo.AUTORIA}</td></tr>"
        f'<tr><th>Licencia</th><td><a href="{ejemplo.LICENCIA_URL}" rel="license" class="cc cc-by-sa"><span></span>'
        "Creative Commons: Reconocimiento - Compartir igual 4.0</a></td></tr></tbody></table>"
        '<p>Este contenido se ha creado con <a href="https://exelearning.net/">eXeLearning</a>, '
        "un editor libre y de código abierto para crear recursos educativos.</p></div>"
        '<p class="exe-download-package-link"><a download="exe-package:elp-name" href="exe-package:elp" '
        'style="background-color:#4e9a06;color:#000000;">Descargar el archivo .elpx</a></p>'
    )
    return vista, None


CONSTRUCTORES = {
    "text": idevice_texto,
    "scrambled-list": idevice_ordenar,
    "form": idevice_test,
    "download-source-file": idevice_descarga,
}


# ---------- content.xml ----------

def componente(pagina_id, bloque_id, caja):
    ident = nuevo_id()
    vista, datos = CONSTRUCTORES[caja["tipo"]](caja, ident)
    json_datos = json.dumps(datos, ensure_ascii=False) if datos is not None else ""
    return "\n".join([
        "        <odeComponent>",
        f"          <odePageId>{pagina_id}</odePageId>",
        f"          <odeBlockId>{bloque_id}</odeBlockId>",
        f"          <odeIdeviceId>{ident}</odeIdeviceId>",
        f"          <odeIdeviceTypeName>{caja['tipo']}</odeIdeviceTypeName>",
        f"          <htmlView>{cdata(vista)}</htmlView>",
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
        f"      <iconName>{caja['icono']}</iconName>",
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


def escribir_content_xml():
    recorrido = list(paginas_en_orden(ejemplo.PAGINAS))
    for numero, (pagina, _, _) in enumerate(recorrido, 1):
        pagina["id"] = f"page-consola-{numero:02d}"
    estructuras = []
    for pagina, madre, orden in recorrido:
        padre = madre["id"] if madre else ""
        titulo = escape(pagina["titulo"])
        pares = [("titlePage", pagina["titulo"]), ("visibility", "true"), ("highlight", "false"),
                 ("hidePageTitle", "false"), ("editableInPage", "false"), ("titleNode", pagina["titulo"]),
                 ("titleHtml", ""), ("description", "")]
        bloques = [bloque(pagina["id"], caja, i + 1) for i, caja in enumerate(pagina["cajas"])]
        estructuras.append("\n".join([
            "<odeNavStructure>",
            f"  <odePageId>{pagina['id']}</odePageId>",
            f"  <odeParentPageId>{padre}</odeParentPageId>",
            f"  <pageName>{titulo}</pageName>",
            f"  <odeNavStructureOrder>{orden}</odeNavStructureOrder>",
            propiedades("odeNavStructureProperty", pares, 2),
            "  <odePagStructures>",
            *bloques,
            "  </odePagStructures>",
            "</odeNavStructure>",
        ]))
    preferencias = propiedades("userPreference", [("theme", "consola")], 0)
    recursos = propiedades("odeResource", [("odeId", "20261014120000CONSOL"),
                                           ("odeVersionId", "20261014120000VERSN1"), ("exe_version", "")], 0)
    metadatos = propiedades("odeProperty", [
        ("pp_title", ejemplo.TITULO), ("pp_author", ejemplo.AUTORIA), ("pp_description", ejemplo.DESCRIPCION),
        ("pp_lang", "es"), ("pp_license", ejemplo.LICENCIA), ("pp_licenseUrl", ejemplo.LICENCIA_URL),
        ("pp_theme", "consola"), ("pp_modified", FECHA), ("pp_addExeLink", "true"),
        ("pp_addPagination", "true"), ("pp_addSearchBox", "true"), ("pp_addAccessibilityToolbar", "false"),
        ("pp_addMathJax", "false"), ("exportSource", "true"), ("pp_globalFont", "default"),
    ], 0)
    xml = "\n".join([
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!DOCTYPE ode SYSTEM "content.dtd">',
        '<ode xmlns="http://www.intef.es/xsd/ode" version="2.0">',
        preferencias, recursos, metadatos,
        "<odeNavStructures>", *estructuras, "</odeNavStructures>",
        "</ode>", "",
    ])
    (RAIZ / "content.xml").write_text(xml)
    print(f"content.xml: {len(recorrido)} páginas")


# ---------- Exportación con eXeLearning ----------

COPIAR = ("index.html", "html", "search_index.js", "libs", "idevices", "content", "content.dtd")


def exportar(exelearning):
    with tempfile.TemporaryDirectory() as temporal:
        temporal = Path(temporal)
        entrada = temporal / "entrada.elpx"
        with zipfile.ZipFile(entrada, "w", zipfile.ZIP_DEFLATED) as paquete:
            paquete.write(RAIZ / "content.xml", "content.xml")
            paquete.write(RAIZ / "scripts/plantillas/content.dtd", "content.dtd")
            for archivo in sorted((RAIZ / "theme").rglob("*")):
                if archivo.is_file():
                    paquete.write(archivo, "theme/" + archivo.relative_to(RAIZ / "theme").as_posix())
        salida = temporal / "salida.elpx"
        bun = shutil.which("bun") or str(Path.home() / ".bun/bin/bun")
        # Desde su propia carpeta, para que encuentre public/ con las bibliotecas y los iDevices.
        subprocess.run([bun, "dist/cli.js", "elp:export", str(entrada), str(salida), "elpx"],
                       cwd=exelearning, check=True, env=dict(os.environ, PUBLIC_DIR="public"))
        extraido = temporal / "extraido"
        with zipfile.ZipFile(salida) as paquete:
            paquete.extractall(extraido)
        for nombre in COPIAR:
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
        # El content.xml exportado lleva la captura en base64: se conserva el nuestro.
        print("Exportado con eXeLearning:", ", ".join(sorted(p.name for p in extraido.iterdir())))


# ---------- MathML para los lectores de pantalla ----------

FORMULA = re.compile(r'<span class="exe-math-rendered" data-latex="([^"]*)"( data-display="block")?>(<svg\b[\s\S]*?</svg>)</span>')
DATOS_JSON = re.compile(r'data-idevice-json-data="([^"]*)"')


def completar_mathml(exelearning):
    """Añade a cada fórmula dibujada su MathML y oculta el SVG a los lectores de pantalla.

    Es lo que hace la exportación de eXeLearning desde el navegador; la de la línea
    de órdenes deja solo el SVG, sin texto alternativo.
    """
    paginas = [RAIZ / "index.html", *sorted((RAIZ / "html").glob("*.html"))]
    pendientes = {}

    def recoger(texto):
        for latex, bloque, _ in FORMULA.findall(texto):
            pendientes.setdefault((html.unescape(latex), bool(bloque)), None)

    def datos_de(codigo):
        return [json.loads(html.unescape(valor)) for valor in DATOS_JSON.findall(codigo)]

    def cadenas(valor):
        if isinstance(valor, str):
            yield valor
        elif isinstance(valor, list):
            for elemento in valor:
                yield from cadenas(elemento)
        elif isinstance(valor, dict):
            for elemento in valor.values():
                yield from cadenas(elemento)

    for pagina in paginas:
        codigo = pagina.read_text()
        recoger(codigo)
        for datos in datos_de(codigo):
            for cadena in cadenas(datos):
                recoger(cadena)
    if not pendientes:
        return
    claves = list(pendientes)
    peticion = [{"latex": re.sub(r"^\\[(\[]|\\[)\]]$", "", latex.strip()).strip(), "display": bloque}
                for latex, bloque in claves]
    salida = subprocess.run(["node", str(RAIZ / "scripts/mathml.cjs")], input=json.dumps(peticion),
                            capture_output=True, text=True, check=True,
                            env=dict(os.environ, NODE_PATH=str(Path(exelearning) / "node_modules")))
    mathml = dict(zip(claves, json.loads(salida.stdout)))

    def sustituir(coincidencia):
        latex, bloque, svg = coincidencia.groups()
        svg = svg.replace("<svg ", '<svg aria-hidden="true" ', 1)
        return (f'<span class="exe-math-rendered" data-latex="{latex}"{bloque or ""}>'
                f'{svg}{mathml[(html.unescape(latex), bool(bloque))]}</span>')

    def tratar(valor):
        if isinstance(valor, str):
            return FORMULA.sub(sustituir, valor)
        if isinstance(valor, list):
            return [tratar(elemento) for elemento in valor]
        if isinstance(valor, dict):
            return {clave: tratar(elemento) for clave, elemento in valor.items()}
        return valor

    def tratar_atributo(coincidencia):
        datos = tratar(json.loads(html.unescape(coincidencia.group(1))))
        return 'data-idevice-json-data="' + html.escape(json.dumps(datos, ensure_ascii=False), quote=True) + '"'

    for pagina in paginas:
        codigo = DATOS_JSON.sub(tratar_atributo, pagina.read_text())
        pagina.write_text(FORMULA.sub(sustituir, codigo))
    print(f"MathML añadido a {len(claves)} fórmulas distintas")


if __name__ == "__main__":
    escribir_content_xml()
    if len(sys.argv) > 1:
        exportar(Path(sys.argv[1]).resolve())
        completar_mathml(Path(sys.argv[1]).resolve())
