/**
 * Puente con Appium. **Solo las interacciones y las preguntas lo usan.**
 *
 * En una sesión nativa no hay DOM ni JavaScript: todo lo que en web se
 * resolvía ejecutando un script, acá se resuelve con comandos del driver.
 * `browser` es el global que inyecta el runner de WebdriverIO.
 */
import type { Target } from '../ui/selector';

/**
 * El elemento nativo detrás de un target.
 *
 * `browser.$()` devuelve un encadenable: es `await`-eable en tiempo de
 * ejecución, pero sus tipos no son los de una promesa común, y por eso la
 * regla `await-thenable` de ESLint está apagada para esta carpeta.
 */
export const elementFor = (targeted: Target): ChainablePromiseElement =>
    browser.$(targeted.selector);

/** `true` si el control está en pantalla. */
export const isDisplayed = async (targeted: Target): Promise<boolean> => {
    try {
        const element = await elementFor(targeted);
        return (await element.isExisting()) && (await element.isDisplayed());
    } catch {
        return false;
    }
};

/**
 * El valor que muestra un control.
 *
 * Medido en el paso 0: Flutter deja el `text` vacío y pone la etiqueta
 * hablada en **`content-desc`** (`"Saltar"`, `"17.800 pesos colombianos"`),
 * igual que en web la pone en `textContent`. Se lee `content-desc` y se cae
 * a `text` por si algún widget hiciera lo contrario.
 */
export const readableTextOf = async (targeted: Target): Promise<string> => {
    const element = await elementFor(targeted);
    const description = await element.getAttribute('content-desc').catch(() => null);
    if (description && description.trim().length > 0) {
        return description.replace(/\s+/g, ' ').trim();
    }
    const text = await element.getText().catch(() => '');
    return text.replace(/\s+/g, ' ').trim();
};

/**
 * Cierra el teclado confirmando el campo.
 *
 * **No se usa `hideKeyboard()`**: en Android termina mandando BACK, y en una
 * app Flutter eso no baja el teclado sino que cierra la pantalla. Costó un
 * rato entenderlo: al escribir la cantidad, el ticket de la orden se cerraba
 * solo y el escenario seguía contra el detalle del instrumento.
 *
 * `performEditorAction: done` es lo que hace el botón de confirmar del
 * propio teclado: baja el teclado y deja la pantalla donde estaba.
 */
export const confirmarElCampo = async (): Promise<void> => {
    await browser
        .execute('mobile: performEditorAction', { action: 'done' })
        .catch(() => undefined);
};

/**
 * Reinicia la app: la cierra y la vuelve a abrir.
 *
 * El backend falso vive en memoria dentro de la app, así que esto es el
 * equivalente mobile del contexto nuevo que la suite web tiene por test.
 */
export const restartApp = async (appPackage: string): Promise<void> => {
    await browser.terminateApp(appPackage);
    await browser.activateApp(appPackage);
};

/** Captura de pantalla en base64, para el reporte. */
export const screenshot = (): Promise<string> => browser.takeScreenshot();
