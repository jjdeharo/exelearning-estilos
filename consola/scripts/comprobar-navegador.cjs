// SPDX-License-Identifier: AGPL-3.0-or-later
// Recorre el ejemplo publicado en un navegador y comprueba el estilo y las actividades.
// Usa el Playwright instalado de forma global o el de eXeLearning:
//   NODE_PATH=$(npm root -g) node scripts/comprobar-navegador.cjs [url] [navegador]
// Con CAPTURA=theme/screenshot.png,screenshot.png,captura.png guarda además
// la miniatura del estilo (1200 × 700).
const assert = require('node:assert/strict');
const playwright = require('playwright');

const base = process.argv[2] || 'http://localhost:1315/';
const motor = playwright[process.argv[3] || 'chromium'];
const PAGINAS = 13;

// Respuestas correctas del test: verdadero/falso con «1» o «0»; en las de elegir, el orden de la opción.
const TEST = [['1'], [0], [0], [0], ['0'], [0], [1], [0], [0, 2], ['1']];

(async () => {
    const navegador = await motor.launch();
    const pagina = await navegador.newPage({ viewport: { width: 1280, height: 800 } });
    const errores = [];
    pagina.on('pageerror', error => errores.push(error.message));
    pagina.on('response', respuesta => {
        if (respuesta.status() >= 400 && respuesta.url().startsWith(base)) {
            errores.push(`${respuesta.status()} ${respuesta.url()}`);
        }
    });
    const lista = () => pagina.waitForFunction(() => document.body.classList.contains('cli-lista')
        && [...document.querySelectorAll('.idevice_node[data-idevice-component-type="json"]')].every(nodo => nodo.classList.contains('loaded')));
    const abrir = async url => { await pagina.goto(url); await lista(); };
    const pulsar = async selector => {
        const antes = pagina.url();
        await pagina.locator(selector).click();
        await pagina.waitForURL(url => url.href !== antes);
        await lista();
    };
    try {
        // La ventana: título, árbol, prompt y barra de estado.
        await abrir(new URL('index.html', base).href);
        const urls = await pagina.locator('#siteNav a').evaluateAll(enlaces => enlaces.map(enlace => enlace.href));
        assert.equal(urls.length, PAGINAS, 'Todas las páginas en el árbol');
        assert.equal(await pagina.locator('.cli-titulo .package-title').innerText(), 'Ecuaciones de segundo grado');
        const ramas = await pagina.locator('#siteNav .cli-rama').allTextContents();
        assert.equal(ramas[0], '├── ', 'Rama de la primera página');
        assert.equal(ramas.at(-1), '└── ', 'Rama de la última');
        assert.equal(ramas[3], '│   ├── ', 'Rama de una subpágina');
        assert.equal(await pagina.locator('.page-header .cli-prompt').innerText(), 'aula@exe:~/ecuaciones-de-segundo-grado$ cat inicio.md');
        assert.equal(await pagina.locator('.cli-anterior').getAttribute('aria-disabled'), 'true', 'Nada antes de la primera página');
        assert.match(await pagina.locator('.cli-barra .page-counter').innerText(), /1\s*\/\s*13/);

        // Todo el recurso con «Siguiente», y vuelta atrás con «Anterior».
        const visitadas = [pagina.url()];
        while (await pagina.locator('a.cli-siguiente').count() && visitadas.length < 20) {
            await pulsar('a.cli-siguiente');
            visitadas.push(pagina.url());
            // MathJax de eXeLearning: al terminar no queda LaTeX a la vista.
            await pagina.waitForFunction(() => !/\\\(|\\\[/.test(document.querySelector('main.page').innerText), null, { timeout: 15000 })
                .catch(() => { throw new Error(`LaTeX sin dibujar en ${pagina.url()}`); });
        }
        assert.deepEqual(visitadas, urls, '«Siguiente» recorre todas las páginas en orden');
        assert.equal(await pagina.locator('.cli-siguiente').getAttribute('aria-disabled'), 'true', 'Nada después de la última');
        await pulsar('a.cli-anterior');
        assert.equal(pagina.url(), urls.at(-2), '«Anterior» vuelve atrás');

        // La ruta del prompt sigue el árbol.
        await abrir(urls[3]);
        assert.equal(await pagina.locator('.page-header .cli-prompt').innerText(), 'aula@exe:~/ecuaciones-de-segundo-grado/ecuaciones-incompletas$ cat sin-termino-en-x.md', 'Una página sin subpáginas es un archivo de la carpeta de su madre');
        assert.equal(await pagina.locator('.box.cli-fail .box-title').evaluate(titulo => getComputedStyle(titulo, '::before').content), '"[FAILED] "', 'Etiqueta de systemd');

        // La terminal: help, ls, errores, tabulador, cd y grep.
        await abrir(urls.find(url => url.endsWith('ecuaciones-completas.html')));
        assert.equal(await pagina.locator('.page-header .cli-prompt').innerText(), 'aula@exe:~/ecuaciones-de-segundo-grado/ecuaciones-completas$ cat README.md', 'Una página con subpáginas es una carpeta');
        const campo = pagina.locator('.cli-campo');
        const orden = async texto => { await campo.fill(texto); await campo.press('Enter'); };
        await orden('help');
        assert.match(await pagina.locator('.cli-salida').innerText(), /grep PALABRA/);
        await orden('ls');
        assert.deepEqual(await pagina.locator('.cli-ls a').allTextContents(), ['README.md', 'la-formula-general.md', 'el-discriminante.md']);
        await orden('vim');
        assert.match(await pagina.locator('.cli-error').last().innerText(), /vim: orden no encontrada/);
        await orden('cd nada');
        assert.match(await pagina.locator('.cli-error').last().innerText(), /No existe el archivo o el directorio/);
        await campo.fill('cd el-d');
        await campo.press('Tab');
        assert.equal(await campo.inputValue(), 'cd el-discriminante.md', 'El tabulador completa la página');
        await campo.fill('');
        await campo.press('Tab');
        assert.equal(await pagina.evaluate(() => document.activeElement.classList.contains('cli-campo')), false, 'Con la línea vacía, el tabulador pasa al siguiente control');
        // plot, calc, la ayuda de cada orden, el historial y clear.
        await orden('plot [-2:4] x^2-2x-3');
        assert.match(await pagina.locator('.cli-grafica').last().innerText(), /\*/, 'plot dibuja la curva');
        assert.equal(await pagina.locator('.cli-grafica .cli-corte').count(), 2, 'plot marca los dos cortes');
        assert.equal(await pagina.locator('.cli-comentario').last().innerText(), '# corta el eje X en x = -1 y x = 3');
        await orden('plot [-3:3] x^3-2x');
        assert.equal(await pagina.locator('.cli-comentario').last().innerText(), '# corta el eje X en x ≈ -1.414, x = 0 y x ≈ 1.414');
        await orden('calc 3^2-2*3-3');
        assert.equal(await pagina.locator('.cli-salida-linea').last().innerText(), '0');
        await orden('calc 2*(1+0.5)^2');
        assert.equal(await pagina.locator('.cli-salida-linea').last().innerText(), '4.5');
        await orden('calc sqrt(-4)');
        assert.match(await pagina.locator('.cli-error').last().innerText(), /no es un número real/);
        await orden('calc 2 $ 3');
        assert.match(await pagina.locator('.cli-error').last().innerText(), /no se entiende «\$»/);
        await orden('plot --help');
        assert.match(await pagina.locator('.cli-salida').innerText(), /Uso: plot \[INTERVALO\] FUNCIÓN/);
        await orden('help calc');
        assert.match(await pagina.locator('.cli-salida').innerText(), /Uso: calc EXPRESIÓN/);
        await campo.press('ArrowUp');
        assert.equal(await campo.inputValue(), 'help calc', '↑ recupera la orden anterior');
        await campo.press('ArrowUp');
        assert.equal(await campo.inputValue(), 'plot --help');
        await campo.press('ArrowDown');
        await campo.press('ArrowDown');
        assert.equal(await campo.inputValue(), '', '↓ vuelve a la línea vacía');
        await orden('clear');
        assert.equal(await pagina.locator('.cli-salida').innerText(), '', 'clear borra la terminal');
        await orden('grep discriminante');
        assert.equal(await pagina.locator('main .page-content').isVisible(), false, 'grep muestra los resultados del buscador');
        assert.ok(await pagina.locator('#exe-client-search-results-list li').count() > 0);
        await pagina.locator('.cli-volver').click();
        assert.equal(await pagina.locator('main .page-content').isVisible(), true, '«Volver a la página» la vuelve a mostrar');
        await Promise.all([pagina.waitForURL(urls.find(url => url.endsWith('el-discriminante.html'))), orden('cd el-discriminante')]);
        await lista();
        // Como en bash: desde un archivo de ecuaciones-completas/, «..» es la carpeta del recurso.
        await Promise.all([pagina.waitForURL(urls.find(url => url.endsWith('test.html'))), orden('cd ../actividades/test')]);
        await lista();
        await Promise.all([pagina.waitForURL(urls[0]), orden('cd ..')]);
        await lista();
        await Promise.all([pagina.waitForURL(urls.find(url => url.endsWith('ecuaciones-completas.html'))), orden('cd ecuaciones-completas')]);
        await lista();
        await Promise.all([pagina.waitForURL(urls[0]), orden('cd')]);
        await lista();

        // «Ver solución» despliega la resolución y cambia de rótulo.
        await abrir(urls.find(url => url.endsWith('ejercicios-resueltos.html')));
        const boton = pagina.locator('.feedbacktooglebutton').first();
        assert.equal(await boton.inputValue(), 'Ver solución');
        assert.equal(await pagina.locator('.feedback.js-feedback').first().isVisible(), false);
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
                const textos = await pagina.locator('.exe-sortableList-options > li').allTextContents();
                const indice = textos.findIndex(texto => texto.trim().startsWith(correctas[i]));
                if (indice === i) break;
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
        assert.equal(await pagina.locator('.form-feedback-correct').count(), TEST.length, 'Diez aciertos marcados');

        // Miniatura del estilo: una pantalla de 1440 × 840 dibujada a 1200 × 700.
        if (process.env.CAPTURA) {
            const captura = await navegador.newPage({ viewport: { width: 1440, height: 840 }, deviceScaleFactor: 1200 / 1440 });
            await captura.goto(urls.find(url => url.endsWith('la-formula-general.html')));
            await captura.waitForFunction(() => document.body.classList.contains('cli-lista'));
            await captura.evaluate(() => document.fonts.ready);
            await captura.evaluate(() => document.querySelector('.exe-open-exelearning')?.remove());
            await captura.addStyleTag({ content: '.cli-cursor { animation: none !important; }' });
            for (const ruta of process.env.CAPTURA.split(',')) await captura.screenshot({ path: ruta });
            await captura.close();
        }

        // Móvil: el índice se abre sobre la página y nada es más ancho que la pantalla.
        for (const ancho of [390, 320]) {
            await pagina.setViewportSize({ width: ancho, height: 800 });
            for (const url of urls) {
                await abrir(url);
                assert.equal(await pagina.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Cabe en ${ancho} px: ${url}`);
            }
            await abrir(urls[3]);
            assert.equal(await pagina.locator('.cli-arbol').isVisible(), false, `Índice cerrado a ${ancho} px`);
            await pagina.locator('.cli-indice').click();
            assert.equal(await pagina.locator('.cli-arbol').isVisible(), true, `«Índice» lo abre a ${ancho} px`);
            assert.equal(await pagina.locator('.cli-indice').getAttribute('aria-expanded'), 'true');
            await pagina.keyboard.press('Escape');
            assert.equal(await pagina.locator('.cli-arbol').isVisible(), false, 'Escape lo cierra');
            assert.equal(await pagina.evaluate(() => document.activeElement.classList.contains('cli-indice')), true, 'El foco vuelve al botón');
        }
        assert.deepEqual(errores, [], errores.join('\n'));
        console.log(`CORRECTO (${process.argv[3] || 'chromium'}): ${urls.length} páginas, árbol, prompt, barra de estado, terminal (plot, calc, clear, historial), soluciones, ordenar, test y móvil a 390 y 320 px.`);
    } finally {
        await navegador.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
