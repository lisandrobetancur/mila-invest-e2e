import { Ensure, includes, isTrue } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { IsDisplayed, SemanticText } from '../../src/screenplay/questions';
import { AbrirLaApp, CuentaDemo, EsperarA, IniciarSesion } from '../../src/screenplay/tasks';
import { LoginForm } from '../../src/screenplay/ui/auth.ui';
import { Home } from '../../src/screenplay/ui/dashboard.ui';

describe(Caracteristica('Iniciar sesión'), () => {

    it(Escenario('entra con la cuenta demo', '@smoke', '@acceso'), async () => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor abrió MILA Invest', AbrirLaApp()),
            Cuando('inicia sesión con la cuenta demo', IniciarSesion.conLaCuentaDemo()),
            Entonces('ve su saludo', Ensure.that(IsDisplayed.of(Home.greeting()), isTrue())),
            Y(
                've el valor total de su cuenta',
                EsperarA(Home.total()),
                Ensure.that(SemanticText.of(Home.total()), includes('pesos colombianos')),
            ),
        );
    });

    it(Escenario('no entra con una contraseña incorrecta', '@smoke', '@acceso'), async () => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor abrió MILA Invest', AbrirLaApp()),
            Cuando(
                'intenta entrar con una contraseña incorrecta',
                IniciarSesion.con(CuentaDemo.email, 'ContraseñaIncorrecta1!'),
            ),
            Entonces(
                've el error del inicio de sesión',
                EsperarA(LoginForm.error()),
                Ensure.that(IsDisplayed.of(LoginForm.error()), isTrue()),
            ),
            Y('sigue en el inicio de sesión', Ensure.that(IsDisplayed.of(LoginForm.submit()), isTrue())),
        );
    });
});
