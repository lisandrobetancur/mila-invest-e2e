import { Ensure, isTrue } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { Caracteristica, Cuando, Dado, Entonces, Escenario } from '../../../src/gherkin/gherkin';
import { IsDisplayed } from '../../../src/screenplay/questions';
import { TapOn } from '../../../src/screenplay/interactions';
import {
    AbrirLaRuta,
    EsperarA,
    EsperarLaCargaDe,
    IniciarSesion,
} from '../../../src/screenplay/tasks';
import { LoginForm } from '../../../src/screenplay/ui/auth.ui';
import { Home } from '../../../src/screenplay/ui/dashboard.ui';
import { Shell } from '../../../src/screenplay/ui/shell.ui';

describe(Caracteristica('Rutas que no existen'), () => {

    it(Escenario('una ruta desconocida muestra "no encontrado"', '@plataforma'), async ({ actorCalled }) => {
        await actorCalled('Camila').attemptsTo(
            Dado('que #actor abre una ruta que no existe', AbrirLaRuta('/una-ruta-que-no-existe')),
            Cuando('inicia sesión con la cuenta demo', EsperarLaCargaDe(LoginForm.view()), IniciarSesion.conLaCuentaDemo()),
            Entonces(
                've la pantalla de "no encontrado"',
                EsperarA(Shell.notFound()),
                Ensure.that(IsDisplayed.of(Shell.notFoundTitle()), isTrue()),
            ),
            Cuando('toca "Ir al inicio"', TapOn.element(Shell.notFoundHome())),
            Entonces(
                'llega al inicio',
                EsperarLaCargaDe(Home.view()),
                Ensure.that(IsDisplayed.of(Home.greeting()), isTrue()),
            ),
        );
    });
});
