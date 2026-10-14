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
    try {
        if (localStorage.getItem(CLAVE_ORIENTACION) === 'horizontal') raiz.classList.add('and-horizontal');
    } catch (error) { /* Sin almacenamiento, siempre en vertical. */ }

    var TEXTOS = {
        es: { index: 'Índice', home: 'Inicio', previous: 'Anterior', next: 'Siguiente', search: 'Buscar', rotate: 'Girar', rotateLong: 'Girar el móvil', close: 'Cerrar el índice', bar: 'Navegación', power: 'Botón de encendido', powerOff: 'Apagar la pantalla', powerOn: 'Pantalla apagada: púlsala para encenderla' },
        ca: { index: 'Índex', home: 'Inici', previous: 'Anterior', next: 'Següent', search: 'Cerca', rotate: 'Gira', rotateLong: 'Gira el mòbil', close: 'Tanca l\'índex', bar: 'Navegació', power: 'Botó d\'engegada', powerOff: 'Apaga la pantalla', powerOn: 'Pantalla apagada: prem-la per encendre-la' },
        gl: { index: 'Índice', home: 'Inicio', previous: 'Anterior', next: 'Seguinte', search: 'Buscar', rotate: 'Xirar', rotateLong: 'Xirar o móbil', close: 'Pechar o índice', bar: 'Navegación', power: 'Botón de acendido', powerOff: 'Apagar a pantalla', powerOn: 'Pantalla apagada: preme nela para acendela' },
        eu: { index: 'Aurkibidea', home: 'Hasiera', previous: 'Aurrekoa', next: 'Hurrengoa', search: 'Bilatu', rotate: 'Biratu', rotateLong: 'Biratu mugikorra', close: 'Itxi aurkibidea', bar: 'Nabigazioa', power: 'Pizteko botoia', powerOff: 'Itzali pantaila', powerOn: 'Pantaila itzalita: sakatu pizteko' },
        en: { index: 'Index', home: 'Home', previous: 'Previous', next: 'Next', search: 'Search', rotate: 'Rotate', rotateLong: 'Rotate the phone', close: 'Close the index', bar: 'Navigation', power: 'Power button', powerOff: 'Turn the screen off', powerOn: 'Screen off: tap to turn it on' },
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
        girar: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M2 9a10 10 0 0 1 4-5M2 9l3 .3M2 9l.3-3M22 15a10 10 0 0 1-4 5M22 15l-3-.3M22 15l-.3 3"/>',
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

    // Barra de estado: la hora, la cobertura, el wifi y la batería. La lee el lector de
    // pantalla del propio dispositivo, así que aquí es solo visual.
    function construirEstado(pantalla) {
        var estado = crear('div', 'and-estado');
        estado.setAttribute('aria-hidden', 'true');
        piezas.hora = crear('span', 'and-hora');
        var iconos = crear('span', 'and-estado-iconos');
        piezas.senal = crear('span', 'and-icono and-senal');
        piezas.wifi = crear('span', 'and-icono and-wifi');
        piezas.bateria = crear('span', 'and-icono and-bateria');
        piezas.porcentaje = crear('span', 'and-porcentaje');
        iconos.append(piezas.senal, piezas.wifi, piezas.porcentaje, piezas.bateria);
        estado.append(piezas.hora, iconos);
        pantalla.prepend(estado);
        actualizarHora();
        setInterval(actualizarHora, 15000);
        vigilarDispositivo();
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

    function vigilarDispositivo() {
        var estado = { nivel: 1, cargando: false, conocida: false };
        var pintarBateria = function () {
            piezas.bateria.innerHTML = dibujo(trazoBateria(estado.nivel, estado.cargando));
            var texto = estado.conocida ? Math.round(estado.nivel * 100) + ' %' : '';
            piezas.porcentaje.textContent = texto;
            if (piezas.reposoBateria) piezas.reposoBateria.textContent = texto;
        };
        var pintarRed = function () {
            var conectado = navigator.onLine !== false;
            piezas.wifi.innerHTML = dibujo(trazoWifi(conectado));
            piezas.wifi.classList.toggle('and-sin-red', !conectado);
            var conexion = navigator.connection;
            var barras = { 'slow-2g': 1, '2g': 2, '3g': 3, '4g': 4 }[conexion && conexion.effectiveType] || 4;
            piezas.senal.innerHTML = dibujo(trazoSenal(conectado ? barras : 0));
        };
        pintarBateria();
        pintarRed();
        window.addEventListener('online', pintarRed);
        window.addEventListener('offline', pintarRed);
        if (navigator.connection && navigator.connection.addEventListener) navigator.connection.addEventListener('change', pintarRed);
        // La batería, solo en los navegadores que la dan (Chrome, Edge); en los demás, llena.
        if (navigator.getBattery) {
            navigator.getBattery().then(function (bateria) {
                var leer = function () {
                    estado.nivel = bateria.level;
                    estado.cargando = bateria.charging;
                    estado.conocida = true;
                    pintarBateria();
                };
                leer();
                bateria.addEventListener('levelchange', leer);
                bateria.addEventListener('chargingchange', leer);
            }).catch(function () { /* Sin acceso a la batería: se queda llena. */ });
        }
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
        piezas.girar = crear('button', 'and-girar');
        piezas.girar.type = 'button';
        piezas.girar.title = texto('rotateLong');
        piezas.girar.append(icono('girar'), crear('span', 'and-girar-texto', texto('rotate')));
        movil.after(piezas.girar);
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

    function girar() {
        var horizontal = !raiz.classList.contains('and-horizontal');
        var aplicar = function () {
            raiz.classList.toggle('and-horizontal', horizontal);
            try {
                localStorage.setItem(CLAVE_ORIENTACION, horizontal ? 'horizontal' : 'vertical');
            } catch (error) { /* Sin almacenamiento, no se recuerda. */ }
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
