/** Iniciar y cerrar sesión. */
import { Task } from '@serenity-js/core';

import { ClearAndType, TapOn } from '../../interactions';
import { LoginForm } from '../../ui/auth.ui';
import { Settings } from '../../ui/settings.ui';
import { EsperarA, EsperarAQueDesaparezca, EsperarLaCargaDe } from '../esperas';
import { AbrirAjustes } from '../navegacion/IrALaTab';

/** Credenciales de la cuenta demo del backend falso. */
export const CuentaDemo = {
    email: 'demo@milainvest.app',
    password: 'Demo1234!',
} as const;

export const IniciarSesion = {
    /**
     * Entra con la cuenta demo.
     *
     * El botón "Usar cuenta demo" **solo rellena** el formulario (paso 0,
     * §2): después hay que enviarlo.
     */
    conLaCuentaDemo: (): Task =>
        Task.where(
            '#actor inicia sesión con la cuenta demo',
            EsperarA(LoginForm.demo()),
            TapOn.element(LoginForm.demo()),
            TapOn.element(LoginForm.submit()),
            // No se espera el inicio: si #actor venía de un deep link, la app
            // lo devuelve a la pantalla que había pedido.
            EsperarAQueDesaparezca(LoginForm.view()),
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

/** Cierra la sesión desde ajustes, confirmando el diálogo. */
export const CerrarSesion = (): Task =>
    Task.where(
        '#actor cierra sesión',
        AbrirAjustes(),
        TapOn.element(Settings.logout()),
        EsperarA(Settings.logoutDialog()),
        TapOn.element(Settings.logoutConfirm()),
        EsperarLaCargaDe(LoginForm.view()),
    );
