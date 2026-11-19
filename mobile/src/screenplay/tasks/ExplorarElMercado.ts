/** Explorar el mercado en el teléfono. */
import { Task } from '@serenity-js/core';

import { ClearAndType, Desplazarse, TapOn } from '../interactions';
import { type CountryCode, CountryFilter, InstrumentDetail, MarketList } from '../ui/market.ui';
import { Tab } from '../ui/shell.ui';
import { EsperarA, EsperarLaCargaDe } from './esperas';

/** Abre la tab Mercado y espera la lista. */
export const AbrirElMercado = (): Task =>
    Task.where(
        '#actor abre el mercado',
        TapOn.element(Tab.mercado()),
        EsperarLaCargaDe(MarketList.withData()),
    );

export const FiltrarInstrumentos = {
    /** Filtra por país. */
    porPais: (country: CountryCode | 'TODOS'): Task =>
        Task.where(`#actor filtra por país ${country}`, TapOn.element(CountryFilter[country]())),

    /** Busca por texto. */
    buscando: (text: string): Task =>
        Task.where(
            `#actor busca "${text}"`,
            EsperarA(MarketList.search()),
            ClearAndType.theValue(text).into(MarketList.search()),
        ),

    /** Toca "Limpiar filtros" del estado vacío. */
    limpiandoLosFiltros: (): Task =>
        Task.where(
            '#actor limpia los filtros',
            EsperarA(MarketList.clearFilters()),
            TapOn.element(MarketList.clearFilters()),
        ),
};

/**
 * Abre el detalle de un instrumento desde la lista.
 *
 * En el teléfono la lista no entra en una pantalla: hay que desplazarse
 * hasta el instrumento antes de tocarlo.
 */
export const AbrirInstrumento = {
    conId: (instrumentId: string): Task =>
        Task.where(
            `#actor abre el instrumento ${instrumentId}`,
            AbrirElMercado(),
            Desplazarse.haciaAbajo.hasta(MarketList.instrument(instrumentId)),
            TapOn.element(MarketList.instrument(instrumentId)),
            EsperarLaCargaDe(InstrumentDetail.withData()),
        ),
};
