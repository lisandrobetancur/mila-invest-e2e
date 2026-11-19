/** Actividad: movimientos y órdenes. */
import { Task } from '@serenity-js/core';

import { TapOn } from '../../interactions';
import { OrderHistory } from '../../ui/orders.ui';
import {
    type MovementRange,
    MovementRangeFilter,
    type MovementType,
    MovementTypeFilter,
    Movements,
} from '../../ui/transactions.ui';
import { EsperarLaCargaDe } from '../esperas';
import { IrALaTab } from '../navegacion/IrALaTab';

/** Abre la tab Actividad en la sección "Movimientos". */
export const VerLosMovimientos = (): Task =>
    Task.where(
        '#actor mira sus movimientos',
        IrALaTab.actividad(),
        TapOn.element(Movements.movementsTab()),
        EsperarLaCargaDe(Movements.view()),
    );

/** Abre la tab Actividad en la sección "Órdenes". */
export const VerLasOrdenes = (): Task =>
    Task.where(
        '#actor mira sus órdenes',
        IrALaTab.actividad(),
        TapOn.element(Movements.ordersTab()),
        EsperarLaCargaDe(OrderHistory.view()),
    );

export const FiltrarMovimientos = {
    /** Filtra por tipo de movimiento. */
    porTipo: (type: MovementType): Task =>
        Task.where(
            `#actor filtra los movimientos por ${type}`,
            TapOn.element(MovementTypeFilter[type]()),
        ),

    /** Filtra por rango de fechas. */
    porRango: (range: MovementRange): Task =>
        Task.where(
            `#actor filtra los movimientos por rango ${range}`,
            TapOn.element(MovementRangeFilter[range]()),
        ),
};
