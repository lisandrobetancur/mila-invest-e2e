/**
 * Trae un control a la vista.
 *
 * Las listas de Flutter viven en el canvas: los nodos semánticos de los
 * ítems existen con su posición, así que alcanza con pedirle al navegador
 * que los traiga. Si aun así el nodo queda fuera de la ventana, se baja con
 * la rueda del mouse en pasos acotados, verificando la condición en cada
 * paso (nunca una espera fija).
 */
import { Interaction, d } from '@serenity-js/core';

import { env } from '../../config/env';
import type { Target } from '../ui/selector';
import { locatorFor, pageFor } from './native';

const PASOS = 12;

export const ScrollIntoView = {
    /** Baja (o sube) hasta que [targeted] quede a la vista. */
    element: (targeted: Target): Interaction =>
        Interaction.where(d`#actor desplaza la vista hasta ${targeted}`, async (actor) => {
            const node = await locatorFor(actor, targeted);
            await node
                .scrollIntoViewIfNeeded({ timeout: env.timeouts.interaction })
                .catch(() => undefined);
            if (await node.isVisible()) {
                return;
            }
            const page = await pageFor(actor);
            for (let paso = 0; paso < PASOS; paso++) {
                const fresco = await locatorFor(actor, targeted);
                if (await fresco.isVisible()) {
                    return;
                }
                await page.mouse.wheel(0, 300);
                await page.waitForLoadState('networkidle').catch(() => undefined);
            }
        }),
};
