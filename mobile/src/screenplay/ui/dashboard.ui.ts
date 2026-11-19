/** Targets del inicio. */
import { DashboardIds, DerivedIds } from '../../../../src/screenplay/ids/ids.generated';
import { type Target, target } from './selector';

export const Home = {
    view: (): Target => target(DashboardIds.homeView, 'el inicio'),
    withData: (): Target => target(DashboardIds.homeStateData, 'el inicio con datos'),
    empty: (): Target => target(DashboardIds.homeStateEmpty, 'el inicio de un usuario nuevo'),
    greeting: (): Target => target(DashboardIds.homeGreetingText, 'el saludo'),
    total: (): Target => target(DashboardIds.homeTotalText, 'el valor total del inicio'),
    dayChange: (): Target => target(DashboardIds.homeDayChangeText, 'la variación del día del inicio'),
    wallet: (): Target => target(DashboardIds.homeWalletIconButton, 'el botón de la billetera'),
    settings: (): Target => target(DashboardIds.homeSettingsIconButton, 'el botón de ajustes'),
    mover: (instrumentId: string): Target =>
        target(DashboardIds.moverItem(instrumentId), `${instrumentId} entre los que más se mueven`),
    moverPrice: (instrumentId: string): Target =>
        target(DerivedIds.priceTextOf(DashboardIds.moverItem(instrumentId)), `el precio de ${instrumentId} en el inicio`),
};
