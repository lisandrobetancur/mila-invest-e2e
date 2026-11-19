/** Targets del shell: tabs, onboarding, splash y "no encontrado". */
import { AppCrossIds, ShellIds } from '../ids/ids.generated';
import { type Target, target } from './selector';

/** Tabs del shell. Los mismos ids en bottom bar y en rail lateral. */
export const Tab = {
    inicio: (): Target => target(ShellIds.navHomeTab, 'la tab Inicio'),
    mercado: (): Target => target(ShellIds.navMarketTab, 'la tab Mercado'),
    portafolio: (): Target => target(ShellIds.navPortfolioTab, 'la tab Portafolio'),
    actividad: (): Target => target(ShellIds.navActivityTab, 'la tab Actividad'),
};

export const Shell = {
    view: (): Target => target(ShellIds.navShellView, 'el shell de navegación'),
    notFound: (): Target => target(ShellIds.shellNotFoundView, 'la pantalla de "no encontrado"'),
    notFoundTitle: (): Target => target(ShellIds.shellNotFoundTitleText, 'el título de "no encontrado"'),
    notFoundHome: (): Target => target(ShellIds.shellNotFoundHomeButton, 'el botón "Ir al inicio"'),
};

export const Splash = {
    view: (): Target => target(AppCrossIds.splashView, 'el splash'),
    loading: (): Target => target(AppCrossIds.splashStateLoading, 'el splash arrancando'),
    error: (): Target => target(AppCrossIds.splashStateError, 'el splash con error'),
    retry: (): Target => target(AppCrossIds.splashRetryButton, 'el botón "Reintentar" del splash'),
};

export const Onboarding = {
    view: (): Target => target(AppCrossIds.onboardingView, 'el onboarding'),
    title: (): Target => target(AppCrossIds.onboardingStepTitleText, 'el título del paso del onboarding'),
    progress: (): Target => target(AppCrossIds.onboardingProgressText, 'el progreso del onboarding'),
    skip: (): Target => target(AppCrossIds.onboardingSkipButton, 'el botón "Saltar"'),
    next: (): Target => target(AppCrossIds.onboardingNextButton, 'el botón "Siguiente"'),
    start: (): Target => target(AppCrossIds.onboardingStartButton, 'el botón "Empezar"'),
};
