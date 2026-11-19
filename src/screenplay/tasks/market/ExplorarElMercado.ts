/** Explorar el mercado: filtros, búsqueda y detalle. */
import { Duration, Task, Wait } from '@serenity-js/core';
import { equals, isTrue } from '@serenity-js/assertions';

import { ClearAndType, ScrollIntoView, TapOn } from '../../interactions';
import {
    type ChartRange,
    type CountryCode,
    CountryFilter,
    type InstrumentType,
    InstrumentDetail,
    MarketList,
    RangeSegment,
    TypeFilter,
} from '../../ui/market.ui';
import { env } from '../../../config/env';
import { IsSelected, QueryParam } from '../../questions';
import { EsperarA, EsperarLaCargaDe } from '../esperas';
import { IrALaTab } from '../navegacion/IrALaTab';

/** Abre la tab Mercado y espera la lista. */
export const AbrirElMercado = (): Task =>
    Task.where('#actor abre el mercado', IrALaTab.mercado(), EsperarLaCargaDe(MarketList.withData()));

export const FiltrarInstrumentos = {
    /**
     * Filtra por país. La URL pasa a reflejarlo (`?country=PE`), pero el
     * router la actualiza un frame después del toque: se espera a que el
     * chip quede elegido antes de seguir.
     */
    porPais: (country: CountryCode | 'TODOS'): Task =>
        Task.where(
            `#actor filtra por país ${country}`,
            TapOn.element(CountryFilter[country]()),
            Wait.upTo(Duration.ofMilliseconds(env.timeouts.element)).until(
                IsSelected.of(CountryFilter[country]()),
                isTrue(),
            ),
        ),

    /** Filtra por tipo de instrumento. */
    porTipo: (type: InstrumentType): Task =>
        Task.where(
            `#actor filtra por tipo ${type}`,
            TapOn.element(TypeFilter[type]()),
            Wait.upTo(Duration.ofMilliseconds(env.timeouts.element)).until(
                IsSelected.of(TypeFilter[type]()),
                isTrue(),
            ),
        ),

    /** Busca por texto. La búsqueda llega a la URL con un pequeño retraso. */
    buscando: (text: string): Task =>
        Task.where(
            `#actor busca "${text}"`,
            EsperarA(MarketList.search()),
            ClearAndType.theValue(text).into(MarketList.search()),
            Wait.upTo(Duration.ofMilliseconds(env.timeouts.element)).until(
                QueryParam.named('q'),
                equals(text),
            ),
        ),

    /** Toca "Limpiar filtros" del estado vacío. */
    limpiandoLosFiltros: (): Task =>
        Task.where(
            '#actor limpia los filtros',
            EsperarA(MarketList.clearFilters()),
            TapOn.element(MarketList.clearFilters()),
        ),
};

/** Abre el detalle de un instrumento desde la lista. */
export const AbrirInstrumento = {
    conId: (instrumentId: string): Task =>
        Task.where(
            `#actor abre el instrumento ${instrumentId}`,
            AbrirElMercado(),
            ScrollIntoView.element(MarketList.instrument(instrumentId)),
            TapOn.element(MarketList.instrument(instrumentId)),
            EsperarLaCargaDe(InstrumentDetail.withData()),
        ),
};

/** Cambia el rango del gráfico del detalle. */
export const CambiarElRangoDelGrafico = {
    a: (range: ChartRange): Task =>
        Task.where(
            `#actor cambia el rango del gráfico a ${range}`,
            TapOn.element(RangeSegment[range]()),
            EsperarA(InstrumentDetail.chart()),
        ),
};
