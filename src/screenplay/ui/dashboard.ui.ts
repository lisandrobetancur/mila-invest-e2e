/** Targets del inicio. */
import { DashboardIds, DerivedIds } from '../ids/ids.generated';
import { type Target, target } from './selector';
import type { AllocationType } from './portfolio.ui';

export const Home = {
    view: (): Target => target(DashboardIds.homeView, 'el inicio'),
    withData: (): Target => target(DashboardIds.homeStateData, 'el inicio con datos'),
    empty: (): Target => target(DashboardIds.homeStateEmpty, 'el inicio de un usuario nuevo'),
    emptyTitle: (): Target => target(DashboardIds.homeEmptyTitleText, 'el título de "Haz tu primer depósito"'),
    emptyDeposit: (): Target => target(DashboardIds.homeEmptyDepositButton, 'el botón "Depositar" del inicio vacío'),
    greeting: (): Target => target(DashboardIds.homeGreetingText, 'el saludo'),
    total: (): Target => target(DashboardIds.homeTotalText, 'el valor total del inicio'),
    dayChange: (): Target => target(DashboardIds.homeDayChangeText, 'la variación del día del inicio'),
    allocationChart: (): Target => target(DashboardIds.homeAllocationChart, 'la distribución compacta'),
    allocation: (type: AllocationType): Target =>
        target(DashboardIds.allocationItem(type), `la porción de distribución de tipo ${type} en el inicio`),
    wallet: (): Target => target(DashboardIds.homeWalletIconButton, 'el botón de la billetera'),
    settings: (): Target => target(DashboardIds.homeSettingsIconButton, 'el botón de ajustes'),
    recentAll: (): Target => target(DashboardIds.homeRecentAllButton, 'el botón "Ver todo" de los movimientos'),
    mover: (instrumentId: string): Target =>
        target(DashboardIds.moverItem(instrumentId), `${instrumentId} entre los que más se mueven`),
    moverPrice: (instrumentId: string): Target =>
        target(DerivedIds.priceTextOf(DashboardIds.moverItem(instrumentId)), `el precio de ${instrumentId} en el inicio`),
    moverChange: (instrumentId: string): Target =>
        target(DerivedIds.changeTextOf(DashboardIds.moverItem(instrumentId)), `la variación de ${instrumentId} en el inicio`),
    recent: (transactionId: string): Target =>
        target(DashboardIds.recentItem(transactionId), `el movimiento reciente ${transactionId}`),
    recentAmount: (transactionId: string): Target =>
        target(DerivedIds.amountTextOf(DashboardIds.recentItem(transactionId)), `el monto del movimiento reciente ${transactionId}`),
};
