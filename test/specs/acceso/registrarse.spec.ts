import { Ensure, equals, isTrue } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import {
    Caracteristica,
    Cuando,
    Dado,
    Entonces,
    Escenario,
    EsquemaDelEscenario,
    Y,
} from '../../../src/gherkin/gherkin';
import { CurrentPath, IsDisplayed } from '../../../src/screenplay/questions';
import {
    AbrirElRegistro,
    AbrirLaApp,
    CompletarElRegistro,
    EnviarElRegistro,
    EsperarA,
    EsperarLaCargaDe,
    Registrarse,
    usuarioNuevo,
} from '../../../src/screenplay/tasks';
import { DocumentChip, RegisterForm } from '../../../src/screenplay/ui/auth.ui';
import { Home } from '../../../src/screenplay/ui/dashboard.ui';

describe(Caracteristica('Crear una cuenta'), () => {

    it(Escenario('un usuario nuevo queda dentro de la app', '@acceso'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor abrió MILA Invest', AbrirLaApp()),
            Cuando('crea una cuenta con sus datos', Registrarse.con(usuarioNuevo())),
            Entonces(
                'llega al inicio',
                EsperarLaCargaDe(Home.view()),
                Ensure.that(CurrentPath(), equals('/home')),
            ),
        );
    });

    it(Escenario('el país es obligatorio', '@acceso'), async ({ actorCalled }) => {
        const datos = usuarioNuevo();
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor está en el registro', AbrirLaApp(), AbrirElRegistro()),
            Cuando(
                'completa todo menos el país',
                // Sin país elegido, la app todavía no muestra el documento:
                // el tipo y el número aparecen recién al elegirlo.
                CompletarElRegistro.con({
                    nombre: datos.nombre,
                    email: datos.email,
                    password: datos.password,
                    acepta: datos.acepta,
                }),
                EnviarElRegistro(),
            ),
            Entonces(
                've que el país es obligatorio',
                EsperarA(RegisterForm.countryError()),
                Ensure.that(IsDisplayed.of(RegisterForm.countryError()), isTrue()),
            ),
            Y('sigue en el registro', Ensure.that(CurrentPath(), equals('/register'))),
        );
    });

    it(Escenario('hay que aceptar el aviso de simulación', '@acceso'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor está en el registro', AbrirLaApp(), AbrirElRegistro()),
            Cuando(
                'completa todo sin aceptar el aviso',
                CompletarElRegistro.con({ ...usuarioNuevo(), acepta: false }),
                EnviarElRegistro(),
            ),
            Entonces(
                've que tiene que aceptarlo',
                EsperarA(RegisterForm.acceptError()),
                Ensure.that(IsDisplayed.of(RegisterForm.acceptError()), isTrue()),
            ),
        );
    });

    it(Escenario('la contraseña tiene que cumplir los requisitos', '@acceso'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor está en el registro', AbrirLaApp(), AbrirElRegistro()),
            Cuando(
                'elige una contraseña demasiado corta',
                CompletarElRegistro.con({ ...usuarioNuevo(), password: 'abc' }),
                EnviarElRegistro(),
            ),
            Entonces(
                've los requisitos de la contraseña',
                EsperarA(RegisterForm.requirementLength()),
                Ensure.that(IsDisplayed.of(RegisterForm.requirementLength()), isTrue()),
                Ensure.that(IsDisplayed.of(RegisterForm.requirementNumber()), isTrue()),
            ),
            Y('sigue en el registro', Ensure.that(CurrentPath(), equals('/register'))),
        );
    });

    describe(EsquemaDelEscenario('cada país pide su documento'), () => {
        const ejemplos = [
            { pais: 'CO', documento: DocumentChip.CC, nombre: 'cédula' },
            { pais: 'MX', documento: DocumentChip.CURP, nombre: 'CURP' },
            { pais: 'PE', documento: DocumentChip.DNI, nombre: 'DNI' },
        ] as const;

        for (const ejemplo of ejemplos) {
            it(Escenario(`en ${ejemplo.pais} se pide ${ejemplo.nombre}`, '@acceso'), async ({ actorCalled }) => {
                await actorCalled('Licho').attemptsTo(
                    Dado('que #actor está en el registro', AbrirLaApp(), AbrirElRegistro()),
                    Cuando(`elige ${ejemplo.pais} como país`, CompletarElRegistro.con({ pais: ejemplo.pais })),
                    Entonces(
                        `puede elegir ${ejemplo.nombre} como documento`,
                        EsperarA(ejemplo.documento()),
                        Ensure.that(IsDisplayed.of(ejemplo.documento()), isTrue()),
                    ),
                );
            });
        }
    });
});
