/**
 * Escribe en un campo de la app.
 *
 * En Android el campo es un nodo editable de verdad: se toca para darle el
 * foco y se escribe con `setValue()`, que reemplaza el contenido. Después se
 * confirma con la acción "done" del teclado, que lo baja sin salir de la
 * pantalla: mientras el teclado está arriba tapa los controles de la mitad
 * inferior y los toques siguientes caen sobre él.
 */
import { Interaction, d } from '@serenity-js/core';

import { env } from '../../config/env';
import type { Target } from '../ui/selector';
import { confirmarElCampo, elementFor } from './native';

const escribir = (limpiar: boolean) =>
    (value: string): { into: (targeted: Target) => Interaction } => ({
        /** …en [targeted]. */
        into: (targeted: Target): Interaction =>
            Interaction.where(d`#actor escribe ${value} en ${targeted}`, async () => {
                const element = await elementFor(targeted);
                await element.waitForDisplayed({ timeout: env.timeouts.element });
                await element.click();
                if (limpiar) {
                    await element.clearValue();
                }
                await element.setValue(value);
                await confirmarElCampo();
            }),
    });

/** Escribe [value] en un campo. */
export const TypeInto = { theValue: escribir(false) };

/** Borra lo que haya y escribe [value]. */
export const ClearAndType = { theValue: escribir(true) };
