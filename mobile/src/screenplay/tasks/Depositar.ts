/** Depositar dinero virtual desde el teléfono. */
import { Check, Task } from '@serenity-js/core';
import { isFalse } from '@serenity-js/assertions';

import { ClearAndType, Desplazarse, TapOn } from '../interactions';
import { IsDisplayed } from '../questions/IsDisplayed';
import { Home } from '../ui/dashboard.ui';
import { type Currency, Deposit, DepositButton, Wallet } from '../ui/wallet.ui';
import { EsperarA, EsperarLaCargaDe } from './esperas';
import { IrALaTab } from './IrALaTab';

/**
 * Abre la billetera desde el inicio, si no está ya abierta.
 *
 * La billetera y el depósito son pantallas completas: mientras están arriba,
 * las tabs del shell no existen. Por eso la tarea comprueba primero dónde
 * está #actor, y así se puede componer sin romperse.
 */
export const AbrirLaBilletera = (): Task =>
    Task.where(
        '#actor abre la billetera',
        Check.whether(IsDisplayed.of(Wallet.view()), isFalse()).andIfSo(
            IrALaTab.inicio(),
            TapOn.element(Home.wallet()),
            EsperarLaCargaDe(Wallet.withData()),
        ),
    );

/** Abre el depósito de una moneda. */
export const AbrirElDeposito = {
    en: (currency: Currency): Task =>
        Task.where(
            `#actor abre el depósito en ${currency}`,
            Check.whether(IsDisplayed.of(Deposit.view()), isFalse()).andIfSo(
                AbrirLaBilletera(),
                Desplazarse.haciaAbajo.hasta(DepositButton[currency]()),
                TapOn.element(DepositButton[currency]()),
                EsperarA(Deposit.view()),
            ),
        ),
};

export const Depositar = {
    /** Escribe un monto y lo deposita. */
    monto: (amount: string) => ({
        en: (currency: Currency): Task =>
            Task.where(
                `#actor deposita ${amount} ${currency}`,
                AbrirElDeposito.en(currency),
                ClearAndType.theValue(amount).into(Deposit.amount()),
                Desplazarse.haciaAbajo.hasta(Deposit.submit()),
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
    Task.where(
        '#actor envía el depósito',
        Desplazarse.haciaAbajo.hasta(Deposit.submit()),
        TapOn.element(Deposit.submit()),
    );
