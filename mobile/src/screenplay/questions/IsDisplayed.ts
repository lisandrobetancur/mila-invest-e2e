/**
 * Si un control está en pantalla.
 *
 * Se apoya en `isDisplayed()` del driver, que es lo que entiende
 * UiAutomator2. El `isVisible()` de `@serenity-js/web` no sirve acá: para
 * WebdriverIO termina ejecutando JavaScript, y en una sesión nativa de
 * Appium no hay JavaScript que ejecutar.
 */
import { Question, d } from '@serenity-js/core';

import { isDisplayed } from '../interactions/native';
import type { Target } from '../ui/selector';

export const IsDisplayed = {
    /** `true` si [targeted] está en pantalla. */
    of: (targeted: Target): Question<Promise<boolean>> =>
        Question.about(d`si ${targeted} está en pantalla`, () => isDisplayed(targeted)),
};
