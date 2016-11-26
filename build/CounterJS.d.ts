/**
 * CounterJS v0.0.1
 * @author luis.miguel
 */
declare class Counter {
    private static __instance;
    private __callback;
    private __app;
    private __toCount;
    private __globalInterval;
    private static __styleBox;
    private static __htmlBox;
    private static __createSetInterval(callback, secondsLoop);
    private static __createNodeElement(time, check);
    private __initGlobalInterval();
    private __addListenerToDiv();
    private __changeToCount(toCount);
    private __clearCounters();
    private __initializeLocalStorage();
    /**
     * @constructor Counter
     * Devuelve una nueva instancia de Counter. Borra los Counter existentes, es decir, elimina la caja contador y el intervalo
     * @param app {string} Nombre de la app que se usará para identificar unívocamente en el localStorage
     */
    constructor(app: string);
    /**
     * Clase Singleton. Devuelve la instancia de Counter existente o crea una nueva instancia
     * @param app {string} Nombre de la app que se usará para identificar unívocamente en el localStorage
     * @returns {Counter}
     */
    static getInstance(app: string): Counter;
    /**
     * Crea un nuevo contador
     * @param callback {function} Función que se va a llamar en cada vuelta de contador
     * @param secondsLoop {number} Segundos que durará cada vuelta
     * @returns {Counter}
     */
    newCounter(callback: Function, secondsLoop?: number): Counter;
    /**
     * Borra el contador actual si existe
     * @returns {Counter}
     */
    removeCounter(): Counter;
    /**
     * Pausa el contador actual si existe
     * @returns {Counter}
     */
    stopCounter(): Counter;
    /**
     * Continua el contador actual si existe
     * @throw Lanza excepción si no existe ningún contador actualmente
     * @returns {Counter}
     */
    restartCounter(): Counter;
    /**
     * Devuelve el nombre de la app indicada
     * @returns {string}
     */
    getApp(): string;
    /**
     * Devuelve la función callback que se llama en cada vuelta
     * @throw Lanza excepción si no existe ningún contador actualmente
     * @returns {Function}
     */
    getFnCallback(): Function;
    /**
     * Modifica la función a llamar en cada vuelta
     * @param newFnCallback
     * @throw Lanza excepción si no existe ningún contador actualmente
     * @returns {Counter}
     */
    setFnCallback(newFnCallback: Function): Counter;
    /**
     * Devuelve los segundos que durá cada vuelta del contador actual
     * @throw Lanza excepción si no existe ningún contador actualmente
     * @returns {number}
     */
    getSecondsLoop(): number;
    /**
     * Modifica los segundos que durará cada vuelta
     * @param newSecondsLoop
     * @returns {Counter}
     */
    setSecondsLoop(newSecondsLoop: number): Counter;
}
