// SPDX-License-Identifier: AGPL-3.0-or-later
// Revisa la accesibilidad de cada página del ejemplo con axe-core (WCAG 2.1 A y AA).
//   NODE_PATH=$(npm root -g) node scripts/accesibilidad.cjs [url]
const { chromium } = require('playwright');
const axe = require.resolve('axe-core/axe.min.js');
const base = process.argv[2] || 'http://localhost:1315/';

(async () => {
    const navegador = await chromium.launch();
    const pagina = await navegador.newPage({ viewport: { width: 1280, height: 800 } });
    await pagina.goto(new URL('index.html', base).href);
    const urls = await pagina.locator('#siteNav a').evaluateAll(enlaces => enlaces.map(enlace => enlace.href));
    let fallos = 0;
    for (const ancho of [1280, 390]) {
        await pagina.setViewportSize({ width: ancho, height: 800 });
        for (const url of urls) {
            await pagina.goto(url);
            await pagina.waitForFunction(() => document.body.classList.contains('cli-lista'));
            await pagina.addScriptTag({ path: axe });
            const resultado = await pagina.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }));
            for (const problema of resultado.violations) {
                fallos++;
                console.log(`${ancho}px ${url.split('/').pop()}: ${problema.id} (${problema.impact}) ${problema.help}`);
                for (const nodo of problema.nodes.slice(0, 3)) console.log('   ', nodo.target.join(' '), nodo.failureSummary.split('\n')[1] || '');
            }
        }
    }
    await navegador.close();
    console.log(fallos ? `${fallos} problemas de accesibilidad` : `CORRECTO: ${urls.length} páginas sin problemas de axe-core a 1280 y 390 px`);
    process.exitCode = fallos ? 1 : 0;
})();
