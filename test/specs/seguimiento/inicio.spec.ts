import { Ensure, includes, isLessThan, isTrue } from '@serenity-js/assertions';
import { notes } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { AmountValue, IsDisplayed, SemanticText } from '../../../src/screenplay/questions';
import {
    AbrirLaApp,
    ComprarInstrumento,
    EsperarA,
    IniciarSesion,
    IrALaTab,
    TerminarLaOrden,
} from '../../../src/screenplay/tasks';
import { Home } from '../../../src/screenplay/ui/dashboard.ui';

/** Lo que #actor anota durante estos escenarios. */
interface Notas {
    totalAnterior: number;
}

describe(Caracteristica('Ver el inicio'), () => {

    const conSesion = [AbrirLaApp(), IniciarSesion.conLaCuentaDemo()];

    it(Escenario('resume la cuenta y los que más se mueven', '@smoke', '@seguimiento'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor inició sesión con la cuenta demo', ...conSesion),
            Entonces(
                've el valor total de su cuenta',
                EsperarA(Home.withData()),
                Ensure.that(SemanticText.of(Home.total()), includes('pesos colombianos')),
            ),
            Y('ve la variación del día', Ensure.that(IsDisplayed.of(Home.dayChange()), isTrue())),
            Y('ve su distribución', Ensure.that(IsDisplayed.of(Home.allocationChart()), isTrue())),
            Y(
                've los instrumentos que más se mueven',
                Ensure.that(IsDisplayed.of(Home.mover('ECOPETROL-CO')), isTrue()),
                Ensure.that(SemanticText.of(Home.moverPrice('ECOPETROL-CO')), includes('pesos colombianos')),
            ),
        );
    });

    it(Escenario('el inicio se actualiza después de una compra', '@seguimiento'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor inició sesión con la cuenta demo', ...conSesion, EsperarA(Home.withData())),
            Y('anota el valor total de su cuenta', notes<Notas>().set('totalAnterior', AmountValue.of(Home.total()))),
            Cuando(
                'compra 2 acciones de ISA',
                ComprarInstrumento.conId('ISA-CO').cantidad(2),
                TerminarLaOrden(),
                IrALaTab.inicio(),
            ),
            Entonces(
                'el valor total baja, porque pagó la comisión',
                EsperarA(Home.withData()),
                Ensure.that(AmountValue.of(Home.total()), isLessThan(notes<Notas>().get('totalAnterior'))),
            ),
        );
    });
});
