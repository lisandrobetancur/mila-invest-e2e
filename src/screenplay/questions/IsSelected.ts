/**
 * Si un control está elegido.
 *
 * Medido en el paso 0 (§6): los chips salen como `role="checkbox"` con
 * `aria-checked`; los segmentos y las tabs **no exponen** su selección
 * (GAP-1 en [`flutter-web-notes.md`](../../../docs/flutter-web-notes.md)).
 * Para esos, los escenarios afirman sobre la consecuencia —la URL, la vista
 * que quedó abierta—, no sobre el control.
 */
import { Question, d } from '@serenity-js/core';

import { locatorFor } from '../interactions/native';
import type { Target } from '../ui/selector';

export const IsSelected = {
    /** `true` si [targeted] está marcado. */
    of: (targeted: Target): Question<Promise<boolean>> =>
        Question.about(d`si ${targeted} está elegido`, async (actor) => {
            const node = await locatorFor(actor, targeted);
            const checked = await node.getAttribute('aria-checked');
            const selected = await node.getAttribute('aria-selected');
            return (checked ?? selected) === 'true';
        }),
};
