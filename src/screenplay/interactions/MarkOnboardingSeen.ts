/**
 * Marca el onboarding como visto **antes** de que la app cargue.
 *
 * La app guarda la preferencia con `shared_preferences`, que en web es
 * `localStorage` con el prefijo `flutter.` (confirmado en el paso 0, §5):
 *
 * ```
 * flutter.mila_invest.onboarding_seen = "true"
 * ```
 *
 * `addInitScript` corre en cada documento nuevo antes de cualquier script de
 * la página, así que el `redirect` del router nunca llega a mandar al
 * onboarding. Hay que ejecutarla **antes** de navegar.
 */
import { Interaction } from '@serenity-js/core';

import { pageFor } from './native';

/** Clave de `shared_preferences` en web. */
export const ONBOARDING_SEEN_KEY = 'flutter.mila_invest.onboarding_seen';

export const MarkOnboardingSeen = (): Interaction =>
    Interaction.where(
        '#actor marca el onboarding como visto',
        async (actor) => {
            const page = await pageFor(actor);
            await page.addInitScript((key: string) => {
                window.localStorage.setItem(key, 'true');
            }, ONBOARDING_SEEN_KEY);
        },
    );
