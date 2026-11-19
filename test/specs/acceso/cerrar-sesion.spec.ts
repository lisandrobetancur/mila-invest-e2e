import { Ensure, equals, isTrue } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { CurrentPath, IsDisplayed } from '../../../src/screenplay/questions';
import { TapOn } from '../../../src/screenplay/interactions';
import {
    AbrirAjustes,
    AbrirLaApp,
    CerrarSesion,
    EsperarA,
    EsperarAQueDesaparezca,
    IniciarSesion,
} from '../../../src/screenplay/tasks';
import { LoginForm } from '../../../src/screenplay/ui/auth.ui';
import { Settings } from '../../../src/screenplay/ui/settings.ui';

describe(Caracteristica('Cerrar sesión'), () => {

    it(Escenario('cierra la sesión confirmando el diálogo', '@acceso'), async ({ actorCalled }) => {
        await actorCalled('Camila').attemptsTo(
            Dado(
                'que #actor inició sesión con la cuenta demo',
                AbrirLaApp(),
                IniciarSesion.conLaCuentaDemo(),
            ),
            Cuando('cierra la sesión', CerrarSesion()),
            Entonces('vuelve al inicio de sesión', Ensure.that(CurrentPath(), equals('/login'))),
            Y('ve el formulario vacío', Ensure.that(IsDisplayed.of(LoginForm.demo()), isTrue())),
        );
    });

    it(Escenario('puede arrepentirse y seguir dentro', '@acceso'), async ({ actorCalled }) => {
        await actorCalled('Camila').attemptsTo(
            Dado(
                'que #actor inició sesión con la cuenta demo',
                AbrirLaApp(),
                IniciarSesion.conLaCuentaDemo(),
            ),
            Cuando(
                'abre el diálogo de cierre de sesión y lo cancela',
                AbrirAjustes(),
                TapOn.element(Settings.logout()),
                EsperarA(Settings.logoutDialog()),
                TapOn.element(Settings.logoutCancel()),
                EsperarAQueDesaparezca(Settings.logoutDialog()),
            ),
            Entonces('sigue en ajustes', Ensure.that(CurrentPath(), equals('/settings'))),
            Y(
                'sigue con la sesión abierta',
                EsperarA(Settings.logout()),
                Ensure.that(IsDisplayed.of(Settings.logout()), isTrue()),
            ),
        );
    });
});
