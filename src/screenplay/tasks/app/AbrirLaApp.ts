/** Entrar a la app. */
import { Task } from '@serenity-js/core';
import { Navigate } from '@serenity-js/web';

import { env } from '../../../config/env';
import { EsperarElArranque, MarkOnboardingSeen } from '../../interactions';
import { LoginForm } from '../../ui/auth.ui';
import { Onboarding } from '../../ui/shell.ui';

const url = (path: string): string => new URL(path, env.baseUrl).toString();

/**
 * Salta el onboarding de la primera visita.
 *
 * Marca la preferencia **antes** de cargar la app, así el `redirect` del
 * router nunca pasa por el onboarding. Hay que hacerlo antes de navegar.
 */
export const SaltarOnboarding = (): Task =>
    Task.where('#actor salta el onboarding', MarkOnboardingSeen());

/**
 * Abre la app por la raíz y espera el login.
 *
 * **Se entra por `/`, no por `/login`.** Entrar directo a una ruta pública
 * deja esa ruta estacionada en el router de la app y el login no lleva a
 * ningún lado (BUG-1 en `docs/flutter-web-notes.md`). Por la raíz, el
 * `redirect` manda al login igual, y sin estacionar nada.
 */
export const AbrirLaApp = (): Task =>
    Task.where(
        '#actor abre MILA Invest',
        SaltarOnboarding(),
        Navigate.to(url('/')),
        EsperarElArranque.mostrando(LoginForm.view()),
    );

/** Abre la app sin saltar el onboarding, para probarlo. */
export const AbrirLaAppPorPrimeraVez = (): Task =>
    Task.where(
        '#actor abre MILA Invest por primera vez',
        Navigate.to(url('/')),
        EsperarElArranque.mostrando(Onboarding.view()),
    );

/**
 * Abre una ruta concreta (deep link), sin sesión.
 *
 * Para rutas **protegidas**: la app las estaciona, pasa por el login y
 * vuelve a ellas después de iniciar sesión. Sin sesión, cualquier ruta pasa
 * primero por el login, así que es eso lo que se espera al entrar.
 */
export const AbrirLaRuta = (path: string): Task =>
    Task.where(
        `#actor abre ${path}`,
        SaltarOnboarding(),
        Navigate.to(url(path)),
        EsperarElArranque.mostrando(LoginForm.view()),
    );
