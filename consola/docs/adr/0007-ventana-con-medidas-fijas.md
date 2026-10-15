# 7. La ventana tiene medidas fijas y se desplaza por dentro

- Estado: aceptada
- Fecha: 15-10-2026

## Contexto

En pantallas anchas, la ventana de la terminal crecía con el contenido y quien se desplazaba era la pestaña del navegador: la barra de título se iba hacia arriba y la ventana no tenía borde inferior. No parecía una ventana de verdad. Juanjo pidió que tuviera sus límites, con margen abajo, y la barra de desplazamiento dentro de la ventana, no en la pestaña.

## Decisión

- Desde 60rem de ancho y 30rem de alto, `body` mide lo mismo que la pantalla (`100dvh`) y no se desplaza. La ventana ocupa todo menos el margen del escritorio: arriba y a los lados, el de antes; abajo, la línea de la licencia y «Creado con eXeLearning», que quedan fuera de la ventana.
- El árbol y la página tienen cada uno su desplazamiento (`overflow-y: auto`), como dos paneles de tmux, con la barra de desplazamiento en los colores de la terminal (`scrollbar-color`). La barra de título y la de tmux quedan siempre a la vista.
- El marco y la sombra son de toda la ventana (un `::before` de `.exe-content` detrás del título, el árbol, la página y la barra), con las esquinas redondeadas arriba y abajo.
- Al cargar, el foco no está en la ventana y el navegador aplicaría las teclas de desplazamiento a la pestaña, que ya no se mueve. `style.js` (`desplazarVentana`) hace que, si el foco no está en ningún control, flechas, AvPág, RePág, espacio, Inicio y Fin desplacen la página de la ventana. Con «reducir movimiento», sin animación.
- En la barra de tmux, el nombre de la sesión se recorta con puntos suspensivos si no cabe todo, como hace tmux. A 1024 px la barra se salía 10 px por la derecha (ya pasaba antes de este cambio).

## Alternativas descartadas

- **Ventana fija también en el móvil**: allí la ventana ocupa toda la pantalla, sin escritorio alrededor, como una aplicación de terminal; el desplazamiento de la pestaña deja que el navegador esconda su barra de direcciones y gane espacio.
- **Ventana fija en pantallas bajas** (menos de 30rem de alto, un portátil apaisado con el zoom alto): el título y la barra de tmux dejarían muy poco sitio a la página; ahí se desplaza la pestaña, como antes.
- **Dar el foco a la página al cargar** para que las teclas funcionen solas: saltaría el enlace «Saltar al contenido» y el árbol al recorrer con el tabulador.

## Consecuencias

- Comprobado en Chromium, Firefox y WebKit a 1920 × 1080, 1440 × 840, 1280 × 800, 1024 × 600 y 1280 × 440: la pestaña no se desplaza (salvo en la pantalla baja), la página sí, y nada se sale por los lados.
- Las teclas de desplazamiento funcionan al cargar en los tres motores; dentro de la línea de órdenes siguen siendo del campo.
- axe-core da los mismos avisos que antes, todos de los iDevices de eXeLearning.
- Al imprimir no cambia nada: las reglas van solo en `screen`.
