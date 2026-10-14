# SPDX-License-Identifier: CC-BY-SA-4.0
"""Contenido del recurso de ejemplo «Ecuaciones de segundo grado».

Cada página es un diccionario con su título, la página de la que cuelga y sus
cajas. Las fórmulas van en LaTeX: \\( … \\) dentro del texto y \\[ … \\] en
línea aparte. eXeLearning las dibuja al exportar.
"""

TITULO = "Ecuaciones de segundo grado"
DESCRIPCION = (
    "Recurso de ejemplo sobre la resolución de ecuaciones de segundo grado, "
    "completas e incompletas, presentado con el estilo Consola de eXeLearning."
)
AUTORIA = "Juan José de Haro"
LICENCIA = "creative commons: attribution - share alike 4.0"
LICENCIA_URL = "https://creativecommons.org/licenses/by-sa/4.0/"


def grafica(f, x0, x1, y0, y1, columnas, filas, raices, marcas_x, marcas_y):
    """Dibuja y = f(x) con caracteres, como la terminal «dumb» de gnuplot."""
    dx = (x1 - x0) / (columnas - 1)
    dy = (y1 - y0) / (filas - 1)
    lienzo = [[" "] * columnas for _ in range(filas)]

    def fila(y):
        return round((y1 - y) / dy)

    def columna(x):
        return round((x - x0) / dx)

    eje_x, eje_y = fila(0), columna(0)
    for c in range(columnas):
        lienzo[eje_x][c] = "-"
    for r in range(filas):
        lienzo[r][eje_y] = "|"
    lienzo[eje_x][eje_y] = "+"
    anterior = None
    for c in range(columnas):
        r = fila(f(x0 + c * dx))
        # Si la curva salta más de una fila, se rellena el tramo vertical.
        if anterior is None or abs(r - anterior) <= 1:
            tramo = [r]
        elif r > anterior:
            tramo = range(anterior + 1, r + 1)
        else:
            tramo = range(r, anterior)
        for rr in tramo:
            if 0 <= rr < filas:
                lienzo[rr][c] = "*"
        anterior = r
    for x in raices:
        lienzo[eje_x][columna(x)] = "o"
    ancho = max(len(str(v)) for v in marcas_y)
    lineas = []
    for r in range(filas):
        y = y1 - r * dy
        etiqueta = next((str(v) for v in marcas_y if abs(v - y) < 1e-9), "")
        lineas.append(etiqueta.rjust(ancho) + " " + "".join(lienzo[r]).rstrip())
    base = [" "] * (columnas + 2)
    for v in marcas_x:
        texto = str(v)
        inicio = columna(v) - (len(texto) - 1)
        for i, caracter in enumerate(texto):
            base[inicio + i] = caracter
    lineas.append(" " * (ancho + 1) + "".join(base).rstrip())
    return "\n".join(lineas)


PARABOLA = grafica(lambda x: x * x - 2 * x - 3, -2, 4, -4, 5, 31, 19, [-1, 3], [-1, 1, 2, 3], [5, -4])


def texto(titulo, icono, html, clase="", solucion=None, boton="Ver solución|Ocultar solución"):
    return {"tipo": "text", "titulo": titulo, "icono": icono, "html": html,
            "clase": clase, "solucion": solucion, "boton": boton}


