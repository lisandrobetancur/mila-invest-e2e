/** Operar: ticket → revisar → confirmar → resultado. */
import { Task } from '@serenity-js/core';

import { ClearAndType, Desplazarse, TapOn } from '../interactions';
import { InstrumentDetail } from '../ui/market.ui';
import { OrderConfirmation, OrderResult, OrderTicket } from '../ui/orders.ui';
import { EsperarA, EsperarLaCargaDe } from './esperas';
import { AbrirInstrumento } from './ExplorarElMercado';

/** Abre el ticket desde el detalle del instrumento. */
export const AbrirElTicket = {
    /** De compra. */
    deCompra: (instrumentId: string): Task =>
        Task.where(
            `#actor abre el ticket de compra de ${instrumentId}`,
            AbrirInstrumento.conId(instrumentId),
            Desplazarse.haciaAbajo.hasta(InstrumentDetail.buy()),
            TapOn.element(InstrumentDetail.buy()),
            EsperarLaCargaDe(OrderTicket.withData()),
        ),

    /** De venta. */
    deVenta: (instrumentId: string): Task =>
        Task.where(
            `#actor abre el ticket de venta de ${instrumentId}`,
            AbrirInstrumento.conId(instrumentId),
            Desplazarse.haciaAbajo.hasta(InstrumentDetail.sell()),
            TapOn.element(InstrumentDetail.sell()),
            EsperarLaCargaDe(OrderTicket.withData()),
        ),
};

/** Escribe la cantidad en el ticket. */
export const IndicarLaCantidad = {
    de: (quantity: number): Task =>
        Task.where(
            `#actor indica una cantidad de ${quantity}`,
            EsperarA(OrderTicket.quantity()),
            ClearAndType.theValue(String(quantity)).into(OrderTicket.quantity()),
        ),
};

/** Pasa del ticket a la confirmación. */
export const RevisarLaOrden = (): Task =>
    Task.where(
        '#actor revisa la orden',
        Desplazarse.haciaAbajo.hasta(OrderTicket.review()),
        TapOn.element(OrderTicket.review()),
        EsperarA(OrderConfirmation.view()),
    );

/** Confirma y espera el resultado. */
export const ConfirmarLaOrden = (): Task =>
    Task.where(
        '#actor confirma la orden',
        Desplazarse.haciaAbajo.hasta(OrderConfirmation.submit()),
        TapOn.element(OrderConfirmation.submit()),
        EsperarLaCargaDe(OrderResult.view()),
        EsperarA(OrderResult.status()),
    );

interface Operacion {
    conId: (instrumentId: string) => { cantidad: (quantity: number) => Task };
}

const operar = (verbo: string, abrir: (id: string) => Task): Operacion => ({
    conId: (instrumentId: string) => ({
        /** …[quantity] unidades, a mercado, hasta ver el resultado. */
        cantidad: (quantity: number): Task =>
            Task.where(
                `#actor ${verbo} ${quantity} de ${instrumentId} a mercado`,
                abrir(instrumentId),
                IndicarLaCantidad.de(quantity),
                RevisarLaOrden(),
                ConfirmarLaOrden(),
            ),
    }),
});

/** Compra a mercado, de punta a punta. */
export const ComprarInstrumento = operar('compra', AbrirElTicket.deCompra);

/** Vende a mercado, de punta a punta. */
export const VenderInstrumento = operar('vende', AbrirElTicket.deVenta);

/** Cierra el ticket desde el resultado. */
export const TerminarLaOrden = (): Task =>
    Task.where('#actor cierra el ticket', TapOn.element(OrderResult.done()));
