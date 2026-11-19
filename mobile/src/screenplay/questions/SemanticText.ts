/**
 * Lee el valor que muestra un control.
 *
 * En Android el valor viaja en `content-desc` y es la **forma hablada**
 * (`"17.800 pesos colombianos"`), igual que en web viaja en `textContent`.
 * Los escenarios afirman sobre esa forma, que no cambia con el tema ni con
 * el layout.
 */
import { Question, d } from '@serenity-js/core';

import { readableTextOf } from '../interactions/native';
import type { Target } from '../ui/selector';

export const SemanticText = {
    /** El texto de [targeted], normalizado. */
    of: (targeted: Target): Question<Promise<string>> =>
        Question.about(d`el texto de ${targeted}`, () => readableTextOf(targeted)),
};
