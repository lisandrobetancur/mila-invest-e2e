/** Targets de acceso. */
import { AuthIds } from '../../../../src/screenplay/ids/ids.generated';
import { type Target, target } from './selector';

export const LoginForm = {
    view: (): Target => target(AuthIds.loginView, 'la pantalla de inicio de sesión'),
    email: (): Target => target(AuthIds.loginEmailField, 'el campo de correo'),
    password: (): Target => target(AuthIds.loginPasswordField, 'el campo de contraseña'),
    submit: (): Target => target(AuthIds.loginSubmitButton, 'el botón "Iniciar sesión"'),
    demo: (): Target => target(AuthIds.loginDemoButton, 'el botón "Usar cuenta demo"'),
    registerLink: (): Target => target(AuthIds.loginRegisterLink, 'el link "Crear cuenta"'),
    error: (): Target => target(AuthIds.loginErrorText, 'el error del inicio de sesión'),
};
