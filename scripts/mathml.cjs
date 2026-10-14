// SPDX-License-Identifier: AGPL-3.0-or-later
// Convierte fórmulas LaTeX en MathML con el MathJax de eXeLearning (mathjax-full 3).
// Entrada por stdin: [{"latex": "x^2", "display": false}, …]. Salida: la lista de MathML.
// Lo usa construir_ejemplo.py: la exportación por línea de órdenes dibuja las fórmulas en
// SVG pero no añade el MathML que leen los lectores de pantalla (ver docs/adr/0004).
const { mathjax } = require('mathjax-full/js/mathjax.js');
const { TeX } = require('mathjax-full/js/input/tex.js');
const { AllPackages } = require('mathjax-full/js/input/tex/AllPackages.js');
const { SerializedMmlVisitor } = require('mathjax-full/js/core/MmlTree/SerializedMmlVisitor.js');
const { liteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor.js');
const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js');
const { STATE } = require('mathjax-full/js/core/MathItem.js');

RegisterHTMLHandler(liteAdaptor());
// bussproofs necesita una salida que mida cajas; para MathML no hace falta.
const paquetes = AllPackages.filter(paquete => paquete !== 'bussproofs');
const documento = mathjax.document('', { InputJax: new TeX({ packages: paquetes }) });
const serializador = new SerializedMmlVisitor();

let entrada = '';
process.stdin.on('data', trozo => { entrada += trozo; });
process.stdin.on('end', () => {
    const formulas = JSON.parse(entrada);
    const salida = formulas.map(({ latex, display }) => {
        const nodo = documento.convert(latex, { display, end: STATE.CONVERT });
        return serializador.visitTree(nodo, documento).replace(/\n\s*/g, '');
    });
    process.stdout.write(JSON.stringify(salida));
});
