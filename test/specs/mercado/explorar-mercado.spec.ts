import { Ensure, equals, isGreaterThan, isTrue } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { ElementCount, IsDisplayed, IsSelected, QueryParam } from '../../../src/screenplay/questions';
import {
    AbrirElMercado,
    AbrirLaApp,
    EsperarA,
    FiltrarInstrumentos,
    IniciarSesion,
} from '../../../src/screenplay/tasks';
import { CountryFilter, MarketList } from '../../../src/screenplay/ui/market.ui';

describe(Caracteristica('Explorar el mercado'), () => {

    // Antecedentes: Licho entró con la cuenta demo y está en el mercado.
    const enElMercado = [AbrirLaApp(), IniciarSesion.conLaCuentaDemo(), AbrirElMercado()];

    it(Escenario('filtra por país y la URL lo refleja', '@mercado'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor está en el mercado', ...enElMercado),
            Cuando('filtra por Perú', FiltrarInstrumentos.porPais('PE')),
            Entonces('la URL refleja el filtro', Ensure.that(QueryParam.named('country'), equals('PE'))),
            Y('el chip de Perú queda elegido', Ensure.that(IsSelected.of(CountryFilter.PE()), isTrue())),
            Y(
                've instrumentos peruanos',
                EsperarA(MarketList.instrument('BAP-PE')),
                Ensure.that(IsDisplayed.of(MarketList.instrument('BAP-PE')), isTrue()),
            ),
        );
    });

    it(Escenario('filtra por tipo y la URL lo refleja', '@mercado'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor está en el mercado', ...enElMercado),
            Cuando('filtra por ETFs', FiltrarInstrumentos.porTipo('ETF')),
            Entonces('la URL refleja el tipo', Ensure.that(QueryParam.named('type'), equals('ETF'))),
            Y(
                've el ETF del mercado colombiano',
                EsperarA(MarketList.instrument('ICOLCAP-CO')),
                Ensure.that(IsDisplayed.of(MarketList.instrument('ICOLCAP-CO')), isTrue()),
            ),
        );
    });

    it(Escenario('una búsqueda sin resultados ofrece limpiar los filtros', '@mercado'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor está en el mercado', ...enElMercado),
            Cuando('busca algo que no existe', FiltrarInstrumentos.buscando('zzz')),
            Entonces(
                've el estado vacío',
                EsperarA(MarketList.empty()),
                Ensure.that(IsDisplayed.of(MarketList.emptyTitle()), isTrue()),
            ),
            Y('la URL refleja la búsqueda', Ensure.that(QueryParam.named('q'), equals('zzz'))),
            Cuando('limpia los filtros', FiltrarInstrumentos.limpiandoLosFiltros()),
            Entonces(
                'vuelve a ver instrumentos',
                EsperarA(MarketList.withData()),
                Ensure.that(ElementCount.of(MarketList.allInstruments()), isGreaterThan(0)),
            ),
            Y('la búsqueda quedó vacía', Ensure.that(QueryParam.named('q'), equals(''))),
        );
    });
});
