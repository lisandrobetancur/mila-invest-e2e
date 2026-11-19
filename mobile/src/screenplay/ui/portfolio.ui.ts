/** Targets del portafolio. */
import { DerivedIds, PortfolioIds } from '../../../../src/screenplay/ids/ids.generated';
import { type Target, target } from './selector';

export const Portfolio = {
    view: (): Target => target(PortfolioIds.overviewView, 'el portafolio'),
    withData: (): Target => target(PortfolioIds.overviewStateData, 'el portafolio con datos'),
    total: (): Target => target(PortfolioIds.overviewTotalText, 'el valor total del portafolio'),
    cash: (): Target => target(PortfolioIds.overviewCashText, 'el efectivo'),
    invested: (): Target => target(PortfolioIds.overviewInvestedText, 'lo invertido'),
    position: (instrumentId: string): Target =>
        target(PortfolioIds.positionItem(instrumentId), `la posición en ${instrumentId}`),
    positionQuantity: (instrumentId: string): Target =>
        target(DerivedIds.quantityTextOf(PortfolioIds.positionItem(instrumentId)), `la cantidad de la posición en ${instrumentId}`),
    positionValue: (instrumentId: string): Target =>
        target(DerivedIds.valueTextOf(PortfolioIds.positionItem(instrumentId)), `el valor de la posición en ${instrumentId}`),
};
