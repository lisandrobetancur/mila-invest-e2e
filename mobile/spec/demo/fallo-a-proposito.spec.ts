/**
 * ⚠️ ESTE ESCENARIO FALLA A PROPÓSITO. No es una regresión.
 *
 * El gemelo del de la suite web (`test/specs/demo/`), para ver cómo se ve un
 * fallo en el reporte de Android: el paso que rompe, el árbol de actividades
 * hasta ahí y la captura que toma el `Camarografo` en el momento exacto.
 *
 * Está etiquetado `@fallo-demo`, así que se puede dejar afuera:
 *
 * ```bash
 * npx wdio run mobile/wdio.conf.ts --mochaOpts.invert --mochaOpts.grep @fallo-demo
 * ```
 */
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';

import { Caracteristica, Cuando, Dado, Entonces, Escenario } from '../../../src/gherkin/gherkin';
import { SemanticText } from '../../src/screenplay/questions';
import { AbrirLaApp, EsperarA, IniciarSesion } from '../../src/screenplay/tasks';
import { Home } from '../../src/screenplay/ui/dashboard.ui';

describe(Caracteristica('Un fallo a propósito (Android)'), () => {

    it(Escenario('el valor total no es el que dice este escenario', '@smoke', '@fallo-demo'), async () => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor inició sesión con la cuenta demo', AbrirLaApp(), IniciarSesion.conLaCuentaDemo()),
            Cuando('mira el valor total de su cuenta', EsperarA(Home.total())),
            Entonces(
                'el escenario afirma un valor que la app nunca muestra',
                // La cuenta demo arranca con millones de pesos: esto falla
                // siempre, y por eso sirve de ejemplo.
                Ensure.that(SemanticText.of(Home.total()), equals('0 pesos colombianos')),
            ),
        );
    });
});
