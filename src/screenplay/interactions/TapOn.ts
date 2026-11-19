/**
 * Toca un control de la app.
 *
 * Los nodos `flt-semantics` responden al click normal de Playwright (medido
 * en el paso 0: 10/10 sin fallos). Lo que sí pasa es que Flutter reconstruye
 * el árbol semántico entre frames y el nodo puede desprenderse en el medio
 * de una transición de ruta; ahí Playwright reintenta hasta el timeout. Por
 * eso: esperar a que sea visible, tocar, y si el nodo se desprendió,
 * reintentar **una** vez por el centro de su bounding box.
 */
import { Interaction, d } from '@serenity-js/core';

import { env } from '../../config/env';
import type { Target } from '../ui/selector';
import { locatorFor, tapCenterOf } from './native';

const esDesprendido = (error: unknown): boolean =>
    /detached|not attached|Timeout/i.test(
        error instanceof Error ? error.message : String(error),
    );

export const TapOn = {
    /** Toca [targeted] en cuanto esté visible. */
    element: (targeted: Target): Interaction =>
        Interaction.where(d`#actor toca ${targeted}`, async (actor) => {
            const node = await locatorFor(actor, targeted);
            await node.waitFor({ state: 'visible', timeout: env.timeouts.element });
            try {
                await node.click({ timeout: env.timeouts.interaction });
            } catch (error) {
                if (!esDesprendido(error)) {
                    throw error;
                }
                // El nodo se reconstruyó: tocamos donde quedó ahora.
                await tapCenterOf(await locatorFor(actor, targeted));
            }
        }),
};
