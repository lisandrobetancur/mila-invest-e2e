import { Ensure, equals, isTrue } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { CurrentPath, IsDisplayed, SemanticText } from '../../../src/screenplay/questions';
import {
    AbrirLaRuta,
    EsperarA,
    EsperarLaCargaDe,
    IniciarSesion,
} from '../../../src/screenplay/tasks';
import { LoginForm } from '../../../src/screenplay/ui/auth.ui';
import { InstrumentDetail } from '../../../src/screenplay/ui/market.ui';

describe(Caracteristica('Abrir la app por un deep link'), () => {

    it(Escenario('un deep link sin sesión pasa por el login y vuelve al instrumento', '@plataforma'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor abre el link de ISA sin tener sesión', AbrirLaRuta('/market/instrument/ISA-CO')),
            Entonces(
                'la app le pide iniciar sesión',
                EsperarLaCargaDe(LoginForm.view()),
                Ensure.that(CurrentPath(), equals('/login')),
            ),
            Cuando('inicia sesión con la cuenta demo', IniciarSesion.conLaCuentaDemo()),
            Entonces(
                'vuelve al instrumento que había pedido',
                EsperarLaCargaDe(InstrumentDetail.withData()),
                Ensure.that(CurrentPath(), equals('/market/instrument/ISA-CO')),
            ),
            Y('ve el ticker', Ensure.that(SemanticText.of(InstrumentDetail.ticker()), equals('ISA'))),
        );
    });

    it(Escenario('un instrumento que no existe muestra "no encontrado"', '@plataforma'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor abre el link de un instrumento inexistente', AbrirLaRuta('/market/instrument/NOPE-XX')),
            Cuando('inicia sesión con la cuenta demo', EsperarLaCargaDe(LoginForm.view()), IniciarSesion.conLaCuentaDemo()),
            Entonces(
                've que no existe',
                EsperarA(InstrumentDetail.notFound()),
                Ensure.that(IsDisplayed.of(InstrumentDetail.notFoundTitle()), isTrue()),
            ),
            Y('puede volver al mercado', Ensure.that(IsDisplayed.of(InstrumentDetail.backToMarket()), isTrue())),
        );
    });
});
