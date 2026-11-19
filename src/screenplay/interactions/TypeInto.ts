/**
 * Escribe en un campo de la app.
 *
 * Medido en el paso 0 (§3): un campo expone un `<input>`/`<textarea>` hijo
 * del nodo semántico, y `fill()` sobre ese hijo dispara el `onChanged` del
 * `AppTextField`. Tres cosas lo complican, y las tres están resueltas acá:
 *
 * 1. **Hay que tocar el campo y esperar a que esté en edición.** Escribir
 *    sobre un campo que la app todavía no tiene en edición se pierde: el
 *    navegador enfoca el `<input>` antes de que el engine lo escuche. No
 *    alcanza con tocar: se espera a que el `<input>` conserve el foco
 *    (`esperarCampoActivo`). Medido en `semantics-probe/` (sonda E): sin
 *    esperar, 0 de 5 registros quedaban completos; esperando, 5 de 5.
 * 2. **El foco se puede ir solo.** Al re-tocar un campo después de tocar un
 *    control vecino, el foco queda unos 75 ms en el `<input>` y se va a
 *    `BODY`. Si pasa, se vuelve a tocar (0 de 5 sin esto, 5 de 5 con esto).
 * 3. **Flutter puede reconstruir el `<input>` mientras se escribe**, y se
 *    lleva puesto lo escrito. Por eso, después de escribir se vuelve a
 *    resolver el nodo y se comprueba que el valor haya quedado; si no,
 *    se reintenta desde el toque.
 *
 * Son bugs del modo semantics, que esta suite fuerza solo para tener ids
 * (flutter/flutter#194186, #192792). Cuando un arreglo llegue a la versión
 * de Flutter de la app, sacar la espera y ver si la suite sigue verde.
 */
import { Interaction, d } from '@serenity-js/core';

import { env } from '../../config/env';
import type { Target } from '../ui/selector';
import { esperarCampoActivo, inputInside, locatorFor } from './native';

/** Cuántas veces se reintenta antes de dar el campo por imposible. */
const INTENTOS = 3;

/** Cuántas veces se vuelve a tocar el campo, en cada intento, si el foco se va. */
const RETOQUES = 2;

const escribir = (
    descripcion: (targeted: Target, value: string) => string,
    limpiar: boolean,
) =>
    (value: string): { into: (targeted: Target) => Interaction } => ({
        /** …en [targeted]. */
        into: (targeted: Target): Interaction =>
            Interaction.where(descripcion(targeted, value), async (actor) => {
                let enEdicion = false;
                let quedo = '';

                for (let intento = 1; intento <= INTENTOS; intento++) {
                    // Tocarlo y esperar a que la app lo tenga en edición; si
                    // el foco se va, volver a tocarlo.
                    for (let toque = 0; toque <= RETOQUES && !enEdicion; toque++) {
                        const node = await locatorFor(actor, targeted);
                        await node.waitFor({ state: 'visible', timeout: env.timeouts.element });
                        await node.click({ timeout: env.timeouts.interaction });
                        enEdicion = await esperarCampoActivo(node);
                    }

                    const input = inputInside(await locatorFor(actor, targeted));
                    await input.waitFor({ state: 'attached', timeout: env.timeouts.element });
                    if (limpiar) {
                        await input.fill('', { timeout: env.timeouts.interaction });
                    }
                    await input.fill(value, { timeout: env.timeouts.interaction });

                    // Releer desde un locator nuevo: si Flutter reconstruyó el
                    // nodo, el valor se perdió y hay que escribirlo otra vez.
                    quedo = await inputInside(await locatorFor(actor, targeted))
                        .inputValue({ timeout: env.timeouts.interaction })
                        .catch(() => '');

                    if (quedo.includes(value)) {
                        return;
                    }
                    enEdicion = false;
                }

                throw new Error(
                    `No se pudo escribir "${value}" en ${INTENTOS} intentos ` +
                        `(quedó "${quedo}", campo en edición: ${enEdicion}).`,
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
