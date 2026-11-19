import { Ensure, equals, includes, isTrue } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { Desplazarse } from '../../src/screenplay/interactions';
import { IsDisplayed, SemanticText } from '../../src/screenplay/questions';
import {
    AbrirElMercado,
    AbrirInstrumento,
    AbrirLaApp,
    EsperarA,
    FiltrarInstrumentos,
    IniciarSesion,
} from '../../src/screenplay/tasks';
import { InstrumentDetail, MarketList } from '../../src/screenplay/ui/market.ui';

describe(Caracteristica('Explorar el mercado'), () => {

    // Antecedentes: cada escenario arranca con la app reiniciada, así que
    // vuelve a entrar. Es el precio del aislamiento en un dispositivo.
    const enElMercado = [AbrirLaApp(), IniciarSesion.conLaCuentaDemo(), AbrirElMercado()];

    it(Escenario('filtra por país', '@smoke', '@mercado'), async () => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor está en el mercado', ...enElMercado),
            Cuando('filtra por Perú', FiltrarInstrumentos.porPais('PE')),
            Entonces(
                've instrumentos peruanos',
                EsperarA(MarketList.instrument('BAP-PE')),
                Ensure.that(IsDisplayed.of(MarketList.instrument('BAP-PE')), isTrue()),
            ),
            Y(
                've su precio en soles',
                Ensure.that(SemanticText.of(MarketList.instrumentPrice('BAP-PE')), includes('soles')),
            ),
        );
    });

    it(Escenario('abre un instrumento que está fuera de la pantalla', '@smoke', '@mercado'), async () => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor está en el mercado', ...enElMercado),
            Entonces(
                'el último instrumento de la lista todavía no se ve',
                Ensure.that(IsDisplayed.of(MarketList.instrument('FERREYC1-PE')), equals(false)),
            ),
            Cuando(
                'se desplaza hasta encontrarlo',
                Desplazarse.haciaAbajo.hasta(MarketList.instrument('FERREYC1-PE')),
            ),
            Entonces(
                'ya puede verlo',
                Ensure.that(IsDisplayed.of(MarketList.instrument('FERREYC1-PE')), isTrue()),
            ),
        );
    });

    it(Escenario('abre el detalle de un instrumento', '@mercado'), async () => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor inició sesión con la cuenta demo', AbrirLaApp(), IniciarSesion.conLaCuentaDemo()),
            Cuando('abre ISA desde el mercado', AbrirInstrumento.conId('ISA-CO')),
            Entonces('ve el ticker', Ensure.that(SemanticText.of(InstrumentDetail.ticker()), equals('ISA'))),
            Y(
                've el precio en pesos colombianos',
                Ensure.that(SemanticText.of(InstrumentDetail.price()), includes('pesos colombianos')),
            ),
            Y('puede comprar', Ensure.that(IsDisplayed.of(InstrumentDetail.buy()), isTrue())),
        );
    });

    it(Escenario('una búsqueda sin resultados ofrece limpiar los filtros', '@mercado'), async () => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor está en el mercado', ...enElMercado),
            Cuando('busca algo que no existe', FiltrarInstrumentos.buscando('zzz')),
            Entonces(
                've el estado vacío',
                EsperarA(MarketList.empty()),
                Ensure.that(IsDisplayed.of(MarketList.emptyTitle()), isTrue()),
            ),
            Cuando('limpia los filtros', FiltrarInstrumentos.limpiandoLosFiltros()),
            Entonces(
                'vuelve a ver instrumentos',
                EsperarA(MarketList.withData()),
                Ensure.that(IsDisplayed.of(MarketList.instrument('ECOPETROL-CO')), isTrue()),
            ),
        );
    });
});
