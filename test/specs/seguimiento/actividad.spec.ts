import { Ensure, isGreaterThan, isTrue } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { ElementCount, IsDisplayed } from '../../../src/screenplay/questions';
import {
    AbrirLaApp,
    ComprarInstrumento,
    EsperarA,
    FiltrarMovimientos,
    IniciarSesion,
    TerminarLaOrden,
    VerLasOrdenes,
    VerLosMovimientos,
} from '../../../src/screenplay/tasks';
import { OrderHistory, OrderStatusFilter } from '../../../src/screenplay/ui/orders.ui';
import { Movements } from '../../../src/screenplay/ui/transactions.ui';
import { TapOn } from '../../../src/screenplay/interactions';

describe(Caracteristica('Ver la actividad'), () => {

    const conSesion = [AbrirLaApp(), IniciarSesion.conLaCuentaDemo()];

    it(Escenario('la compra y su comisión quedan en los movimientos', '@seguimiento'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado(
                'que #actor compró 1 acción de ISA',
                ...conSesion,
                ComprarInstrumento.conId('ISA-CO').cantidad(1),
                TerminarLaOrden(),
            ),
            Cuando('mira sus compras', VerLosMovimientos(), FiltrarMovimientos.porTipo('COMPRAS')),
            Entonces(
                've al menos una compra',
                EsperarA(Movements.withData()),
                Ensure.that(ElementCount.of(Movements.allMovements()), isGreaterThan(0)),
            ),
            Cuando('mira sus comisiones', FiltrarMovimientos.porTipo('COMISIONES')),
            Entonces(
                've al menos una comisión',
                EsperarA(Movements.withData()),
                Ensure.that(ElementCount.of(Movements.allMovements()), isGreaterThan(0)),
            ),
        );
    });

    it(Escenario('el historial muestra la orden rechazada de la cuenta demo', '@seguimiento'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor inició sesión con la cuenta demo', ...conSesion),
            Cuando('mira sus órdenes rechazadas', VerLasOrdenes(), TapOn.element(OrderStatusFilter.RECHAZADAS())),
            Entonces(
                've la orden rechazada',
                EsperarA(OrderHistory.withData()),
                Ensure.that(ElementCount.of(OrderHistory.allOrders()), isGreaterThan(0)),
            ),
            Y('sigue en el historial', Ensure.that(IsDisplayed.of(OrderHistory.view()), isTrue())),
        );
    });
});
