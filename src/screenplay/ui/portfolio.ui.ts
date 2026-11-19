/** Targets del portafolio. */
import { DerivedIds, PortfolioIds } from '../ids/ids.generated';
import { type Target, target, targetStartingWith } from './selector';

/** Tipos que componen la distribución. */
export type AllocationType = 'STOCK' | 'ETF' | 'CASH';

export const Portfolio = {
    view: (): Target => target(PortfolioIds.overviewView, 'el portafolio'),
    withData: (): Target => target(PortfolioIds.overviewStateData, 'el portafolio con datos'),
    empty: (): Target => target(PortfolioIds.overviewStateEmpty, 'el portafolio sin inversiones'),
    emptyTitle: (): Target => target(PortfolioIds.overviewEmptyTitleText, 'el título del portafolio vacío'),
    explore: (): Target => target(PortfolioIds.overviewExploreButton, 'el botón "Explorar mercado" del portafolio'),
    total: (): Target => target(PortfolioIds.overviewTotalText, 'el valor total del portafolio'),
    dayChange: (): Target => target(PortfolioIds.overviewDayChangeText, 'la variación del día del portafolio'),
    cash: (): Target => target(PortfolioIds.overviewCashText, 'el efectivo'),
    invested: (): Target => target(PortfolioIds.overviewInvestedText, 'lo invertido'),
    allocationChart: (): Target => target(PortfolioIds.overviewAllocationChart, 'el gráfico de distribución'),
    allocation: (type: AllocationType): Target =>
        target(PortfolioIds.allocationItem(type), `la porción de distribución de tipo ${type}`),
    allPositions: (): Target =>
        targetStartingWith(PortfolioIds.positionItem(''), 'las posiciones del portafolio'),
    position: (instrumentId: string): Target =>
        target(PortfolioIds.positionItem(instrumentId), `la posición en ${instrumentId}`),
    positionQuantity: (instrumentId: string): Target =>
        target(DerivedIds.quantityTextOf(PortfolioIds.positionItem(instrumentId)), `la cantidad de la posición en ${instrumentId}`),
    positionAvgCost: (instrumentId: string): Target =>
        target(DerivedIds.avgCostTextOf(PortfolioIds.positionItem(instrumentId)), `el costo promedio de la posición en ${instrumentId}`),
    positionValue: (instrumentId: string): Target =>
        target(DerivedIds.valueTextOf(PortfolioIds.positionItem(instrumentId)), `el valor de la posición en ${instrumentId}`),
    positionPnl: (instrumentId: string): Target =>
        target(DerivedIds.pnlTextOf(PortfolioIds.positionItem(instrumentId)), `el P&L de la posición en ${instrumentId}`),
};
