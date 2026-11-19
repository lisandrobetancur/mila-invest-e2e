/** Depositar en una cuenta de la billetera. */
import { Check, Task } from '@serenity-js/core';
import { isFalse } from '@serenity-js/assertions';

import { ClearAndType, TapOn } from '../../interactions';
import { IsDisplayed } from '../../questions';
import { type Currency, Deposit, DepositButton, Wallet } from '../../ui/wallet.ui';
import { EsperarA, EsperarLaCargaDe } from '../esperas';
import { AbrirLaBilletera } from '../navegacion/IrALaTab';

/** Abre el depósito de una moneda desde la billetera. */
export const AbrirElDeposito = {
    en: (currency: Currency): Task =>
        Task.where(
            `#actor abre el depósito en ${currency}`,
            Check.whether(IsDisplayed.of(Deposit.view()), isFalse()).andIfSo(
                AbrirLaBilletera(),
                EsperarLaCargaDe(Wallet.withData()),
                TapOn.element(DepositButton[currency]()),
                EsperarA(Deposit.view()),
            ),
        ),
};

export const Depositar = {
    /** Escribe un monto a mano y lo deposita. */
    monto: (amount: string) => ({
        en: (currency: Currency): Task =>
            Task.where(
                `#actor deposita ${amount} ${currency}`,
                AbrirElDeposito.en(currency),
                ClearAndType.theValue(amount).into(Deposit.amount()),
                TapOn.element(Deposit.submit()),
            ),
    }),

    /** Elige uno de los montos sugeridos y lo deposita. */
    elMontoSugerido: (amount: string) => ({
        en: (currency: Currency): Task =>
            Task.where(
                `#actor deposita el monto sugerido de ${amount} ${currency}`,
                AbrirElDeposito.en(currency),
                TapOn.element(Deposit.suggested(amount)),
                TapOn.element(Deposit.submit()),
            ),
    }),
};

/** Escribe un monto en el depósito sin enviarlo. */
export const IndicarElMonto = {
    de: (amount: string): Task =>
        Task.where(
            `#actor indica un monto de ${amount}`,
            EsperarA(Deposit.amount()),
            ClearAndType.theValue(amount).into(Deposit.amount()),
        ),
};

/** Envía el depósito. */
export const EnviarElDeposito = (): Task =>
    Task.where('#actor envía el depósito', TapOn.element(Deposit.submit()));
