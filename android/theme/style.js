/*!
 * Android — estilo de eXeLearning
 * Presenta el recurso como una aplicación en un móvil Android con Material Design 3:
 * barra superior, índice en un cajón lateral, tarjetas y una barra de navegación
 * abajo. En pantallas grandes, el móvil se dibuja sobre el escritorio y se puede
 * girar entre vertical y horizontal; en un móvil de verdad, ocupa la pantalla.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Juan José de Haro (@jjdeharo), 2026.
 */
(function () {
    'use strict';

    var raiz = document.documentElement;
    // Antes del primer pintado, para que la página no aparezca un instante sin el móvil.
    raiz.classList.add('and-js');

    // La orientación que eligió quien lee se recuerda en su dispositivo.
    var CLAVE_ORIENTACION = 'exe-estilo-android-orientacion';
    var CLAVE_LETRA = 'exe-estilo-android-letra';
    // Tamaños de letra, como los de Android: de pequeño a muy grande.
    var ESCALAS = [0.85, 1, 1.15, 1.3, 1.5, 1.75, 2];
    try {
        if (localStorage.getItem(CLAVE_ORIENTACION) === 'horizontal') raiz.classList.add('and-horizontal');
    } catch (error) { /* Sin almacenamiento, siempre en vertical. */ }

    var TEXTOS = {
        es: { index: 'Índice', home: 'Inicio', previous: 'Anterior', next: 'Siguiente', search: 'Buscar', rotate: 'Girar el móvil', close: 'Cerrar el índice', bar: 'Navegación', power: 'Botón de encendido', powerOff: 'Apagar la pantalla', powerOn: 'Pantalla apagada: púlsala para encenderla', volumeUp: 'Subir: letra más grande', volumeDown: 'Bajar: letra más pequeña', textSize: 'Tamaño de letra', seen: 'Has visto %1 de %2 páginas', seenShort: '%1 % visto' },
        ca: { index: 'Índex', home: 'Inici', previous: 'Anterior', next: 'Següent', search: 'Cerca', rotate: 'Gira el mòbil', close: 'Tanca l\'índex', bar: 'Navegació', power: 'Botó d\'engegada', powerOff: 'Apaga la pantalla', powerOn: 'Pantalla apagada: prem-la per encendre-la', volumeUp: 'Puja: lletra més gran', volumeDown: 'Baixa: lletra més petita', textSize: 'Mida de la lletra', seen: 'Has vist %1 de %2 pàgines', seenShort: '%1 % vist' },
        gl: { index: 'Índice', home: 'Inicio', previous: 'Anterior', next: 'Seguinte', search: 'Buscar', rotate: 'Xirar o móbil', close: 'Pechar o índice', bar: 'Navegación', power: 'Botón de acendido', powerOff: 'Apagar a pantalla', powerOn: 'Pantalla apagada: preme nela para acendela', volumeUp: 'Subir: letra máis grande', volumeDown: 'Baixar: letra máis pequena', textSize: 'Tamaño da letra', seen: 'Viches %1 de %2 páxinas', seenShort: '%1 % visto' },
        eu: { index: 'Aurkibidea', home: 'Hasiera', previous: 'Aurrekoa', next: 'Hurrengoa', search: 'Bilatu', rotate: 'Biratu mugikorra', close: 'Itxi aurkibidea', bar: 'Nabigazioa', power: 'Pizteko botoia', powerOff: 'Itzali pantaila', powerOn: 'Pantaila itzalita: sakatu pizteko', volumeUp: 'Igo: letra handiagoa', volumeDown: 'Jaitsi: letra txikiagoa', textSize: 'Letraren tamaina', seen: '%2 orritatik %1 ikusi dituzu', seenShort: '%1 % ikusita' },
        en: { index: 'Index', home: 'Home', previous: 'Previous', next: 'Next', search: 'Search', rotate: 'Rotate the phone', close: 'Close the index', bar: 'Navigation', power: 'Power button', powerOff: 'Turn the screen off', powerOn: 'Screen off: tap to turn it on', volumeUp: 'Volume up: larger text', volumeDown: 'Volume down: smaller text', textSize: 'Text size', seen: 'You have seen %1 of %2 pages', seenShort: '%1% seen' },
    };

    // Iconos propios, dibujados con trazos sencillos: los de eXeLearning son para las cajas.
    var ICONOS = {
        menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
        buscar: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
        anterior: '<path d="M15 5l-7 7 7 7"/>',
        siguiente: '<path d="M9 5l7 7-7 7"/>',
        inicio: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/>',
        indice: '<path d="M8 7h12M8 12h12M8 17h12"/><circle cx="4.5" cy="7" r=".6"/><circle cx="4.5" cy="12" r=".6"/><circle cx="4.5" cy="17" r=".6"/>',
        cerrar: '<path d="M6 6l12 12M18 6L6 18"/>',
        girar: '<rect x="8.75" y="5.5" width="6.5" height="13" rx="1.4" transform="rotate(45 12 12)"/><path d="M2.5 9.5A10 10 0 0 1 9.5 2.5"/><path d="M9.5 2.5l-2.8.2M9.5 2.5l-1.2 2.5"/><path d="M21.5 14.5a10 10 0 0 1-7 7"/><path d="M14.5 21.5l2.8-.2M14.5 21.5l1.2-2.5"/>',
    };

    // Iconos de la barra de estado, que reflejan el dispositivo de quien lee cuando el
    // navegador lo dice: cobertura según la velocidad de la conexión, wifi según haya red
    // y batería según su nivel y si se está cargando.
    function trazoSenal(barras) {
        var trazo = '';
        [[4, 17], [9, 13], [14, 9], [19, 4]].forEach(function (barra, i) {
            trazo += '<path d="M' + barra[0] + ' 20h2v-' + (20 - barra[1]) + 'h-2z" fill="currentColor" stroke="none"' + (i < barras ? '' : ' opacity=".3"') + '/>';
        });
        return trazo;
    }

    function trazoWifi(conectado) {
        if (conectado) return '<path d="M2 9a15 15 0 0 1 20 0L12 21z" fill="currentColor" stroke="none"/>';
        return '<path d="M2 9a15 15 0 0 1 20 0L12 21z" fill="currentColor" stroke="none" opacity=".3"/><path d="M4 4l16 16" stroke-width="2.5"/>';
    }

    function trazoBateria(nivel, cargando) {
        var alto = Math.max(1, Math.round(15 * nivel));
        var trazo = '<rect x="7.5" y="4.5" width="9" height="16" rx="1.5" stroke-width="1.5"/><rect x="10" y="2" width="4" height="2" fill="currentColor" stroke="none"/>'
            + '<rect x="8.5" y="' + (20 - alto) + '" width="7" height="' + alto + '" rx=".5" fill="currentColor" stroke="none"/>';
        if (cargando) trazo += '<path d="M13 7l-3 6h3l-2 5" style="stroke: var(--md-surface)" stroke-width="1.6"/>';
        return trazo;
    }

    var idioma = (raiz.lang || 'es').slice(0, 2);
    var reducido = window.matchMedia('(prefers-reduced-motion: reduce)');
    var piezas = {};

    // Primero las cadenas de eXeLearning, que ya vienen en el idioma del recurso.
    function texto(clave) {
        if (window.$exe_i18n && window.$exe_i18n[clave]) return window.$exe_i18n[clave];
        return (TEXTOS[idioma] || TEXTOS.en)[clave];
    }

    function guardado(clave) {
        try { return localStorage.getItem(clave); } catch (error) { return null; }
    }

    function guardar(clave, valor) {
        try { localStorage.setItem(clave, valor); } catch (error) { /* Sin almacenamiento, no se recuerda. */ }
    }

    function crear(etiqueta, clase, contenido) {
        var nodo = document.createElement(etiqueta);
        if (clase) nodo.className = clase;
        if (contenido) nodo.textContent = contenido;
        return nodo;
    }

    function dibujo(trazo) {
        return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + trazo + '</svg>';
    }

    function icono(nombre) {
        var envoltorio = crear('span', 'and-icono');
        envoltorio.setAttribute('aria-hidden', 'true');
        envoltorio.innerHTML = dibujo(ICONOS[nombre]);
        return envoltorio;
    }

    function botonIcono(nombre, rotulo, clase) {
        var boton = crear('button', 'and-boton-icono ' + clase);
        boton.type = 'button';
        boton.setAttribute('aria-label', rotulo);
        boton.title = rotulo;
        boton.append(icono(nombre));
        return boton;
    }

    function pad(numero) {
        return String(numero).padStart(2, '0');
    }

    /* ---------- Las piezas de la pantalla ---------- */

    // Barra de estado: la hora, la cobertura y el wifi del dispositivo, y la batería, que
    // es el progreso de lectura. Es visual: el porcentaje se explica al pasar el ratón.
    function construirEstado(pantalla) {
        var estado = crear('div', 'and-estado');
        estado.setAttribute('aria-hidden', 'true');
        piezas.hora = crear('span', 'and-hora');
        var iconos = crear('span', 'and-estado-iconos');
        piezas.senal = crear('span', 'and-icono and-senal');
        piezas.wifi = crear('span', 'and-icono and-wifi');
        piezas.bateria = crear('span', 'and-icono and-bateria');
        piezas.porcentaje = crear('span', 'and-porcentaje');
        piezas.progreso = crear('span', 'and-progreso');
        piezas.progreso.append(piezas.porcentaje, piezas.bateria);
        iconos.append(piezas.senal, piezas.wifi, piezas.progreso);
        estado.append(piezas.hora, iconos);
        pantalla.prepend(estado);
        actualizarHora();
        setInterval(actualizarHora, 15000);
        vigilarRed();
        return estado;
    }

    function actualizarHora() {
        var ahora = new Date();
        var hora = pad(ahora.getHours()) + ':' + pad(ahora.getMinutes());
        piezas.hora.textContent = hora;
        if (piezas.reposoHora) {
            piezas.reposoHora.textContent = hora;
            // Como Android: «mié., 14 oct.», con solo la primera letra en mayúscula.
            var fecha = ahora.toLocaleDateString(raiz.lang || undefined, { weekday: 'short', day: 'numeric', month: 'short' });
            piezas.reposoFecha.textContent = fecha.charAt(0).toUpperCase() + fecha.slice(1);
        }
    }

    // La batería se carga con las páginas vistas de este recurso, que se recuerdan en el
    // dispositivo; al verlas todas, sale el rayo de carga completa.
    function contarVistas(nav) {
        var enlaces = nav.querySelectorAll('a[href]');
        var paginas = [];
        for (var i = 0; i < enlaces.length; i++) paginas.push(enlaces[i].href.split('#')[0]);
        // El recurso se identifica por la dirección de su carpeta.
        var carpeta = paginas.length ? paginas[0].replace(/[^/]*$/, '') : location.href;
        var clave = 'exe-estilo-android-vistas:' + carpeta;
        var vistas = [];
        try { vistas = JSON.parse(guardado(clave) || '[]'); } catch (error) { vistas = []; }
        var actual = location.href.split('#')[0];
        var activa = nav.querySelector('a.active');
        if (activa) actual = activa.href.split('#')[0];
        if (vistas.indexOf(actual) < 0) vistas.push(actual);
        vistas = vistas.filter(function (pagina) { return paginas.indexOf(pagina) >= 0; });
        guardar(clave, JSON.stringify(vistas));
        return { vistas: vistas.length, total: paginas.length };
    }

    function pintarProgreso(progreso) {
        var nivel = progreso.total ? progreso.vistas / progreso.total : 1;
        var completo = nivel >= 1;
        var porcentaje = Math.round(nivel * 100);
        piezas.bateria.innerHTML = dibujo(trazoBateria(nivel, completo));
        piezas.porcentaje.textContent = porcentaje + ' %';
        var explicacion = texto('seen').replace('%1', progreso.vistas).replace('%2', progreso.total);
        piezas.progreso.title = explicacion;
        if (piezas.reposoBateria) piezas.reposoBateria.textContent = texto('seenShort').replace('%1', porcentaje);
    }

    function vigilarRed() {
        var pintarRed = function () {
            var conectado = navigator.onLine !== false;
            piezas.wifi.innerHTML = dibujo(trazoWifi(conectado));
            piezas.wifi.classList.toggle('and-sin-red', !conectado);
            var conexion = navigator.connection;
            var barras = { 'slow-2g': 1, '2g': 2, '3g': 3, '4g': 4 }[conexion && conexion.effectiveType] || 4;
            piezas.senal.innerHTML = dibujo(trazoSenal(conectado ? barras : 0));
        };
        pintarRed();
        window.addEventListener('online', pintarRed);
        window.addEventListener('offline', pintarRed);
        if (navigator.connection && navigator.connection.addEventListener) navigator.connection.addEventListener('change', pintarRed);
    }

    // Barra superior: el índice, el nombre del recurso y la búsqueda.
    function construirBarra(estado, principal) {
        var barra = crear('header', 'and-barra');
        piezas.menu = botonIcono('menu', texto('index'), 'and-menu');
        piezas.menu.setAttribute('aria-controls', 'and-cajon');
        piezas.menu.setAttribute('aria-expanded', 'false');
        var titulo = crear('div', 'and-barra-titulo');
        var cabecera = principal.querySelector('.package-header');
        if (cabecera) titulo.append(cabecera);
        barra.append(piezas.menu, titulo);
        var formulario = document.getElementById('exe-client-search-form');
        if (formulario) {
            piezas.buscar = botonIcono('buscar', texto('search'), 'and-buscar');
            piezas.buscar.setAttribute('aria-controls', 'and-busqueda');
            piezas.buscar.setAttribute('aria-expanded', 'false');
            barra.append(piezas.buscar);
            piezas.busqueda = crear('div', 'and-busqueda');
            piezas.busqueda.id = 'and-busqueda';
            piezas.busqueda.hidden = true;
            piezas.busqueda.append(formulario);
        }
        estado.after(barra);
        if (piezas.busqueda) barra.after(piezas.busqueda);
        return barra;
    }

    // La página y el pie, en la zona que se desplaza entre las dos barras.
    function construirContenido(pantalla, principal) {
        var contenido = crear('div', 'and-contenido');
        principal.before(contenido);
        contenido.append(principal);
        // El contador de páginas, encima del título, como un sobretítulo.
        var contador = principal.querySelector('.page-counter');
        var cabeceraPagina = principal.querySelector('.page-header');
        if (contador && cabeceraPagina) cabeceraPagina.prepend(contador);
        var pie = crear('div', 'and-pie');
        var licencia = document.getElementById('siteFooter');
        var hecho = document.getElementById('made-with-eXe');
        if (licencia) pie.append(licencia);
        if (hecho) pie.append(hecho);
        contenido.append(pie);
        piezas.contenido = contenido;
        return contenido;
    }

    function destino(nodo, clase, nombreIcono, rotulo) {
        var elemento;
        if (nodo && nodo.href) {
            elemento = crear('a', 'and-destino ' + clase);
            elemento.href = nodo.href;
        } else {
            elemento = crear('span', 'and-destino ' + clase);
            elemento.setAttribute('aria-disabled', 'true');
        }
        var indicador = crear('span', 'and-indicador');
        indicador.append(icono(nombreIcono));
        elemento.append(indicador, crear('span', 'and-destino-texto', rotulo));
        return elemento;
    }

    // Barra de navegación de abajo: anterior, inicio, índice y siguiente.
    function construirNavegacion(pantalla, contenido, nav) {
        var barra = crear('nav', 'and-navegacion');
        barra.setAttribute('aria-label', texto('bar'));
        var botones = document.querySelector('.nav-buttons');
        var anterior = botones && botones.querySelector('.nav-button-left');
        var siguiente = botones && botones.querySelector('.nav-button-right');
        var primera = nav.querySelector('a[href]');
        var activa = nav.querySelector('a.active');

        var indice = crear('button', 'and-destino and-ver-indice');
        indice.type = 'button';
        indice.setAttribute('aria-controls', 'and-cajon');
        var indicador = crear('span', 'and-indicador');
        indicador.append(icono('indice'));
        indice.append(indicador, crear('span', 'and-destino-texto', texto('index')));
        piezas.verIndice = indice;

        var inicio = destino(primera && primera !== activa ? primera : null, 'and-inicio', 'inicio', texto('home'));
        barra.append(
            destino(anterior, 'and-anterior', 'anterior', texto('previous')),
            inicio,
            indice,
            destino(siguiente, 'and-siguiente', 'siguiente', texto('next'))
        );
        contenido.after(barra);
        if (botones) botones.remove();

        var gestos = crear('div', 'and-gestos');
        gestos.setAttribute('aria-hidden', 'true');
        barra.after(gestos);
    }

    // El índice, en un cajón que se abre sobre la página.
    function construirCajon(pantalla, nav, principal) {
        var cajon = crear('div', 'and-cajon');
        cajon.id = 'and-cajon';
        var cabecera = crear('div', 'and-cajon-cabecera');
        var tituloRecurso = principal.querySelector('.package-title');
        cabecera.append(crear('h2', 'and-cajon-titulo', tituloRecurso ? tituloRecurso.textContent.trim() : texto('index')));
        piezas.cerrar = botonIcono('cerrar', texto('close'), 'and-cerrar');
        cabecera.append(piezas.cerrar);
        cajon.append(cabecera, nav);
        piezas.velo = crear('div', 'and-velo');
        pantalla.append(piezas.velo, cajon);
        piezas.cajon = cajon;
    }

    // El marco del móvil: el cuerpo, la cámara y los botones laterales, solo en pantallas grandes.
    function construirMovil(pantalla) {
        var movil = crear('div', 'and-movil');
        pantalla.before(movil);
        movil.append(pantalla);
        var camara = crear('span', 'and-camara');
        camara.setAttribute('aria-hidden', 'true');
        movil.append(camara);

        // El botón de encendido, en el lateral: apaga la pantalla y deja la hora, como la
        // pantalla siempre activa de Android. Pulsarlo otra vez o tocar la pantalla la enciende.
        piezas.encendido = crear('button', 'and-encendido');
        piezas.encendido.type = 'button';
        piezas.encendido.setAttribute('aria-label', texto('powerOff'));
        piezas.encendido.title = texto('power');
        movil.append(piezas.encendido);
        piezas.reposo = crear('button', 'and-reposo');
        piezas.reposo.type = 'button';
        piezas.reposo.setAttribute('aria-label', texto('powerOn'));
        piezas.reposoHora = crear('span', 'and-reposo-hora');
        piezas.reposoFecha = crear('span', 'and-reposo-fecha');
        piezas.reposoBateria = crear('span', 'and-reposo-bateria');
        piezas.reposo.append(piezas.reposoHora, piezas.reposoFecha, piezas.reposoBateria);
        piezas.reposo.hidden = true;
        pantalla.append(piezas.reposo);
        actualizarHora();
        // Los botones de volumen cambian el tamaño de la letra de la página.
        piezas.subir = crear('button', 'and-volumen and-subir');
        piezas.bajar = crear('button', 'and-volumen and-bajar');
        [[piezas.subir, 'volumeUp'], [piezas.bajar, 'volumeDown']].forEach(function (par) {
            par[0].type = 'button';
            par[0].setAttribute('aria-label', texto(par[1]));
            par[0].title = texto(par[1]);
            movil.append(par[0]);
        });
        // El panel que aparece al pulsarlos, como el del volumen de Android.
        piezas.panel = crear('div', 'and-panel-letra');
        piezas.panel.setAttribute('role', 'status');
        piezas.panelNivel = crear('span', 'and-panel-nivel');
        var pista = crear('span', 'and-panel-pista');
        pista.append(piezas.panelNivel);
        piezas.panelTexto = crear('span', 'and-panel-texto');
        var letra = crear('span', 'and-panel-icono', 'Aa');
        letra.setAttribute('aria-hidden', 'true');
        piezas.panel.append(pista, letra, piezas.panelTexto);
        pantalla.append(piezas.panel);

        // El icono de girar, abajo a la derecha, como la sugerencia de giro de Android.
        piezas.girar = botonIcono('girar', texto('rotate'), 'and-girar');
        var gestos = pantalla.querySelector('.and-gestos');
        if (gestos) {
            gestos.removeAttribute('aria-hidden');
            gestos.append(piezas.girar);
        }
        piezas.movil = movil;
    }

    /* ---------- Comportamiento ---------- */

    function abrirCajon(abierto, devolverFoco) {
        document.body.classList.toggle('and-cajon-abierto', abierto);
        piezas.menu.setAttribute('aria-expanded', abierto ? 'true' : 'false');
        piezas.cajon.inert = !abierto;
        if (abierto) {
            var actual = piezas.cajon.querySelector('#siteNav a.active') || piezas.cajon.querySelector('a');
            if (actual) actual.focus();
        } else if (devolverFoco) {
            devolverFoco.focus();
        }
    }

    function abrirBusqueda(abierta) {
        piezas.busqueda.hidden = !abierta;
        piezas.buscar.setAttribute('aria-expanded', abierta ? 'true' : 'false');
        if (abierta) {
            var campo = document.getElementById('exe-client-search-text');
            if (campo) campo.focus();
        }
    }

    function apagar(apagada) {
        piezas.movil.classList.toggle('and-apagado', apagada);
        piezas.reposo.hidden = !apagada;
        piezas.encendido.setAttribute('aria-label', texto(apagada ? 'powerOn' : 'powerOff'));
        // Con la pantalla apagada, lo de debajo no se puede usar.
        var pantalla = piezas.reposo.parentElement;
        for (var i = 0; i < pantalla.children.length; i++) {
            if (pantalla.children[i] !== piezas.reposo) pantalla.children[i].inert = apagada;
        }
        if (!apagada) abrirCajon(document.body.classList.contains('and-cajon-abierto'));
        actualizarHora();
    }

    function escalaGuardada() {
        var valor = parseFloat(guardado(CLAVE_LETRA));
        return ESCALAS.indexOf(valor) >= 0 ? valor : 1;
    }

    function aplicarLetra(escala, avisar) {
        piezas.contenido.style.setProperty('--and-escala', escala);
        raiz.classList.toggle('and-letra-cambiada', escala !== 1);
        var posicion = ESCALAS.indexOf(escala);
        piezas.subir.disabled = posicion === ESCALAS.length - 1;
        piezas.bajar.disabled = posicion === 0;
        if (!avisar) return;
        var porcentaje = Math.round(escala * 100) + ' %';
        piezas.panelNivel.style.height = Math.round(100 * (posicion + 1) / ESCALAS.length) + '%';
        piezas.panelTexto.textContent = texto('textSize') + ': ' + porcentaje;
        piezas.panel.classList.add('and-visible');
        clearTimeout(piezas.temporizadorPanel);
        piezas.temporizadorPanel = setTimeout(function () {
            piezas.panel.classList.remove('and-visible');
        }, 1800);
    }

    function cambiarLetra(paso) {
        var posicion = ESCALAS.indexOf(escalaGuardada()) + paso;
        posicion = Math.max(0, Math.min(ESCALAS.length - 1, posicion));
        guardar(CLAVE_LETRA, String(ESCALAS[posicion]));
        aplicarLetra(ESCALAS[posicion], true);
    }

    function girar() {
        var horizontal = !raiz.classList.contains('and-horizontal');
        var aplicar = function () {
            raiz.classList.toggle('and-horizontal', horizontal);
            guardar(CLAVE_ORIENTACION, horizontal ? 'horizontal' : 'vertical');
        };
        // Como un móvil de verdad: el cuerpo gira y luego la pantalla se recoloca.
        if (reducido.matches) return aplicar();
        piezas.movil.classList.add(horizontal ? 'and-girando-horizontal' : 'and-girando-vertical');
        window.setTimeout(function () {
            piezas.movil.classList.remove('and-girando-horizontal', 'and-girando-vertical');
            aplicar();
        }, 350);
    }

    function escuchar() {
        piezas.menu.addEventListener('click', function () {
            abrirCajon(true);
        });
        piezas.verIndice.addEventListener('click', function () {
            abrirCajon(true);
        });
        piezas.cerrar.addEventListener('click', function () {
            abrirCajon(false, piezas.menu);
        });
        piezas.velo.addEventListener('click', function () {
            abrirCajon(false, piezas.menu);
        });
        if (piezas.buscar) {
            piezas.buscar.addEventListener('click', function () {
                abrirBusqueda(piezas.busqueda.hidden);
            });
            document.getElementById('exe-client-search-form').addEventListener('submit', function () {
                piezas.contenido.scrollTop = 0;
            });
        }
        document.addEventListener('keydown', function (evento) {
            if (evento.key !== 'Escape') return;
            if (document.body.classList.contains('and-cajon-abierto')) abrirCajon(false, piezas.menu);
            else if (piezas.busqueda && !piezas.busqueda.hidden) {
                abrirBusqueda(false);
                piezas.buscar.focus();
            }
        });
        piezas.girar.addEventListener('click', girar);
        piezas.subir.addEventListener('click', function () {
            cambiarLetra(1);
        });
        piezas.bajar.addEventListener('click', function () {
            cambiarLetra(-1);
        });
        piezas.encendido.addEventListener('click', function () {
            apagar(!piezas.movil.classList.contains('and-apagado'));
        });
        piezas.reposo.addEventListener('click', function () {
            apagar(false);
            piezas.encendido.focus();
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
        var pantalla = document.querySelector('.exe-web-site .exe-content');
        var principal = pantalla && pantalla.querySelector('main.page');
        var nav = document.getElementById('siteNav');
        // Solo en la exportación como sitio web y una sola vez; si no, la página se lee normal.
        if (!principal || !nav || document.querySelector('.and-navegacion')) {
            raiz.classList.remove('and-js');
            return;
        }
        var estado = construirEstado(pantalla);
        construirBarra(estado, principal);
        var contenido = construirContenido(pantalla, principal);
        construirNavegacion(pantalla, contenido, nav);
        construirCajon(pantalla, nav, principal);
        construirMovil(pantalla);
        pintarProgreso(contarVistas(nav));
        // La letra se aplica también en un móvil de verdad, aunque allí no haya botones.
        aplicarLetra(escalaGuardada(), false);
        abrirCajon(false);
        escuchar();
        marcarDesplazables();
        window.addEventListener('resize', marcarDesplazables);
        // Al girar el móvil cambia el ancho de la pantalla.
        new MutationObserver(marcarDesplazables).observe(raiz, { attributes: true, attributeFilter: ['class'] });
        document.body.classList.add('and-lista');
    }

    // Después de los manejadores «ready» de eXeLearning, que crean el buscador.
    if (window.jQuery) window.jQuery(iniciar);
    else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();
})();
