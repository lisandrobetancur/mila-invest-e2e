/** Targets de ajustes. */
import { AppCrossIds } from '../ids/ids.generated';
import { type Target, target } from './selector';

/** Idiomas de la app. */
export type Language = 'es' | 'en';

/** Temas de la app. */
export type Theme = 'system' | 'light' | 'dark';

export const Settings = {
    view: (): Target => target(AppCrossIds.settingsView, 'la pantalla de ajustes'),
    back: (): Target => target(AppCrossIds.settingsBackIconButton, 'el botón de volver de ajustes'),
    accountName: (): Target => target(AppCrossIds.settingsAccountNameText, 'el nombre de la cuenta'),
    accountEmail: (): Target => target(AppCrossIds.settingsAccountEmailText, 'el correo de la cuenta'),
    accountCountry: (): Target => target(AppCrossIds.settingsAccountCountryText, 'el país de la cuenta'),
    accountDocument: (): Target => target(AppCrossIds.settingsAccountDocumentText, 'el documento de la cuenta'),
    version: (): Target => target(AppCrossIds.settingsVersionText, 'la versión de la app'),
    disclaimer: (): Target => target(AppCrossIds.settingsDisclaimerText, 'el aviso de simulación de ajustes'),
    simulated: (): Target => target(AppCrossIds.settingsSimulatedText, 'el badge "Simulado" de ajustes'),
    logout: (): Target => target(AppCrossIds.settingsLogoutButton, 'el botón "Cerrar sesión"'),
    logoutDialog: (): Target => target(AppCrossIds.settingsLogoutDialog, 'el diálogo de cierre de sesión'),
    logoutConfirm: (): Target => target(AppCrossIds.settingsLogoutConfirmButton, 'el botón de confirmar el cierre de sesión'),
    logoutCancel: (): Target => target(AppCrossIds.settingsLogoutCancelButton, 'el botón de cancelar el cierre de sesión'),
};

/** Segmento de idioma. */
export const LanguageSegment: Record<Language, () => Target> = {
    es: () => target(AppCrossIds.settingsLanguageEsSegment, 'el idioma español'),
    en: () => target(AppCrossIds.settingsLanguageEnSegment, 'el idioma inglés'),
};

/** Segmento de tema. */
export const ThemeSegment: Record<Theme, () => Target> = {
    system: () => target(AppCrossIds.settingsThemeSystemSegment, 'el tema del sistema'),
    light: () => target(AppCrossIds.settingsThemeLightSegment, 'el tema claro'),
    dark: () => target(AppCrossIds.settingsThemeDarkSegment, 'el tema oscuro'),
};
