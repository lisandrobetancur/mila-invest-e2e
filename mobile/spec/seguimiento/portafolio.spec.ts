import { Ensure, includes, isTrue } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { IsDisplayed, SemanticText } from '../../src/screenplay/questions';
import { AbrirLaApp, EsperarA, IniciarSesion, IrALaTab, VerEnPantalla } from '../../src/screenplay/tasks';
import { Portfolio } from '../../src/screenplay/ui/portfolio.ui';

describe(Caracteristica('Ver el portafolio'), () => {

    it(Escenario('muestra el total, el efectivo y lo invertido', '@smoke', '@seguimiento'), async () => {
        await actorCalled('Camila').attemptsTo(
            Dado('que #actor inició sesión con la cuenta demo', AbrirLaApp(), IniciarSesion.conLaCuentaDemo()),
            Cuando('abre su portafolio', IrALaTab.portafolio()),
            Entonces(
                've su valor total en la moneda base',
                EsperarA(Portfolio.withData()),
                Ensure.that(SemanticText.of(Portfolio.total()), includes('pesos colombianos')),
            ),
            Y(
                've cuánto tiene en efectivo y cuánto invertido',
                Ensure.that(IsDisplayed.of(Portfolio.cash()), isTrue()),
                Ensure.that(IsDisplayed.of(Portfolio.invested()), isTrue()),
            ),
            Y(
                've el detalle de su posición en ECOPETROL',
                VerEnPantalla(Portfolio.position('ECOPETROL-CO')),
                Ensure.that(SemanticText.of(Portfolio.positionQuantity('ECOPETROL-CO')), includes('120')),
            ),
        );
    });
});
