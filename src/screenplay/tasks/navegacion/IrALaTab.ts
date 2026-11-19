/**
 * Moverse por la app.
 *
 * Siempre **tocando**, nunca navegando por URL: con el backend falso la
 * sesión vive en memoria y cualquier recarga vuelve al login (paso 0, §7).
 */
import { Check, Task } from '@serenity-js/core';
import { isFalse } from '@serenity-js/assertions';

import { TapOn } from '../../interactions';
import { IsDisplayed } from '../../questions';
import { Home } from '../../ui/dashboard.ui';
import { MarketList } from '../../ui/market.ui';
import { Movements } from '../../ui/transactions.ui';
import { Portfolio } from '../../ui/portfolio.ui';
import { Settings } from '../../ui/settings.ui';
import { Tab } from '../../ui/shell.ui';
import { Wallet } from '../../ui/wallet.ui';
import { EsperarA, EsperarLaCargaDe } from '../esperas';

export const IrALaTab = {
    /** Tab Inicio. */
    inicio: (): Task =>
        Task.where('#actor va a la tab Inicio', TapOn.element(Tab.inicio()), EsperarLaCargaDe(Home.view())),

    /** Tab Mercado. */
    mercado: (): Task =>
        Task.where('#actor va a la tab Mercado', TapOn.element(Tab.mercado()), EsperarLaCargaDe(MarketList.view())),

    /** Tab Portafolio. */
    portafolio: (): Task =>
        Task.where('#actor va a la tab Portafolio', TapOn.element(Tab.portafolio()), EsperarLaCargaDe(Portfolio.view())),

    /** Tab Actividad. */
    actividad: (): Task =>
        Task.where('#actor va a la tab Actividad', TapOn.element(Tab.actividad()), EsperarLaCargaDe(Movements.view())),
};

/**
 * Abre ajustes desde el inicio, si no está ya abierto.
 *
 * Ajustes y billetera son pantallas de pantalla completa: mientras están
 * arriba, las tabs del shell no existen. Por eso estas tareas comprueban
 * primero dónde está #actor, y así se pueden componer sin romperse.
 */
export const AbrirAjustes = (): Task =>
    Task.where(
        '#actor abre los ajustes',
        Check.whether(IsDisplayed.of(Settings.view()), isFalse()).andIfSo(
            IrALaTab.inicio(),
            TapOn.element(Home.settings()),
            EsperarA(Settings.view()),
        ),
    );

/** Abre la billetera desde el inicio, si no está ya abierta. */
export const AbrirLaBilletera = (): Task =>
    Task.where(
        '#actor abre la billetera',
        Check.whether(IsDisplayed.of(Wallet.view()), isFalse()).andIfSo(
            IrALaTab.inicio(),
            TapOn.element(Home.wallet()),
            EsperarA(Wallet.view()),
        ),
    );
