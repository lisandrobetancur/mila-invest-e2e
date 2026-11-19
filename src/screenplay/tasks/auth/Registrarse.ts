/** Crear una cuenta nueva. */
import { Task } from '@serenity-js/core';

import { ClearAndType, TapOn } from '../../interactions';
import { CountryChip, DocumentChip, LoginForm, RegisterForm } from '../../ui/auth.ui';
import { EsperarA } from '../esperas';

/** País de la cuenta. */
export type Country = 'CO' | 'MX' | 'PE';

/** Tipo de documento, según el país. */
export type DocumentType = 'CC' | 'CE' | 'CURP' | 'DNI';

/** Datos de un registro. Todo opcional: cada escenario llena lo que prueba. */
export interface DatosDeRegistro {
    readonly pais?: Country;
    readonly nombre?: string;
    readonly email?: string;
    readonly tipoDeDocumento?: DocumentType;
    readonly documento?: string;
    readonly password?: string;
    readonly acepta?: boolean;
}

/** Va del login al registro. */
export const AbrirElRegistro = (): Task =>
    Task.where(
        '#actor abre el registro',
        EsperarA(LoginForm.registerLink()),
        TapOn.element(LoginForm.registerLink()),
        EsperarA(RegisterForm.view()),
    );

/** Llena el formulario de registro con lo que venga en [datos]. */
export const CompletarElRegistro = {
    con: (datos: DatosDeRegistro): Task =>
        Task.where(
            '#actor completa el registro',
            ...(datos.pais ? [TapOn.element(CountryChip[datos.pais]())] : []),
            ...(datos.nombre === undefined
                ? []
                : [ClearAndType.theValue(datos.nombre).into(RegisterForm.name())]),
            ...(datos.email === undefined
                ? []
                : [ClearAndType.theValue(datos.email).into(RegisterForm.email())]),
            ...(datos.tipoDeDocumento ? [TapOn.element(DocumentChip[datos.tipoDeDocumento]())] : []),
            ...(datos.documento === undefined
                ? []
                : [ClearAndType.theValue(datos.documento).into(RegisterForm.document())]),
            ...(datos.password === undefined
                ? []
                : [ClearAndType.theValue(datos.password).into(RegisterForm.password())]),
            ...(datos.acepta ? [TapOn.element(RegisterForm.accept())] : []),
        ),
};

/** Envía el formulario de registro. */
export const EnviarElRegistro = (): Task =>
    Task.where('#actor envía el registro', TapOn.element(RegisterForm.submit()));

export const Registrarse = {
    /** Abre el registro, lo completa y lo envía. */
    con: (datos: DatosDeRegistro): Task =>
        Task.where(
            `#actor se registra como ${datos.email ?? 'un usuario nuevo'}`,
            AbrirElRegistro(),
            CompletarElRegistro.con(datos),
            EnviarElRegistro(),
        ),
};

/** Datos válidos de un usuario nuevo, con correo y documento únicos. */
export const usuarioNuevo = (seed = Date.now()): Required<DatosDeRegistro> => ({
    pais: 'CO',
    nombre: 'Licho Prueba',
    email: `camila.${seed}@milainvest.app`,
    tipoDeDocumento: 'CC',
    documento: `10${String(seed).slice(-8)}`,
    password: 'Demo1234!',
    acepta: true,
});
