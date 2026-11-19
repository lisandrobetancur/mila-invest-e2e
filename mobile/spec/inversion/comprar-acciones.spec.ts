import { Ensure, equals, includes } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { SemanticText } from '../../src/screenplay/questions';
import {
    AbrirElTicket,
    AbrirLaApp,
    ComprarInstrumento,
    VerEnPantalla,
    IndicarLaCantidad,
    IniciarSesion,
    IrALaTab,
    TerminarLaOrden,
} from '../../src/screenplay/tasks';
import { OrderResult, OrderSummary } from '../../src/screenplay/ui/orders.ui';
import { Portfolio } from '../../src/screenplay/ui/portfolio.ui';

describe(Caracteristica('Comprar acciones a mercado'), () => {

    const conSesion = [AbrirLaApp(), IniciarSesion.conLaCuentaDemo()];

    it(Escenario('compra con saldo suficiente', '@smoke', '@inversion'), async () => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor inició sesión con la cuenta demo', ...conSesion),
            Cuando('compra 2 acciones de ISA a mercado', ComprarInstrumento.conId('ISA-CO').cantidad(2)),
            Entonces('ve la orden ejecutada', Ensure.that(SemanticText.of(OrderResult.status()), equals('Ejecutada'))),
            Y(
                've la posición en su portafolio',
                TerminarLaOrden(),
                IrALaTab.portafolio(),
                VerEnPantalla(Portfolio.position('ISA-CO')),
                Ensure.that(SemanticText.of(Portfolio.positionQuantity('ISA-CO')), includes('2')),
            ),
        );
    });

    it(Escenario('ve la comisión y el total antes de confirmar', '@inversion'), async () => {
        await actorCalled('Licho').attemptsTo(
            Dado(
                'que #actor está armando una compra de 2 acciones de ISA',
                ...conSesion,
                AbrirElTicket.deCompra('ISA-CO'),
                IndicarLaCantidad.de(2),
            ),
            Entonces(
                've el resumen con la comisión y el total',
                VerEnPantalla(OrderSummary.total()),
                Ensure.that(SemanticText.of(OrderSummary.commission()), includes('pesos colombianos')),
                Ensure.that(SemanticText.of(OrderSummary.total()), includes('pesos colombianos')),
            ),
        );
    });
});
