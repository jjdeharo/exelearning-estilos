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

    // Mensajes de la terminal. %s se sustituye por el nombre o la palabra de la orden.
    var MENSAJES = {
        es: {
            entrada: 'Terminal: escribe una orden y pulsa Intro. Escribe help para ver las órdenes.',
            ayuda: ['Órdenes disponibles:',
                '  ls            lista las páginas de esta carpeta',
                '  cd PÁGINA     abre una página; «cd ..» sube un nivel y «cd» vuelve al inicio',
                '  grep PALABRA  busca una palabra en todo el recurso',
                '  help          muestra esta ayuda',
                'El tabulador completa el nombre de una orden o de una página.'],
            noOrden: 'bash: %s: orden no encontrada. Escribe help para ver las órdenes.',
            noExiste: 'bash: cd: %s: No existe el archivo o el directorio',
            usoGrep: 'Uso: grep PALABRA',
            resultados: '%s: resultados arriba.',
            volver: 'Volver a la página',
            sinResultados: '%s: sin resultados',
        },
        ca: {
            entrada: 'Terminal: escriu una ordre i prem Retorn. Escriu help per veure les ordres.',
            ayuda: ['Ordres disponibles:',
                '  ls             llista les pàgines d\'aquesta carpeta',
                '  cd PÀGINA      obre una pàgina; «cd ..» puja un nivell i «cd» torna a l\'inici',
                '  grep PARAULA   cerca una paraula en tot el recurs',
                '  help           mostra aquesta ajuda',
                'El tabulador completa el nom d\'una ordre o d\'una pàgina.'],
            noOrden: 'bash: %s: no s\'ha trobat l\'ordre. Escriu help per veure les ordres.',
            noExiste: 'bash: cd: %s: No existeix el fitxer o el directori',
            usoGrep: 'Ús: grep PARAULA',
            resultados: '%s: resultats a dalt.',
            volver: 'Torna a la pàgina',
            sinResultados: '%s: cap resultat',
        },
        gl: {
            entrada: 'Terminal: escribe unha orde e preme Intro. Escribe help para ver as ordes.',
            ayuda: ['Ordes dispoñibles:',
                '  ls             lista as páxinas deste cartafol',
                '  cd PÁXINA      abre unha páxina; «cd ..» sobe un nivel e «cd» volve ao inicio',
                '  grep PALABRA   busca unha palabra en todo o recurso',
                '  help           amosa esta axuda',
                'O tabulador completa o nome dunha orde ou dunha páxina.'],
            noOrden: 'bash: %s: non se atopou a orde. Escribe help para ver as ordes.',
            noExiste: 'bash: cd: %s: Non existe o ficheiro ou o directorio',
            usoGrep: 'Uso: grep PALABRA',
            resultados: '%s: resultados arriba.',
            volver: 'Volver á páxina',
            sinResultados: '%s: sen resultados',
        },
        eu: {
            entrada: 'Terminala: idatzi agindu bat eta sakatu Sartu. Idatzi help aginduak ikusteko.',
            ayuda: ['Erabil daitezkeen aginduak:',
                '  ls            karpeta honetako orriak zerrendatzen ditu',
                '  cd ORRIA      orri bat irekitzen du; «cd ..» maila bat igotzen da eta «cd» hasierara itzultzen da',
                '  grep HITZA    hitz bat bilatzen du baliabide osoan',
                '  help          laguntza hau erakusten du',
                'Tabulagailuak agindu edo orri baten izena osatzen du.'],
            noOrden: 'bash: %s: ez da agindua aurkitu. Idatzi help aginduak ikusteko.',
            noExiste: 'bash: cd: %s: Ez dago halako fitxategi edo direktoriorik',
            usoGrep: 'Erabilera: grep HITZA',
            resultados: '%s: emaitzak goian.',
            volver: 'Itzuli orrira',
            sinResultados: '%s: ez dago emaitzarik',
        },
        en: {
            entrada: 'Terminal: type a command and press Enter. Type help to see the commands.',
            ayuda: ['Available commands:',
                '  ls            list the pages in this folder',
                '  cd PAGE       open a page; "cd .." goes up one level and "cd" goes back to the start',
                '  grep WORD     search the whole resource for a word',
                '  help          show this help',
                'Tab completes the name of a command or a page.'],
            noOrden: 'bash: %s: command not found. Type help to see the commands.',
            noExiste: 'bash: cd: %s: No such file or directory',
            usoGrep: 'Usage: grep WORD',
            resultados: '%s: results above.',
            volver: 'Back to the page',
            sinResultados: '%s: no results',
        },
    };
    var ORDENES = ['cd', 'grep', 'help', 'ls'];

    var idioma = (raiz.lang || 'es').slice(0, 2);
    var estrecha = window.matchMedia('(max-width: 59.99rem)');
    var piezas = {};
    // Lo que la terminal necesita saber: el árbol de páginas, la carpeta del recurso y la página abierta.
    var estado = {};

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
            .replace(/[\u0300-\u036f]/g, '')
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
                pagina.hijas = [];
                if (antecesoras.length) antecesoras[antecesoras.length - 1].hijas.push(pagina);
                paginas.push(pagina);
                recorrer(elementos[i].querySelector(':scope > ul'), antecesoras.concat(pagina));
            }
        })(nav.querySelector(':scope > ul'), []);
        return paginas;
    }

    // La carpeta del recurso: contiene las páginas de primer nivel.
    function carpetaRaiz(paginas, carpeta) {
        return {
            nombre: carpeta,
            raiz: true,
            antecesoras: [],
            hijas: paginas.filter(function (pagina) {
                return !pagina.antecesoras.length;
            }),
        };
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

    // Una página con subpáginas es una carpeta, y su contenido, el README.md de esa carpeta.
    // Las demás son archivos dentro de la carpeta de su madre, o en la del recurso.
    function carpetaDe(pagina) {
        if (!pagina) return estado.raiz;
        if (pagina.hijas.length) return pagina;
        return pagina.antecesoras[pagina.antecesoras.length - 1] || estado.raiz;
    }

    function madreDe(carpeta) {
        if (carpeta.raiz) return carpeta;
        return carpeta.antecesoras[carpeta.antecesoras.length - 1] || estado.raiz;
    }

    function rutaDe(carpeta) {
        var partes = ['~', estado.raiz.nombre];
        if (!carpeta.raiz) {
            carpeta.antecesoras.forEach(function (antecesora) {
                partes.push(antecesora.nombre);
            });
            partes.push(carpeta.nombre);
        }
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

    function construirPrompt(principal) {
        var titulo = principal.querySelector('.page-title');
        if (!titulo) return;
        var actual = estado.actual;
        var orden = 'cat ' + (!actual ? 'index.md' : actual.hijas.length ? 'README.md' : actual.nombre + '.md');
        titulo.before(prompt(rutaDe(carpetaDe(actual)), orden));
        construirTerminal(principal);
    }

    /* ---------- La terminal: ls, cd, grep y help ---------- */

    function mensaje(clave, valor) {
        var lista = MENSAJES[idioma] || MENSAJES.en;
        var cadena = lista[clave];
        return typeof cadena === 'string' ? cadena.replace('%s', valor || '') : cadena;
    }

    function escribir(lineas, clase) {
        [].concat(lineas).forEach(function (linea) {
            piezas.salida.append(crear('div', 'cli-salida-linea' + (clase ? ' ' + clase : ''), linea));
        });
    }

    // Las entradas de una carpeta, como las muestra «ls»: subcarpetas con «/» y páginas con «.md».
    function entradas(carpeta) {
        var lista = carpeta.raiz ? [] : [{ nombre: 'README.md', pagina: carpeta }];
        carpeta.hijas.forEach(function (pagina) {
            lista.push(pagina.hijas.length
                ? { nombre: pagina.nombre + '/', pagina: pagina, carpeta: true }
                : { nombre: pagina.nombre + '.md', pagina: pagina });
        });
        return lista;
    }

    function ordenLs() {
        var linea = crear('div', 'cli-salida-linea cli-ls');
        entradas(carpetaDe(estado.actual)).forEach(function (entrada) {
            var enlace = crear('a', entrada.carpeta ? 'cli-ls-carpeta' : 'cli-ls-archivo', entrada.nombre);
            enlace.href = entrada.pagina.enlace.href;
            enlace.title = entrada.pagina.titulo;
            linea.append(enlace, ' ');
        });
        piezas.salida.append(linea);
    }

    // Sigue una ruta («..», «~», «carpeta/página», con o sin «.md») desde la carpeta abierta.
    function resolver(ruta) {
        var nodo = carpetaDe(estado.actual);
        var partes = ruta.split('/');
        for (var i = 0; i < partes.length; i++) {
            var parte = partes[i].replace(/\.md$/i, '');
            if (!parte || parte === '.') continue;
            if (parte === '~' && i === 0) { nodo = estado.raiz; continue; }
            if (parte === '..') { nodo = madreDe(nodo); continue; }
            if (parte === 'README' && !nodo.raiz) continue;
            var buscada = nombreDeArchivo(parte);
            var siguiente = nodo.hijas.filter(function (hija) {
                return hija.nombre === buscada;
            })[0];
            if (!siguiente) return null;
            nodo = siguiente;
        }
        return nodo;
    }

    function abrir(nodo) {
        var pagina = nodo.raiz ? estado.paginas[0] : nodo;
        if (pagina && pagina !== estado.actual) location.href = pagina.enlace.href;
    }

    function ordenCd(argumento) {
        if (!argumento || argumento === '~') return abrir(estado.raiz);
        var destino = resolver(argumento);
        if (!destino) return escribir(mensaje('noExiste', argumento), 'cli-error');
        abrir(destino);
    }

    // «grep» usa el buscador del recurso; las opciones («-i», «-r»…) se pasan por alto.
    function ordenGrep(argumentos) {
        var palabra = argumentos.filter(function (argumento) {
            return argumento.charAt(0) !== '-';
        }).join(' ').replace(/^["']|["']$/g, '');
        var formulario = document.getElementById('exe-client-search-form');
        var campo = document.getElementById('exe-client-search-text');
        if (!palabra) return escribir(mensaje('usoGrep'));
        if (!formulario || !campo) return escribir(mensaje('noOrden', 'grep'), 'cli-error');
        campo.value = palabra;
        if (formulario.requestSubmit) formulario.requestSubmit();
        else formulario.dispatchEvent(new Event('submit', { cancelable: true }));
        var hay = document.querySelector('#exe-client-search-results-list li');
        escribir(mensaje(hay ? 'resultados' : 'sinResultados', palabra));
        // La búsqueda oculta la página; el botón «Ocultar» del buscador la vuelve a mostrar,
        // pero en el móvil está dentro del índice cerrado: la terminal ofrece el mismo paso.
        var ocultar = document.getElementById('exe-client-search-reset');
        if (ocultar) {
            var volver = crear('button', 'cli-volver', mensaje('volver'));
            volver.type = 'button';
            volver.addEventListener('click', function (evento) {
                evento.stopPropagation();
                ocultar.click();
                volver.disabled = true;
                piezas.campo.focus();
            });
            var linea = crear('div', 'cli-salida-linea');
            linea.append(volver);
            piezas.salida.append(linea);
        }
        var resultados = document.getElementById('exe-client-search-results');
        if (hay && resultados) resultados.scrollIntoView({ block: 'start' });
    }

    function ejecutar(linea) {
        var eco = prompt(rutaDe(carpetaDe(estado.actual)), linea);
        eco.className = 'cli-salida-linea cli-eco';
        eco.removeAttribute('aria-hidden');
        piezas.salida.append(eco);
        var partes = linea.trim().split(/\s+/);
        var orden = partes[0];
        var argumentos = partes.slice(1);
        if (!orden) return;
        if (orden === 'help' || orden === 'ayuda') escribir(mensaje('ayuda'));
        else if (orden === 'ls') ordenLs();
        else if (orden === 'cd') ordenCd(argumentos[0]);
        else if (orden === 'grep') ordenGrep(argumentos);
        else escribir(mensaje('noOrden', orden), 'cli-error');
    }

    // El tabulador completa la orden o la última parte de la ruta de «cd». Con la línea vacía
    // no hace nada, para que siga sirviendo para pasar de un control a otro.
    function completar(campo) {
        var valor = campo.value;
        if (!valor.trim()) return false;
        var partes = valor.split(/\s+/);
        var opciones;
        var parcial = partes[partes.length - 1];
        var prefijo = '';
        if (partes.length === 1) {
            opciones = ORDENES.map(function (orden) { return orden + ' '; });
        } else if (partes[0] === 'cd' && partes.length === 2) {
            var corte = parcial.lastIndexOf('/');
            prefijo = parcial.slice(0, corte + 1);
            var carpeta = prefijo ? resolver(prefijo) : carpetaDe(estado.actual);
            if (!carpeta) return true;
            parcial = parcial.slice(corte + 1);
            opciones = entradas(carpeta).map(function (entrada) { return entrada.nombre; }).concat(['../']);
        } else {
            return true;
        }
        var validas = opciones.filter(function (opcion) {
            return opcion.indexOf(parcial) === 0;
        });
        if (validas.length === 1) {
            partes[partes.length - 1] = prefijo + validas[0];
            campo.value = partes.join(' ');
        } else if (validas.length > 1) {
            escribir(validas.join('  '));
        }
        return true;
    }

    function construirTerminal(principal) {
        var terminal = crear('div', 'cli-terminal');
        piezas.salida = crear('div', 'cli-salida');
        piezas.salida.setAttribute('role', 'log');
        piezas.salida.setAttribute('aria-live', 'polite');

        var formulario = crear('form', 'cli-espera');
        var linea = prompt(rutaDe(carpetaDe(estado.actual)));
        linea.classList.remove('cli-prompt');
        linea.className = 'cli-prompt-texto';
        var entrada = crear('span', 'cli-entrada');
        var campo = crear('input', 'cli-campo');
        campo.type = 'text';
        campo.setAttribute('aria-label', mensaje('entrada'));
        campo.title = mensaje('entrada');
        campo.setAttribute('autocomplete', 'off');
        campo.setAttribute('autocapitalize', 'off');
        campo.setAttribute('spellcheck', 'false');
        campo.setAttribute('enterkeyhint', 'go');
        // «help» como ejemplo, en gris: no está escrito y desaparece al escribir.
        campo.placeholder = 'help';
        var cursor = crear('span', 'cli-cursor');
        cursor.setAttribute('aria-hidden', 'true');
        entrada.append(cursor, campo);
        formulario.append(linea, entrada);

        formulario.addEventListener('submit', function (evento) {
            evento.preventDefault();
            ejecutar(campo.value);
            campo.value = '';
        });
        campo.addEventListener('keydown', function (evento) {
            if (evento.key === 'Tab' && !evento.shiftKey && completar(campo)) evento.preventDefault();
        });
        // Pulsar en cualquier parte de la línea lleva al campo, como en una terminal.
        formulario.addEventListener('click', function () {
            campo.focus();
        });

        terminal.append(piezas.salida, formulario);
        var contenido = principal.querySelector('.page-content');
        if (contenido) contenido.after(terminal);
        piezas.campo = campo;
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
        estado.paginas = paginas;
        estado.raiz = carpetaRaiz(paginas, carpeta);
        estado.actual = paginas.filter(function (pagina) {
            return pagina.enlace === activa;
        })[0] || null;

        construirTitulo(pantalla, principal, carpeta);
        construirArbol(principal, nav, paginas, carpeta);
        construirPrompt(principal);
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
