/**
 * Esperas por condición, con el techo de `env.ts`.
 *
 * No hay esperas fijas en toda la suite: siempre se espera *a que algo pase*.
 *
 * Se espera con [`IsDisplayed`](../questions/IsDisplayed.ts), no con el
 * `isVisible()` de `@serenity-js/web`: ese hace *hit-testing* con
 * `document.elementFromPoint` y exige que el punto central del elemento le
 * pertenezca. Los nodos contenedores de Flutter (las raíces de vista y de
 * estado) llevan `pointer-events: none`, así que el punto cae en el canvas y
 * el chequeo da `false` aunque la vista esté perfectamente a la vista.
 */
import { Duration, Task, Wait, d } from '@serenity-js/core';
import { includes, isFalse, isTrue } from '@serenity-js/assertions';

import { env } from '../../config/env';
import { IsDisplayed } from '../questions/IsDisplayed';
import { SemanticText } from '../questions/SemanticText';
import type { Target } from '../ui/selector';

/** Espera a que [targeted] esté en pantalla. */
export const EsperarA = (targeted: Target): Task =>
    Task.where(
        d`#actor espera a ver ${targeted}`,
        Wait.upTo(Duration.ofMilliseconds(env.timeouts.element)).until(
            IsDisplayed.of(targeted),
            isTrue(),
        ),
    );

/** Espera a que la app termine de cargar y muestre [targeted]. */
export const EsperarLaCargaDe = (targeted: Target): Task =>
    Task.where(
        d`#actor espera a que cargue ${targeted}`,
        Wait.upTo(Duration.ofMilliseconds(env.timeouts.navigation)).until(
            IsDisplayed.of(targeted),
            isTrue(),
        ),
    );

/** Espera a que [targeted] desaparezca. */
export const EsperarAQueDesaparezca = (targeted: Target): Task =>
    Task.where(
        d`#actor espera a que desaparezca ${targeted}`,
        Wait.upTo(Duration.ofMilliseconds(env.timeouts.element)).until(
            IsDisplayed.of(targeted),
            isFalse(),
        ),
    );

/**
 * Espera a que [targeted] **diga** algo en particular.
 *
 * Un control puede estar en pantalla con el texto viejo: al reemplazar el
 * contenido de un campo, la app muestra primero el error de "campo
 * requerido" y recién después el que corresponde al valor nuevo. Esperar a
 * que el nodo exista no alcanza; hay que esperar a que diga lo que se espera.
 */
export const EsperarAQueDiga = (targeted: Target, texto: string): Task =>
    Task.where(
        d`#actor espera a que ${targeted} diga "${texto}"`,
        Wait.upTo(Duration.ofMilliseconds(env.timeouts.element)).until(
            SemanticText.of(targeted),
            includes(texto),
        ),
    );
