/** Targets de órdenes: ticket, resumen, confirmación y resultado. */
import { DerivedIds, OrdersIds } from '../../../../src/screenplay/ids/ids.generated';
import { type Target, target } from './selector';

export const OrderTicket = {
    view: (): Target => target(OrdersIds.ticketView, 'el ticket de la orden'),
    withData: (): Target => target(OrdersIds.ticketStateData, 'el ticket listo para editar'),
    quantity: (): Target => target(OrdersIds.ticketQuantityField, 'el campo de cantidad'),
    quantityError: (): Target => target(DerivedIds.errorTextOf(OrdersIds.ticketQuantityField), 'el error del campo de cantidad'),
    available: (): Target => target(OrdersIds.ticketAvailableText, 'el saldo disponible del ticket'),
    position: (): Target => target(OrdersIds.ticketPositionText, 'la cantidad en posición del ticket'),
    review: (): Target => target(OrdersIds.ticketReviewButton, 'el botón "Revisar orden"'),
};

export const OrderSummary = {
    commission: (): Target => target(OrdersIds.summaryCommissionText, 'la comisión'),
    total: (): Target => target(OrdersIds.summaryTotalText, 'el total de la orden'),
};

export const OrderConfirmation = {
    view: (): Target => target(OrdersIds.confirmView, 'la confirmación de la orden'),
    order: (): Target => target(OrdersIds.confirmOrderText, 'la orden que se confirma'),
    submit: (): Target => target(OrdersIds.confirmSubmitButton, 'el botón de confirmar la orden'),
};

export const OrderResult = {
    view: (): Target => target(OrdersIds.resultView, 'el resultado de la orden'),
    status: (): Target => target(OrdersIds.resultStatusText, 'el estado de la orden'),
    portfolio: (): Target => target(OrdersIds.resultPortfolioButton, 'el botón "Ver portafolio"'),
    done: (): Target => target(OrdersIds.resultDoneButton, 'el botón "Listo"'),
};
