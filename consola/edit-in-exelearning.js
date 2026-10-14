/* SPDX-License-Identifier: AGPL-3.0-or-later
   «Editar en eXeLearning» del ejemplo publicado, como el enlace de los estilos de Ernesto
   Serrano, pero en la barra de tmux, junto a Anterior, Índice y Siguiente, para que se vea
   siempre, también en el móvil. Abre en eXeLearning en línea el .elpx que publica la web.
   No forma parte del estilo: herramientas/empaquetar.py lo añade solo al HTML del ejemplo. */
window.addEventListener('load', function () {
    var barra = document.querySelector('.cli-barra');
    if (!barra || document.querySelector('.cli-editar')) return;
    var estilo = document.createElement('style');
    estilo.textContent = '.cli-editar::before { content: "✎"; }'
        + '@media screen and (max-width: 59.99rem) { .cli-editar .cli-tecla-texto { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); } }';
    var enlace = document.createElement('a');
    enlace.className = 'cli-tecla cli-editar';
    enlace.href = 'https://static.exelearning.dev/?url=https://jjdeharo.github.io/exelearning-estilos/consola/descargas/ecuaciones-segundo-grado.elpx';
    enlace.target = '_blank';
    enlace.rel = 'noopener';
    enlace.title = 'Editar en eXeLearning';
    var texto = document.createElement('span');
    texto.className = 'cli-tecla-texto';
    texto.textContent = 'Editar en eXeLearning';
    enlace.append(texto);
    document.head.append(estilo);
    // Detrás de «Siguiente», antes del número de página y la hora.
    var estado = barra.querySelector('.cli-estado');
    barra.insertBefore(enlace, estado);
});
