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
 * Espera a que el campo esté de verdad en edición: que su `<input>` tenga el
 * foco y lo conserve durante [estableMs]. Devuelve `false` si el foco no
 * llega en [timeout] o si llega y se va (entonces hay que volver a tocar).
 *
 * Con semantics forzado, Flutter 3.41.9 tiene dos problemas que esto cubre
 * (medidos en `semantics-probe/`, sondas A y E):
 *
 * - **Las primeras teclas se pierden.** El navegador enfoca el `<input>`
 *   antes de que el engine le instale los listeners; lo que se escribe en
 *   ese hueco se pisa (flutter/flutter#194186, sin arreglo). Esperar unos
 *   frames con el foco quieto alcanzó: 5 de 5, contra 0 de 5 sin esperar.
 * - **El foco se va al re-tocar un campo** después de tocar un control
 *   vecino: queda unos 75 ms en el `<input>` y se va a `BODY`
 *   (flutter/flutter#192792 y relacionados). No vuelve solo: hay que volver
 *   a tocar. Por eso la ventana de estabilidad es más larga que esos 75 ms.
 */
export const esperarCampoActivo = (
    node: Locator,
    { estableMs = 200, timeout = 1_500 }: { estableMs?: number; timeout?: number } = {},
): Promise<boolean> =>
    node
        .evaluate(
            (host, { estableMs, timeout }) =>
                new Promise<boolean>((resolve) => {
                    const t0 = performance.now();
                    let desde: number | null = null;
                    const tick = (): void => {
                        const input = host.querySelector('input, textarea');
                        const ahora = performance.now();
                        if (input && document.activeElement === input) {
                            desde ??= ahora;
                            if (ahora - desde >= estableMs) return resolve(true);
                        } else if (desde !== null) {
                            // Tuvo el foco y lo perdió: no va a volver solo.
                            return resolve(false);
                        }
                        if (ahora - t0 > timeout) return resolve(false);
                        requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }),
            { estableMs, timeout },
        )
        // El nodo se reconstruyó en el medio: tratarlo como foco perdido.
        .catch(() => false);

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
