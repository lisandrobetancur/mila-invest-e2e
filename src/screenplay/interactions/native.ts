/**
 * Puente con Playwright. **Solo las interacciones lo usan.**
 *
 * Flutter web dibuja sobre un canvas y expone un árbol `flt-semantics`
 * encima; algunas cosas (escribir en el `<input>` hijo, tocar el centro del
 * bounding box, `addInitScript`) necesitan el objeto nativo. Todo eso vive
 * acá y no se filtra a las tareas ni a los specs.
 */
import type { AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import type { PlaywrightPage } from '@serenity-js/playwright';
import { BrowseTheWeb, type PageElement } from '@serenity-js/web';
import type { Locator, Page } from 'playwright-core';

import type { Target } from '../ui/selector';

/** `Locator` de Playwright detrás de un target. */
export const locatorFor = async (
    actor: AnswersQuestions & UsesAbilities,
    targeted: Target,
): Promise<Locator> => {
    const element = (await actor.answer(targeted)) as PageElement<Locator>;
    return element.nativeElement();
};

/** `Page` de Playwright de la pestaña actual. */
export const pageFor = async (actor: UsesAbilities): Promise<Page> => {
    const current = await BrowseTheWeb.as(actor).currentPage();
    return (current as PlaywrightPage).nativePage();
};

/**
 * El `<input>`/`<textarea>` que Flutter pone dentro del nodo semántico de un
 * campo. Es la única excepción a "un id, un target".
 */
export const inputInside = (node: Locator): Locator =>
    node.locator('input, textarea').first();

/**
 * Toca el centro del bounding box con el mouse.
 *
 * No pasa por las comprobaciones de accionabilidad de Playwright, así que
 * sirve cuando Flutter reconstruye el nodo en el medio de un click.
 */
export const tapCenterOf = async (node: Locator): Promise<void> => {
    const box = await node.boundingBox();
    if (!box) {
        throw new Error('El nodo no tiene bounding box: no se puede tocar.');
    }
    const page = node.page();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.up();
};
