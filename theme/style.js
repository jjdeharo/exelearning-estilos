/*!
 * Consola — estilo de eXeLearning
 * Presenta el recurso como una terminal de Linux: barra de título, el índice
 * como la salida de «tree», cada página abierta desde su prompt y una barra de
 * estado como la de tmux para pasar de una página a otra.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Juan José de Haro (@jjdeharo), 2026.
 */
(function () {
    'use strict';

    var raiz = document.documentElement;
    // Antes del primer pintado, para que la página no aparezca un instante sin la terminal.
    raiz.classList.add('cli-js');

    // Nombre de usuario y de máquina del prompt: neutros, para cualquier recurso.
    var USUARIO = 'aula';
    var MAQUINA = 'exe';

    var TEXTOS = {
        es: { index: 'Índice', previous: 'Anterior', next: 'Siguiente', bar: 'Navegación' },
        ca: { index: 'Índex', previous: 'Anterior', next: 'Següent', bar: 'Navegació' },
        gl: { index: 'Índice', previous: 'Anterior', next: 'Seguinte', bar: 'Navegación' },
        eu: { index: 'Aurkibidea', previous: 'Aurrekoa', next: 'Hurrengoa', bar: 'Nabigazioa' },
        en: { index: 'Index', previous: 'Previous', next: 'Next', bar: 'Navigation' },
    };

    var idioma = (raiz.lang || 'es').slice(0, 2);
    var estrecha = window.matchMedia('(max-width: 59.99rem)');
    var piezas = {};

    // Primero las cadenas de eXeLearning, que ya vienen en el idioma del recurso.
    function texto(clave) {
        if (window.$exe_i18n && window.$exe_i18n[clave]) return window.$exe_i18n[clave];
        return (TEXTOS[idioma] || TEXTOS.en)[clave];
    }

    function crear(etiqueta, clase, contenido) {
        var nodo = document.createElement(etiqueta);
        if (clase) nodo.className = clase;
        if (contenido) nodo.textContent = contenido;
        return nodo;
    }

    // «Ecuaciones de segundo grado» → «ecuaciones-de-segundo-grado», como un nombre de carpeta.
    function nombreDeArchivo(titulo) {
        var nombre = titulo
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        return (nombre || 'pagina').slice(0, 40).replace(/-+$/, '');
    }

    /* ---------- Las páginas como un árbol de carpetas ---------- */

    // Recorre el índice de eXeLearning y anota, para cada página, su nivel y sus antecesoras.
    function leerArbol(nav) {
        var paginas = [];
        (function recorrer(ul, antecesoras) {
            if (!ul) return;
            var elementos = ul.children;
            for (var i = 0; i < elementos.length; i++) {
                var enlace = elementos[i].querySelector(':scope > a');
                if (!enlace) continue;
                var pagina = {
                    enlace: enlace,
                    titulo: enlace.textContent.trim(),
                    antecesoras: antecesoras,
                    ultima: i === elementos.length - 1,
                };
                pagina.nombre = nombreDeArchivo(pagina.titulo);
                paginas.push(pagina);
                recorrer(elementos[i].querySelector(':scope > ul'), antecesoras.concat(pagina));
            }
        })(nav.querySelector(':scope > ul'), []);
        return paginas;
    }

    // Ramas de «tree»: «│   » si la antecesora tiene hermanas detrás, «├── » o «└── » en la propia.
    function dibujarRamas(paginas) {
        paginas.forEach(function (pagina) {
            var rama = '';
            pagina.antecesoras.forEach(function (antecesora) {
                rama += antecesora.ultima ? '    ' : '│   ';
            });
            rama += pagina.ultima ? '└── ' : '├── ';
            var dibujo = crear('span', 'cli-rama', rama);
            dibujo.setAttribute('aria-hidden', 'true');
            var titulo = crear('span', 'cli-rama-titulo');
            while (pagina.enlace.firstChild) titulo.append(pagina.enlace.firstChild);
            pagina.enlace.append(dibujo, titulo);
        });
    }

    // Ruta de la carpeta en la que está la página: la del recurso más la de sus antecesoras.
    function ruta(carpeta, pagina) {
        var partes = ['~', carpeta];
        if (pagina) pagina.antecesoras.forEach(function (antecesora) {
            partes.push(antecesora.nombre);
        });
        return partes.join('/');
    }

    function prompt(rutaActual, orden) {
        var linea = crear('p', 'cli-prompt');
        linea.setAttribute('aria-hidden', 'true');
        linea.append(
            crear('span', 'cli-usuario', USUARIO + '@' + MAQUINA),
            crear('span', '', ':'),
            crear('span', 'cli-ruta', rutaActual),
            crear('span', '', '$ ')
        );
        if (orden) linea.append(crear('span', 'cli-orden', orden));
        return linea;
    }

    /* ---------- Las piezas de la ventana ---------- */

    function construirTitulo(pantalla, principal, carpeta) {
        var barra = crear('div', 'cli-titulo');
        var cabecera = principal.querySelector('.package-header');
        if (cabecera) barra.append(cabecera);
        else barra.append(crear('p', 'package-title', USUARIO + '@' + MAQUINA + ': ~/' + carpeta));
        pantalla.prepend(barra);
        piezas.titulo = barra;
    }

    function construirArbol(principal, nav, paginas, carpeta) {
        var arbol = crear('div', 'cli-arbol');
        arbol.id = 'cli-arbol';
        var cabecera = crear('h2', 'cli-arbol-titulo', texto('index'));
        arbol.append(prompt('~/' + carpeta, 'tree'), cabecera, nav);
        dibujarRamas(paginas);
        var buscador = document.getElementById('exe-client-search-form');
        if (buscador) {
            arbol.append(buscador);
            buscador.addEventListener('submit', function () {
                if (estrecha.matches) mostrarArbol(false);
            });
        }
        // Delante de la página, donde lo pone eXeLearning: el índice va primero al tabular.
        principal.before(arbol);
        piezas.arbol = arbol;
    }

    function construirPrompt(principal, actual, carpeta) {
        var titulo = principal.querySelector('.page-title');
        if (!titulo) return;
        var orden = 'cat ' + (actual ? actual.nombre : 'index') + '.md';
        titulo.before(prompt(ruta(carpeta, actual), orden));
        // Al final de la página, la terminal queda esperando la siguiente orden.
        var espera = prompt(ruta(carpeta, actual));
        espera.classList.add('cli-espera');
        espera.append(crear('span', 'cli-cursor'));
        var contenido = principal.querySelector('.page-content');
        if (contenido) contenido.after(espera);
    }

    function enlaceDeBarra(nodo, clase, rotulo) {
        if (nodo && nodo.href) {
            nodo.className = 'cli-tecla ' + clase;
            nodo.textContent = '';
            nodo.append(crear('span', 'cli-tecla-texto', rotulo));
            return nodo;
        }
        var apagado = crear('span', 'cli-tecla ' + clase);
        apagado.append(crear('span', 'cli-tecla-texto', rotulo));
        apagado.setAttribute('aria-disabled', 'true');
        return apagado;
    }

    function pad(numero) {
        return String(numero).padStart(2, '0');
    }

    function reloj() {
        var ahora = new Date();
        piezas.reloj.textContent = pad(ahora.getHours()) + ':' + pad(ahora.getMinutes());
    }

    // Barra de estado como la de tmux: sesión, anterior, índice, siguiente, página y hora.
    function construirBarra(pantalla, carpeta) {
        var barra = crear('nav', 'cli-barra');
        barra.setAttribute('aria-label', texto('bar'));
        var botones = document.querySelector('.nav-buttons');
        var anterior = botones && botones.querySelector('.nav-button-left');
        var siguiente = botones && botones.querySelector('.nav-button-right');

        var sesion = crear('span', 'cli-sesion', '[' + carpeta + ']');
        sesion.setAttribute('aria-hidden', 'true');

        piezas.anterior = enlaceDeBarra(anterior, 'cli-anterior', texto('previous'));
        piezas.siguiente = enlaceDeBarra(siguiente, 'cli-siguiente', texto('next'));

        piezas.indice = crear('button', 'cli-tecla cli-indice');
        piezas.indice.type = 'button';
        piezas.indice.append(crear('span', 'cli-tecla-texto', texto('index')));
        piezas.indice.setAttribute('aria-controls', 'cli-arbol');
        piezas.indice.setAttribute('aria-expanded', 'false');
        piezas.indice.addEventListener('click', function () {
            if (estrecha.matches) {
                mostrarArbol(!document.body.classList.contains('cli-arbol-abierto'));
                return;
            }
            var destino = piezas.arbol.querySelector('#siteNav a.active') || piezas.arbol.querySelector('a');
            if (destino) destino.focus();
        });

        var estado = crear('span', 'cli-estado');
        var contador = document.querySelector('.page-counter');
        if (contador) estado.append(contador);
        piezas.reloj = crear('span', 'cli-reloj');
        piezas.reloj.setAttribute('aria-hidden', 'true');
        estado.append(piezas.reloj);

        barra.append(sesion, piezas.anterior, piezas.indice, piezas.siguiente, estado);
        pantalla.append(barra);
        if (botones) botones.remove();
        reloj();
        setInterval(reloj, 15000);
    }

    function construirPie(pantalla) {
        var pie = crear('div', 'cli-pie');
        var licencia = document.getElementById('siteFooter');
        var hecho = document.getElementById('made-with-eXe');
        if (licencia) pie.append(licencia);
        if (hecho) pie.append(hecho);
        pantalla.append(pie);
    }

    /* ---------- El índice en el móvil ---------- */

    function mostrarArbol(abierto, devolverFoco) {
        document.body.classList.toggle('cli-arbol-abierto', abierto);
        piezas.indice.setAttribute('aria-expanded', abierto ? 'true' : 'false');
        piezas.arbol.inert = estrecha.matches && !abierto;
        if (abierto) {
            var destino = piezas.arbol.querySelector('#siteNav a.active') || piezas.arbol.querySelector('a, input');
            if (destino) destino.focus();
        } else if (devolverFoco) {
            piezas.indice.focus();
        }
    }

    function escuchar() {
        document.addEventListener('keydown', function (evento) {
            if (evento.key === 'Escape' && document.body.classList.contains('cli-arbol-abierto')) {
                mostrarArbol(false, true);
            }
        });
        document.addEventListener('click', function (evento) {
            if (!document.body.classList.contains('cli-arbol-abierto')) return;
            if (piezas.arbol.contains(evento.target) || piezas.indice.contains(evento.target)) return;
            mostrarArbol(false);
        });
        estrecha.addEventListener('change', function () {
            mostrarArbol(false);
        });
    }

    // Una tabla o un bloque de código más ancho que la pantalla se desplaza en horizontal:
    // con tabindex se puede desplazar también con el teclado.
    function marcarDesplazables() {
        var bloques = document.querySelectorAll('.exe-content table, .exe-content pre');
        for (var i = 0; i < bloques.length; i++) {
            var bloque = bloques[i];
            if (bloque.scrollWidth > bloque.clientWidth + 1) bloque.setAttribute('tabindex', '0');
            else if (bloque.getAttribute('tabindex') === '0') bloque.removeAttribute('tabindex');
        }
    }

    function iniciar() {
        marcarDesplazables();
        window.addEventListener('resize', marcarDesplazables);
        var pantalla = document.querySelector('.exe-web-site .exe-content');
        var principal = pantalla && pantalla.querySelector('main.page');
        var nav = document.getElementById('siteNav');
        // Solo en la exportación como sitio web y una sola vez; si no, la página se lee normal.
        if (!principal || !nav || document.querySelector('.cli-barra')) {
            raiz.classList.remove('cli-js');
            return;
        }
        var tituloRecurso = principal.querySelector('.package-title');
        var carpeta = nombreDeArchivo(tituloRecurso ? tituloRecurso.textContent : 'recurso');
        var paginas = leerArbol(nav);
        var activa = nav.querySelector('a.active');
        var actual = paginas.filter(function (pagina) {
            return pagina.enlace === activa;
        })[0] || null;

        construirTitulo(pantalla, principal, carpeta);
        construirArbol(principal, nav, paginas, carpeta);
        construirPrompt(principal, actual, carpeta);
        construirBarra(pantalla, carpeta);
        construirPie(pantalla);
        mostrarArbol(false);
        escuchar();
        document.body.classList.add('cli-lista');
    }

    // Después de los manejadores «ready» de eXeLearning, que crean el buscador.
    if (window.jQuery) window.jQuery(iniciar);
    else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();
})();
