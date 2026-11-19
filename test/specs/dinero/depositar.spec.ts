import { Ensure, equals, isGreaterThan, isTrue } from '@serenity-js/assertions';
import { notes } from '@serenity-js/core';
import { describe, it } from '@serenity-js/playwright-test';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { AmountValue, IsDisplayed } from '../../../src/screenplay/questions';
import {
    AbrirElDeposito,
    AbrirLaApp,
    AbrirLaBilletera,
    Depositar,
    EnviarElDeposito,
    EsperarA,
    IndicarElMonto,
    IniciarSesion,
} from '../../../src/screenplay/tasks';
import { Available, Deposit, Wallet } from '../../../src/screenplay/ui/wallet.ui';

/** Lo que #actor anota durante estos escenarios. */
interface Notas {
    saldoAnterior: number;
}

describe(Caracteristica('Depositar dinero virtual'), () => {

    const conSesion = [AbrirLaApp(), IniciarSesion.conLaCuentaDemo()];

    it(Escenario('deposita un monto sugerido', '@smoke', '@dinero'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor está en su billetera', ...conSesion, AbrirLaBilletera(), EsperarA(Wallet.withData())),
            Y(
                'anota cuánto tiene en pesos colombianos',
                notes<Notas>().set('saldoAnterior', AmountValue.of(Available.COP())),
            ),
            Cuando('deposita el monto sugerido de un millón', Depositar.elMontoSugerido('1000000').en('COP')),
            Entonces(
                've el aviso de depósito realizado',
                EsperarA(Deposit.success()),
                Ensure.that(IsDisplayed.of(Deposit.success()), isTrue()),
            ),
            Y(
                'su saldo en pesos colombianos subió',
                EsperarA(Available.COP()),
                Ensure.that(AmountValue.of(Available.COP()), isGreaterThan(notes<Notas>().get('saldoAnterior'))),
            ),
        );
    });

    it(Escenario('un monto en cero no se deposita', '@smoke', '@dinero'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor está depositando en pesos colombianos', ...conSesion, AbrirElDeposito.en('COP')),
            Y(
                'anota cuánto tiene',
                notes<Notas>().set('saldoAnterior', AmountValue.of(Deposit.available())),
            ),
            Cuando('intenta depositar cero', IndicarElMonto.de('0'), EnviarElDeposito()),
            Entonces(
                've el error del campo',
                EsperarA(Deposit.amountError()),
                Ensure.that(IsDisplayed.of(Deposit.amountError()), isTrue()),
            ),
            Y('sigue en el depósito', Ensure.that(IsDisplayed.of(Deposit.view()), isTrue())),
            Y(
                'su saldo no cambió',
                Ensure.that(AmountValue.of(Deposit.available()), equals(notes<Notas>().get('saldoAnterior'))),
            ),
        );
    });
});
