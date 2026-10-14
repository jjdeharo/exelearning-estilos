# 2. La terminal de Linux: GNOME Terminal, bash, tree, tmux y systemd

- Estado: aceptada
- Fecha: 14-10-2026

## Contexto

El encargo era un estilo que imite la consola de Linux. El estilo Hacker de ATE ya ocupa el terreno de las terminales de película (Matrix, Tron, PipBoy), así que este tenía que parecerse a la terminal que se usa de verdad, y seguir siendo claro para alumnado que no la ha visto nunca.

## Decisión

- **Colores**: la paleta Tango, la de GNOME Terminal durante años, sobre un fondo casi negro (`#1d1f21`). El rojo de Tango no llega a 4,5:1 como texto sobre ese fondo; para texto se usa `#ff7070`.
- **Letra**: DejaVu Sans Mono, la monoespaciada por defecto de la mayoría de las distribuciones. Reducida con `pyftsubset` a latín, signos matemáticos, flechas y dibujo de cajas: unos 32 KB por grosor en WOFF2 (normal y negrita).
- **Piezas**, cada una con su orden real: el índice como la salida de `tree`, con sus ramas calculadas en `style.js`; el prompt de bash de Debian y Ubuntu (usuario y máquina en verde, ruta en azul) con la ruta de la página en el árbol; la barra de estado de `tmux` para navegar; las etiquetas de arranque de systemd (`[  OK  ]`, `[FAILED]`) para las cajas que se quieren destacar y para los aciertos y fallos del test.
- **Usuario y máquina neutros**: `aula@exe`, que vale para cualquier recurso y no presupone el género de nadie.
- **Iconos de las cajas**: los generales de eXeLearning (Material Symbols), que se pintan con el color del texto; el estilo los pone en verde. El estilo no trae iconos propios: en la primera versión llevaba una copia de los de Zen, retirada para no duplicar lo que eXeLearning ya ofrece.
- **Las actividades**, con marco de doble línea, como una ventana de `dialog`, para distinguirlas del texto.
- **Los títulos se leen como texto**: el índice muestra el título de cada página, no su nombre de archivo; los nombres de archivo solo aparecen en el prompt, que es decorativo (`aria-hidden`).

## Alternativas descartadas

- **Consola virtual de texto** (fondo negro puro, gris claro, 80 columnas): más fiel, pero menos legible y sin la ventana que hace reconocible la metáfora.
- **Fondo berenjena de Ubuntu**: ata el estilo a una distribución.
- **Botones de ventana** (cerrar, maximizar): adornos que parecen funcionar y no funcionan.
- **Atajos de teclado propios** (flechas para pasar de página): se dejan para cuando se pidan; la barra de estado basta.

## Consecuencias

- Contraste comprobado con axe-core en todas las páginas, sin fallos.
- Las clases `cli-ok`, `cli-info`, `cli-warn`, `cli-fail` y `cli-marco` son la forma de destacar cajas desde la interfaz de eXeLearning, sin tocar código.
