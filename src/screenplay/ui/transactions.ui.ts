/** Targets de los movimientos (la sección "Movimientos" de Actividad). */
import { DerivedIds, TransactionsIds } from '../ids/ids.generated';
import { type Target, target, targetStartingWith } from './selector';

/** Tipo por el que se filtran los movimientos. */
export type MovementType = 'TODOS' | 'DEPOSITOS' | 'COMPRAS' | 'VENTAS' | 'COMISIONES';

/** Rango por el que se filtran los movimientos. */
export type MovementRange = 'TODO' | '7D' | '30D' | '90D';

export const Movements = {
    view: (): Target => target(TransactionsIds.listView, 'la lista de movimientos'),
    withData: (): Target => target(TransactionsIds.listStateData, 'los movimientos con datos'),
    empty: (): Target => target(TransactionsIds.listStateEmpty, 'los movimientos vacíos'),
    emptyTitle: (): Target => target(TransactionsIds.listEmptyTitleText, 'el título de los movimientos vacíos'),
    emptyDeposit: (): Target => target(TransactionsIds.listEmptyDepositButton, 'el botón "Depositar" del estado vacío'),
    clearFilters: (): Target => target(TransactionsIds.listClearFiltersButton, 'el botón "Limpiar filtros" de movimientos'),
    movementsTab: (): Target => target(TransactionsIds.listMovementsTab, 'la sección "Movimientos"'),
    ordersTab: (): Target => target(TransactionsIds.listOrdersTab, 'la sección "Órdenes"'),
    day: (isoDate: string): Target => target(TransactionsIds.dayItem(isoDate), `el día ${isoDate}`),
    allMovements: (): Target =>
        targetStartingWith(TransactionsIds.listItem(''), 'los movimientos de la lista'),
    movement: (transactionId: string): Target =>
        target(TransactionsIds.listItem(transactionId), `el movimiento ${transactionId}`),
    movementAmount: (transactionId: string): Target =>
        target(DerivedIds.amountTextOf(TransactionsIds.listItem(transactionId)), `el monto del movimiento ${transactionId}`),
    movementDescription: (transactionId: string): Target =>
        target(DerivedIds.descriptionTextOf(TransactionsIds.listItem(transactionId)), `la descripción del movimiento ${transactionId}`),
};

/** Chip de tipo de movimiento. */
export const MovementTypeFilter: Record<MovementType, () => Target> = {
    TODOS: () => target(TransactionsIds.listTypeAllChip, 'el chip de tipo "Todos"'),
    DEPOSITOS: () => target(TransactionsIds.listTypeDepositChip, 'el chip de tipo "Depósitos"'),
    COMPRAS: () => target(TransactionsIds.listTypeBuyChip, 'el chip de tipo "Compras"'),
    VENTAS: () => target(TransactionsIds.listTypeSellChip, 'el chip de tipo "Ventas"'),
    COMISIONES: () => target(TransactionsIds.listTypeFeeChip, 'el chip de tipo "Comisiones"'),
};

/** Chip de rango de fechas. */
export const MovementRangeFilter: Record<MovementRange, () => Target> = {
    TODO: () => target(TransactionsIds.listRangeAllChip, 'el chip de rango "Todo"'),
    '7D': () => target(TransactionsIds.listRange7dChip, 'el chip de rango "7 días"'),
    '30D': () => target(TransactionsIds.listRange30dChip, 'el chip de rango "30 días"'),
    '90D': () => target(TransactionsIds.listRange90dChip, 'el chip de rango "90 días"'),
};
