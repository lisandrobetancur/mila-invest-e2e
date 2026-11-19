/**
 * El **único** lugar donde se construye un selector.
 *
 * El contrato de la app expone cada vista, control y valor como el atributo
 * `flt-semantics-identifier` de un nodo `flt-semantics`. No hay selectores
 * por texto, por XPath ni por estructura: un id, un target.
 */
import type { Answerable } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { By, PageElement as Element } from '@serenity-js/web';

/** Un target: lo que las interacciones y las preguntas reciben. */
export type Target = Answerable<PageElement>;

/** Selector CSS de un identificador semántico. */
export const sel = (id: string): string => `[flt-semantics-identifier="${id}"]`;

/**
 * Target de un identificador semántico, con el nombre de negocio con el que
 * va a salir en el reporte.
 */
export const target = (id: string, description: string): Target =>
    Element.located(By.css(sel(id))).describedAs(description);

/**
 * Target de **todos** los nodos cuyo id empieza con [prefix]: los ítems de
 * una lista (`market_list_instrument_item_`), que llevan el id de la entidad
 * al final. Se usa con [`ElementCount`](../questions/ElementCount.ts).
 */
export const targetStartingWith = (prefix: string, description: string): Target =>
    Element.located(By.css(`[flt-semantics-identifier^="${prefix}"]`)).describedAs(description);
