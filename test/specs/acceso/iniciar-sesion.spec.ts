import { Ensure, equals, includes, isTrue } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { CurrentPath, IsDisplayed, SemanticText } from '../../../src/screenplay/questions';
import { AbrirLaApp, CuentaDemo, EsperarA, EsperarLaCargaDe, IniciarSesion } from '../../../src/screenplay/tasks';
import { Home } from '../../../src/screenplay/ui/dashboard.ui';
import { LoginForm } from '../../../src/screenplay/ui/auth.ui';

describe(Caracteristica('Iniciar sesión'), () => {

    it(Escenario('entra con la cuenta demo', '@smoke', '@acceso'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor abrió MILA Invest', AbrirLaApp()),
            Cuando('inicia sesión con la cuenta demo', IniciarSesion.conLaCuentaDemo()),
            Entonces(
                'llega al inicio',
                EsperarLaCargaDe(Home.view()),
                Ensure.that(CurrentPath(), equals('/home')),
            ),
            Y('ve su saludo', Ensure.that(IsDisplayed.of(Home.greeting()), isTrue())),
            Y('ve el valor total de su cuenta', Ensure.that(SemanticText.of(Home.total()), includes('pesos colombianos'))),
        );
    });

    it(Escenario('no entra con una contraseña incorrecta', '@acceso'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor abrió MILA Invest', AbrirLaApp()),
            Cuando('intenta entrar con una contraseña incorrecta', IniciarSesion.con(CuentaDemo.email, 'ContraseñaIncorrecta1!')),
            Entonces(
                've el error del inicio de sesión',
                EsperarA(LoginForm.error()),
                Ensure.that(IsDisplayed.of(LoginForm.error()), isTrue()),
            ),
            Y('sigue en el inicio de sesión', Ensure.that(CurrentPath(), equals('/login'))),
        );
    });
});
