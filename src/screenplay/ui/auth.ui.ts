/** Targets de acceso: login y registro. */
import { AuthIds, DerivedIds } from '../ids/ids.generated';
import { type Target, target } from './selector';

export const LoginForm = {
    view: (): Target => target(AuthIds.loginView, 'la pantalla de inicio de sesión'),
    email: (): Target => target(AuthIds.loginEmailField, 'el campo de correo'),
    password: (): Target => target(AuthIds.loginPasswordField, 'el campo de contraseña'),
    passwordToggle: (): Target => target(AuthIds.loginPasswordToggle, 'el botón de ver la contraseña'),
    submit: (): Target => target(AuthIds.loginSubmitButton, 'el botón "Iniciar sesión"'),
    demo: (): Target => target(AuthIds.loginDemoButton, 'el botón "Usar cuenta demo"'),
    registerLink: (): Target => target(AuthIds.loginRegisterLink, 'el link "Crear cuenta"'),
    error: (): Target => target(AuthIds.loginErrorText, 'el error del inicio de sesión'),
    emailError: (): Target => target(DerivedIds.errorTextOf(AuthIds.loginEmailField), 'el error del campo de correo'),
    passwordError: (): Target => target(DerivedIds.errorTextOf(AuthIds.loginPasswordField), 'el error del campo de contraseña'),
};

export const RegisterForm = {
    view: (): Target => target(AuthIds.registerView, 'la pantalla de registro'),
    back: (): Target => target(AuthIds.registerBackIconButton, 'el botón de volver del registro'),
    name: (): Target => target(AuthIds.registerNameField, 'el campo de nombre'),
    email: (): Target => target(AuthIds.registerEmailField, 'el campo de correo del registro'),
    document: (): Target => target(AuthIds.registerDocumentField, 'el campo de documento'),
    password: (): Target => target(AuthIds.registerPasswordField, 'el campo de contraseña del registro'),
    accept: (): Target => target(AuthIds.registerAcceptCheckbox, 'la aceptación del aviso de simulación'),
    submit: (): Target => target(AuthIds.registerSubmitButton, 'el botón "Crear cuenta"'),
    loginLink: (): Target => target(AuthIds.registerLoginLink, 'el link "Ya tengo cuenta"'),
    error: (): Target => target(AuthIds.registerErrorText, 'el error del registro'),
    countryError: (): Target => target(AuthIds.registerCountryErrorText, 'el error de país'),
    acceptError: (): Target => target(AuthIds.registerAcceptCheckboxErrorText, 'el error de la aceptación'),
    nameError: (): Target => target(DerivedIds.errorTextOf(AuthIds.registerNameField), 'el error del campo de nombre'),
    emailError: (): Target => target(DerivedIds.errorTextOf(AuthIds.registerEmailField), 'el error del campo de correo'),
    documentError: (): Target => target(DerivedIds.errorTextOf(AuthIds.registerDocumentField), 'el error del campo de documento'),
    passwordError: (): Target => target(DerivedIds.errorTextOf(AuthIds.registerPasswordField), 'el error del campo de contraseña'),
    requirementLength: (): Target => target(AuthIds.registerRequirementLengthText, 'el requisito de largo de la contraseña'),
    requirementLetter: (): Target => target(AuthIds.registerRequirementLetterText, 'el requisito de letra de la contraseña'),
    requirementNumber: (): Target => target(AuthIds.registerRequirementNumberText, 'el requisito de número de la contraseña'),
};

/** Países del registro, por código ISO. */
export const CountryChip = {
    CO: (): Target => target(AuthIds.registerCountryCoChip, 'el chip de Colombia'),
    MX: (): Target => target(AuthIds.registerCountryMxChip, 'el chip de México'),
    PE: (): Target => target(AuthIds.registerCountryPeChip, 'el chip de Perú'),
};

/** Tipos de documento del registro. */
export const DocumentChip = {
    CC: (): Target => target(AuthIds.registerDocumentCcChip, 'el chip de documento CC'),
    CE: (): Target => target(AuthIds.registerDocumentCeChip, 'el chip de documento CE'),
    CURP: (): Target => target(AuthIds.registerDocumentCurpChip, 'el chip de documento CURP'),
    DNI: (): Target => target(AuthIds.registerDocumentDniChip, 'el chip de documento DNI'),
};
