// SPDX-License-Identifier: AGPL-3.0-or-later
// Abre un proyecto en el editor de eXeLearning, entra en la edición de cada iDevice y lo
// guarda, y descarga el proyecto: así el HTML y los datos de cada iDevice los genera su
// propio editor, como si los hubiera guardado una persona.
//   NODE_PATH=$(npm root -g) node scripts/normalizar.cjs URL_DEL_EDITOR entrada.elpx salida.elpx
const { chromium } = require('playwright');

const [url, entrada, salida] = process.argv.slice(2);
const ESPERA = 60000;

(async () => {
    const navegador = await chromium.launch();
    const contexto = await navegador.newContext({ acceptDownloads: true, viewport: { width: 1400, height: 900 } });
    const pagina = await contexto.newPage();
    const errores = [];
    pagina.on('pageerror', error => errores.push(error.message));
    try {
        await pagina.goto(url, { timeout: ESPERA });
        await pagina.getByText('Archivo', { exact: true }).first().waitFor({ timeout: ESPERA });
        await pagina.waitForTimeout(3000);

        // Archivo > Abrir.
        await pagina.getByText('Archivo', { exact: true }).first().click();
        const [selector] = await Promise.all([
            pagina.waitForEvent('filechooser', { timeout: ESPERA }),
            pagina.locator('#navbar-button-open-offline, #navbar-button-openuserodefiles').filter({ visible: true }).first().click(),
        ]);
        await selector.setFiles(entrada);
        // El proyecto lleva su estilo: eXeLearning pregunta si se instala.
        const confirmar = pagina.locator('#modalConfirm.show');
        await confirmar.waitFor({ timeout: ESPERA });
        await confirmar.getByRole('button', { name: 'Sí' }).click();
        await pagina.waitForTimeout(4000);

        // Cada página del árbol, en orden; dentro, cada iDevice: Editar y Guardar.
        const paginas = pagina.locator('#nav_list .nav-element:not([nav-id="root"]) > .nav-element-text .node-text-span');
        const total = await paginas.count();
        if (!total) throw new Error('No se ven las páginas del proyecto');
        let guardados = 0;
        for (let i = 0; i < total; i++) {
            const titulo = (await paginas.nth(i).innerText()).trim();
            await paginas.nth(i).click();
            await pagina.waitForTimeout(1500);
            const ids = await pagina.locator('#node-content .idevice_node').evaluateAll(nodos => nodos.map(nodo => nodo.id));
            for (const id of ids) {
                await pagina.locator(`#editIdevice${id}`).click();
                const guardar = pagina.locator(`#saveIdevice${id}`);
                await guardar.waitFor({ state: 'visible', timeout: ESPERA });
                // El editor de texto enriquecido tarda un poco en cargar lo guardado.
                await pagina.waitForTimeout(2500);
                await guardar.click();
                await pagina.waitForFunction(idDevice => {
                    const nodo = document.getElementById(idDevice);
                    return nodo && nodo.getAttribute('mode') === 'export' && nodo.getAttribute('loading') !== 'true';
                }, id, { timeout: ESPERA });
                const aviso = await pagina.locator('.modal.show').count();
                if (aviso) throw new Error(`Aviso al guardar un iDevice de «${titulo}»: ${await pagina.locator('.modal.show').first().innerText()}`);
                guardados++;
            }
            console.log(`${titulo}: ${ids.length} iDevices guardados`);
        }

        // Archivo > Descargar: el .elpx tal como lo guarda eXeLearning.
        await pagina.getByText('Archivo', { exact: true }).first().click();
        const [descarga] = await Promise.all([
            pagina.waitForEvent('download', { timeout: ESPERA }),
            pagina.locator('#navbar-button-save-offline, #navbar-button-download-project').filter({ visible: true }).first().click(),
        ]);
        await descarga.saveAs(salida);
        if (errores.length) console.warn('Errores de la página:\n' + errores.join('\n'));
        console.log(`Editor de eXeLearning: ${total} páginas y ${guardados} iDevices guardados; proyecto descargado.`);
    } finally {
        await navegador.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
