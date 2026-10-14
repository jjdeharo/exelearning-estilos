// SPDX-License-Identifier: AGPL-3.0-or-later
// Recorre el ejemplo publicado en un navegador y comprueba el estilo Android y las actividades.
//   NODE_PATH=$(npm root -g) node android/scripts/comprobar-navegador.cjs [url] [navegador]
// Con CAPTURA=theme/screenshot.png,screenshot.png,captura.png guarda además la miniatura
// del estilo (1200 × 700), con el móvil en horizontal.
const assert = require('node:assert/strict');
const playwright = require('playwright');

const base = process.argv[2] || 'http://localhost:1315/';
const motor = playwright[process.argv[3] || 'chromium'];
const PAGINAS = 13;

// Respuestas correctas del test: verdadero/falso con «1» o «0»; en las de elegir, el orden de la opción.
const TEST = [['1'], [0], [0], [0], ['0'], [0], [1], [0], [0, 2], ['1']];

(async () => {
    const navegador = await motor.launch();
    const contexto = await navegador.newContext({ viewport: { width: 1366, height: 800 } });
    const pagina = await contexto.newPage();
    const errores = [];
    pagina.on('pageerror', error => errores.push(error.message));
    pagina.on('response', respuesta => {
        if (respuesta.status() >= 400 && respuesta.url().startsWith(base)) errores.push(`${respuesta.status()} ${respuesta.url()}`);
    });
    const lista = () => pagina.waitForFunction(() => document.body.classList.contains('and-lista')
        && [...document.querySelectorAll('.idevice_node[data-idevice-component-type="json"]')].every(nodo => nodo.classList.contains('loaded')));
    const abrir = async url => { await pagina.goto(url); await lista(); };
    const pulsar = async selector => {
        const antes = pagina.url();
        await pagina.locator(selector).click();
        await pagina.waitForURL(url => url.href !== antes);
        await lista();
    };
    try {
        // La aplicación dentro del móvil dibujado.
        await abrir(new URL('index.html', base).href);
        const urls = await pagina.locator('#siteNav a').evaluateAll(enlaces => enlaces.map(enlace => enlace.href));
        assert.equal(urls.length, PAGINAS, 'Todas las páginas en el índice');
        assert.equal(await pagina.locator('.and-movil').evaluate(movil => getComputedStyle(movil).display), 'block', 'En el ordenador se dibuja el móvil');
        assert.equal(await pagina.locator('.and-estado').isVisible(), true, 'Barra de estado');
        assert.match(await pagina.locator('.and-hora').innerText(), /^\d\d:\d\d$/);
        assert.equal(await pagina.locator('.and-barra .package-title').innerText(), 'Ecuaciones de segundo grado');
        assert.equal(await pagina.locator('.and-anterior').getAttribute('aria-disabled'), 'true', 'Nada antes de la primera página');
        assert.equal(await pagina.locator('.and-inicio').getAttribute('aria-disabled'), 'true', 'Ya se está en el inicio');
        assert.match(await pagina.locator('.page-header .page-counter').innerText(), /1\s*\/\s*13/);

        // Todo el recurso con «Siguiente», y vuelta atrás con «Anterior».
        const visitadas = [pagina.url()];
        while (await pagina.locator('a.and-siguiente').count() && visitadas.length < 20) {
            await pulsar('a.and-siguiente');
            visitadas.push(pagina.url());
            // MathJax de eXeLearning: al terminar no queda LaTeX a la vista.
            await pagina.waitForFunction(() => !/\\\(|\\\[/.test(document.querySelector('main.page').innerText), null, { timeout: 15000 })
                .catch(() => { throw new Error(`LaTeX sin dibujar en ${pagina.url()}`); });
        }
        assert.deepEqual(visitadas, urls, '«Siguiente» recorre todas las páginas en orden');
        assert.equal(await pagina.locator('.and-siguiente').getAttribute('aria-disabled'), 'true', 'Nada después de la última');
        await pulsar('a.and-anterior');
        assert.equal(pagina.url(), urls.at(-2), '«Anterior» vuelve atrás');
        await pulsar('a.and-inicio');
        assert.equal(pagina.url(), urls[0], '«Inicio» lleva a la primera página');

        // El índice en su cajón: se abre con el menú o con «Índice» y se cierra con Escape o el velo.
        await abrir(urls[3]);
        assert.equal(await pagina.locator('.and-cajon').isVisible(), false, 'Cajón cerrado');
        await pagina.locator('.and-menu').click();
        await pagina.locator('.and-cajon #siteNav a.active').waitFor({ state: 'visible' });
        assert.equal(await pagina.evaluate(() => document.activeElement.classList.contains('active')), true, 'El foco va a la página abierta');
        assert.equal(await pagina.locator('.and-menu').getAttribute('aria-expanded'), 'true');
        await pagina.keyboard.press('Escape');
        await pagina.locator('.and-cajon').waitFor({ state: 'hidden' });
        assert.equal(await pagina.evaluate(() => document.activeElement.classList.contains('and-menu')), true, 'El foco vuelve al menú');
        await pagina.locator('.and-ver-indice').click();
        await pagina.locator('.and-cajon #siteNav a.active').waitFor({ state: 'visible' });
        await pagina.locator('.and-velo').click({ position: { x: 300, y: 300 } });
        await pagina.locator('.and-cajon').waitFor({ state: 'hidden' });
        await pagina.locator('.and-menu').click();
        await pagina.locator('.and-cajon #siteNav a').last().click();
        await pagina.waitForURL(urls.at(-1));
        await lista();

        // La búsqueda.
        await pagina.locator('.and-buscar').click();
        await pagina.locator('#exe-client-search-text').fill('discriminante');
        await pagina.locator('#exe-client-search-text').press('Enter');
        assert.ok(await pagina.locator('#exe-client-search-results-list li').count() > 0, 'La búsqueda encuentra resultados');

        // Girar el móvil: cambia la orientación y se recuerda.
        const vertical = await pagina.locator('.and-movil').boundingBox();
        assert.ok(vertical.height > vertical.width, 'Empieza en vertical');
        await pagina.locator('.and-girar').click();
        await pagina.waitForFunction(() => document.documentElement.classList.contains('and-horizontal'));
        await pagina.waitForTimeout(500);
        const horizontal = await pagina.locator('.and-movil').boundingBox();
        assert.ok(horizontal.width > horizontal.height, 'Girado, queda en horizontal');
        await abrir(urls[2]);
        assert.equal(await pagina.evaluate(() => document.documentElement.classList.contains('and-horizontal')), true, 'La orientación se recuerda');
        await pagina.locator('.and-girar').click();
        await pagina.waitForFunction(() => !document.documentElement.classList.contains('and-horizontal'));

        // «Ver solución» despliega la resolución y cambia de rótulo.
        await abrir(urls.find(url => url.endsWith('ejercicios-resueltos.html')));
        const boton = pagina.locator('.feedbacktooglebutton').first();
        assert.equal(await boton.inputValue(), 'Ver solución');
        await boton.click();
        await pagina.locator('.feedback.js-feedback').first().waitFor({ state: 'visible' });
        assert.equal(await boton.inputValue(), 'Ocultar solución');

        // Ordenar los pasos.
        await abrir(urls.find(url => url.endsWith('ordena-los-pasos.html')));
        const total = await pagina.locator('.exe-sortableList-options > li').count();
        const correctas = await pagina.locator('.scrambled-list').evaluate(nodo => JSON.parse(nodo.dataset.ideviceJsonData).options
            .map(opcion => { const caja = document.createElement('div'); caja.innerHTML = opcion; return caja.textContent.trim().slice(0, 18); }));
        for (let i = 0; i < total; i++) {
            for (let intentos = 0; intentos < total; intentos++) {
                const textos = await pagina.locator('.exe-sortableList-options > li').evaluateAll(elementos => elementos.map(elemento => {
                    const copia = elemento.cloneNode(true);
                    copia.querySelectorAll('mjx-container').forEach(formula => formula.remove());
                    return copia.textContent.trim();
                }));
                const indice = textos.findIndex(texto => correctas[i].startsWith(texto.slice(0, 10)));
                if (indice === i || indice < 0) break;
                await pagina.locator('.exe-sortableList-options > li').nth(indice).locator('a.up').click();
            }
        }
        await pagina.locator('input[class*="exe-sortableList-check-"]').click();
        assert.match(await pagina.locator('[id$="-feedback"]').innerText(), /Correcto/i, 'Ordenar los pasos se puede completar');

        // El test, con todas las respuestas correctas.
        await abrir(urls.find(url => url.endsWith('test.html')));
        const preguntas = pagina.locator('.FormView_question');
        assert.equal(await preguntas.count(), TEST.length);
        for (const [indice, respuesta] of TEST.entries()) {
            const pregunta = preguntas.nth(indice);
            if (await pregunta.getAttribute('activity-type') === 'true-false') {
                await pregunta.locator(`input[value="${respuesta[0]}"]`).check();
            } else {
                for (const opcion of respuesta) await pregunta.locator('input[type=radio], input[type=checkbox]').nth(opcion).check();
            }
        }
        await pagina.locator('[id^="form-button-check-"]').click();
        await pagina.locator('[id^="form-result-test-"]').filter({ hasText: /pasado la prueba/ }).waitFor();
        assert.match(await pagina.locator('[id^="form-score-"]').innerText(), /10\/10/, 'El test reconoce todas las respuestas');

        // Miniatura del estilo: el móvil en horizontal, en una pantalla de 1440 × 840 dibujada a 1200 × 700.
        if (process.env.CAPTURA) {
            const captura = await navegador.newPage({ viewport: { width: 1440, height: 840 }, deviceScaleFactor: 1200 / 1440 });
            await captura.addInitScript(() => localStorage.setItem('exe-estilo-android-orientacion', 'horizontal'));
            await captura.goto(urls.find(url => url.endsWith('la-formula-general.html')));
            await captura.waitForFunction(() => document.body.classList.contains('and-lista'));
            await captura.waitForTimeout(2500);
            await captura.evaluate(() => document.fonts.ready);
            for (const ruta of process.env.CAPTURA.split(',')) await captura.screenshot({ path: ruta });
            await captura.close();
        }

        // Móvil de verdad: sin marco, a toda pantalla, y nada más ancho que la pantalla.
        for (const ancho of [412, 360, 320]) {
            await pagina.setViewportSize({ width: ancho, height: 800 });
            for (const url of urls) {
                await abrir(url);
                await pagina.waitForTimeout(300);
                assert.equal(await pagina.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Cabe en ${ancho} px: ${url}`);
            }
            assert.equal(await pagina.locator('.and-movil').evaluate(movil => getComputedStyle(movil).display), 'contents', `Sin marco a ${ancho} px`);
            assert.equal(await pagina.locator('.and-girar').isVisible(), false, 'Sin botón de girar en un móvil de verdad');
            await pagina.locator('.and-ver-indice').click();
            await pagina.locator('.and-cajon #siteNav a.active').waitFor({ state: 'visible' });
            await pagina.keyboard.press('Escape');
            await pagina.locator('.and-cajon').waitFor({ state: 'hidden' });
        }
        // Un móvil en horizontal.
        await pagina.setViewportSize({ width: 800, height: 360 });
        await abrir(urls[6]);
        assert.equal(await pagina.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Cabe en un móvil en horizontal');
        assert.equal(await pagina.locator('.and-movil').evaluate(movil => getComputedStyle(movil).display), 'contents', 'Sin marco en un móvil en horizontal');
        assert.deepEqual(errores, [], errores.join('\n'));
        console.log(`CORRECTO (${process.argv[3] || 'chromium'}): ${urls.length} páginas, móvil dibujado, barra de navegación, índice, búsqueda, giro, soluciones, ordenar, test, MathJax y móvil de 412, 360 y 320 px.`);
    } finally {
        await navegador.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
