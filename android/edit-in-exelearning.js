/* SPDX-License-Identifier: AGPL-3.0-or-later
   «Editar en eXeLearning» del ejemplo publicado, como el enlace de los estilos de Ernesto
   Serrano, pero dentro del móvil: un botón flotante de Material con un lápiz, que aparece
   al pasar el ratón por la pantalla, al tocarla o al llegar con el teclado, y abre en
   eXeLearning en línea el .elpx que publica la web. No forma parte del estilo:
   herramientas/empaquetar.py lo añade solo al HTML del ejemplo. */
window.addEventListener('load', function () {
    var pantalla = document.querySelector('.and-js .exe-web-site .exe-content');
    if (!pantalla || document.querySelector('.and-editar')) return;
    var estilo = document.createElement('style');
    estilo.textContent = [
        '.and-editar { position: absolute; right: 1rem; bottom: 8rem; z-index: 20; display: flex; align-items: center; justify-content: center; width: 3.5rem; height: 3.5rem; border-radius: 1rem; background: var(--md-primary-container); color: var(--md-on-primary-container) !important; box-shadow: var(--and-sombra-3); text-decoration: none !important; opacity: 0; transform: scale(.6); pointer-events: none; }',
        '.and-editar svg { width: 1.5rem; height: 1.5rem; }',
        // Aparece al pasar el ratón por la pantalla, al tocarla o al enfocarlo con el teclado.
        '.exe-content:hover > .and-editar, .and-editar:focus-visible, .and-editar.and-visible { opacity: 1; transform: none; pointer-events: auto; }',
        '.and-editar:focus-visible { outline: .1875rem solid var(--md-secondary); outline-offset: .125rem; }',
        '@media (prefers-reduced-motion: no-preference) { .and-editar { transition: opacity .2s, transform .2s cubic-bezier(.2, 0, 0, 1); } }',
        // En horizontal, la navegación es un raíl: el botón baja a la esquina.
        '.and-horizontal .and-editar { bottom: 3rem; }',
        // En un móvil de verdad, sobre la barra de navegación fija.
        '@media screen and (max-width: 49.99rem), screen and (max-height: 37.99rem) { .and-editar { position: fixed; bottom: 6rem; } }',
        '@media screen and (orientation: landscape) and (max-height: 37.99rem) { .and-editar { bottom: 1rem; } }',
        '@media print { .and-editar { display: none; } }',
    ].join('\n');
    var enlace = document.createElement('a');
    enlace.className = 'and-editar';
    enlace.href = 'https://static.exelearning.dev/?url=https://jjdeharo.github.io/exelearning-estilos/android/descargas/ecuaciones-segundo-grado.elpx';
    enlace.target = '_blank';
    enlace.rel = 'noopener';
    enlace.setAttribute('aria-label', 'Editar en eXeLearning');
    enlace.title = 'Editar en eXeLearning';
    enlace.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>';
    document.head.append(estilo);
    pantalla.append(enlace);
    // En una pantalla táctil, al tocarla aparece unos segundos.
    var temporizador;
    pantalla.addEventListener('pointerdown', function (evento) {
        if (evento.pointerType === 'mouse') return;
        enlace.classList.add('and-visible');
        clearTimeout(temporizador);
        temporizador = setTimeout(function () {
            enlace.classList.remove('and-visible');
        }, 4000);
    });
});
