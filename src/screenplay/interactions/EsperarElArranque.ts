/**
 * Espera a que la app arranque, con una recarga de rescate.
 *
 * Muy de vez en cuando (≈1 de cada 400 arranques, medido en corridas
 * seguidas) la app web no llega a pintar: la página queda en blanco, sin un
 * solo nodo `flt-semantics`. No es el servidor —aguanta 30 descargas
 * concurrentes sin un error— sino el canvas de Flutter, que se queda sin
 * primer frame.
 *
 * Una persona, frente a una pantalla en blanco, recarga. Esto hace lo mismo,
 * **una sola vez** y solo al entrar a la app: recargar más adelante perdería
 * la sesión, que con el backend falso vive en memoria.
 */
import { Interaction, d } from '@serenity-js/core';

import { env } from '../../config/env';
import type { Target } from '../ui/selector';
import { locatorFor, pageFor } from './native';

export const EsperarElArranque = {
    /** Espera a [targeted]; si la app no pintó, recarga y vuelve a esperar. */
    mostrando: (targeted: Target): Interaction =>
        Interaction.where(d`#actor espera a que arranque la app y aparezca ${targeted}`, async (actor) => {
            const aparecio = await locatorFor(actor, targeted)
                .then((node) => node.waitFor({ state: 'visible', timeout: env.timeouts.navigation }))
                .then(() => true)
                .catch(() => false);

            if (aparecio) {
                return;
            }

            const page = await pageFor(actor);
            await page.reload({ timeout: env.timeouts.navigation });
            const node = await locatorFor(actor, targeted);
            await node.waitFor({ state: 'visible', timeout: env.timeouts.navigation });
        }),
};
