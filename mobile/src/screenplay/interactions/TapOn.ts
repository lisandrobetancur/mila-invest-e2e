/**
 * Toca un control de la app.
 *
 * Se espera a que el control aparezca y se toca con el `click()` del driver,
 * que UiAutomator2 traduce en un toque sobre el centro del elemento. La
 * espera la hace el driver: dentro de una `Interaction` el actor no puede
 * delegar en otras actividades.
 */
import { Interaction, d } from '@serenity-js/core';

import { env } from '../../config/env';
import type { Target } from '../ui/selector';
import { elementFor } from './native';

export const TapOn = {
    /** Toca [targeted] en cuanto esté en pantalla. */
    element: (targeted: Target): Interaction =>
        Interaction.where(d`#actor toca ${targeted}`, async () => {
            const element = await elementFor(targeted);
            await element.waitForDisplayed({ timeout: env.timeouts.element });
            await element.click();
        }),
};
