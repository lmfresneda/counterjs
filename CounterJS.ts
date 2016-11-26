/**
 * CounterJS v0.0.1
 * @author luis.miguel
 */

class Counter {
    private static __instance: Counter;
    private __callback: any;
    private __app: string = "";
    private __toCount: boolean = true;
    private __globalInterval: number = 0;
    private static __styleBox: string =
        "#__counter__box__{ z-index: 1000; position: absolute; top: 0; left: calc(50% - 30px); width: 60px; border: 1px solid #AFACAC; border-top: 0px; padding: 1px; font-size: .8em; text-align: center; background-color: #FFFFE4; font-family: Arial; opacity: .5; }"
        + " #__counter__box__:hover{ opacity: 1 !important; }"
        + " #__counter__checkbox__{ vertical-align: middle; }";
    private static __htmlBox: string =
        "<div id='__counter__box__'>"
        + "<input type='checkbox' id='__counter__checkbox__' checked/>"
        + " <span id='__counter__time__'>{{TIME}}</span>"
        + "</div>";

    private static __createSetInterval(callback: Function, secondsLoop: number): number {
        var interval = setInterval(callback, secondsLoop * 1000);
        return interval;
    }

    private static __createNodeElement(time: number, check: boolean): void {
        let div = document.createElement('div');
        div.innerHTML = Counter.__htmlBox.replace(/\{\{TIME\}\}/, time.toString());
        let element = div.firstChild;
        document.getElementsByTagName("body")[0].insertBefore(element, document.getElementsByTagName("body")[0].firstChild);
        let checkbox = <HTMLInputElement>document.getElementById("__counter__checkbox__");
        checkbox.checked = check;

        let head = document.head || document.getElementsByTagName('head')[0];
        let style = <HTMLStyleElement>document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(Counter.__styleBox));
        head.appendChild(style);
    }

    private __initGlobalInterval(): Counter {
        Counter.__instance.__globalInterval = Counter.__createSetInterval(function () {
            if (!!Counter.__instance.__toCount) {
                let element = document.getElementById("__counter__time__");
                let time = element.textContent;
                if (time === "1") {
                    //reiniciar y llamar a la función
                    time = Counter.__instance.__callback.secondsLoop.toString();
                    Counter.__instance.__callback.callback();
                } else {
                    time = (parseInt(time) - 1).toString();
                }
                element.textContent = time;
            }
        }, 1);
        return Counter.__instance;
    }

    private __addListenerToDiv(): Counter {
        document.getElementById("__counter__checkbox__").addEventListener("click", function () {
            var checkbox = <HTMLInputElement>document.getElementById("__counter__checkbox__");
            if (checkbox.checked) {
                Counter.__instance.restartCounter();
            } else {
                Counter.__instance.stopCounter();
            }
        });
        return Counter.__instance;
    }

    private __changeToCount(toCount: boolean): Counter {
        var objApp = JSON.parse(localStorage.getItem(Counter.__instance.__app));
        objApp.toCount = toCount;
        localStorage.setItem(Counter.__instance.__app, JSON.stringify(objApp));
        Counter.__instance.__toCount = toCount;
        return Counter.__instance;
    }

    private __clearCounters(): Counter {
        let element = document.getElementById("__counter__box__");
        if (element) element.parentNode.removeChild(element);
        window.clearInterval(Counter.__instance.__globalInterval);
        Counter.__instance.__globalInterval = 0;
        return Counter.__instance;
    }

    private __initializeLocalStorage(): Counter {
        if (!localStorage.getItem(Counter.__instance.__app)) {
            localStorage.setItem(Counter.__instance.__app, JSON.stringify({toCount: true}));
        } else {
            var objApp = JSON.parse(localStorage.getItem(Counter.__instance.__app));
            Counter.__instance.__toCount = objApp.toCount;
        }
        return Counter.__instance;
    }

    /**
     * @constructor Counter
     * Devuelve una nueva instancia de Counter. Borra los Counter existentes, es decir, elimina la caja contador y el intervalo
     * @param app {string} Nombre de la app que se usará para identificar unívocamente en el localStorage
     */
    constructor(app: string) {
        if (Counter.__instance) {
            throw new Error("Error: Instantiation failed: Use Counter.getInstance() instead of new.");
        }
        if (!app) {
            throw new Error("Error: [app] parameter is required.");
        }
        Counter.__instance = this;
        Counter.__instance.__app = app;
        Counter.__instance.__initializeLocalStorage();
        Counter.__instance.__clearCounters();
    }

    /**
     * Clase Singleton. Devuelve la instancia de Counter existente o crea una nueva instancia
     * @param app {string} Nombre de la app que se usará para identificar unívocamente en el localStorage
     * @returns {Counter}
     */
    static getInstance(app: string): Counter {
        if (!app) {
            throw new Error("Error: [app] parameter is required.");
        }
        Counter.__instance = Counter.__instance || new Counter(app);
        Counter.__instance.__app = app;
        Counter.__instance.__initializeLocalStorage();
        return Counter.__instance.__clearCounters();
    }

    /**
     * Crea un nuevo contador
     * @param callback {function} Función que se va a llamar en cada vuelta de contador
     * @param secondsLoop {number} Segundos que durará cada vuelta
     * @returns {Counter}
     */
    newCounter(callback: Function, secondsLoop: number = 60): Counter {
        if (!callback || typeof callback !== "function") {
            throw new TypeError("No se ha indicado 'callback' o no es una función");
        }
        Counter.__instance.__clearCounters();
        Counter.__instance.__callback = {
            callback: callback,
            secondsLoop: secondsLoop
        };
        Counter.__createNodeElement(secondsLoop, Counter.__instance.__toCount);
        Counter.__instance.__addListenerToDiv();
        return Counter.__instance.__initGlobalInterval();
    }

    /**
     * Borra el contador actual si existe
     * @returns {Counter}
     */
    removeCounter(): Counter {
        Counter.__instance.stopCounter();
        Counter.__instance.__clearCounters();
        Counter.__instance.__callback = null;
        return Counter.__instance;
    }

    /**
     * Pausa el contador actual si existe
     * @returns {Counter}
     */
    stopCounter(): Counter {
        return Counter.__instance.__changeToCount(false);
    }

    /**
     * Continua el contador actual si existe
     * @throw Lanza excepción si no existe ningún contador actualmente
     * @returns {Counter}
     */
    restartCounter(): Counter {
        if (!Counter.__instance.__globalInterval) {
            throw new Error(`Error: Counter loop is not initialized. Use Counter.getInstance('${Counter.__instance.__app}').newCounter(...) before.`);
        }
        return Counter.__instance.__changeToCount(true);
    }

    /**
     * Devuelve el nombre de la app indicada
     * @returns {string}
     */
    getApp(): string {
        return Counter.__instance.__app;
    }

    /**
     * Devuelve la función callback que se llama en cada vuelta
     * @throw Lanza excepción si no existe ningún contador actualmente
     * @returns {Function}
     */
    getFnCallback(): Function {
        if (!Counter.__instance.__callback) {
            throw new Error(`Error: Counter loop is not initialized. Use Counter.getInstance('${Counter.__instance.__app}').newCounter(...) before.`);
        }
        return Counter.__instance.__callback.callback;
    }

    /**
     * Modifica la función a llamar en cada vuelta
     * @param newFnCallback
     * @throw Lanza excepción si no existe ningún contador actualmente
     * @returns {Counter}
     */
    setFnCallback(newFnCallback: Function): Counter {
        if (!Counter.__instance.__callback) {
            throw new Error(`Error: Counter loop is not initialized. Use Counter.getInstance('${Counter.__instance.__app}').newCounter(...) before.`);
        }
        Counter.__instance.__callback.callback = newFnCallback;
        return Counter.__instance;
    }

    /**
     * Devuelve los segundos que durá cada vuelta del contador actual
     * @throw Lanza excepción si no existe ningún contador actualmente
     * @returns {number}
     */
    getSecondsLoop(): number {
        if (!Counter.__instance.__callback) {
            throw new Error(`Error: Counter loop is not initialized. Use Counter.getInstance('${Counter.__instance.__app}').newCounter(...) before.`);
        }
        return Counter.__instance.__callback.secondsLoop;
    }

    /**
     * Modifica los segundos que durará cada vuelta
     * @param newSecondsLoop
     * @returns {Counter}
     */
    setSecondsLoop(newSecondsLoop: number): Counter {
        if (!Counter.__instance.__callback) {
            throw new Error(`Error: Counter loop is not initialized. Use Counter.getInstance('${Counter.__instance.__app}').newCounter(...) before.`);
        }
        Counter.__instance.__callback.secondsLoop = newSecondsLoop;
        return Counter.__instance;
    }
}