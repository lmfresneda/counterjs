/**
 * CounterJS v0.0.1
 * @author luis.miguel
 */
var Counter = (function () {
    /**
     * @constructor Counter
     * Devuelve una nueva instancia de Counter. Borra los Counter existentes, es decir, elimina la caja contador y el intervalo
     * @param app {string} Nombre de la app que se usará para identificar unívocamente en el localStorage
     */
    function Counter(app) {
        this.__app = "";
        this.__toCount = true;
        this.__globalInterval = 0;
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
    Counter.__createSetInterval = function (callback, secondsLoop) {
        var interval = setInterval(callback, secondsLoop * 1000);
        return interval;
    };
    Counter.__createNodeElement = function (time, check) {
        var div = document.createElement('div');
        div.innerHTML = Counter.__htmlBox.replace(/\{\{TIME\}\}/, time.toString());
        var element = div.firstChild;
        document.getElementsByTagName("body")[0].insertBefore(element, document.getElementsByTagName("body")[0].firstChild);
        var checkbox = document.getElementById("__counter__checkbox__");
        checkbox.checked = check;
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(Counter.__styleBox));
        head.appendChild(style);
    };
    Counter.prototype.__initGlobalInterval = function () {
        Counter.__instance.__globalInterval = Counter.__createSetInterval(function () {
            if (!!Counter.__instance.__toCount) {
                var element = document.getElementById("__counter__time__");
                var time = element.textContent;
                if (time === "1") {
                    //reiniciar y llamar a la función
                    time = Counter.__instance.__callback.secondsLoop.toString();
                    Counter.__instance.__callback.callback();
                }
                else {
                    time = (parseInt(time) - 1).toString();
                }
                element.textContent = time;
            }
        }, 1);
        return Counter.__instance;
    };
    Counter.prototype.__addListenerToDiv = function () {
        document.getElementById("__counter__checkbox__").addEventListener("click", function () {
            var checkbox = document.getElementById("__counter__checkbox__");
            if (checkbox.checked) {
                Counter.__instance.restartCounter();
            }
            else {
                Counter.__instance.stopCounter();
            }
        });
        return Counter.__instance;
    };
    Counter.prototype.__changeToCount = function (toCount) {
        var objApp = JSON.parse(localStorage.getItem(Counter.__instance.__app));
        objApp.toCount = toCount;
        localStorage.setItem(Counter.__instance.__app, JSON.stringify(objApp));
        Counter.__instance.__toCount = toCount;
        return Counter.__instance;
    };
    Counter.prototype.__clearCounters = function () {
        var element = document.getElementById("__counter__box__");
        if (element)
            element.parentNode.removeChild(element);
        window.clearInterval(Counter.__instance.__globalInterval);
        Counter.__instance.__globalInterval = 0;
        return Counter.__instance;
    };
    Counter.prototype.__initializeLocalStorage = function () {
        if (!localStorage.getItem(Counter.__instance.__app)) {
            localStorage.setItem(Counter.__instance.__app, JSON.stringify({ toCount: true }));
        }
        else {
            var objApp = JSON.parse(localStorage.getItem(Counter.__instance.__app));
            Counter.__instance.__toCount = objApp.toCount;
        }
        return Counter.__instance;
    };
    /**
     * Clase Singleton. Devuelve la instancia de Counter existente o crea una nueva instancia
     * @param app {string} Nombre de la app que se usará para identificar unívocamente en el localStorage
     * @returns {Counter}
     */
    Counter.getInstance = function (app) {
        if (!app) {
            throw new Error("Error: [app] parameter is required.");
        }
        Counter.__instance = Counter.__instance || new Counter(app);
        Counter.__instance.__app = app;
        Counter.__instance.__initializeLocalStorage();
        return Counter.__instance.__clearCounters();
    };
    /**
     * Crea un nuevo contador
     * @param callback {function} Función que se va a llamar en cada vuelta de contador
     * @param secondsLoop {number} Segundos que durará cada vuelta
     * @returns {Counter}
     */
    Counter.prototype.newCounter = function (callback, secondsLoop) {
        if (secondsLoop === void 0) { secondsLoop = 60; }
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
    };
    /**
     * Borra el contador actual si existe
     * @returns {Counter}
     */
    Counter.prototype.removeCounter = function () {
        Counter.__instance.stopCounter();
        Counter.__instance.__clearCounters();
        Counter.__instance.__callback = null;
        return Counter.__instance;
    };
    /**
     * Pausa el contador actual si existe
     * @returns {Counter}
     */
    Counter.prototype.stopCounter = function () {
        return Counter.__instance.__changeToCount(false);
    };
    /**
     * Continua el contador actual si existe
     * @throw Lanza excepción si no existe ningún contador actualmente
     * @returns {Counter}
     */
    Counter.prototype.restartCounter = function () {
        if (!Counter.__instance.__globalInterval) {
            throw new Error("Error: Counter loop is not initialized. Use Counter.getInstance('" + Counter.__instance.__app + "').newCounter(...) before.");
        }
        return Counter.__instance.__changeToCount(true);
    };
    /**
     * Devuelve el nombre de la app indicada
     * @returns {string}
     */
    Counter.prototype.getApp = function () {
        return Counter.__instance.__app;
    };
    /**
     * Devuelve la función callback que se llama en cada vuelta
     * @throw Lanza excepción si no existe ningún contador actualmente
     * @returns {Function}
     */
    Counter.prototype.getFnCallback = function () {
        if (!Counter.__instance.__callback) {
            throw new Error("Error: Counter loop is not initialized. Use Counter.getInstance('" + Counter.__instance.__app + "').newCounter(...) before.");
        }
        return Counter.__instance.__callback.callback;
    };
    /**
     * Modifica la función a llamar en cada vuelta
     * @param newFnCallback
     * @throw Lanza excepción si no existe ningún contador actualmente
     * @returns {Counter}
     */
    Counter.prototype.setFnCallback = function (newFnCallback) {
        if (!Counter.__instance.__callback) {
            throw new Error("Error: Counter loop is not initialized. Use Counter.getInstance('" + Counter.__instance.__app + "').newCounter(...) before.");
        }
        Counter.__instance.__callback.callback = newFnCallback;
        return Counter.__instance;
    };
    /**
     * Devuelve los segundos que durá cada vuelta del contador actual
     * @throw Lanza excepción si no existe ningún contador actualmente
     * @returns {number}
     */
    Counter.prototype.getSecondsLoop = function () {
        if (!Counter.__instance.__callback) {
            throw new Error("Error: Counter loop is not initialized. Use Counter.getInstance('" + Counter.__instance.__app + "').newCounter(...) before.");
        }
        return Counter.__instance.__callback.secondsLoop;
    };
    /**
     * Modifica los segundos que durará cada vuelta
     * @param newSecondsLoop
     * @returns {Counter}
     */
    Counter.prototype.setSecondsLoop = function (newSecondsLoop) {
        if (!Counter.__instance.__callback) {
            throw new Error("Error: Counter loop is not initialized. Use Counter.getInstance('" + Counter.__instance.__app + "').newCounter(...) before.");
        }
        Counter.__instance.__callback.secondsLoop = newSecondsLoop;
        return Counter.__instance;
    };
    Counter.__styleBox = "#__counter__box__{ z-index: 1000; position: absolute; top: 0; left: calc(50% - 30px); width: 60px; border: 1px solid #AFACAC; border-top: 0px; padding: 1px; font-size: .8em; text-align: center; background-color: #FFFFE4; font-family: Arial; opacity: .5; }"
        + " #__counter__box__:hover{ opacity: 1 !important; }"
        + " #__counter__checkbox__{ vertical-align: middle; }";
    Counter.__htmlBox = "<div id='__counter__box__'>"
        + "<input type='checkbox' id='__counter__checkbox__' checked/>"
        + " <span id='__counter__time__'>{{TIME}}</span>"
        + "</div>";
    return Counter;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ291bnRlckpTLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vQ291bnRlckpTLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVIO0lBNEZJOzs7O09BSUc7SUFDSCxpQkFBWSxHQUFXO1FBOUZmLFVBQUssR0FBVyxFQUFFLENBQUM7UUFDbkIsY0FBUyxHQUFZLElBQUksQ0FBQztRQUMxQixxQkFBZ0IsR0FBVyxDQUFDLENBQUM7UUE2RmpDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0VBQXdFLENBQUMsQ0FBQztRQUM5RixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ1AsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFDRCxPQUFPLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUMxQixPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7UUFDL0IsT0FBTyxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQzlDLE9BQU8sQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDekMsQ0FBQztJQTVGYywyQkFBbUIsR0FBbEMsVUFBbUMsUUFBa0IsRUFBRSxXQUFtQjtRQUN0RSxJQUFJLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFLFdBQVcsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN6RCxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFYywyQkFBbUIsR0FBbEMsVUFBbUMsSUFBWSxFQUFFLEtBQWM7UUFDM0QsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QyxHQUFHLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FB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