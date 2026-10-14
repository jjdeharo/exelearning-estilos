# 6. Una terminal con cuatro órdenes: ls, cd, grep y help

- Estado: aceptada
- Fecha: 14-10-2026

## Contexto

En la primera versión, el prompt del final de cada página era solo decorativo. Juan José de Haro preguntó qué se podía escribir en él y aprobó que funcionara con cuatro órdenes.

## Decisión

- El prompt del final es un formulario con un campo de texto. Encima, una zona de salida (`role="log"`, `aria-live="polite"`) repite cada orden con su prompt y muestra la respuesta.
- **Modelo de carpetas**: una página con subpáginas es una carpeta y su contenido es su `README.md`; las demás son archivos `.md` de la carpeta de su madre, o de la del recurso. El prompt de la cabecera sigue ese modelo, para que `cd` lleve siempre a donde dice la ruta.
- **Órdenes**:
  - `ls`: entradas de la carpeta, como enlaces; las carpetas en azul y con `/`, como `ls --color`.
  - `cd`: rutas relativas, `..`, `~` y nombres con o sin `.md`; `cd` solo vuelve a la primera página. Como en bash, `cd ..` sube desde la carpeta en la que se está, no desde la página. También abre archivos, no solo carpetas: es más útil para quien no conoce la terminal.
  - `grep`: rellena y envía el buscador de eXeLearning, sin rehacerlo; pasa por alto las opciones (`-i`, `-r`). Ofrece «Volver a la página» en la propia salida, porque en el móvil el botón «Ocultar» del buscador queda dentro del índice cerrado.
  - `help` (también `ayuda`).
- Mensajes en castellano, catalán, gallego, euskera e inglés, según el idioma del recurso, con el formato de los de bash («orden no encontrada», «No existe el archivo o el directorio»). Las traducciones están hechas con IA y sin revisión profesional.
- **Tabulador**: completa la orden o la última parte de la ruta de `cd` y, si hay varias opciones, las lista. Con la línea vacía no actúa, para no atrapar el foco del teclado.
- La barra de estado y el índice siguen siendo la forma principal de moverse: la terminal es un añadido.

## Alternativas descartadas

- **Más órdenes** (`clear`, `history`, `cat`): no se pidieron.
- **Atajos con las flechas o números de página**: chocarían con la escritura en el campo y con las actividades.
- **Foco automático en el campo al cargar**: movería la página hasta el final y robaría el foco al lector de pantalla.

## Validación

`comprobar-navegador.cjs` en Chromium, Firefox y WebKit: `help`, `ls`, orden desconocida, `cd` a una página que no existe, tabulador con la línea escrita y vacía, `grep` con «Volver a la página», y `cd` a una página, a una ruta con `..`, a una carpeta y al inicio. axe-core no encuentra problemas nuevos.
