/**
 * Cuántos nodos coinciden con un target.
 *
 * Los targets de lista (`MarketList.allInstruments()`) usan un selector por
 * prefijo del identificador, así que esto cuenta ítems sin saber nada de la
 * estructura de la pantalla.
 */
import { Question, d } from '@serenity-js/core';

import { locatorFor } from '../interactions/native';
import type { Target } from '../ui/selector';

export const ElementCount = {
    /** Cantidad de nodos que coinciden con [targeted]. */
    of: (targeted: Target): Question<Promise<number>> =>
        Question.about(d`la cantidad de ${targeted}`, async (actor) => {
            const node = await locatorFor(actor, targeted);
            return node.count();
        }),
};
