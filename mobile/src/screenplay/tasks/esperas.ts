/**
 * Esperas por condición, con el techo de `env.ts`.
 *
 * Igual que en la suite web, no hay esperas fijas: siempre se espera *a que
 * algo pase*. Y se espera con `IsDisplayed`, no con el `isVisible()` de
 * `@serenity-js/web`, que para WebdriverIO termina ejecutando JavaScript en
 * la página — algo que en una sesión nativa de Appium no existe.
 */
import { Duration, Task, Wait, d } from '@serenity-js/core';
import { isFalse, isTrue } from '@serenity-js/assertions';

import { env } from '../../config/env';
import { Desplazarse } from '../interactions';
import { IsDisplayed } from '../questions/IsDisplayed';
import type { Target } from '../ui/selector';

/** Espera a que [targeted] esté en pantalla. */
export const EsperarA = (targeted: Target): Task =>
    Task.where(
        d`#actor espera a ver ${targeted}`,
        Wait.upTo(Duration.ofMilliseconds(env.timeouts.element)).until(IsDisplayed.of(targeted), isTrue()),
    );

/** Espera a que la app termine de abrir [targeted]. */
export const EsperarLaCargaDe = (targeted: Target): Task =>
    Task.where(
        d`#actor espera a que cargue ${targeted}`,
        Wait.upTo(Duration.ofMilliseconds(env.timeouts.navigation)).until(IsDisplayed.of(targeted), isTrue()),
    );

/** Espera a que [targeted] desaparezca. */
export const EsperarAQueDesaparezca = (targeted: Target): Task =>
    Task.where(
        d`#actor espera a que desaparezca ${targeted}`,
        Wait.upTo(Duration.ofMilliseconds(env.timeouts.element)).until(IsDisplayed.of(targeted), isFalse()),
    );

/**
 * Trae [targeted] a la pantalla, desplazándose si hace falta.
 *
 * En un teléfono, "esperar a ver algo" no alcanza: media pantalla de
 * contenido empieza fuera de la vista. Esto es lo que se usa para lo que
 * vive en una lista o al final de un formulario —una posición del
 * portafolio, el total del resumen de una orden—, mientras que `EsperarA`
 * queda para lo que aparece solo, como un mensaje de error.
 */
export const VerEnPantalla = (targeted: Target): Task =>
    Task.where(d`#actor busca ${targeted} en la pantalla`, Desplazarse.haciaAbajo.hasta(targeted));
