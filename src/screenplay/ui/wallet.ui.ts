/** Targets de la billetera y el depósito. */
import { DerivedIds, WalletIds } from '../ids/ids.generated';
import { type Target, target } from './selector';

/** Monedas de las cuentas. */
export type Currency = 'COP' | 'MXN' | 'PEN';

export const Wallet = {
    view: (): Target => target(WalletIds.accountsView, 'la billetera'),
    withData: (): Target => target(WalletIds.accountsStateData, 'la billetera con saldo'),
    empty: (): Target => target(WalletIds.accountsStateEmpty, 'la billetera sin saldo'),
    emptyTitle: (): Target => target(WalletIds.accountsEmptyTitleText, 'el título de la billetera vacía'),
    emptyDeposit: (): Target => target(WalletIds.accountsEmptyDepositButton, 'el botón "Hacer un depósito"'),
    back: (): Target => target(WalletIds.accountsBackIconButton, 'el botón de volver de la billetera'),
    account: (currency: Currency): Target => target(WalletIds.accountItem(currency), `la cuenta en ${currency}`),
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
    close: (): Target => target(WalletIds.depositCloseIconButton, 'el botón de cerrar el depósito'),
    amount: (): Target => target(WalletIds.depositAmountField, 'el campo del monto'),
    amountError: (): Target => target(DerivedIds.errorTextOf(WalletIds.depositAmountField), 'el error del campo del monto'),
    available: (): Target => target(WalletIds.depositAvailableText, 'el disponible de la moneda elegida'),
    submit: (): Target => target(WalletIds.depositSubmitButton, 'el botón "Depositar"'),
    error: (): Target => target(WalletIds.depositErrorText, 'el error del depósito'),
    success: (): Target => target(WalletIds.depositSuccessSnackbar, 'el aviso de depósito realizado'),
    suggested: (amount: string): Target =>
        target(WalletIds.depositSuggestedItem(amount), `el monto sugerido de ${amount}`),
};

/** Segmento de moneda del depósito. */
export const CurrencySegment: Record<Currency, () => Target> = {
    COP: () => target(WalletIds.depositCurrencyCopSegment, 'el segmento de moneda COP'),
    MXN: () => target(WalletIds.depositCurrencyMxnSegment, 'el segmento de moneda MXN'),
    PEN: () => target(WalletIds.depositCurrencyPenSegment, 'el segmento de moneda PEN'),
};
