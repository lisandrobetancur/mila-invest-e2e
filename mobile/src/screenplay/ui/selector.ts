/**
 * El **único** lugar donde se construye un selector nativo.
 *
 * La app es Flutter y declara cada control con `Semantics(identifier:)`. En
 * Android eso aterriza como el **`resource-id`** del nodo, con exactamente el
 * mismo string que en web expone `flt-semantics-identifier`: por eso las dos
 * suites comparten `src/screenplay/ids/ids.generated.ts` y ningún id se
 * escribe dos veces.
 *
 * De las estrategias que acepta Appium se usa `UiSelector().resourceId(...)`,
 * la más rápida (medido en el paso 0: 37 ms contra 59 ms del XPath
 * equivalente, que además serializa toda la jerarquía en cada búsqueda).
 * `~` (accessibility id) **no** sirve: en Flutter el `content-desc` lleva la
 * etiqueta hablada del control ("Saltar"), no su identificador.
 *
 * **Por qué no se usa `PageElement` de `@serenity-js/web`:** esa capa da por
 * sentado que hay un navegador. Su `isVisible()` termina en
 * `browser.execute(...)`, el `Photographer` pide la ventana activa y el
 * cierre de sesión consulta `window/handles`; ninguno de los tres comandos
 * existe en una sesión nativa de Appium. Acá el target es un valor simple y
 * las interacciones hablan con el driver.
 */

/** Un control de la app: su selector nativo y cómo se llama en el reporte. */
export class Target {
    constructor(
        readonly selector: string,
        private readonly description: string,
    ) {}

    /** Lo que sale en el reporte. */
    toString(): string {
        return this.description;
    }
}

/** Selector nativo de un identificador semántico. */
export const sel = (id: string): string =>
    `android=new UiSelector().resourceId("${id}")`;

/**
 * Target de un identificador semántico, con el nombre de negocio con el que
 * va a salir en el reporte.
 */
export const target = (id: string, description: string): Target =>
    new Target(sel(id), description);
