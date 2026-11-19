/**
 * El número que hay dentro de un valor hablado.
 *
 * `"22.800 pesos colombianos"` → `22800`.
 * `"sube 180 pesos colombianos, 1,02 por ciento"` → `180`.
 *
 * Sirve para afirmar relaciones (que el total bajó, que la cantidad subió)
 * sin atarse al formato, que cambia con el idioma y la moneda. Para afirmar
 * un valor exacto, [`SemanticText`](./SemanticText.ts) es más claro.
 */
import { Question, d } from '@serenity-js/core';

import { SemanticText } from './SemanticText';
import type { Target } from '../ui/selector';

/** Convierte un número escrito en es-CO (`1.234,5`) a `number`. */
export const parseAmount = (text: string): number => {
    const match = /-?\d[\d.,\s]*/.exec(text);
    if (!match) {
        throw new Error(`No hay ningún número en "${text}".`);
    }
    const raw = match[0].replace(/\s/g, '');
    const normalized = raw.includes(',')
        ? raw.replace(/\./g, '').replace(',', '.')
        : raw.replace(/\.(?=\d{3}\b)/g, '');
    const value = Number(normalized);
    if (Number.isNaN(value)) {
        throw new Error(`No se pudo leer un número de "${text}".`);
    }
    return value;
};

export const AmountValue = {
    /** El primer número de [targeted]. */
    of: (targeted: Target): Question<Promise<number>> =>
        Question.about(d`el monto de ${targeted}`, async (actor) =>
            parseAmount(await actor.answer(SemanticText.of(targeted))),
        ),
};
