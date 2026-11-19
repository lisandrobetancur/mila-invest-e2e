/** Iniciar sesión. */
import { Task } from '@serenity-js/core';

import { ClearAndType, TapOn } from '../interactions';
import { LoginForm } from '../ui/auth.ui';
import { Home } from '../ui/dashboard.ui';
import { EsperarA, EsperarLaCargaDe } from './esperas';

/** Credenciales de la cuenta demo del backend falso. */
export const CuentaDemo = {
    email: 'demo@milainvest.app',
    password: 'Demo1234!',
} as const;

export const IniciarSesion = {
    /**
     * Entra con la cuenta demo.
     *
     * El botón "Usar cuenta demo" solo rellena el formulario: después hay que
     * enviarlo. Es el mismo comportamiento que en web.
     */
    conLaCuentaDemo: (): Task =>
        Task.where(
            '#actor inicia sesión con la cuenta demo',
            EsperarA(LoginForm.demo()),
            TapOn.element(LoginForm.demo()),
            TapOn.element(LoginForm.submit()),
            EsperarLaCargaDe(Home.view()),
        ),

    /** Entra con un correo y una contraseña cualesquiera. */
    con: (email: string, password: string): Task =>
        Task.where(
            `#actor inicia sesión como ${email}`,
            EsperarA(LoginForm.email()),
            ClearAndType.theValue(email).into(LoginForm.email()),
            ClearAndType.theValue(password).into(LoginForm.password()),
            TapOn.element(LoginForm.submit()),
        ),
};
