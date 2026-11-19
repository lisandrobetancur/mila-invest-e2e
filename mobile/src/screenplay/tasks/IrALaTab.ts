/** Moverse entre las tabs del shell. */
import { Task } from '@serenity-js/core';

import { TapOn } from '../interactions';
import { Home } from '../ui/dashboard.ui';
import { MarketList } from '../ui/market.ui';
import { Portfolio } from '../ui/portfolio.ui';
import { Tab } from '../ui/shell.ui';
import { EsperarLaCargaDe } from './esperas';

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
    actividad: (): Task => Task.where('#actor va a la tab Actividad', TapOn.element(Tab.actividad())),
};
