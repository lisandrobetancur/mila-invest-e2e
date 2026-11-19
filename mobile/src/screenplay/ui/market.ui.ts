/** Targets del mercado. */
import { DerivedIds, MarketIds } from '../../../../src/screenplay/ids/ids.generated';
import { type Target, target } from './selector';

/** Países que filtran la lista. */
export type CountryCode = 'CO' | 'MX' | 'PE';

export const MarketList = {
    view: (): Target => target(MarketIds.listView, 'la lista del mercado'),
    withData: (): Target => target(MarketIds.listStateData, 'la lista con instrumentos'),
    empty: (): Target => target(MarketIds.listStateEmpty, 'la lista sin resultados'),
    emptyTitle: (): Target => target(MarketIds.listEmptyTitleText, 'el título del estado vacío'),
    search: (): Target => target(MarketIds.listSearchField, 'el buscador del mercado'),
    clearFilters: (): Target => target(MarketIds.listClearFiltersButton, 'el botón "Limpiar filtros"'),
    instrument: (instrumentId: string): Target =>
        target(MarketIds.listInstrumentItem(instrumentId), `el instrumento ${instrumentId} de la lista`),
    instrumentPrice: (instrumentId: string): Target =>
        target(DerivedIds.priceTextOf(MarketIds.listInstrumentItem(instrumentId)), `el precio de ${instrumentId} en la lista`),
};

/** Chip de país de la lista. */
export const CountryFilter: Record<CountryCode | 'TODOS', () => Target> = {
    TODOS: () => target(MarketIds.listCountryAllChip, 'el chip de país "Todos"'),
    CO: () => target(MarketIds.listCountryCoChip, 'el chip de país Colombia'),
    MX: () => target(MarketIds.listCountryMxChip, 'el chip de país México'),
    PE: () => target(MarketIds.listCountryPeChip, 'el chip de país Perú'),
};

export const InstrumentDetail = {
    view: (): Target => target(MarketIds.detailView, 'el detalle del instrumento'),
    withData: (): Target => target(MarketIds.detailStateData, 'el detalle con datos'),
    ticker: (): Target => target(MarketIds.detailTickerText, 'el ticker'),
    price: (): Target => target(MarketIds.detailPriceText, 'el último precio'),
    chart: (): Target => target(MarketIds.detailChart, 'el gráfico de precios'),
    positionQuantity: (): Target => target(MarketIds.detailPositionQuantityText, 'la cantidad en posición'),
    buy: (): Target => target(MarketIds.detailBuyButton, 'el botón "Comprar"'),
    sell: (): Target => target(MarketIds.detailSellButton, 'el botón "Vender"'),
};