PAGINAS = [
    {
        "titulo": "Inicio",
        "cajas": [
            texto("Bienvenida", "start", r"""
<p>Este recurso explica cómo se resuelven las <strong>ecuaciones de segundo grado</strong>, tanto las incompletas como las completas, con ejemplos resueltos paso a paso y actividades para practicar.</p>
<p>Es también el ejemplo del estilo <strong>Consola</strong> para eXeLearning, que presenta el recurso como una terminal de Linux: cada página es un archivo, el índice es la salida de la orden <code>tree</code> y la barra verde de abajo es la de <code>tmux</code>.</p>"""),
            texto("Qué aprenderás", "objectives", r"""
<ul>
<li>A reconocer una ecuación de segundo grado y sus coeficientes \(a\), \(b\) y \(c\).</li>
<li>A resolver las incompletas sin la fórmula general.</li>
<li>A aplicar la fórmula general a las completas.</li>
<li>A saber cuántas soluciones tiene una ecuación antes de resolverla, con el discriminante.</li>
</ul>""", clase="cli-ok"),
            texto("Cómo moverse por el recurso", "guide", r"""
<ul>
<li>El índice de la izquierda muestra las páginas como las carpetas y los archivos de la orden <code>tree</code>. En el móvil se abre con el botón «Índice» de la barra inferior.</li>
<li>La barra verde lleva a la página anterior y a la siguiente.</li>
<li>Los botones «Ver solución» de los ejercicios muestran la resolución completa.</li>
</ul>""", clase="cli-info"),
        ],
    },
    {
        "titulo": "Qué es una ecuación de segundo grado",
        "cajas": [
            texto("Definición", "book", r"""
<p>Una <strong>ecuación de segundo grado</strong> con una incógnita es la que, después de quitar paréntesis y denominadores y de pasar todos los términos a un miembro, se puede escribir así:</p>
<p>\[ ax^2 + bx + c = 0, \qquad a \neq 0 \]</p>
<p>Los números \(a\), \(b\) y \(c\) son los <strong>coeficientes</strong>: \(a\) acompaña a \(x^2\), \(b\) acompaña a \(x\) y \(c\) es el <strong>término independiente</strong>. El coeficiente \(a\) no puede ser cero, porque entonces no habría término en \(x^2\) y la ecuación sería de primer grado.</p>"""),
            texto("Completas e incompletas", "info", r"""
<p>Si \(b\) y \(c\) son distintos de cero, la ecuación es <strong>completa</strong>. Si alguno de los dos es cero, es <strong>incompleta</strong>, y se resuelve de una forma más sencilla, sin la fórmula general.</p>
<table class="exe-table">
<thead><tr><th>Ecuación</th><th>\(a\)</th><th>\(b\)</th><th>\(c\)</th><th>Tipo</th></tr></thead>
<tbody>
<tr><td>\(2x^2 - 7x + 3 = 0\)</td><td>\(2\)</td><td>\(-7\)</td><td>\(3\)</td><td>completa</td></tr>
<tr><td>\(x^2 - 16 = 0\)</td><td>\(1\)</td><td>\(0\)</td><td>\(-16\)</td><td>incompleta, sin término en \(x\)</td></tr>
<tr><td>\(3x^2 + 12x = 0\)</td><td>\(3\)</td><td>\(12\)</td><td>\(0\)</td><td>incompleta, sin término independiente</td></tr>
<tr><td>\(5x^2 = 0\)</td><td>\(5\)</td><td>\(0\)</td><td>\(0\)</td><td>incompleta, sin los dos</td></tr>
</tbody>
</table>"""),
            texto("Antes de leer los coeficientes", "alert", r"""
<p>Hay que dejar la ecuación en la forma \(ax^2 + bx + c = 0\). Por ejemplo, en \(x^2 = 5x - 6\) el término independiente no es \(-6\): al pasar todo al primer miembro queda \(x^2 - 5x + 6 = 0\), así que \(a = 1\), \(b = -5\) y \(c = 6\).</p>""", clase="cli-warn"),
            texto("Qué significa resolverla", "observe", r"""
<p>Resolver la ecuación es encontrar sus <strong>soluciones</strong> o <strong>raíces</strong>: los valores de \(x\) que la cumplen. Una ecuación de segundo grado tiene <strong>dos soluciones, una o ninguna</strong> entre los números reales.</p>
<p>Las soluciones son los puntos en los que la parábola \(y = ax^2 + bx + c\) corta el eje horizontal. La de \(y = x^2 - 2x - 3\) lo corta en \(x = -1\) y en \(x = 3\), marcados con una <code>o</code>: son las soluciones de \(x^2 - 2x - 3 = 0\).</p>
<figure><pre role="img" aria-label="Parábola y igual a x al cuadrado menos 2x menos 3, que corta el eje horizontal en x igual a menos 1 y en x igual a 3">""" + PARABOLA + r"""</pre>
<figcaption>gnuplot: y = x^2 - 2x - 3, dibujada con caracteres</figcaption></figure>
<p>Se comprueba sustituyendo: \((-1)^2 - 2\cdot(-1) - 3 = 1 + 2 - 3 = 0\) y \(3^2 - 2\cdot 3 - 3 = 9 - 6 - 3 = 0\).</p>"""),
        ],
    },
    {
        "titulo": "Ecuaciones incompletas",
        "cajas": [
            texto("Dos casos", "info", r"""
<p>Una ecuación de segundo grado es incompleta cuando le falta el término en \(x\) (\(b = 0\)) o el término independiente (\(c = 0\)). Cada caso tiene su método, más rápido que la fórmula general:</p>
<table class="exe-table">
<thead><tr><th>Forma</th><th>Le falta</th><th>Método</th><th>Soluciones</th></tr></thead>
<tbody>
<tr><td>\(ax^2 + c = 0\)</td><td>\(b = 0\)</td><td>despejar \(x^2\) y sacar la raíz</td><td>\(x = \pm\sqrt{-\frac{c}{a}}\), si \(-\frac{c}{a} \geq 0\)</td></tr>
<tr><td>\(ax^2 + bx = 0\)</td><td>\(c = 0\)</td><td>sacar factor común \(x\)</td><td>\(x = 0\) y \(x = -\frac{b}{a}\)</td></tr>
</tbody>
</table>
<p>Si faltan los dos, la ecuación es \(ax^2 = 0\) y su única solución es \(x = 0\).</p>"""),
        ],
        "hijas": [
            {
                "titulo": "Sin término en x",
                "cajas": [
                    texto("Método", "guide", r"""
<p>En \(ax^2 + c = 0\) se despeja \(x^2\) y se saca la raíz cuadrada. Como un número y su opuesto tienen el mismo cuadrado, hay que tomar las dos raíces, la positiva y la negativa:</p>
<p>\[ ax^2 + c = 0 \;\Rightarrow\; x^2 = -\frac{c}{a} \;\Rightarrow\; x = \pm\sqrt{-\frac{c}{a}} \]</p>"""),
                    texto("Ejemplo resuelto", "calculate", r"""
<p>Resolvemos \(2x^2 - 50 = 0\).</p>
<p>\[ 2x^2 = 50 \;\Rightarrow\; x^2 = 25 \;\Rightarrow\; x = \pm\sqrt{25} = \pm 5 \]</p>
<p>Soluciones: \(x_1 = 5\) y \(x_2 = -5\). Comprobación: \(2\cdot 5^2 - 50 = 50 - 50 = 0\), y lo mismo con \(-5\), porque \((-5)^2 = 25\).</p>"""),
                    texto("Cuándo no hay solución", "alert", r"""
<p>Si \(-\frac{c}{a}\) es negativo, la ecuación no tiene solución real, porque ningún número real elevado al cuadrado da un resultado negativo. En \(x^2 + 9 = 0\) queda \(x^2 = -9\), y no hay ningún número real cuyo cuadrado sea \(-9\).</p>""", clase="cli-warn"),
                    texto("Error frecuente", "think", r"""
<p>Escribir solo \(x = 5\) al resolver \(x^2 = 25\): se pierde la solución negativa. La ecuación tiene dos soluciones, \(5\) y \(-5\).</p>""", clase="cli-fail"),
                ],
            },
            {
                "titulo": "Sin término independiente",
                "cajas": [
                    texto("Método", "guide", r"""
<p>En \(ax^2 + bx = 0\) se saca factor común \(x\). Un producto vale cero solo si alguno de sus factores es cero, así que la ecuación se separa en dos de primer grado:</p>
<p>\[ ax^2 + bx = 0 \;\Rightarrow\; x\,(ax + b) = 0 \;\Rightarrow\; \begin{cases} x = 0 \\ ax + b = 0 \;\Rightarrow\; x = -\dfrac{b}{a} \end{cases} \]</p>"""),
                    texto("Ejemplo resuelto", "calculate", r"""
<p>Resolvemos \(3x^2 - 12x = 0\).</p>
<p>\[ 3x^2 - 12x = 0 \;\Rightarrow\; 3x\,(x - 4) = 0 \;\Rightarrow\; x_1 = 0, \quad x_2 = 4 \]</p>
<p>Comprobación con \(x = 4\): \(3\cdot 4^2 - 12\cdot 4 = 48 - 48 = 0\).</p>"""),
                    texto("Siempre tiene dos soluciones", "info", r"""
<p>Este tipo de ecuación tiene siempre dos soluciones reales distintas, y una de ellas es \(x = 0\).</p>""", clase="cli-ok"),
                    texto("Error frecuente", "think", r"""
<p>Dividir los dos miembros entre \(x\): de \(3x^2 = 12x\) se pasaría a \(3x = 12\) y se perdería la solución \(x = 0\). No se puede dividir entre \(x\) sin saber si vale cero; por eso se saca factor común.</p>""", clase="cli-fail"),
                ],
            },
        ],
    },
    {
        "titulo": "Ecuaciones completas",
        "cajas": [
            texto("La fórmula general", "info", r"""
<p>Cuando \(a\), \(b\) y \(c\) son distintos de cero, despejar o sacar factor común no basta. Estas ecuaciones se resuelven con la <strong>fórmula general</strong>, que sirve para cualquier ecuación de segundo grado, también para las incompletas.</p>
<p>El número que queda dentro de la raíz, el <strong>discriminante</strong>, dice cuántas soluciones tiene la ecuación antes de calcularlas.</p>"""),
        ],
        "hijas": [
            {
                "titulo": "La fórmula general",
                "cajas": [
                    texto("La fórmula", "math", r"""
<p>\[ x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} \]</p>
<p>El signo \(\pm\) indica que hay que hacer dos cálculos, uno sumando la raíz y otro restándola. Cada uno da una solución.</p>""", clase="cli-marco"),
                    texto("Paso a paso", "roadmap", r"""
<ol>
<li>Pasar todos los términos a un miembro y ordenarlos: \(ax^2 + bx + c = 0\).</li>
<li>Escribir los coeficientes con su signo.</li>
<li>Calcular el discriminante, \(b^2 - 4ac\).</li>
<li>Sustituir en la fórmula y calcular las dos soluciones.</li>
<li>Comprobar el resultado en la ecuación de partida.</li>
</ol>"""),
                    texto("Ejemplo resuelto", "calculate", r"""
<p>Resolvemos \(2x^2 - 7x + 3 = 0\), con \(a = 2\), \(b = -7\) y \(c = 3\).</p>
<p>\[ x = \frac{-(-7) \pm \sqrt{(-7)^2 - 4\cdot 2\cdot 3}}{2\cdot 2} = \frac{7 \pm \sqrt{49 - 24}}{4} = \frac{7 \pm 5}{4} \]</p>
<p>\[ x_1 = \frac{7 + 5}{4} = 3, \qquad x_2 = \frac{7 - 5}{4} = \frac{1}{2} \]</p>
<p>Comprobación: \(2\cdot 3^2 - 7\cdot 3 + 3 = 18 - 21 + 3 = 0\) y \(2\cdot\left(\frac{1}{2}\right)^2 - 7\cdot\frac{1}{2} + 3 = \frac{1}{2} - \frac{7}{2} + 3 = 0\).</p>"""),
                    texto("De dónde sale", "think", r"""
<p>La fórmula se obtiene completando un cuadrado en \(ax^2 + bx + c = 0\).</p>""", solucion=r"""
<p>Se multiplican los dos miembros por \(4a\) y se suma \(b^2\) a los dos:</p>
<p>\[ 4a^2x^2 + 4abx + 4ac = 0 \;\Rightarrow\; 4a^2x^2 + 4abx + b^2 = b^2 - 4ac \]</p>
<p>El primer miembro es el cuadrado de \(2ax + b\). Sacando la raíz cuadrada y despejando \(x\):</p>
<p>\[ (2ax + b)^2 = b^2 - 4ac \;\Rightarrow\; 2ax + b = \pm\sqrt{b^2 - 4ac} \;\Rightarrow\; x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} \]</p>""", boton="Ver de dónde sale|Ocultar"),
                    texto("Error frecuente", "alert", r"""
<p>Olvidar el signo de \(b\). Si \(b = -7\), el numerador empieza por \(-(-7) = 7\). Y \(b^2\) nunca es negativo: \((-7)^2 = 49\), no \(-49\).</p>""", clase="cli-fail"),
                ],
            },
            {
                "titulo": "El discriminante",
                "cajas": [
                    texto("Definición", "book", r"""
<p>El <strong>discriminante</strong> es la expresión que hay dentro de la raíz de la fórmula general. Se representa con la letra griega delta mayúscula:</p>
<p>\[ \Delta = b^2 - 4ac \]</p>"""),
                    texto("Cuántas soluciones hay", "objectives", r"""
<table class="exe-table">
<thead><tr><th>Discriminante</th><th>Soluciones</th><th>Ejemplo</th></tr></thead>
<tbody>
<tr><td>\(\Delta > 0\)</td><td>dos soluciones reales distintas</td><td>\(x^2 - 5x + 6 = 0\): \(\Delta = 25 - 24 = 1\), soluciones \(2\) y \(3\)</td></tr>
<tr><td>\(\Delta = 0\)</td><td>una solución doble, \(x = -\frac{b}{2a}\)</td><td>\(x^2 - 6x + 9 = 0\): \(\Delta = 36 - 36 = 0\), solución \(3\)</td></tr>
<tr><td>\(\Delta < 0\)</td><td>ninguna solución real</td><td>\(x^2 + x + 1 = 0\): \(\Delta = 1 - 4 = -3\)</td></tr>
</tbody>
</table>"""),
                    texto("Por qué", "think", r"""
<p>Si el discriminante es negativo, la fórmula pide la raíz cuadrada de un número negativo, que no existe entre los números reales. Si es cero, sumar o restar \(\sqrt{0}\) da lo mismo, y las dos soluciones coinciden.</p>"""),
                    texto("Un atajo", "info", r"""
<p>Calcular primero el discriminante ahorra trabajo: si es negativo, ya se sabe que la ecuación no tiene solución real y no hace falta seguir.</p>""", clase="cli-info"),
                ],
            },
        ],
    },
    {
        "titulo": "Ejercicios resueltos",
        "cajas": [
            texto("Cómo trabajar", "guide", r"""
<p>Resuelve cada ecuación en tu cuaderno antes de pulsar «Ver solución». Fíjate primero en si es completa o incompleta.</p>""", clase="cli-info"),
            texto("Ejercicio 1", "calculate", r"""<p>Resuelve \(x^2 - 49 = 0\).</p>""", solucion=r"""
<p>Es incompleta, sin término en \(x\):</p>
<p>\[ x^2 = 49 \;\Rightarrow\; x = \pm\sqrt{49} = \pm 7 \]</p>
<p>Soluciones: \(x_1 = 7\) y \(x_2 = -7\).</p>"""),
            texto("Ejercicio 2", "calculate", r"""<p>Resuelve \(5x^2 + 20x = 0\).</p>""", solucion=r"""
<p>Es incompleta, sin término independiente:</p>
<p>\[ 5x\,(x + 4) = 0 \;\Rightarrow\; x_1 = 0, \quad x_2 = -4 \]</p>"""),
            texto("Ejercicio 3", "calculate", r"""<p>Resuelve \(x^2 - 2x - 15 = 0\).</p>""", solucion=r"""
<p>Es completa, con \(a = 1\), \(b = -2\) y \(c = -15\). El discriminante es \(\Delta = 4 + 60 = 64\):</p>
<p>\[ x = \frac{2 \pm \sqrt{64}}{2} = \frac{2 \pm 8}{2} \;\Rightarrow\; x_1 = 5, \quad x_2 = -3 \]</p>"""),
            texto("Ejercicio 4", "calculate", r"""<p>Resuelve \(4x^2 + 4x + 1 = 0\).</p>""", solucion=r"""
<p>El discriminante es \(\Delta = 16 - 16 = 0\): hay una solución doble.</p>
<p>\[ x = \frac{-4}{2\cdot 4} = -\frac{1}{2} \]</p>
<p>La ecuación es \((2x + 1)^2 = 0\), y solo se cumple con \(x = -\frac{1}{2}\).</p>"""),
            texto("Ejercicio 5", "calculate", r"""<p>Resuelve \(3x^2 - x + 2 = 0\).</p>""", solucion=r"""
<p>El discriminante es \(\Delta = (-1)^2 - 4\cdot 3\cdot 2 = 1 - 24 = -23\). Es negativo: la ecuación no tiene solución real.</p>"""),
            texto("Ejercicio 6", "calculate", r"""<p>Resuelve \(x\,(x + 3) = 10\).</p>""", solucion=r"""
<p>Primero se quita el paréntesis y se pasa todo a un miembro: \(x^2 + 3x - 10 = 0\). El discriminante es \(\Delta = 9 + 40 = 49\):</p>
<p>\[ x = \frac{-3 \pm 7}{2} \;\Rightarrow\; x_1 = 2, \quad x_2 = -5 \]</p>
<p>Comprobación: \(2\cdot 5 = 10\) y \((-5)\cdot(-2) = 10\).</p>"""),
            texto("Ejercicio 7", "calculate", r"""<p>Resuelve \((x - 1)^2 = 2x + 7\).</p>""", solucion=r"""
<p>Se desarrolla el cuadrado y se pasa todo a un miembro:</p>
<p>\[ x^2 - 2x + 1 = 2x + 7 \;\Rightarrow\; x^2 - 4x - 6 = 0 \]</p>
<p>El discriminante es \(\Delta = 16 + 24 = 40\), que no es un cuadrado perfecto, así que las soluciones llevan una raíz:</p>
<p>\[ x = \frac{4 \pm \sqrt{40}}{2} = \frac{4 \pm 2\sqrt{10}}{2} = 2 \pm \sqrt{10} \]</p>
<p>Soluciones: \(x_1 = 2 + \sqrt{10} \approx 5{,}16\) y \(x_2 = 2 - \sqrt{10} \approx -1{,}16\).</p>"""),
        ],
    },
    {
        "titulo": "Actividades",
        "cajas": [
            texto("Comprueba lo que sabes", "activity", r"""
<p>Dos actividades para repasar: ordenar los pasos con los que se resuelve una ecuación completa y un test de diez preguntas. Se pueden repetir tantas veces como se quiera.</p>"""),
        ],
        "hijas": [
            {
                "titulo": "Ordena los pasos",
                "cajas": [
                    {
                        "tipo": "scrambled-list",
                        "titulo": "Resolver x² + 2 = 3x",
                        "icono": "pieces",
                        "instrucciones": r"<p>Ordena los pasos para resolver \(x^2 + 2 = 3x\).</p>",
                        "opciones": [
                            r"Pasar todo al primer miembro: \(x^2 - 3x + 2 = 0\).",
                            r"Leer los coeficientes: \(a = 1\), \(b = -3\), \(c = 2\).",
                            r"Calcular el discriminante: \(\Delta = (-3)^2 - 4\cdot 1\cdot 2 = 1\).",
                            r"Aplicar la fórmula: \(x = \frac{3 \pm 1}{2}\).",
                            r"Escribir las soluciones: \(x_1 = 2\), \(x_2 = 1\).",
                            r"Comprobar: \(2^2 + 2 = 3\cdot 2\) y \(1^2 + 2 = 3\cdot 1\).",
                        ],
                    },
                ],
            },
            {
                "titulo": "Test",
                "cajas": [
                    {
                        "tipo": "form",
                        "titulo": "Diez preguntas",
                        "icono": "ask",
                        "instrucciones": "<p>Responde a las preguntas y pulsa «Comprobar» al final. Para superar el test hacen falta cinco aciertos.</p>",
                        "preguntas": [
                            {"activityType": "true-false", "baseText": r"<p>\(x^2 - 3x = 0\) es una ecuación incompleta.</p>", "answer": "1"},
                            {"activityType": "selection", "selectionType": "single", "baseText": r"<p>¿Cuáles son los coeficientes de \(3x^2 - 2 = 5x\)?</p>",
                             "answers": [[True, r"\(a = 3\), \(b = -5\), \(c = -2\)"], [False, r"\(a = 3\), \(b = 5\), \(c = -2\)"], [False, r"\(a = 3\), \(b = -2\), \(c = 5\)"], [False, r"\(a = 3\), \(b = 0\), \(c = -2\)"]]},
                            {"activityType": "selection", "selectionType": "single", "baseText": r"<p>¿Cuáles son las soluciones de \(x^2 - 36 = 0\)?</p>",
                             "answers": [[True, r"\(x = 6\) y \(x = -6\)"], [False, r"Solo \(x = 6\)"], [False, r"\(x = 18\) y \(x = -18\)"], [False, "No tiene solución real"]]},
                            {"activityType": "selection", "selectionType": "single", "baseText": r"<p>¿Cuáles son las soluciones de \(2x^2 + 8x = 0\)?</p>",
                             "answers": [[True, r"\(x = 0\) y \(x = -4\)"], [False, r"\(x = 0\) y \(x = 4\)"], [False, r"Solo \(x = -4\)"], [False, r"\(x = 2\) y \(x = -2\)"]]},
                            {"activityType": "true-false", "baseText": r"<p>La ecuación \(x^2 + 16 = 0\) tiene dos soluciones, \(4\) y \(-4\).</p>", "answer": "0"},
                            {"activityType": "selection", "selectionType": "single", "baseText": r"<p>¿Cuánto vale el discriminante de \(x^2 - 4x + 1 = 0\)?</p>",
                             "answers": [[True, r"\(12\)"], [False, r"\(20\)"], [False, r"\(-12\)"], [False, r"\(4\)"]]},
                            {"activityType": "selection", "selectionType": "single", "baseText": r"<p>¿Cuántas soluciones reales tiene \(9x^2 - 6x + 1 = 0\)?</p>",
                             "answers": [[False, "Dos distintas"], [True, "Una solución doble"], [False, "Ninguna"]]},
                            {"activityType": "selection", "selectionType": "single", "baseText": r"<p>¿Cuáles son las soluciones de \(x^2 + x - 6 = 0\)?</p>",
                             "answers": [[True, r"\(x = 2\) y \(x = -3\)"], [False, r"\(x = -2\) y \(x = 3\)"], [False, r"\(x = 1\) y \(x = -6\)"], [False, "No tiene solución real"]]},
                            {"activityType": "selection", "selectionType": "multiple", "baseText": r"<p>¿Qué ecuaciones no tienen solución real? Marca todas las que lo cumplan.</p>",
                             "answers": [[True, r"\(x^2 + 4 = 0\)"], [False, r"\(x^2 - 4 = 0\)"], [True, r"\(x^2 + x + 2 = 0\)"], [False, r"\(x^2 - 4x + 4 = 0\)"]]},
                            {"activityType": "true-false", "baseText": r"<p>Si \(\Delta = 0\), la única solución es \(x = -\frac{b}{2a}\).</p>", "answer": "1"},
                        ],
                    },
                ],
            },
        ],
    },
    {
        "titulo": "Créditos y descargas",
        "cajas": [
            texto("Créditos", "info", r"""
<p>Estilo <strong>Consola</strong> para eXeLearning y recurso de ejemplo «Ecuaciones de segundo grado», de Juan José de Haro (@jjdeharo).</p>
<ul>
<li>Estilo: licencia <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener">GNU AGPL v3 o posterior</a>, la misma que eXeLearning.</li>
<li>Contenido de este ejemplo: licencia <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.es" target="_blank" rel="noopener">CC BY-SA 4.0</a>.</li>
<li>Tipografía <a href="https://dejavu-fonts.github.io/" target="_blank" rel="noopener">DejaVu Sans Mono</a>, del proyecto DejaVu: licencia de Bitstream Vera, con los cambios de DejaVu en dominio público.</li>
<li>Iconos de los iDevices: <a href="https://fonts.google.com/icons" target="_blank" rel="noopener">Material Symbols</a> de Google, tomados del estilo Zen de eXeLearning y coloreados en verde, bajo la licencia Apache 2.0.</li>
<li>Colores: la paleta del <a href="https://en.wikipedia.org/wiki/Tango_Desktop_Project" target="_blank" rel="noopener">proyecto Tango</a>, la de GNOME Terminal.</li>
<li>La idea y la organización del repositorio siguen los estilos de eXeLearning del Área de Tecnología Educativa del Gobierno de Canarias, de Ernesto Serrano, como <a href="https://ateeducacion.github.io/exelearning-style-teletext/" target="_blank" rel="noopener">eXeTexto</a>.</li>
</ul>"""),
            texto("Uso de inteligencia artificial", "technology", r"""
<p>Estilo y ejemplo hechos con Claude Code (Anthropic) en octubre de 2026, con la dirección y la revisión de su autor: <a href="https://jjdeharo.github.io/miae/?nivel=4" target="_blank" rel="noopener">nivel 4 del MIAE, cocreación</a>.</p>""", clase="cli-info"),
            {"tipo": "download-source-file", "titulo": "Descargar el recurso", "icono": "download"},
        ],
    },
]
