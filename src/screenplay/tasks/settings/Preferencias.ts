/** Cambiar idioma y tema, sin reiniciar la app. */
import { Task } from '@serenity-js/core';

import { TapOn } from '../../interactions';
import { type Language, LanguageSegment, Settings, type Theme, ThemeSegment } from '../../ui/settings.ui';
import { EsperarA, EsperarAQueDesaparezca } from '../esperas';

export const CambiarIdioma = {
    a: (language: Language): Task =>
        Task.where(
            `#actor cambia el idioma a ${language}`,
            EsperarA(Settings.view()),
            TapOn.element(LanguageSegment[language]()),
        ),
};

/** Vuelve del detalle de ajustes a donde estaba. */
export const VolverDeAjustes = (): Task =>
    Task.where(
        '#actor vuelve de los ajustes',
        EsperarA(Settings.back()),
        TapOn.element(Settings.back()),
        EsperarAQueDesaparezca(Settings.view()),
    );

export const CambiarTema = {
    a: (theme: Theme): Task =>
        Task.where(
            `#actor cambia el tema a ${theme}`,
            EsperarA(Settings.view()),
            TapOn.element(ThemeSegment[theme]()),
        ),
};
