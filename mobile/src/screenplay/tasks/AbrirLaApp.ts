/** Entrar a la app. */
import { Check, Duration, Question, Task, Wait } from '@serenity-js/core';
import { isTrue } from '@serenity-js/assertions';

import { env } from '../../config/env';
import { TapOn } from '../interactions';
import { isDisplayed } from '../interactions/native';
import { IsDisplayed } from '../questions/IsDisplayed';
import { LoginForm } from '../ui/auth.ui';
import { Onboarding } from '../ui/shell.ui';
import { EsperarLaCargaDe } from './esperas';

/**
 * `true` cuando la app terminó de arrancar.
 *
 * Arrancar en un dispositivo no es recargar una página: la app pasa unos
 * segundos por el splash mientras resuelve preferencias y sesión. Preguntar
 * por el onboarding antes de eso da siempre que no, y el escenario sigue
 * contra una pantalla que todavía no existe.
 */
const Arrancada = (): Question<Promise<boolean>> =>
    Question.about('si la app terminó de arrancar', async () =>
        (await isDisplayed(Onboarding.view())) || (await isDisplayed(LoginForm.view())),
    );

/** Espera a que la app pase el splash. */
export const EsperarElArranque = (): Task =>
    Task.where(
        '#actor espera a que arranque la app',
        Wait.upTo(Duration.ofMilliseconds(env.timeouts.navigation)).until(Arrancada(), isTrue()),
    );

/**
 * Salta el onboarding si está.
 *
 * A diferencia de web —donde se marca la preferencia en `localStorage` antes
 * de cargar—, acá se toca "Saltar", que es lo que hace una persona. La
 * preferencia queda guardada en el dispositivo, así que a partir del segundo
 * arranque el onboarding ya no aparece: por eso el paso es condicional.
 */
export const SaltarOnboarding = (): Task =>
    Task.where(
        '#actor salta el onboarding',
        EsperarElArranque(),
        Check.whether(IsDisplayed.of(Onboarding.skip()), isTrue()).andIfSo(
            TapOn.element(Onboarding.skip()),
        ),
    );

/** Abre la app y espera el inicio de sesión. */
export const AbrirLaApp = (): Task =>
    Task.where(
        '#actor abre MILA Invest',
        SaltarOnboarding(),
        EsperarLaCargaDe(LoginForm.view()),
    );
