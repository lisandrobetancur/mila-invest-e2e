/** Targets del shell: tabs y onboarding. */
import { AppCrossIds, ShellIds } from '../../../../src/screenplay/ids/ids.generated';
import { type Target, target } from './selector';

/** Tabs del shell. Los mismos ids que en web. */
export const Tab = {
    inicio: (): Target => target(ShellIds.navHomeTab, 'la tab Inicio'),
    mercado: (): Target => target(ShellIds.navMarketTab, 'la tab Mercado'),
    portafolio: (): Target => target(ShellIds.navPortfolioTab, 'la tab Portafolio'),
    actividad: (): Target => target(ShellIds.navActivityTab, 'la tab Actividad'),
};

export const Onboarding = {
    view: (): Target => target(AppCrossIds.onboardingView, 'el onboarding'),
    skip: (): Target => target(AppCrossIds.onboardingSkipButton, 'el botón "Saltar"'),
    next: (): Target => target(AppCrossIds.onboardingNextButton, 'el botón "Siguiente"'),
    start: (): Target => target(AppCrossIds.onboardingStartButton, 'el botón "Empezar"'),
};

export const Splash = {
    view: (): Target => target(AppCrossIds.splashView, 'el splash'),
};

export const Settings = {
    view: (): Target => target(AppCrossIds.settingsView, 'la pantalla de ajustes'),
    logout: (): Target => target(AppCrossIds.settingsLogoutButton, 'el botón "Cerrar sesión"'),
    logoutDialog: (): Target => target(AppCrossIds.settingsLogoutDialog, 'el diálogo de cierre de sesión'),
    logoutConfirm: (): Target => target(AppCrossIds.settingsLogoutConfirmButton, 'el botón de confirmar el cierre de sesión'),
};
