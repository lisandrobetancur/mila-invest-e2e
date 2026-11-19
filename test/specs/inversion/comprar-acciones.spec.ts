import { Ensure, equals, includes, isTrue } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { IsDisplayed, SemanticText } from '../../../src/screenplay/questions';
import {
    AbrirElTicket,
    AbrirLaApp,
    ComprarInstrumento,
    EsperarA,
    IndicarLaCantidad,
    IniciarSesion,
    RevisarLaOrden,
    VerElPortafolioDesdeElResultado,
} from '../../../src/screenplay/tasks';
import { OrderConfirmation, OrderResult, OrderSummary } from '../../../src/screenplay/ui/orders.ui';
import { Portfolio } from '../../../src/screenplay/ui/portfolio.ui';

describe(Caracteristica('Comprar acciones a mercado'), () => {

    const conSesion = [AbrirLaApp(), IniciarSesion.conLaCuentaDemo()];

    it(Escenario('compra con saldo suficiente', '@smoke', '@inversion'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor inició sesión con la cuenta demo', ...conSesion),
            Cuando('compra 2 acciones de ISA a mercado', ComprarInstrumento.conId('ISA-CO').cantidad(2)),
            Entonces('ve la orden ejecutada', Ensure.that(SemanticText.of(OrderResult.status()), equals('Ejecutada'))),
            Y(
                've la posición en su portafolio',
                VerElPortafolioDesdeElResultado(),
                EsperarA(Portfolio.position('ISA-CO')),
                Ensure.that(SemanticText.of(Portfolio.positionQuantity('ISA-CO')), includes('2')),
            ),
        );
    });

    it(Escenario('ve la comisión y el total antes de confirmar', '@inversion'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado(
                'que #actor está armando una compra de 2 acciones de ISA',
                ...conSesion,
                AbrirElTicket.deCompra('ISA-CO'),
                IndicarLaCantidad.de(2),
            ),
            Entonces(
                've el resumen con la comisión y el total',
                EsperarA(OrderSummary.total()),
                Ensure.that(SemanticText.of(OrderSummary.commission()), includes('pesos colombianos')),
                Ensure.that(SemanticText.of(OrderSummary.total()), includes('pesos colombianos')),
            ),
            Cuando('revisa la orden', RevisarLaOrden()),
            Entonces(
                've qué está por confirmar',
                Ensure.that(IsDisplayed.of(OrderConfirmation.order()), isTrue()),
                Ensure.that(IsDisplayed.of(OrderConfirmation.submit()), isTrue()),
            ),
        );
    });
});
