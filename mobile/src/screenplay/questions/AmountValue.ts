/**
 * El número que hay dentro de un valor hablado.
 *
 * Reusa el mismo parser que la suite web: el formato de los montos lo decide
 * la app, no la plataforma.
 */
import { Question, d } from '@serenity-js/core';

import { parseAmount } from '../../../../src/screenplay/questions/AmountValue';
import { readableTextOf } from '../interactions/native';
import type { Target } from '../ui/selector';

export const AmountValue = {
    /** El primer número de [targeted]. */
    of: (targeted: Target): Question<Promise<number>> =>
        Question.about(d`el monto de ${targeted}`, async () =>
            parseAmount(await readableTextOf(targeted)),
        ),
};
