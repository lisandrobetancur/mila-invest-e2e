import { Ensure, isGreaterThan, isTrue } from '@serenity-js/assertions';
import { actorCalled, notes } from '@serenity-js/core';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { AmountValue, IsDisplayed } from '../../src/screenplay/questions';
import {
    AbrirElDeposito,
    AbrirLaApp,
    AbrirLaBilletera,
    Depositar,
    EnviarElDeposito,
    EsperarA,
    IndicarElMonto,
    IniciarSesion,
    VerEnPantalla,
} from '../../src/screenplay/tasks';
import { Available, Deposit } from '../../src/screenplay/ui/wallet.ui';

/** Lo que #actor anota durante estos escenarios. */
interface Notas {
    saldoAnterior: number;
}

describe(Caracteristica('Depositar dinero virtual'), () => {

    const conSesion = [AbrirLaApp(), IniciarSesion.conLaCuentaDemo()];

    it(Escenario('deposita y su saldo sube', '@smoke', '@dinero'), async () => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor está en su billetera', ...conSesion, AbrirLaBilletera()),
            Y(
                'anota cuánto tiene en pesos colombianos',
                VerEnPantalla(Available.COP()),
                notes<Notas>().set('saldoAnterior', AmountValue.of(Available.COP())),
            ),
            Cuando('deposita un millón', Depositar.monto('1000000').en('COP')),
            Y(
                'su saldo en pesos colombianos subió',
                VerEnPantalla(Available.COP()),
                Entonces(
                    'el disponible es mayor que antes',
                    Ensure.that(AmountValue.of(Available.COP()), isGreaterThan(notes<Notas>().get('saldoAnterior'))),
                ),
            ),
        );
    });

    it(Escenario('un monto en cero no se deposita', '@dinero'), async () => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor está depositando en pesos colombianos', ...conSesion, AbrirElDeposito.en('COP')),
            Cuando('intenta depositar cero', IndicarElMonto.de('0'), EnviarElDeposito()),
            Entonces(
                've el error del campo',
                EsperarA(Deposit.amountError()),
                Ensure.that(IsDisplayed.of(Deposit.amountError()), isTrue()),
            ),
            Y('sigue en el depósito', Ensure.that(IsDisplayed.of(Deposit.view()), isTrue())),
        );
    });
});
