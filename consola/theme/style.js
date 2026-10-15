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

    // Mensajes de la terminal. Cada %s se sustituye, en orden, por los valores que se pasan.
    // «usos» es la ayuda de cada orden («ORDEN --help» o «help ORDEN»); su primera línea es el uso.
    var MENSAJES = {
        es: {
            entrada: 'Terminal: escribe una orden y pulsa Intro. Escribe help para ver las órdenes.',
            ayuda: ['Órdenes disponibles:',
                '  ls              lista las páginas de esta carpeta',
                '  cd PÁGINA       abre una página; «cd ..» sube un nivel y «cd» vuelve al inicio',
                '  grep PALABRA    busca una palabra en todo el recurso',
                '  plot FUNCIÓN    dibuja una función: plot [-3:5] x^2-2x-3',
                '  calc EXPRESIÓN  calcula: calc 2*5^2-50',
                '  clear           borra la terminal',
                '  help            muestra esta ayuda',
                'Cada orden explica cómo se usa con --help, por ejemplo plot --help.',
                'Las flechas ↑ y ↓ recuperan las órdenes anteriores; el tabulador completa los nombres.'],
            usos: {
                ls: ['Uso: ls',
                    'Lista las páginas de la carpeta en la que estás.',
                    'Las carpetas acaban en «/» y se abren con cd.'],
                cd: ['Uso: cd PÁGINA',
                    'Abre una página.',
                    '',
                    '  cd PÁGINA   abre esa página de esta carpeta',
                    '  cd ..       sube a la carpeta de arriba',
                    '  cd          vuelve al inicio',
                    'Escribe el principio del nombre y pulsa el tabulador para completarlo.'],
                grep: ['Uso: grep PALABRA',
                    'Busca una palabra en todas las páginas y muestra dónde aparece.'],
                plot: ['Uso: plot [INTERVALO] FUNCIÓN',
                    'Dibuja la gráfica de una función de x.',
                    '',
                    '  plot x^2-2x-3          entre x = -10 y x = 10',
                    '  plot [-3:5] x^2-2x-3   entre x = -3 y x = 5',
                    '  plot [-3:5] [-5:6] x^2 también fija el alto',
                    '',
                    'Se escribe como en la calculadora:',
                    '  potencias  x^2  (o x**2)',
                    '  producto   2x  o  2*x',
                    '  funciones  sqrt(x)  abs(x)  sin(x)  cos(x)',
                    '             tan(x)  ln(x)  log(x)  exp(x)',
                    '  constante  pi',
                    'log es el logaritmo decimal y ln, el neperiano;',
                    'los ángulos van en radianes.',
                    '',
                    'Los puntos «o» son los cortes con el eje X;',
                    'debajo de la gráfica se dicen con números.'],
                calc: ['Uso: calc EXPRESIÓN',
                    'Calcula una expresión y escribe el resultado.',
                    '',
                    '  calc 2*5^2-50      da 0',
                    '  calc sqrt(25)      da 5',
                    '  calc 3^2-2*3-3     comprueba que x = 3 es solución',
                    '',
                    'Se escribe como en plot (plot --help), sin la x.'],
                clear: ['Uso: clear',
                    'Borra lo escrito en la terminal.'],
                help: ['Uso: help [ORDEN]',
                    'Sin nada, lista las órdenes; con una orden, explica cómo se usa.',
                    'También vale ORDEN --help.'],
            },
            noOrden: 'bash: %s: orden no encontrada. Escribe help para ver las órdenes.',
            sinAyuda: 'help: no hay ayuda sobre «%s». Escribe help para ver las órdenes.',
            masAyuda: 'Escribe %s --help para ver cómo se usa.',
            noExiste: 'bash: cd: %s: No existe el archivo o el directorio',
            resultados: '%s: resultados arriba.',
            volver: 'Volver a la página',
            sinResultados: '%s: sin resultados',
            noEntiendo: '%s: no se entiende «%s». Escribe %s --help.',
            faltaAlgo: '%s: la expresión está incompleta. Escribe %s --help.',
            conX: 'calc: calcula números; para usar la x, dibuja la función con plot.',
            noReal: 'calc: el resultado no es un número real',
            infinito: 'calc: división entre cero',
            intervalo: 'plot: el intervalo se escribe con dos números de menor a mayor, así: [-3:5]',
            sinValores: 'plot: la función no tiene valores reales entre x = %s y x = %s',
            grafica: 'Gráfica de y = %s entre x = %s y x = %s',
            cortes: '# corta el eje X en %s',
            muchosCortes: '# corta el eje X %s veces entre x = %s y x = %s',
            sinCortes: '# no corta el eje X entre x = %s y x = %s',
            y: 'y',
        },
        ca: {
            entrada: 'Terminal: escriu una ordre i prem Retorn. Escriu help per veure les ordres.',
            ayuda: ['Ordres disponibles:',
                '  ls              llista les pàgines d\'aquesta carpeta',
                '  cd PÀGINA       obre una pàgina; «cd ..» puja un nivell i «cd» torna a l\'inici',
                '  grep PARAULA    cerca una paraula en tot el recurs',
                '  plot FUNCIÓ     dibuixa una funció: plot [-3:5] x^2-2x-3',
                '  calc EXPRESSIÓ  calcula: calc 2*5^2-50',
                '  clear           esborra el terminal',
                '  help            mostra aquesta ajuda',
                'Cada ordre explica com s\'usa amb --help, per exemple plot --help.',
                'Les fletxes ↑ i ↓ recuperen les ordres anteriors; el tabulador completa els noms.'],
            usos: {
                ls: ['Ús: ls',
                    'Llista les pàgines de la carpeta on ets.',
                    'Les carpetes acaben en «/» i s\'obren amb cd.'],
                cd: ['Ús: cd PÀGINA',
                    'Obre una pàgina.',
                    '',
                    '  cd PÀGINA   obre aquesta pàgina de la carpeta',
                    '  cd ..       puja a la carpeta de dalt',
                    '  cd          torna a l\'inici',
                    'Escriu el començament del nom i prem el tabulador per completar-lo.'],
                grep: ['Ús: grep PARAULA',
                    'Cerca una paraula en totes les pàgines i mostra on apareix.'],
                plot: ['Ús: plot [INTERVAL] FUNCIÓ',
                    'Dibuixa la gràfica d\'una funció de x.',
                    '',
                    '  plot x^2-2x-3          entre x = -10 i x = 10',
                    '  plot [-3:5] x^2-2x-3   entre x = -3 i x = 5',
                    '  plot [-3:5] [-5:6] x^2 també fixa l\'alçada',
                    '',
                    'S\'escriu com a la calculadora:',
                    '  potències  x^2  (o x**2)',
                    '  producte   2x  o  2*x',
                    '  funcions   sqrt(x)  abs(x)  sin(x)  cos(x)',
                    '             tan(x)  ln(x)  log(x)  exp(x)',
                    '  constant   pi',
                    'log és el logaritme decimal i ln, el neperià;',
                    'els angles van en radians.',
                    '',
                    'Els punts «o» són els talls amb l\'eix X;',
                    'sota la gràfica es diuen amb números.'],
                calc: ['Ús: calc EXPRESSIÓ',
                    'Calcula una expressió i escriu el resultat.',
                    '',
                    '  calc 2*5^2-50      dona 0',
                    '  calc sqrt(25)      dona 5',
                    '  calc 3^2-2*3-3     comprova que x = 3 és solució',
                    '',
                    'S\'escriu com a plot (plot --help), sense la x.'],
                clear: ['Ús: clear',
                    'Esborra el que hi ha escrit al terminal.'],
                help: ['Ús: help [ORDRE]',
                    'Sense res, llista les ordres; amb una ordre, explica com s\'usa.',
                    'També val ORDRE --help.'],
            },
            noOrden: 'bash: %s: no s\'ha trobat l\'ordre. Escriu help per veure les ordres.',
            sinAyuda: 'help: no hi ha ajuda sobre «%s». Escriu help per veure les ordres.',
            masAyuda: 'Escriu %s --help per veure com s\'usa.',
            noExiste: 'bash: cd: %s: No existeix el fitxer o el directori',
            resultados: '%s: resultats a dalt.',
            volver: 'Torna a la pàgina',
            sinResultados: '%s: cap resultat',
            noEntiendo: '%s: no s\'entén «%s». Escriu %s --help.',
            faltaAlgo: '%s: l\'expressió està incompleta. Escriu %s --help.',
            conX: 'calc: calcula números; per usar la x, dibuixa la funció amb plot.',
            noReal: 'calc: el resultat no és un nombre real',
            infinito: 'calc: divisió entre zero',
            intervalo: 'plot: l\'interval s\'escriu amb dos números de menor a major, així: [-3:5]',
            sinValores: 'plot: la funció no té valors reals entre x = %s i x = %s',
            grafica: 'Gràfica de y = %s entre x = %s i x = %s',
            cortes: '# talla l\'eix X a %s',
            muchosCortes: '# talla l\'eix X %s vegades entre x = %s i x = %s',
            sinCortes: '# no talla l\'eix X entre x = %s i x = %s',
            y: 'i',
        },
        gl: {
            entrada: 'Terminal: escribe unha orde e preme Intro. Escribe help para ver as ordes.',
            ayuda: ['Ordes dispoñibles:',
                '  ls              lista as páxinas deste cartafol',
                '  cd PÁXINA       abre unha páxina; «cd ..» sobe un nivel e «cd» volve ao inicio',
                '  grep PALABRA    busca unha palabra en todo o recurso',
                '  plot FUNCIÓN    debuxa unha función: plot [-3:5] x^2-2x-3',
                '  calc EXPRESIÓN  calcula: calc 2*5^2-50',
                '  clear           borra o terminal',
                '  help            amosa esta axuda',
                'Cada orde explica como se usa con --help, por exemplo plot --help.',
                'As frechas ↑ e ↓ recuperan as ordes anteriores; o tabulador completa os nomes.'],
            usos: {
                ls: ['Uso: ls',
                    'Lista as páxinas do cartafol no que estás.',
                    'Os cartafoles rematan en «/» e ábrense con cd.'],
                cd: ['Uso: cd PÁXINA',
                    'Abre unha páxina.',
                    '',
                    '  cd PÁXINA   abre esa páxina deste cartafol',
                    '  cd ..       sobe ao cartafol de arriba',
                    '  cd          volve ao inicio',
                    'Escribe o comezo do nome e preme o tabulador para completalo.'],
                grep: ['Uso: grep PALABRA',
                    'Busca unha palabra en todas as páxinas e amosa onde aparece.'],
                plot: ['Uso: plot [INTERVALO] FUNCIÓN',
                    'Debuxa a gráfica dunha función de x.',
                    '',
                    '  plot x^2-2x-3          entre x = -10 e x = 10',
                    '  plot [-3:5] x^2-2x-3   entre x = -3 e x = 5',
                    '  plot [-3:5] [-5:6] x^2 tamén fixa o alto',
                    '',
                    'Escríbese coma na calculadora:',
                    '  potencias  x^2  (ou x**2)',
                    '  produto    2x  ou  2*x',
                    '  funcións   sqrt(x)  abs(x)  sin(x)  cos(x)',
                    '             tan(x)  ln(x)  log(x)  exp(x)',
                    '  constante  pi',
                    'log é o logaritmo decimal e ln, o neperiano;',
                    'os ángulos van en radiáns.',
                    '',
                    'Os puntos «o» son os cortes co eixe X;',
                    'debaixo da gráfica dinse con números.'],
                calc: ['Uso: calc EXPRESIÓN',
                    'Calcula unha expresión e escribe o resultado.',
                    '',
                    '  calc 2*5^2-50      dá 0',
                    '  calc sqrt(25)      dá 5',
                    '  calc 3^2-2*3-3     comproba que x = 3 é solución',
                    '',
                    'Escríbese coma en plot (plot --help), sen a x.'],
                clear: ['Uso: clear',
                    'Borra o escrito no terminal.'],
                help: ['Uso: help [ORDE]',
                    'Sen nada, lista as ordes; cunha orde, explica como se usa.',
                    'Tamén vale ORDE --help.'],
            },
            noOrden: 'bash: %s: non se atopou a orde. Escribe help para ver as ordes.',
            sinAyuda: 'help: non hai axuda sobre «%s». Escribe help para ver as ordes.',
            masAyuda: 'Escribe %s --help para ver como se usa.',
            noExiste: 'bash: cd: %s: Non existe o ficheiro ou o directorio',
            resultados: '%s: resultados arriba.',
            volver: 'Volver á páxina',
            sinResultados: '%s: sen resultados',
            noEntiendo: '%s: non se entende «%s». Escribe %s --help.',
            faltaAlgo: '%s: a expresión está incompleta. Escribe %s --help.',
            conX: 'calc: calcula números; para usar a x, debuxa a función con plot.',
            noReal: 'calc: o resultado non é un número real',
            infinito: 'calc: división entre cero',
            intervalo: 'plot: o intervalo escríbese con dous números de menor a maior, así: [-3:5]',
            sinValores: 'plot: a función non ten valores reais entre x = %s e x = %s',
            grafica: 'Gráfica de y = %s entre x = %s e x = %s',
            cortes: '# corta o eixe X en %s',
            muchosCortes: '# corta o eixe X %s veces entre x = %s e x = %s',
            sinCortes: '# non corta o eixe X entre x = %s e x = %s',
            y: 'e',
        },
        eu: {
            entrada: 'Terminala: idatzi agindu bat eta sakatu Sartu. Idatzi help aginduak ikusteko.',
            ayuda: ['Erabil daitezkeen aginduak:',
                '  ls              karpeta honetako orriak zerrendatzen ditu',
                '  cd ORRIA        orri bat irekitzen du; «cd ..» maila bat igotzen da eta «cd» hasierara itzultzen da',
                '  grep HITZA      hitz bat bilatzen du baliabide osoan',
                '  plot FUNTZIOA   funtzio bat marrazten du: plot [-3:5] x^2-2x-3',
                '  calc ADIERAZPENA  kalkulatzen du: calc 2*5^2-50',
                '  clear           terminala garbitzen du',
                '  help            laguntza hau erakusten du',
                'Agindu bakoitzak --help-ekin azaltzen du nola erabili, adibidez plot --help.',
                '↑ eta ↓ geziek aurreko aginduak berreskuratzen dituzte; tabulagailuak izenak osatzen ditu.'],
            usos: {
                ls: ['Erabilera: ls',
                    'Zauden karpetako orriak zerrendatzen ditu.',
                    'Karpetak «/» ikurrarekin amaitzen dira eta cd-rekin irekitzen dira.'],
                cd: ['Erabilera: cd ORRIA',
                    'Orri bat irekitzen du.',
                    '',
                    '  cd ORRIA    karpeta honetako orri hori irekitzen du',
                    '  cd ..       goiko karpetara igotzen da',
                    '  cd          hasierara itzultzen da',
                    'Idatzi izenaren hasiera eta sakatu tabulagailua osatzeko.'],
                grep: ['Erabilera: grep HITZA',
                    'Hitz bat bilatzen du orri guztietan eta non agertzen den erakusten du.'],
                plot: ['Erabilera: plot [TARTEA] FUNTZIOA',
                    'x-ren funtzio baten grafikoa marrazten du.',
                    '',
                    '  plot x^2-2x-3          x = -10 eta x = 10 artean',
                    '  plot [-3:5] x^2-2x-3   x = -3 eta x = 5 artean',
                    '  plot [-3:5] [-5:6] x^2 altuera ere finkatzen du',
                    '',
                    'Kalkulagailuan bezala idazten da:',
                    '  berreturak  x^2  (edo x**2)',
                    '  biderkadura 2x  edo  2*x',
                    '  funtzioak   sqrt(x)  abs(x)  sin(x)  cos(x)',
                    '              tan(x)  ln(x)  log(x)  exp(x)',
                    '  konstantea  pi',
                    'log logaritmo hamartarra da, eta ln, nepertarra;',
                    'angeluak radianetan doaz.',
                    '',
                    '«o» puntuak X ardatzarekiko ebakidurak dira;',
                    'grafikoaren azpian zenbakiekin esaten dira.'],
                calc: ['Erabilera: calc ADIERAZPENA',
                    'Adierazpen bat kalkulatzen du eta emaitza idazten du.',
                    '',
                    '  calc 2*5^2-50      0 ematen du',
                    '  calc sqrt(25)      5 ematen du',
                    '  calc 3^2-2*3-3     x = 3 soluzioa dela egiaztatzen du',
                    '',
                    'plot-en bezala idazten da (plot --help), x gabe.'],
                clear: ['Erabilera: clear',
                    'Terminalean idatzitakoa garbitzen du.'],
                help: ['Erabilera: help [AGINDUA]',
                    'Ezer gabe, aginduak zerrendatzen ditu; agindu batekin, nola erabili azaltzen du.',
                    'AGINDUA --help ere balio du.'],
            },
            noOrden: 'bash: %s: ez da agindua aurkitu. Idatzi help aginduak ikusteko.',
            sinAyuda: 'help: ez dago «%s»-ri buruzko laguntzarik. Idatzi help aginduak ikusteko.',
            masAyuda: 'Idatzi %s --help nola erabili ikusteko.',
            noExiste: 'bash: cd: %s: Ez dago halako fitxategi edo direktoriorik',
            resultados: '%s: emaitzak goian.',
            volver: 'Itzuli orrira',
            sinResultados: '%s: ez dago emaitzarik',
            noEntiendo: '%s: ez da ulertzen «%s». Idatzi %s --help.',
            faltaAlgo: '%s: adierazpena osatu gabe dago. Idatzi %s --help.',
            conX: 'calc: zenbakiak kalkulatzen ditu; x erabiltzeko, marraztu funtzioa plot-ekin.',
            noReal: 'calc: emaitza ez da zenbaki erreala',
            infinito: 'calc: zeroz zatitzea',
            intervalo: 'plot: tartea bi zenbakirekin idazten da, txikienetik handienera, honela: [-3:5]',
            sinValores: 'plot: funtzioak ez du balio errealik x = %s eta x = %s artean',
            grafica: 'y = %s funtzioaren grafikoa, x = %s eta x = %s artean',
            cortes: '# X ardatza ebakitzen du hemen: %s',
            muchosCortes: '# X ardatza %s aldiz ebakitzen du x = %s eta x = %s artean',
            sinCortes: '# ez du X ardatza ebakitzen x = %s eta x = %s artean',
            y: 'eta',
        },
        en: {
            entrada: 'Terminal: type a command and press Enter. Type help to see the commands.',
            ayuda: ['Available commands:',
                '  ls              list the pages in this folder',
                '  cd PAGE         open a page; "cd .." goes up one level and "cd" goes back to the start',
                '  grep WORD       search the whole resource for a word',
                '  plot FUNCTION   draw a function: plot [-3:5] x^2-2x-3',
                '  calc EXPRESSION calculate: calc 2*5^2-50',
                '  clear           clear the terminal',
                '  help            show this help',
                'Every command explains how to use it with --help, for example plot --help.',
                'The ↑ and ↓ arrows bring back earlier commands; Tab completes names.'],
            usos: {
                ls: ['Usage: ls',
                    'List the pages in the folder you are in.',
                    'Folders end in "/" and open with cd.'],
                cd: ['Usage: cd PAGE',
                    'Open a page.',
                    '',
                    '  cd PAGE     open that page in this folder',
                    '  cd ..       go up to the folder above',
                    '  cd          go back to the start',
                    'Type the beginning of the name and press Tab to complete it.'],
                grep: ['Usage: grep WORD',
                    'Search every page for a word and show where it appears.'],
                plot: ['Usage: plot [RANGE] FUNCTION',
                    'Draw the graph of a function of x.',
                    '',
                    '  plot x^2-2x-3          from x = -10 to x = 10',
                    '  plot [-3:5] x^2-2x-3   from x = -3 to x = 5',
                    '  plot [-3:5] [-5:6] x^2 also sets the height',
                    '',
                    'Write it as on a calculator:',
                    '  powers     x^2  (or x**2)',
                    '  product    2x  or  2*x',
                    '  functions  sqrt(x)  abs(x)  sin(x)  cos(x)',
                    '             tan(x)  ln(x)  log(x)  exp(x)',
                    '  constant   pi',
                    'log is the common logarithm and ln the natural one;',
                    'angles are in radians.',
                    '',
                    'The "o" points are where it crosses the X axis;',
                    'below the graph they are given as numbers.'],
                calc: ['Usage: calc EXPRESSION',
                    'Calculate an expression and print the result.',
                    '',
                    '  calc 2*5^2-50      gives 0',
                    '  calc sqrt(25)      gives 5',
                    '  calc 3^2-2*3-3     checks that x = 3 is a solution',
                    '',
                    'Written as in plot (plot --help), without x.'],
                clear: ['Usage: clear',
                    'Clear what is written in the terminal.'],
                help: ['Usage: help [COMMAND]',
                    'On its own, list the commands; with a command, explain how to use it.',
                    'COMMAND --help works too.'],
            },
            noOrden: 'bash: %s: command not found. Type help to see the commands.',
            sinAyuda: 'help: no help on "%s". Type help to see the commands.',
            masAyuda: 'Type %s --help to see how to use it.',
            noExiste: 'bash: cd: %s: No such file or directory',
            resultados: '%s: results above.',
            volver: 'Back to the page',
            sinResultados: '%s: no results',
            noEntiendo: '%s: cannot understand "%s". Type %s --help.',
            faltaAlgo: '%s: the expression is incomplete. Type %s --help.',
            conX: 'calc: calculates numbers; to use x, draw the function with plot.',
            noReal: 'calc: the result is not a real number',
            infinito: 'calc: division by zero',
            intervalo: 'plot: write the range as two numbers from lower to higher, like this: [-3:5]',
            sinValores: 'plot: the function has no real values between x = %s and x = %s',
            grafica: 'Graph of y = %s from x = %s to x = %s',
            cortes: '# crosses the X axis at %s',
            muchosCortes: '# crosses the X axis %s times between x = %s and x = %s',
            sinCortes: '# does not cross the X axis between x = %s and x = %s',
            y: 'and',
        },
    };
    var ORDENES = ['calc', 'cd', 'clear', 'grep', 'help', 'ls', 'plot'];

    var idioma = (raiz.lang || 'es').slice(0, 2);
    var estrecha = window.matchMedia('(max-width: 59.99rem)');
    // La misma condición que en style.css: la ventana tiene alto fijo y se desplaza por dentro.
    var ventanaFija = window.matchMedia('(min-width: 60rem) and (min-height: 30rem)');
    var sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
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

    /* ---------- La terminal: ls, cd, grep, plot, calc, clear y help ---------- */

    function mensaje(clave) {
        var lista = MENSAJES[idioma] || MENSAJES.en;
        var cadena = lista[clave];
        if (typeof cadena !== 'string') return cadena;
        for (var i = 1; i < arguments.length; i++) cadena = cadena.replace('%s', arguments[i]);
        return cadena;
    }

    function escribir(lineas, clase) {
        [].concat(lineas).forEach(function (linea) {
            // Una línea vacía lleva un espacio para que ocupe su alto, como en la terminal.
            piezas.salida.append(crear('div', 'cli-salida-linea' + (clase ? ' ' + clase : ''), String(linea) || ' '));
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
        if (!palabra) return uso('grep');
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

    /* ---------- calc y plot: expresiones como en la calculadora ---------- */

    var FUNCIONES = {
        sqrt: Math.sqrt,
        abs: Math.abs,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        ln: Math.log,
        log: Math.log10,
        exp: Math.exp,
    };
    // Los nombres que se reconocen dentro de una palabra: «2xpi» es 2 · x · π.
    var NOMBRES = Object.keys(FUNCIONES).concat(['pi', 'x']).sort(function (a, b) {
        return b.length - a.length;
    });

    // Un fallo de escritura: el símbolo que no se entiende, o nada si la expresión se queda a medias.
    function ErrorDeExpresion(simbolo) {
        this.simbolo = simbolo;
    }

    function trocear(fuente) {
        var fichas = [];
        var patron = /\s*(?:(\d+(?:[.,]\d*)?|[.,]\d+)|([a-zA-Z]+)|(\*\*|[-+*\/^()]))/y;
        var pos = 0;
        fuente = fuente.trim();
        while (pos < fuente.length) {
            patron.lastIndex = pos;
            var trozo = patron.exec(fuente);
            if (!trozo) throw new ErrorDeExpresion(fuente.slice(pos).trim().charAt(0));
            pos = patron.lastIndex;
            if (trozo[1]) {
                fichas.push({ tipo: 'numero', valor: parseFloat(trozo[1].replace(',', '.')) });
            } else if (trozo[2]) {
                var palabra = trozo[2].toLowerCase();
                while (palabra) {
                    var nombre = NOMBRES.filter(function (candidato) {
                        return palabra.indexOf(candidato) === 0;
                    })[0];
                    if (!nombre) throw new ErrorDeExpresion(trozo[2]);
                    fichas.push({ tipo: 'nombre', valor: nombre });
                    palabra = palabra.slice(nombre.length);
                }
            } else {
                fichas.push({ tipo: 'signo', valor: trozo[3] === '**' ? '^' : trozo[3] });
            }
        }
        return fichas;
    }

    // Convierte el texto en una función de x, sin eval: suma, producto (también «2x»),
    // signo, potencia (por la derecha: 2^3^2 = 2^9) y, dentro, números, x, pi y funciones.
    function compilar(fuente) {
        var fichas = trocear(fuente);
        var pos = 0;
        var resultado = { usaX: false };

        function mira(valor) {
            var ficha = fichas[pos];
            return ficha && (valor === undefined || ficha.valor === valor) ? ficha : null;
        }
        function exige(valor) {
            if (!mira(valor)) throw new ErrorDeExpresion(fichas[pos] ? fichas[pos].valor : '');
            pos++;
        }
        function suma() {
            var a = producto();
            while (mira('+') || mira('-')) {
                var resta = fichas[pos++].valor === '-';
                a = (function (izquierda, derecha) {
                    return resta
                        ? function (x) { return izquierda(x) - derecha(x); }
                        : function (x) { return izquierda(x) + derecha(x); };
                })(a, producto());
            }
            return a;
        }
        function producto() {
            var a = signo();
            for (;;) {
                var division = false;
                var b;
                if (mira('*') || mira('/')) {
                    division = fichas[pos++].valor === '/';
                    b = signo();
                } else if (mira() && (mira().tipo !== 'signo' || mira('('))) {
                    b = potencia();
                } else {
                    return a;
                }
                a = (function (izquierda, derecha, dividir) {
                    return dividir
                        ? function (x) { return izquierda(x) / derecha(x); }
                        : function (x) { return izquierda(x) * derecha(x); };
                })(a, b, division);
            }
        }
        function signo() {
            if (mira('-')) {
                pos++;
                var a = signo();
                return function (x) { return -a(x); };
            }
            if (mira('+')) {
                pos++;
                return signo();
            }
            return potencia();
        }
        function potencia() {
            var base = elemento();
            if (!mira('^')) return base;
            pos++;
            var exponente = signo();
            return function (x) { return Math.pow(base(x), exponente(x)); };
        }
        function elemento() {
            var ficha = fichas[pos++];
            if (!ficha) throw new ErrorDeExpresion('');
            if (ficha.tipo === 'numero') return function () { return ficha.valor; };
            if (ficha.valor === 'x') {
                resultado.usaX = true;
                return function (x) { return x; };
            }
            if (ficha.valor === 'pi') return function () { return Math.PI; };
            if (FUNCIONES[ficha.valor]) {
                var funcion = FUNCIONES[ficha.valor];
                exige('(');
                var argumento = suma();
                exige(')');
                return function (x) { return funcion(argumento(x)); };
            }
            if (ficha.valor === '(') {
                var dentro = suma();
                exige(')');
                return dentro;
            }
            throw new ErrorDeExpresion(ficha.valor);
        }

        resultado.f = suma();
        if (pos < fichas.length) throw new ErrorDeExpresion(fichas[pos].valor);
        return resultado;
    }

    // Una expresión mal escrita: dice qué símbolo no se entiende o que falta algo.
    function errorDeExpresion(orden, error) {
        if (!(error instanceof ErrorDeExpresion)) throw error;
        if (error.simbolo) escribir(mensaje('noEntiendo', orden, error.simbolo, orden), 'cli-error');
        else escribir(mensaje('faltaAlgo', orden, orden), 'cli-error');
    }

    // Hasta tres decimales; «≈» si el número se ha redondeado.
    function numero(valor, aproximado) {
        var redondeado = Math.round(valor * 1000) / 1000;
        if (Object.is(redondeado, -0)) redondeado = 0;
        var cadena = String(redondeado);
        if (aproximado && Math.abs(valor - redondeado) > 1e-9) cadena = '≈ ' + cadena;
        return cadena;
    }

    function ordenCalc(expresion) {
        if (!expresion) return uso('calc');
        var compilada;
        try {
            compilada = compilar(expresion);
        } catch (error) {
            return errorDeExpresion('calc', error);
        }
        if (compilada.usaX) return escribir(mensaje('conX'), 'cli-error');
        var valor = compilada.f(0);
        if (isNaN(valor)) return escribir(mensaje('noReal'), 'cli-error');
        if (!isFinite(valor)) return escribir(mensaje('infinito'), 'cli-error');
        // Doce cifras significativas: 0.1+0.2 da 0.3 y no 0.30000000000000004.
        var resultado = Number(valor.toPrecision(12));
        escribir(String(Object.is(resultado, -0) ? 0 : resultado));
    }

    // Un paso «redondo» (1, 2 o 5 por una potencia de 10) cercano al que se pide.
    function pasoRedondo(aproximado) {
        var potencia = Math.pow(10, Math.floor(Math.log10(aproximado)));
        var cociente = aproximado / potencia;
        return (cociente < 1.5 ? 1 : cociente < 3.5 ? 2 : cociente < 7.5 ? 5 : 10) * potencia;
    }

    // Los puntos en los que la función corta el eje X o lo toca: cambios de signo, que se
    // afinan por bisección (descartando asíntotas), y mínimos de |f| que llegan a cero.
    function cortes(f, x0, x1) {
        var muestras = 2000;
        var paso = (x1 - x0) / muestras;
        var xs = [];
        var ys = [];
        for (var i = 0; i <= muestras; i++) {
            xs.push(x0 + i * paso);
            ys.push(f(xs[i]));
        }
        var encontrados = [];
        for (var j = 0; j <= muestras; j++) {
            var ya = ys[j];
            var yb = ys[j + 1];
            if (!isFinite(ya)) continue;
            if (ya === 0) {
                encontrados.push(xs[j]);
            } else if (j < muestras && isFinite(yb) && yb !== 0 && (ya < 0) !== (yb < 0)) {
                var a = xs[j];
                var b = xs[j + 1];
                var fa = ya;
                for (var k = 0; k < 60; k++) {
                    var m = (a + b) / 2;
                    var fm = f(m);
                    if ((fm < 0) === (fa < 0)) { a = m; fa = fm; } else { b = m; }
                }
                var raiz = (a + b) / 2;
                if (Math.abs(f(raiz)) < 1e-6 * Math.max(1, Math.abs(ya), Math.abs(yb))) encontrados.push(raiz);
            } else if (j > 0 && j < muestras && isFinite(ys[j - 1]) && isFinite(yb)
                && Math.abs(ya) < Math.abs(ys[j - 1]) && Math.abs(ya) <= Math.abs(yb)
                && (ys[j - 1] < 0) === (ya < 0) && (yb < 0) === (ya < 0)) {
                var izquierda = xs[j - 1];
                var derecha = xs[j + 1];
                for (var n = 0; n < 100; n++) {
                    var tercio1 = izquierda + (derecha - izquierda) / 3;
                    var tercio2 = derecha - (derecha - izquierda) / 3;
                    if (Math.abs(f(tercio1)) < Math.abs(f(tercio2))) derecha = tercio2; else izquierda = tercio1;
                }
                var toque = (izquierda + derecha) / 2;
                if (Math.abs(f(toque)) < 1e-9) encontrados.push(toque);
            }
        }
        var unicos = [];
        encontrados.sort(function (p, q) { return p - q; }).forEach(function (valor) {
            if (!unicos.length || valor - unicos[unicos.length - 1] > paso) unicos.push(valor);
        });
        return unicos;
    }

    // El alto de la gráfica: del menor al mayor valor, redondeados a un paso redondo. Si hay
    // una asíntota (tan, 1/x), se dejan fuera los valores extremos para que se vea la curva.
    function altoAutomatico(f, x0, x1) {
        var valores = [];
        for (var i = 0; i <= 400; i++) {
            var y = f(x0 + (x1 - x0) * i / 400);
            if (isFinite(y)) valores.push(y);
        }
        if (!valores.length) return null;
        valores.sort(function (a, b) { return a - b; });
        var y0 = valores[0];
        var y1 = valores[valores.length - 1];
        var q05 = valores[Math.floor(valores.length * 0.05)];
        var q95 = valores[Math.floor(valores.length * 0.95)];
        if (q95 > q05 && y1 - y0 > 10 * (q95 - q05)) {
            y0 = q05;
            y1 = q95;
        }
        if (y1 - y0 < 1e-9) {
            y0 -= 1;
            y1 += 1;
        }
        var paso = pasoRedondo((y1 - y0) / 10);
        return [Math.floor(y0 / paso + 1e-9) * paso, Math.ceil(y1 / paso - 1e-9) * paso];
    }

    // Cuántos caracteres caben a lo ancho en la salida de la terminal.
    function caracteresDeAncho() {
        var medida = crear('span', 'cli-salida-linea', '0000000000');
        medida.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
        piezas.salida.append(medida);
        var ancho = medida.getBoundingClientRect().width / 10;
        medida.remove();
        return Math.floor(piezas.salida.clientWidth / (ancho || 10));
    }

    // Dibuja y = f(x) con caracteres, como la terminal «dumb» de gnuplot: ejes con «-», «|» y «+»,
    // la curva con «*» y los cortes con el eje X con «o».
    function dibujarGrafica(f, x0, x1, y0, y1, raices) {
        var filas = 21;
        var dy = (y1 - y0) / (filas - 1);
        var fila = function (y) { return Math.round((y1 - y) / dy); };
        var fila0 = 0 >= y0 && 0 <= y1 ? fila(0) : null;
        var etiquetas = {};
        etiquetas[0] = numero(y1);
        etiquetas[filas - 1] = numero(y0);
        if (fila0 !== null && fila0 > 0 && fila0 < filas - 1) etiquetas[fila0] = '0';
        var margen = Math.max(etiquetas[0].length, etiquetas[filas - 1].length);
        var columnas = Math.max(20, Math.min(71, caracteresDeAncho() - margen - 1));
        var dx = (x1 - x0) / (columnas - 1);
        var columna = function (x) { return Math.round((x - x0) / dx); };
        var columna0 = 0 >= x0 && 0 <= x1 ? columna(0) : null;

        var lienzo = [];
        for (var r = 0; r < filas; r++) {
            lienzo.push([]);
            for (var c = 0; c < columnas; c++) lienzo[r].push(' ');
        }
        var poner = function (r, c, caracter) {
            if (r >= 0 && r < filas && c >= 0 && c < columnas) lienzo[r][c] = caracter;
        };
        if (fila0 !== null) for (var c1 = 0; c1 < columnas; c1++) poner(fila0, c1, '-');
        if (columna0 !== null) for (var r1 = 0; r1 < filas; r1++) poner(r1, columna0, '|');
        if (fila0 !== null && columna0 !== null) poner(fila0, columna0, '+');

        var anterior = null;
        var yAnterior = null;
        for (var c2 = 0; c2 < columnas; c2++) {
            var y = f(x0 + c2 * dx);
            if (!isFinite(y)) {
                anterior = null;
                continue;
            }
            var actual = fila(y);
            // Un salto mayor que todo el alto es una asíntota: no se une.
            var unir = anterior !== null && Math.abs(y - yAnterior) <= y1 - y0;
            var desde = unir && actual > anterior + 1 ? anterior + 1 : actual;
            var hasta = unir && actual < anterior - 1 ? anterior - 1 : actual;
            for (var r2 = Math.min(desde, hasta); r2 <= Math.max(desde, hasta); r2++) poner(r2, c2, '*');
            anterior = actual;
            yAnterior = y;
        }
        if (fila0 !== null) raices.forEach(function (raiz) { poner(fila0, columna(raiz), 'o'); });

        // Marcas del eje X: un paso redondo cada 12 columnas, más o menos, sin que se monten.
        var base = [];
        for (var c3 = 0; c3 < columnas + 4; c3++) base.push(' ');
        var paso = pasoRedondo((x1 - x0) / Math.max(1, columnas / 12));
        var ultima = -2;
        for (var marca = Math.ceil(x0 / paso - 1e-9) * paso; marca <= x1 + 1e-9; marca += paso) {
            var rotulo = numero(marca);
            var inicio = Math.max(0, columna(marca) - (rotulo.length - 1));
            if (inicio <= ultima + 1 || inicio + rotulo.length > base.length) continue;
            for (var i = 0; i < rotulo.length; i++) base[inicio + i] = rotulo.charAt(i);
            ultima = inicio + rotulo.length - 1;
        }

        var dibujo = crear('pre', 'cli-grafica');
        var añadir = function (texto, clase) {
            if (!texto) return;
            dibujo.append(clase ? crear('span', clase, texto) : document.createTextNode(texto));
        };
        lienzo.forEach(function (caracteres, r3) {
            añadir((etiquetas[r3] || '').padStart(margen) + ' ', 'cli-grafica-rotulo');
            // Se agrupan los caracteres seguidos de la misma clase en un solo elemento.
            var linea = caracteres.join('').replace(/\s+$/, '');
            linea.replace(/\*+|o+|[^*o]+/g, function (tramo) {
                añadir(tramo, tramo.charAt(0) === '*' ? 'cli-curva' : tramo.charAt(0) === 'o' ? 'cli-corte' : 'cli-eje');
                return tramo;
            });
            añadir('\n');
        });
        añadir(' '.repeat(margen + 1) + base.join('').replace(/\s+$/, ''), 'cli-grafica-rotulo');
        return dibujo;
    }

    // «plot [x0:x1] [y0:y1] FUNCIÓN», como en gnuplot; «y =» delante se acepta y se quita.
    function ordenPlot(resto) {
        var rangos = [];
        var trozo;
        var patronRango = /^\[([^\]]*)\]\s*/;
        while (rangos.length < 2 && (trozo = patronRango.exec(resto))) {
            var limites = trozo[1].split(':');
            var valores;
            try {
                valores = limites.length === 2 ? limites.map(function (limite) {
                    var compilada = compilar(limite);
                    return compilada.usaX ? NaN : compilada.f(0);
                }) : [NaN, NaN];
            } catch (error) {
                valores = [NaN, NaN];
            }
            if (!isFinite(valores[0]) || !isFinite(valores[1]) || valores[0] >= valores[1]) {
                return escribir(mensaje('intervalo'), 'cli-error');
            }
            rangos.push(valores);
            resto = resto.slice(trozo[0].length);
        }
        var expresion = resto.replace(/^\s*(?:y|f\s*\(\s*x\s*\))\s*=\s*/i, '').trim();
        if (!expresion) return uso('plot');
        var compilada;
        try {
            compilada = compilar(expresion);
        } catch (error) {
            return errorDeExpresion('plot', error);
        }
        var x0 = rangos[0] ? rangos[0][0] : -10;
        var x1 = rangos[0] ? rangos[0][1] : 10;
        var alto = rangos[1] || altoAutomatico(compilada.f, x0, x1);
        if (!alto) return escribir(mensaje('sinValores', numero(x0), numero(x1)), 'cli-error');
        var raices = cortes(compilada.f, x0, x1);
        var dibujo = dibujarGrafica(compilada.f, x0, x1, alto[0], alto[1], raices);
        dibujo.setAttribute('role', 'img');
        dibujo.setAttribute('aria-label', mensaje('grafica', expresion, numero(x0), numero(x1)));
        piezas.salida.append(dibujo);
        var resumen;
        if (!raices.length) {
            resumen = mensaje('sinCortes', numero(x0), numero(x1));
        } else if (raices.length > 8) {
            resumen = mensaje('muchosCortes', raices.length, numero(x0), numero(x1));
        } else {
            var lista = raices.map(function (raiz) {
                var valor = numero(raiz, true);
                return 'x ' + (valor.indexOf('≈') === 0 ? valor : '= ' + valor);
            });
            var ultimo = lista.pop();
            resumen = mensaje('cortes', lista.length ? lista.join(', ') + ' ' + mensaje('y') + ' ' + ultimo : ultimo);
        }
        escribir(resumen, 'cli-comentario');
    }

    /* ---------- Ayuda de cada orden ---------- */

    function ayudaDe(orden) {
        var usos = (MENSAJES[idioma] || MENSAJES.en).usos;
        if (!usos[orden]) return escribir(mensaje('sinAyuda', orden), 'cli-error');
        escribir(usos[orden]);
    }

    // Sin lo necesario: la línea de uso y cómo ver la ayuda completa.
    function uso(orden) {
        escribir([(MENSAJES[idioma] || MENSAJES.en).usos[orden][0], mensaje('masAyuda', orden)]);
    }

    /* ---------- Historial: las flechas ↑ y ↓, como en bash ---------- */

    // Se guarda en la pestaña (sessionStorage) para que siga al pasar de página con cd.
    function leerHistorial() {
        try {
            var guardado = JSON.parse(sessionStorage.getItem('cli-historial'));
            return Array.isArray(guardado) ? guardado : [];
        } catch (error) {
            return [];
        }
    }

    function anotarEnHistorial(linea) {
        var historial = piezas.historial;
        if (linea.trim() && historial[historial.length - 1] !== linea) historial.push(linea);
        if (historial.length > 100) historial.splice(0, historial.length - 100);
        piezas.posicion = historial.length;
        try {
            sessionStorage.setItem('cli-historial', JSON.stringify(historial));
        } catch (error) {
            // Sin almacenamiento, el historial dura lo que la página.
        }
    }

    function recorrerHistorial(campo, sentido) {
        var historial = piezas.historial;
        if (!historial.length) return;
        if (piezas.posicion === historial.length) piezas.borrador = campo.value;
        piezas.posicion = Math.max(0, Math.min(historial.length, piezas.posicion + sentido));
        campo.value = piezas.posicion === historial.length ? piezas.borrador || '' : historial[piezas.posicion];
        campo.setSelectionRange(campo.value.length, campo.value.length);
    }

    function ejecutar(linea) {
        var eco = prompt(rutaDe(carpetaDe(estado.actual)), linea);
        eco.className = 'cli-salida-linea cli-eco';
        eco.removeAttribute('aria-hidden');
        piezas.salida.append(eco);
        anotarEnHistorial(linea);
        var partes = linea.trim().split(/\s+/);
        var orden = partes[0];
        var argumentos = partes.slice(1);
        var resto = linea.trim().slice(orden.length).trim();
        if (!orden) return;
        if (ORDENES.indexOf(orden) >= 0 && (argumentos.indexOf('--help') >= 0 || argumentos.indexOf('-h') >= 0)) {
            return ayudaDe(orden);
        }
        if (orden === 'help' || orden === 'ayuda') {
            if (argumentos[0]) ayudaDe(argumentos[0]);
            else escribir(mensaje('ayuda'));
        } else if (orden === 'ls') ordenLs();
        else if (orden === 'cd') ordenCd(argumentos[0]);
        else if (orden === 'grep') ordenGrep(argumentos);
        else if (orden === 'plot') ordenPlot(resto);
        else if (orden === 'calc') ordenCalc(resto);
        else if (orden === 'clear') piezas.salida.textContent = '';
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
        piezas.historial = leerHistorial();
        piezas.posicion = piezas.historial.length;
        campo.addEventListener('keydown', function (evento) {
            if (evento.key === 'Tab' && !evento.shiftKey && completar(campo)) evento.preventDefault();
            if (evento.key === 'ArrowUp' || evento.key === 'ArrowDown') {
                evento.preventDefault();
                recorrerHistorial(campo, evento.key === 'ArrowUp' ? -1 : 1);
            }
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
        document.addEventListener('keydown', desplazarVentana);
    }

    // Con la ventana fija, la pestaña no se desplaza: si el foco no está en ningún control,
    // las teclas de desplazamiento mueven la página de la ventana, como harían con la pestaña.
    function desplazarVentana(evento) {
        if (!ventanaFija.matches || evento.defaultPrevented || evento.altKey || evento.ctrlKey || evento.metaKey) return;
        var foco = document.activeElement;
        if (foco && foco !== document.body && foco !== document.documentElement) return;
        var pagina = document.querySelector('.exe-web-site main.page');
        var linea = 40;
        var hoja = pagina.clientHeight * 0.875;
        var saltos = {
            ArrowDown: linea,
            ArrowUp: -linea,
            PageDown: hoja,
            PageUp: -hoja,
            ' ': evento.shiftKey ? -hoja : hoja,
            Home: -pagina.scrollHeight,
            End: pagina.scrollHeight
        };
        if (!(evento.key in saltos)) return;
        evento.preventDefault();
        pagina.scrollBy({ top: saltos[evento.key], behavior: evento.repeat || sinMovimiento.matches ? 'auto' : 'smooth' });
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
