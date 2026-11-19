import { Ensure, equals, includes, isTrue } from '@serenity-js/assertions';
import { notes } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { AmountValue, IsDisplayed, SemanticText } from '../../../src/screenplay/questions';
import {
    AbrirAjustes,
    AbrirLaApp,
    CambiarIdioma,
    CambiarTema,
    EsperarA,
    IniciarSesion,
    VolverDeAjustes,
} from '../../../src/screenplay/tasks';
import { Home } from '../../../src/screenplay/ui/dashboard.ui';
import { Settings } from '../../../src/screenplay/ui/settings.ui';

/** Lo que #actor anota durante estos escenarios. */
interface Notas {
    totalEnEspanol: number;
}

describe(Caracteristica('Ajustar la app'), () => {

    const conSesion = [AbrirLaApp(), IniciarSesion.conLaCuentaDemo()];

    it(Escenario('cambia el idioma sin reiniciar y sin tocar el formato de los montos', '@plataforma'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor inició sesión con la cuenta demo', ...conSesion, EsperarA(Home.withData())),
            Y('anota su valor total', notes<Notas>().set('totalEnEspanol', AmountValue.of(Home.total()))),
            Cuando('cambia el idioma a inglés', AbrirAjustes(), CambiarIdioma.a('en'), VolverDeAjustes()),
            Entonces(
                've el inicio en inglés',
                EsperarA(Home.withData()),
                Ensure.that(SemanticText.of(Home.total()), includes('Colombian pesos')),
            ),
            Y(
                'el monto es exactamente el mismo',
                Ensure.that(AmountValue.of(Home.total()), equals(notes<Notas>().get('totalEnEspanol'))),
            ),
        );
    });

    it(Escenario('cambia el tema sin reiniciar', '@plataforma'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor está en los ajustes', ...conSesion, AbrirAjustes()),
            Cuando('elige el tema oscuro', CambiarTema.a('dark')),
            Entonces(
                'sigue en los ajustes, con todo en su lugar',
                Ensure.that(IsDisplayed.of(Settings.logout()), isTrue()),
                Ensure.that(SemanticText.of(Settings.accountEmail()), equals('demo@milainvest.app')),
            ),
            Cuando('vuelve al inicio', VolverDeAjustes()),
            Entonces(
                've su cuenta igual que antes',
                EsperarA(Home.withData()),
                Ensure.that(SemanticText.of(Home.total()), includes('pesos colombianos')),
            ),
        );
    });
});
