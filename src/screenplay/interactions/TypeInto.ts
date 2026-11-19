/**
 * Escribe en un campo de la app.
 *
 * Medido en el paso 0 (§3): un campo expone un `<input>`/`<textarea>` hijo
 * del nodo semántico, y `fill()` sobre ese hijo dispara el `onChanged` del
 * `AppTextField`. Dos cosas lo complican, y las dos están resueltas acá:
 *
 * 1. **Hay que tocar el campo primero.** Escribir sobre un campo que la app
 *    no tiene en edición deja el `<input>` vacío y la vista nunca se entera
 *    (así fallaba el registro: cuatro campos llenos en pantalla y cuatro
 *    errores de "campo obligatorio").
 * 2. **Flutter puede reconstruir el `<input>` mientras se escribe**, y se
 *    lleva puesto lo escrito. Por eso, después de escribir se vuelve a
 *    resolver el nodo y se comprueba que el valor haya quedado; si no,
 *    se reintenta. Era el único flaky que tuvo la suite.
 *
 * `fill()` se prefiere a teclear: al enfocarse, Flutter reconstruye el
 * `<input>` y se pierden las primeras teclas.
 */
import { Interaction, d } from '@serenity-js/core';

import { env } from '../../config/env';
import type { Target } from '../ui/selector';
import { inputInside, locatorFor } from './native';

/** Cuántas veces se reintenta antes de dar el campo por imposible. */
const INTENTOS = 3;

const escribir = (
    descripcion: (targeted: Target, value: string) => string,
    limpiar: boolean,
) =>
    (value: string): { into: (targeted: Target) => Interaction } => ({
        /** …en [targeted]. */
        into: (targeted: Target): Interaction =>
            Interaction.where(descripcion(targeted, value), async (actor) => {
                const node = await locatorFor(actor, targeted);
                await node.waitFor({ state: 'visible', timeout: env.timeouts.element });

                // Tocarlo: la app lo pone en edición.
                await node.click({ timeout: env.timeouts.interaction });

                for (let intento = 1; intento <= INTENTOS; intento++) {
                    const input = inputInside(await locatorFor(actor, targeted));
                    await input.waitFor({ state: 'attached', timeout: env.timeouts.element });
                    if (limpiar) {
                        await input.fill('', { timeout: env.timeouts.interaction });
                    }
                    await input.fill(value, { timeout: env.timeouts.interaction });

                    // Releer desde un locator nuevo: si Flutter reconstruyó el
                    // nodo, el valor se perdió y hay que escribirlo otra vez.
                    const quedo = await inputInside(await locatorFor(actor, targeted))
                        .inputValue({ timeout: env.timeouts.interaction })
                        .catch(() => '');

                    if (quedo.includes(value)) {
                        return;
                    }
                }

                throw new Error(
                    `No se pudo escribir "${value}": el campo se reconstruye y pierde el valor.`,
                );
            }),
    });

/** Escribe [value] en un campo. */
export const TypeInto = {
    theValue: escribir((targeted, value) => d`#actor escribe ${value} en ${targeted}`, false),
};

/** Borra lo que haya y escribe [value]. */
export const ClearAndType = {
    theValue: escribir((targeted, value) => d`#actor escribe ${value} en ${targeted}`, true),
};
