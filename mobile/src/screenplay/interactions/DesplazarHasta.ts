/**
 * Trae un control a la vista desplazando la lista.
 *
 * En un teléfono, la mitad de lo que hay que tocar empieza fuera de
 * pantalla: la lista del mercado, las posiciones del portafolio, el final de
 * un formulario largo. Sin esto, la suite solo puede probar lo que entra en
 * el primer pantallazo.
 *
 * Medido en el paso 0, con la lista del mercado y un instrumento del fondo
 * (`FERREYC1-PE`):
 *
 * | Estrategia | Resultado |
 * |---|---|
 * | `UiScrollable(...).scrollIntoView(...)` | funciona, 8,9 s |
 * | gestos de arrastre acotados | funciona, y se puede comprobar entre uno y otro |
 *
 * Se usan los gestos: cada uno es un paso chico y después de cada uno se
 * pregunta si el control ya está en pantalla, así que nunca se desplaza de
 * más ni se espera de más. `UiScrollable` queda como respaldo para listas
 * muy largas, donde conviene delegar el recorrido completo en el driver.
 *
 * Las listas de Flutter exponen un único nodo `scrollable="true"`, que es el
 * que `UiScrollable` encuentra.
 */
import { Interaction, d } from '@serenity-js/core';

import { env } from '../../config/env';
import { Target } from '../ui/selector';
import { elementFor, isDisplayed } from './native';

/** Cuántos arrastres se intentan antes de rendirse. */
const PASOS = 10;

/** Un arrastre de abajo hacia arriba (o al revés) en el centro de la pantalla. */
const arrastrar = async (hacia: 'abajo' | 'arriba'): Promise<void> => {
    const { width, height } = await browser.getWindowSize();
    const x = Math.round(width / 2);
    const desde = Math.round(height * (hacia === 'abajo' ? 0.75 : 0.3));
    const hasta = Math.round(height * (hacia === 'abajo' ? 0.3 : 0.75));

    await browser
        .action('pointer', { parameters: { pointerType: 'touch' } })
        .move({ x, y: desde })
        .down()
        .pause(80)
        .move({ duration: 450, x, y: hasta })
        .up()
        .perform();
};

interface Desplazamiento {
    hasta: (targeted: Target) => Interaction;
}

const desplazar = (hacia: 'abajo' | 'arriba'): Desplazamiento => ({
    /** …hasta que [targeted] esté en pantalla. */
    hasta: (targeted: Target): Interaction =>
        Interaction.where(d`#actor se desplaza hacia ${hacia} hasta ver ${targeted}`, async () => {
            for (let paso = 0; paso <= PASOS; paso++) {
                if (await isDisplayed(targeted)) {
                    return;
                }
                await arrastrar(hacia);
            }

            // Último recurso: que el propio driver recorra la lista entera.
            const recorrido = `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(${targeted.selector.replace(/^android=/, '')})`;
            const element = await elementFor(new Target(recorrido, targeted.toString()));
            await element.waitForDisplayed({ timeout: env.timeouts.element });
        }),
});

/** Desplaza la pantalla hasta encontrar un control. */
export const Desplazarse = {
    /** Hacia abajo, que es lo habitual. */
    haciaAbajo: desplazar('abajo'),
    /** Hacia arriba, para volver al principio de una lista. */
    haciaArriba: desplazar('arriba'),
};
