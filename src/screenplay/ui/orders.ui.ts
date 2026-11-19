/** Targets de órdenes: ticket, resumen, confirmación, resultado e historial. */
import { DerivedIds, OrdersIds } from '../ids/ids.generated';
import { type Target, target, targetStartingWith } from './selector';

/** Lado de una orden. */
export type Side = 'BUY' | 'SELL';

/** Estado por el que se filtra el historial. */
export type OrderStatus = 'TODAS' | 'PENDIENTES' | 'EJECUTADAS' | 'RECHAZADAS' | 'CANCELADAS';

export const OrderTicket = {
    view: (): Target => target(OrdersIds.ticketView, 'el ticket de la orden'),
    withData: (): Target => target(OrdersIds.ticketStateData, 'el ticket listo para editar'),
    notFound: (): Target => target(OrdersIds.ticketStateEmpty, 'el ticket de un instrumento inexistente'),
    notFoundTitle: (): Target => target(OrdersIds.ticketNotFoundTitleText, 'el título de "instrumento no encontrado" del ticket'),
    close: (): Target => target(OrdersIds.ticketCloseIconButton, 'el botón de cerrar el ticket'),
    instrument: (): Target => target(OrdersIds.ticketInstrumentText, 'el instrumento del ticket'),
    price: (): Target => target(OrdersIds.ticketPriceText, 'el precio del ticket'),
    quantity: (): Target => target(OrdersIds.ticketQuantityField, 'el campo de cantidad'),
    quantityError: (): Target => target(DerivedIds.errorTextOf(OrdersIds.ticketQuantityField), 'el error del campo de cantidad'),
    increase: (): Target => target(OrdersIds.ticketQuantityIncreaseStepper, 'el botón de sumar una unidad'),
    decrease: (): Target => target(OrdersIds.ticketQuantityDecreaseStepper, 'el botón de restar una unidad'),
    available: (): Target => target(OrdersIds.ticketAvailableText, 'el saldo disponible del ticket'),
    position: (): Target => target(OrdersIds.ticketPositionText, 'la cantidad en posición del ticket'),
    lowBalance: (): Target => target(OrdersIds.ticketLowBalanceText, 'el aviso de saldo bajo'),
    deposit: (): Target => target(OrdersIds.ticketDepositButton, 'el botón "Depositar" del ticket'),
    review: (): Target => target(OrdersIds.ticketReviewButton, 'el botón "Revisar orden"'),
};

/** Segmento de lado de la orden. */
export const SideSegment: Record<Side, () => Target> = {
    BUY: () => target(OrdersIds.ticketSideBuySegment, 'el segmento "Comprar"'),
    SELL: () => target(OrdersIds.ticketSideSellSegment, 'el segmento "Vender"'),
};

export const OrderSummary = {
    panel: (): Target => target(OrdersIds.summaryPanel, 'el resumen de la orden'),
    price: (): Target => target(OrdersIds.summaryPriceText, 'el precio del resumen'),
    gross: (): Target => target(OrdersIds.summaryGrossText, 'el monto bruto'),
    commission: (): Target => target(OrdersIds.summaryCommissionText, 'la comisión'),
    total: (): Target => target(OrdersIds.summaryTotalText, 'el total de la orden'),
    availableAfter: (): Target => target(OrdersIds.summaryAvailableAfterText, 'el saldo resultante'),
};

export const OrderConfirmation = {
    view: (): Target => target(OrdersIds.confirmView, 'la confirmación de la orden'),
    back: (): Target => target(OrdersIds.confirmBackIconButton, 'el botón de volver al ticket'),
    order: (): Target => target(OrdersIds.confirmOrderText, 'la orden que se confirma'),
    submit: (): Target => target(OrdersIds.confirmSubmitButton, 'el botón de confirmar la orden'),
    error: (): Target => target(OrdersIds.confirmErrorText, 'el error al enviar la orden'),
};

export const OrderResult = {
    view: (): Target => target(OrdersIds.resultView, 'el resultado de la orden'),
    status: (): Target => target(OrdersIds.resultStatusText, 'el estado de la orden'),
    priceDifference: (): Target => target(OrdersIds.resultPriceDifferenceText, 'la diferencia de precio'),
    rejectReason: (): Target => target(OrdersIds.resultRejectReasonText, 'el motivo del rechazo'),
    portfolio: (): Target => target(OrdersIds.resultPortfolioButton, 'el botón "Ver portafolio"'),
    suggestedAction: (): Target => target(OrdersIds.resultSuggestedActionButton, 'la acción sugerida tras el rechazo'),
    done: (): Target => target(OrdersIds.resultDoneButton, 'el botón "Listo"'),
};

export const OrderHistory = {
    view: (): Target => target(OrdersIds.historyView, 'el historial de órdenes'),
    withData: (): Target => target(OrdersIds.historyStateData, 'el historial con órdenes'),
    empty: (): Target => target(OrdersIds.historyStateEmpty, 'el historial vacío'),
    emptyTitle: (): Target => target(OrdersIds.historyEmptyTitleText, 'el título del historial vacío'),
    explore: (): Target => target(OrdersIds.historyExploreButton, 'el botón "Explorar mercado" del historial'),
    movementsTab: (): Target => target(OrdersIds.historyMovementsTab, 'la sección "Movimientos"'),
    ordersTab: (): Target => target(OrdersIds.historyOrdersTab, 'la sección "Órdenes"'),
    allOrders: (): Target => targetStartingWith(OrdersIds.historyItem(''), 'las órdenes del historial'),
    order: (orderId: string): Target => target(OrdersIds.historyItem(orderId), `la orden ${orderId} del historial`),
    orderStatus: (orderId: string): Target =>
        target(DerivedIds.statusTextOf(OrdersIds.historyItem(orderId)), `el estado de la orden ${orderId}`),
    orderTotal: (orderId: string): Target =>
        target(DerivedIds.totalTextOf(OrdersIds.historyItem(orderId)), `el total de la orden ${orderId}`),
};

/** Chip de estado del historial. */
export const OrderStatusFilter: Record<OrderStatus, () => Target> = {
    TODAS: () => target(OrdersIds.historyStatusAllChip, 'el chip de estado "Todas"'),
    PENDIENTES: () => target(OrdersIds.historyStatusPendingChip, 'el chip de estado "Pendientes"'),
    EJECUTADAS: () => target(OrdersIds.historyStatusFilledChip, 'el chip de estado "Ejecutadas"'),
    RECHAZADAS: () => target(OrdersIds.historyStatusRejectedChip, 'el chip de estado "Rechazadas"'),
    CANCELADAS: () => target(OrdersIds.historyStatusCancelledChip, 'el chip de estado "Canceladas"'),
};

export const OrderDetail = {
    view: (): Target => target(OrdersIds.detailView, 'el detalle de la orden'),
    status: (): Target => target(OrdersIds.detailStatusText, 'el estado del detalle de la orden'),
    instrument: (): Target => target(OrdersIds.detailInstrumentText, 'el instrumento de la orden'),
    side: (): Target => target(OrdersIds.detailSideText, 'el lado de la orden'),
    quantity: (): Target => target(OrdersIds.detailQuantityText, 'la cantidad de la orden'),
    rejectReason: (): Target => target(OrdersIds.detailRejectReasonText, 'el motivo del rechazo de la orden'),
    notFoundTitle: (): Target => target(OrdersIds.detailNotFoundTitleText, 'el título de "orden no encontrada"'),
};
