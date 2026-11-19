import { Ensure, equals, includes, isTrue } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { CurrentPath, IsDisplayed, SemanticText } from '../../../src/screenplay/questions';
import {
    AbrirInstrumento,
    AbrirLaApp,
    CambiarElRangoDelGrafico,
    EsperarA,
    IniciarSesion,
} from '../../../src/screenplay/tasks';
import { InstrumentDetail } from '../../../src/screenplay/ui/market.ui';

describe(Caracteristica('Ver el detalle de un instrumento'), () => {

    const conSesion = [AbrirLaApp(), IniciarSesion.conLaCuentaDemo()];

    it(Escenario('abre el detalle desde la lista', '@mercado'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor inició sesión con la cuenta demo', ...conSesion),
            Cuando('abre ISA desde el mercado', AbrirInstrumento.conId('ISA-CO')),
            Entonces('la URL es la del instrumento', Ensure.that(CurrentPath(), equals('/market/instrument/ISA-CO'))),
            Y('ve el ticker', Ensure.that(SemanticText.of(InstrumentDetail.ticker()), equals('ISA'))),
            Y('ve el precio en pesos colombianos', Ensure.that(SemanticText.of(InstrumentDetail.price()), includes('pesos colombianos'))),
            Y('ve el gráfico', Ensure.that(IsDisplayed.of(InstrumentDetail.chart()), isTrue())),
            Y('puede comprar y vender', Ensure.that(IsDisplayed.of(InstrumentDetail.buy()), isTrue())),
        );
    });

    it(Escenario('cambia el rango del gráfico', '@mercado'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor está viendo ECOPETROL', ...conSesion, AbrirInstrumento.conId('ECOPETROL-CO')),
            Cuando('cambia el rango del gráfico a un mes', CambiarElRangoDelGrafico.a('1M')),
            Entonces(
                'el gráfico sigue en pantalla',
                EsperarA(InstrumentDetail.chart()),
                Ensure.that(IsDisplayed.of(InstrumentDetail.chart()), isTrue()),
            ),
            Y('sigue en el mismo instrumento', Ensure.that(CurrentPath(), equals('/market/instrument/ECOPETROL-CO'))),
        );
    });

    it(Escenario('ve su posición en un instrumento que ya tiene', '@mercado'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor inició sesión con la cuenta demo', ...conSesion),
            Cuando('abre ECOPETROL, donde ya tiene posición', AbrirInstrumento.conId('ECOPETROL-CO')),
            Entonces(
                've cuántas acciones tiene',
                EsperarA(InstrumentDetail.positionQuantity()),
                Ensure.that(SemanticText.of(InstrumentDetail.positionQuantity()), includes('120')),
            ),
            Y('ve el valor de su posición', Ensure.that(IsDisplayed.of(InstrumentDetail.positionValue()), isTrue())),
        );
    });
});
