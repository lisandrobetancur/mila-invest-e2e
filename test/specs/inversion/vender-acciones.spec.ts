import { Ensure, equals, includes, isTrue } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { IsDisplayed, SemanticText } from '../../../src/screenplay/questions';
import {
    AbrirElTicket,
    AbrirLaApp,
    EsperarA,
    EsperarAQueDiga,
    IndicarLaCantidad,
    IniciarSesion,
    IrALaTab,
    TerminarLaOrden,
    VenderInstrumento,
} from '../../../src/screenplay/tasks';
import { OrderResult, OrderTicket } from '../../../src/screenplay/ui/orders.ui';
import { Portfolio } from '../../../src/screenplay/ui/portfolio.ui';

describe(Caracteristica('Vender acciones a mercado'), () => {

    const conSesion = [AbrirLaApp(), IniciarSesion.conLaCuentaDemo()];

    it(Escenario('vende una parte de su posición en ECOPETROL', '@inversion'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor tiene 120 acciones de ECOPETROL', ...conSesion),
            Cuando('vende 10 acciones a mercado', VenderInstrumento.conId('ECOPETROL-CO').cantidad(10)),
            Entonces('ve la orden ejecutada', Ensure.that(SemanticText.of(OrderResult.status()), equals('Ejecutada'))),
            Y(
                'le quedan 110 en el portafolio',
                TerminarLaOrden(),
                IrALaTab.portafolio(),
                EsperarA(Portfolio.position('ECOPETROL-CO')),
                Ensure.that(SemanticText.of(Portfolio.positionQuantity('ECOPETROL-CO')), includes('110')),
            ),
        );
    });

    it(Escenario('no puede vender más de lo que tiene', '@inversion'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor está vendiendo ECOPETROL', ...conSesion, AbrirElTicket.deVenta('ECOPETROL-CO')),
            Cuando('pide vender 500 acciones', IndicarLaCantidad.de(500)),
            Entonces(
                've que no puede vender más de lo que tiene',
                EsperarAQueDiga(OrderTicket.quantityError(), 'vender'),
                Ensure.that(SemanticText.of(OrderTicket.quantityError()), includes('vender')),
            ),
            Y('sigue en el ticket', Ensure.that(IsDisplayed.of(OrderTicket.view()), isTrue())),
        );
    });
});
