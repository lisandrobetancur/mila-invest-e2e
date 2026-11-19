/**
 * ⚠️ ESTE ESCENARIO FALLA A PROPÓSITO. No es una regresión.
 *
 * Existe para ver cómo se ve un fallo en el reporte: el paso que rompe, el
 * árbol de actividades hasta ahí, la captura del momento exacto y el
 * agrupamiento por causa. Sirve para enseñar la suite y para comprobar que
 * las capturas de fallo siguen funcionando después de tocar la configuración.
 *
 * Está aislado en su propia capacidad (`demo`) y etiquetado `@fallo-demo`,
 * así que se puede dejar afuera cuando molesta:
 *
 * ```bash
 * npx playwright test --grep-invert @fallo-demo
 * ```
 */
import { Ensure, equals } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { Caracteristica, Cuando, Dado, Entonces, Escenario } from '../../../src/gherkin/gherkin';
import { SemanticText } from '../../../src/screenplay/questions';
import { AbrirLaApp, EsperarA, IniciarSesion } from '../../../src/screenplay/tasks';
import { Home } from '../../../src/screenplay/ui/dashboard.ui';

describe(Caracteristica('Un fallo a propósito (web)'), () => {

    it(Escenario('el valor total no es el que dice este escenario', '@smoke', '@fallo-demo'), async ({ actorCalled }) => {
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
