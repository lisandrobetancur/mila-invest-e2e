/** Targets del mercado: lista y detalle de instrumento. */
import { DerivedIds, MarketIds } from '../ids/ids.generated';
import { type Target, target, targetStartingWith } from './selector';

/** Países que filtran la lista. */
export type CountryCode = 'CO' | 'MX' | 'PE';

/** Tipos de instrumento que filtran la lista. */
export type InstrumentType = 'STOCK' | 'ETF';

/** Rangos del gráfico del detalle. */
export type ChartRange = '1D' | '1W' | '1M' | '3M' | '1Y';

export const MarketList = {
    view: (): Target => target(MarketIds.listView, 'la lista del mercado'),
    withData: (): Target => target(MarketIds.listStateData, 'la lista con instrumentos'),
    empty: (): Target => target(MarketIds.listStateEmpty, 'la lista sin resultados'),
    emptyTitle: (): Target => target(MarketIds.listEmptyTitleText, 'el título del estado vacío de la lista'),
    search: (): Target => target(MarketIds.listSearchField, 'el buscador del mercado'),
    clearSearch: (): Target => target(MarketIds.listSearchClearIconButton, 'el botón de limpiar la búsqueda'),
    clearFilters: (): Target => target(MarketIds.listClearFiltersButton, 'el botón "Limpiar filtros"'),
    allInstruments: (): Target =>
        targetStartingWith(MarketIds.listInstrumentItem(''), 'los instrumentos de la lista'),
    instrument: (instrumentId: string): Target =>
        target(MarketIds.listInstrumentItem(instrumentId), `el instrumento ${instrumentId} de la lista`),
    instrumentPrice: (instrumentId: string): Target =>
        target(DerivedIds.priceTextOf(MarketIds.listInstrumentItem(instrumentId)), `el precio de ${instrumentId} en la lista`),
    instrumentChange: (instrumentId: string): Target =>
        target(DerivedIds.changeTextOf(MarketIds.listInstrumentItem(instrumentId)), `la variación de ${instrumentId} en la lista`),
    instrumentCountry: (instrumentId: string): Target =>
        target(DerivedIds.countryTextOf(MarketIds.listInstrumentItem(instrumentId)), `el país de ${instrumentId} en la lista`),
};

/** Chip de país de la lista. `TODOS` quita el filtro. */
export const CountryFilter: Record<CountryCode | 'TODOS', () => Target> = {
    TODOS: () => target(MarketIds.listCountryAllChip, 'el chip de país "Todos"'),
    CO: () => target(MarketIds.listCountryCoChip, 'el chip de país Colombia'),
    MX: () => target(MarketIds.listCountryMxChip, 'el chip de país México'),
    PE: () => target(MarketIds.listCountryPeChip, 'el chip de país Perú'),
};

/** Chip de tipo de instrumento. */
export const TypeFilter: Record<InstrumentType, () => Target> = {
    STOCK: () => target(MarketIds.listTypeStockChip, 'el chip de tipo Acciones'),
    ETF: () => target(MarketIds.listTypeEtfChip, 'el chip de tipo ETFs'),
};

export const InstrumentDetail = {
    view: (): Target => target(MarketIds.detailView, 'el detalle del instrumento'),
    withData: (): Target => target(MarketIds.detailStateData, 'el detalle con datos'),
    notFound: (): Target => target(MarketIds.detailStateEmpty, 'el detalle de un instrumento inexistente'),
    notFoundTitle: (): Target => target(MarketIds.detailNotFoundTitleText, 'el título de "instrumento no encontrado"'),
    backToMarket: (): Target => target(MarketIds.detailBackToMarketButton, 'el botón de volver al mercado'),
    back: (): Target => target(MarketIds.detailBackIconButton, 'el botón de volver del detalle'),
    ticker: (): Target => target(MarketIds.detailTickerText, 'el ticker'),
    name: (): Target => target(MarketIds.detailNameText, 'el nombre del emisor'),
    country: (): Target => target(MarketIds.detailCountryText, 'el país del instrumento'),
    price: (): Target => target(MarketIds.detailPriceText, 'el último precio'),
    change: (): Target => target(MarketIds.detailChangeText, 'la variación del día'),
    volume: (): Target => target(MarketIds.detailVolumeText, 'el volumen'),
    chart: (): Target => target(MarketIds.detailChart, 'el gráfico de precios'),
    positionQuantity: (): Target => target(MarketIds.detailPositionQuantityText, 'la cantidad en posición'),
    positionValue: (): Target => target(MarketIds.detailPositionValueText, 'el valor de la posición'),
    positionPnl: (): Target => target(MarketIds.detailPositionPnlText, 'el P&L de la posición'),
    buy: (): Target => target(MarketIds.detailBuyButton, 'el botón "Comprar"'),
    sell: (): Target => target(MarketIds.detailSellButton, 'el botón "Vender"'),
};

/** Segmento de rango del gráfico. */
export const RangeSegment: Record<ChartRange, () => Target> = {
    '1D': () => target(MarketIds.detailRange1dSegment, 'el rango 1D'),
    '1W': () => target(MarketIds.detailRange1wSegment, 'el rango 1S'),
    '1M': () => target(MarketIds.detailRange1mSegment, 'el rango 1M'),
    '3M': () => target(MarketIds.detailRange3mSegment, 'el rango 3M'),
    '1Y': () => target(MarketIds.detailRange1ySegment, 'el rango 1A'),
};
