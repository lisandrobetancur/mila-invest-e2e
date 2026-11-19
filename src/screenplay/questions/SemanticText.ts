/**
 * Lee el valor que muestra un control.
 *
 * Medido en el paso 0 (§4): los nodos de valor **no** tienen `aria-label`;
 * el texto está en `textContent` y es la forma hablada del valor
 * (`"17.800 pesos colombianos"`), no la visual (`"$ 17.800 COP"`). Los nodos
 * contenedores sí usan `aria-label`, así que se lee como respaldo.
 */
import { Question, d } from '@serenity-js/core';

import { locatorFor } from '../interactions/native';
import type { Target } from '../ui/selector';

export const SemanticText = {
    /** El texto de [targeted], normalizado (sin saltos ni espacios de más). */
    of: (targeted: Target): Question<Promise<string>> =>
        Question.about(d`el texto de ${targeted}`, async (actor) => {
            const node = await locatorFor(actor, targeted);
            const text = (await node.textContent()) ?? '';
            const value = text.trim().length > 0 ? text : ((await node.getAttribute('aria-label')) ?? '');
            return value.replace(/\s+/g, ' ').trim();
        }),
};
