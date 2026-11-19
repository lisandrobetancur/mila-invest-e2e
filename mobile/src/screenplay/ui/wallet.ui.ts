/** Targets de la billetera y el depósito. */
import { DerivedIds, WalletIds } from '../../../../src/screenplay/ids/ids.generated';
import { type Target, target } from './selector';

/** Monedas de las cuentas. */
export type Currency = 'COP' | 'MXN' | 'PEN';

export const Wallet = {
    view: (): Target => target(WalletIds.accountsView, 'la billetera'),
    withData: (): Target => target(WalletIds.accountsStateData, 'la billetera con saldo'),
};

/** Saldo disponible por moneda. */
export const Available: Record<Currency, () => Target> = {
    COP: () => target(WalletIds.copAvailableText, 'el disponible en COP'),
    MXN: () => target(WalletIds.mxnAvailableText, 'el disponible en MXN'),
    PEN: () => target(WalletIds.penAvailableText, 'el disponible en PEN'),
};

/** Botón de depositar de cada cuenta. */
export const DepositButton: Record<Currency, () => Target> = {
    COP: () => target(WalletIds.copDepositButton, 'el botón de depositar en COP'),
    MXN: () => target(WalletIds.mxnDepositButton, 'el botón de depositar en MXN'),
    PEN: () => target(WalletIds.penDepositButton, 'el botón de depositar en PEN'),
};

export const Deposit = {
    view: (): Target => target(WalletIds.depositView, 'la pantalla de depósito'),
    amount: (): Target => target(WalletIds.depositAmountField, 'el campo del monto'),
    amountError: (): Target => target(DerivedIds.errorTextOf(WalletIds.depositAmountField), 'el error del campo del monto'),
    submit: (): Target => target(WalletIds.depositSubmitButton, 'el botón "Depositar"'),
    success: (): Target => target(WalletIds.depositSuccessSnackbar, 'el aviso de depósito realizado'),
    suggested: (amount: string): Target => target(WalletIds.depositSuggestedItem(amount), `el monto sugerido de ${amount}`),
};
