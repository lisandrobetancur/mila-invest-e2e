/**
 * Dónde está parada la app.
 *
 * La app usa rutas con path real y refleja los filtros en la query
 * (`/market?country=PE&q=zzz`), así que la URL es la forma más barata y
 * estable de afirmar navegación y filtros.
 */
import { Question } from '@serenity-js/core';

import { pageFor } from '../interactions/native';

/** El `pathname` actual, por ejemplo `/market/instrument/ISA-CO`. */
export const CurrentPath = (): Question<Promise<string>> =>
    Question.about('la ruta actual', async (actor) => {
        const page = await pageFor(actor);
        return new URL(page.url()).pathname;
    });

/** La query actual como pares, por ejemplo `{ country: 'PE' }`. */
export const CurrentQuery = (): Question<Promise<Record<string, string>>> =>
    Question.about('los filtros de la URL', async (actor) => {
        const page = await pageFor(actor);
        return Object.fromEntries(new URL(page.url()).searchParams.entries());
    });

/** El valor de un parámetro de la query, o `''` si no está. */
export const QueryParam = {
    named: (name: string): Question<Promise<string>> =>
        Question.about(`el filtro "${name}" de la URL`, async (actor) => {
            const page = await pageFor(actor);
            return new URL(page.url()).searchParams.get(name) ?? '';
        }),
};
