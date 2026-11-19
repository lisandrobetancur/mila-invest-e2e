/**
 * Estados vacíos de un usuario sin saldo ni posiciones.
 *
 * Solo tiene sentido contra un build hecho con `--dart-define=FAKE_SEED=empty`.
 * Se activa con `MILA_SEED=empty`; con la semilla `demo` (la de siempre) estos
 * escenarios se saltan, porque la cuenta tiene saldo y posiciones.
 */
import { Ensure, isTrue } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { env } from '../../../src/config/env';
import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { IsDisplayed } from '../../../src/screenplay/questions';
import {
    AbrirLaApp,
    AbrirLaBilletera,
    EsperarA,
    IniciarSesion,
    IrALaTab,
    VerLasOrdenes,
    VerLosMovimientos,
} from '../../../src/screenplay/tasks';
import { Home } from '../../../src/screenplay/ui/dashboard.ui';
import { OrderHistory } from '../../../src/screenplay/ui/orders.ui';
import { Portfolio } from '../../../src/screenplay/ui/portfolio.ui';
import { Movements } from '../../../src/screenplay/ui/transactions.ui';
import { Wallet } from '../../../src/screenplay/ui/wallet.ui';

const conSemillaVacia = (titulo: string, cuerpo: () => void): void => {
    if (env.seed === 'empty') {
        describe(titulo, cuerpo);
        return;
    }
    describe.skip(titulo, cuerpo);
};

conSemillaVacia(Caracteristica('Empezar sin saldo ni inversiones'), () => {

    const conSesion = [AbrirLaApp(), IniciarSesion.conLaCuentaDemo()];

    it(Escenario('el inicio invita a hacer el primer depósito', '@seed-empty', '@seguimiento'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor entró con una cuenta nueva', ...conSesion),
            Entonces(
                've la invitación a depositar',
                EsperarA(Home.empty()),
                Ensure.that(IsDisplayed.of(Home.emptyTitle()), isTrue()),
            ),
            Y('puede depositar desde ahí', Ensure.that(IsDisplayed.of(Home.emptyDeposit()), isTrue())),
        );
    });

    it(Escenario('el portafolio invita a explorar el mercado', '@seed-empty', '@seguimiento'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor entró con una cuenta nueva', ...conSesion),
            Cuando('abre su portafolio', IrALaTab.portafolio()),
            Entonces(
                've el portafolio vacío',
                EsperarA(Portfolio.empty()),
                Ensure.that(IsDisplayed.of(Portfolio.emptyTitle()), isTrue()),
            ),
            Y('puede ir al mercado desde ahí', Ensure.that(IsDisplayed.of(Portfolio.explore()), isTrue())),
        );
    });

    it(Escenario('la actividad está vacía', '@seed-empty', '@seguimiento'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor entró con una cuenta nueva', ...conSesion),
            Cuando('mira sus movimientos', VerLosMovimientos()),
            Entonces(
                've que todavía no tiene ninguno',
                EsperarA(Movements.empty()),
                Ensure.that(IsDisplayed.of(Movements.emptyTitle()), isTrue()),
            ),
            Cuando('mira sus órdenes', VerLasOrdenes()),
            Entonces(
                've que tampoco tiene órdenes',
                EsperarA(OrderHistory.empty()),
                Ensure.that(IsDisplayed.of(OrderHistory.emptyTitle()), isTrue()),
            ),
        );
    });

    it(Escenario('la billetera está sin saldo', '@seed-empty', '@dinero'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor entró con una cuenta nueva', ...conSesion),
            Cuando('abre su billetera', AbrirLaBilletera()),
            Entonces(
                've que no tiene saldo',
                EsperarA(Wallet.empty()),
                Ensure.that(IsDisplayed.of(Wallet.emptyTitle()), isTrue()),
            ),
            Y('puede hacer su primer depósito', Ensure.that(IsDisplayed.of(Wallet.emptyDeposit()), isTrue())),
        );
    });
});
