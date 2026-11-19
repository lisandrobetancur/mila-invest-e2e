/**
 * Si un control está en pantalla.
 *
 * Un estado de la app (`market_list_state_empty`, `orders_result_view`) es
 * un nodo más: preguntar si está visible es preguntar en qué estado está la
 * vista.
 */
import { Question, d } from '@serenity-js/core';

import { locatorFor } from '../interactions/native';
import type { Target } from '../ui/selector';

export const IsDisplayed = {
    /** `true` si [targeted] está visible. */
    of: (targeted: Target): Question<Promise<boolean>> =>
        Question.about(d`si ${targeted} está en pantalla`, async (actor) => {
            const node = await locatorFor(actor, targeted);
            return node.isVisible();
        }),
};
