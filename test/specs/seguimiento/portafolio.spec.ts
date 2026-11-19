import { Ensure, includes, isGreaterThan, isTrue } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { ElementCount, IsDisplayed, SemanticText } from '../../../src/screenplay/questions';
import { AbrirLaApp, EsperarA, IniciarSesion, IrALaTab } from '../../../src/screenplay/tasks';
import { Portfolio } from '../../../src/screenplay/ui/portfolio.ui';

describe(Caracteristica('Ver el portafolio'), () => {

    const conSesion = [AbrirLaApp(), IniciarSesion.conLaCuentaDemo()];

    it(Escenario('muestra el total, el efectivo y lo invertido', '@smoke', '@seguimiento'), async ({ actorCalled }) => {
        await actorCalled('Camila').attemptsTo(
            Dado('que #actor inició sesión con la cuenta demo', ...conSesion),
            Cuando('abre su portafolio', IrALaTab.portafolio()),
            Entonces(
                've su valor total en la moneda base',
                EsperarA(Portfolio.withData()),
                Ensure.that(SemanticText.of(Portfolio.total()), includes('pesos colombianos')),
            ),
            Y('ve cuánto tiene en efectivo y cuánto invertido',
                Ensure.that(IsDisplayed.of(Portfolio.cash()), isTrue()),
                Ensure.that(IsDisplayed.of(Portfolio.invested()), isTrue()),
            ),
            Y('ve la distribución de su cartera',
                Ensure.that(IsDisplayed.of(Portfolio.allocationChart()), isTrue()),
                Ensure.that(IsDisplayed.of(Portfolio.allocation('STOCK')), isTrue()),
                Ensure.that(IsDisplayed.of(Portfolio.allocation('CASH')), isTrue()),
            ),
        );
    });

    it(Escenario('muestra una línea por cada posición', '@seguimiento'), async ({ actorCalled }) => {
        await actorCalled('Camila').attemptsTo(
            Dado('que #actor inició sesión con la cuenta demo', ...conSesion),
            Cuando('abre su portafolio', IrALaTab.portafolio()),
            Entonces(
                've todas sus posiciones',
                EsperarA(Portfolio.position('ECOPETROL-CO')),
                Ensure.that(ElementCount.of(Portfolio.allPositions()), isGreaterThan(1)),
            ),
            Y(
                've el detalle de su posición en ECOPETROL',
                Ensure.that(SemanticText.of(Portfolio.positionQuantity('ECOPETROL-CO')), includes('120')),
                Ensure.that(SemanticText.of(Portfolio.positionAvgCost('ECOPETROL-CO')), includes('pesos colombianos')),
                Ensure.that(SemanticText.of(Portfolio.positionValue('ECOPETROL-CO')), includes('pesos colombianos')),
                Ensure.that(IsDisplayed.of(Portfolio.positionPnl('ECOPETROL-CO')), isTrue()),
            ),
        );
    });
});
