# 8. Más órdenes: plot, calc, clear, la ayuda de cada orden, el historial y escribir sin buscar el prompt

- Estado: aceptada
- Fecha: 15-10-2026

## Contexto

Juanjo pidió más órdenes para la terminal y preguntó si se podían dibujar gráficas de verdad escribiendo, como la parábola del ejemplo, dibujada con caracteres al estilo de gnuplot. Aprobó la propuesta: `plot`, `calc`, `clear`, las flechas para recuperar órdenes y una ayuda para cada orden con `--help`.

## Decisión

- **`plot [x0:x1] [y0:y1] FUNCIÓN`**, con la sintaxis de gnuplot (los intervalos entre corchetes, opcionales; por defecto, x entre -10 y 10 y el alto automático). Dibuja como la terminal `dumb` de gnuplot: ejes con `-`, `|` y `+`, la curva con `*` (verde) y los cortes con el eje X con `o` (amarillo). Se acepta `y =` o `f(x) =` delante.
  - El ancho se ajusta al de la terminal (de 20 a 71 columnas): a 320 px caben 25. El alto es de 21 filas.
  - Alto automático: del menor al mayor valor, redondeados a un paso de 1, 2 o 5 por una potencia de 10. Si hay una asíntota (`tan(x)`, `1/x`), se dejan fuera el 5 % de los valores de cada extremo, para que se vea la curva y no solo dos picos.
  - Cortes con el eje X: cambios de signo afinados por bisección (se descartan los de una asíntota, donde la función no se acerca a cero) y mínimos de |f| que llegan a cero, para las raíces dobles como la de `x^2`. Se dicen debajo, con hasta tres decimales y «≈» si se ha redondeado: «# corta el eje X en x ≈ -1.414, x = 0 y x ≈ 1.414». Esa línea es también la que oye un lector de pantalla; el dibujo lleva `role="img"` con la función y el intervalo.
- **`calc EXPRESIÓN`**: una orden real de Linux (paquete `apcalc`) que acepta la cuenta en la misma línea; `bc` exigiría `echo … | bc`. Escribe el resultado con doce cifras significativas (`0.1+0.2` da `0.3`) y avisa si no es real (`sqrt(-1)`) o si se divide entre cero.
- **Las expresiones, como en la calculadora**: `^` y también `**` (el de gnuplot), producto sin signo (`2x`, `2(x+1)`, `2pi`), `sqrt`, `abs`, `sin`, `cos`, `tan`, `ln`, `log`, `exp` y `pi`; coma o punto decimal. La potencia va por la derecha y antes que el signo, como en matemáticas: `-2^2` da -4 y `2^3^2`, 512. Las interpreta un analizador propio (`compilar` en `style.js`), sin `eval` ni `Function`: lo escrito en la terminal no puede ejecutar código.
- **`log` es el decimal y `ln`, el neperiano**, como en los libros de texto de secundaria, aunque en gnuplot `log` es el neperiano: la terminal es para el alumnado. Los ángulos, en radianes; la ayuda lo dice.
- **Ayuda de cada orden**: `ORDEN --help` (o `-h`) y `help ORDEN`, como en Linux y en bash. La de `plot` explica la sintaxis con ejemplos. Una orden sin lo que necesita escribe su línea de uso y remite a `--help`; una expresión mal escrita dice qué símbolo no se entiende.
- **`clear`** borra la salida.
- **Basta con empezar a escribir**, como en una terminal (Juanjo lo pidió después): si el foco no está en un campo (`input`, `textarea`, `select` o un editable, como el buscador o las respuestas de las actividades), una tecla que escribe un carácter va al prompt, que recibe el foco; la ventana baja hasta él. El espacio no, porque desplaza la página; tampoco las combinaciones con Ctrl, Alt o Cmd, ni las teclas muertas de los acentos. El carácter se añade al campo en el propio `style.js`, para no depender de cómo trata cada navegador un cambio de foco a mitad de pulsación. Al cargar, el foco sigue sin ir al prompt (ADR 6): solo se mueve cuando alguien escribe. A un lector de pantalla no le afecta: en modo de lectura recoge él las teclas antes que la página.
- **Historial**: ↑ y ↓ dentro del campo, como en bash. Se guarda en `sessionStorage` para que siga al cambiar de página con `cd`, y se pierde al cerrar la pestaña; sin almacenamiento, dura lo que la página.
- Todo en los cinco idiomas, con IA y sin revisión profesional, como el resto de los mensajes.
- En el ejemplo, la caja «Cómo moverse por el recurso» enumera las órdenes y, detrás de la parábola, una línea propia de Consola (`PISTA_GRAFICA` en `scripts/estilo.py`) invita a dibujarla con `plot` y a comprobar una solución con `calc`. El ejemplo común la toma con `getattr`, así que el estilo Android no cambia.

## Alternativas descartadas

- **`pwd` y `tree`**: repiten lo que ya enseñan el prompt y el índice.
- **`echo`, `date` y `whoami`**: adorno, no ayudan a quien lee.
- **Varias funciones en un mismo `plot`** (separadas por comas, como en gnuplot): se deja para cuando se pida.
- **`eval` o `Function` para las expresiones**: más corto, pero ejecutaría cualquier código escrito en la terminal.

## Validación

- `comprobar-navegador.cjs` en Chromium, Firefox y WebKit: la parábola del ejemplo con sus dos cortes y la línea «# corta el eje X en x = -1 y x = 3»; `x^3-2x` con sus raíces aproximadas; `calc` con resultado entero, decimal, no real y con un símbolo desconocido; `plot --help` y `help calc`; ↑ y ↓; teclear con el foco fuera de los campos (va al prompt) y en el buscador (se queda en él); `clear`. A mano, en los tres motores: al teclear `calc 2+2` e Intro sin haber pulsado nada, la ventana baja hasta el prompt y responde 4.
- A mano: `tan(x)`, `1/x`, `sqrt(x)`, `sin(x)`, `(x-0.3)^2` (raíz doble), una constante y una función sin valores reales en el intervalo. A 320 px la gráfica cabe sin desplazamiento en los tres motores.
- axe-core: los mismos avisos que antes, todos de los iDevices de eXeLearning.
