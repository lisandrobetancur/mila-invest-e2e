# Escribir un escenario

Gherkin dentro de `describe`/`it`. **No hay Cucumber ni archivos `.feature`**:
la estructura es la de Playwright Test y las palabras clave son tareas de
Serenity, así que el reporte HTML de Serenity/JS muestra los pasos
Dado/Cuando/Entonces igual que si vinieran de un `.feature`, pero el código
se navega, se refactoriza y se tipa como código.

## La convención

| Gherkin | En código |
|---|---|
| `Característica:` | `describe(Caracteristica('…'))`, uno por archivo |
| `Regla:` | `describe(Regla('…'))` anidado |
| `Antecedentes:` | una constante con las tareas comunes, o `beforeEach` |
| `Escenario:` | `it(Escenario('…', '@tag'))` |
| `Esquema del escenario:` + `Ejemplos:` | `describe(EsquemaDelEscenario('…'))` + un `for` sobre los ejemplos |
| Tags | argumentos de `Escenario(...)`, filtrables con `--grep` |

Los helpers (`Caracteristica`, `Escenario`, `Dado`, `Cuando`, `Entonces`, `Y`,
`Pero`) están en [`src/gherkin/gherkin.ts`](../src/gherkin/gherkin.ts).

`describe` e `it` se importan **siempre** de `@serenity-js/playwright-test`,
nunca de `@playwright/test`: son los que inyectan el fixture `actorCalled`.

## Un escenario entero

```ts
import { Ensure, equals, includes } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { Caracteristica, Cuando, Dado, Entonces, Escenario, Y } from '../../../src/gherkin/gherkin';
import { SemanticText } from '../../../src/screenplay/questions';
import { AbrirLaApp, ComprarInstrumento, IniciarSesion } from '../../../src/screenplay/tasks';
import { OrderResult } from '../../../src/screenplay/ui/orders.ui';

describe(Caracteristica('Comprar acciones a mercado'), () => {

    // Antecedentes
    const conSesion = [AbrirLaApp(), IniciarSesion.conLaCuentaDemo()];

    it(Escenario('compra con saldo suficiente', '@smoke', '@inversion'), async ({ actorCalled }) => {
        await actorCalled('Licho').attemptsTo(
            Dado('que #actor inició sesión con la cuenta demo', ...conSesion),
            Cuando('compra 2 acciones de ISA a mercado', ComprarInstrumento.conId('ISA-CO').cantidad(2)),
            Entonces('ve la orden ejecutada', Ensure.that(SemanticText.of(OrderResult.status()), equals('Ejecutada'))),
        );
    });
});
```

`#actor` se reemplaza por el nombre del actor en el reporte, así que el paso
se lee "Dado que Licho inició sesión con la cuenta demo".

## Esquema del escenario

```ts
describe(EsquemaDelEscenario('cada país pide su documento'), () => {
    const ejemplos = [
        { pais: 'CO', documento: DocumentChip.CC, nombre: 'cédula' },
        { pais: 'MX', documento: DocumentChip.CURP, nombre: 'CURP' },
        { pais: 'PE', documento: DocumentChip.DNI, nombre: 'DNI' },
    ] as const;

    for (const ejemplo of ejemplos) {
        it(Escenario(`en ${ejemplo.pais} se pide ${ejemplo.nombre}`, '@acceso'), async ({ actorCalled }) => {
            // …
        });
    }
});
```

## Reglas de la casa

**Un spec solo usa tareas, preguntas y targets por nombre.** Si estás por
escribir `By.css` o un id, falta una tarea o un target. Hay un lint que lo
impide.

**Nada de esperas fijas.** No existe `waitForTimeout` en esta suite. Si algo
tarda, la tarea correspondiente espera *a que pase algo* (`EsperarA`,
`EsperarLaCargaDe`). En un spec, lo normal es no esperar nada: las tareas ya
dejan la pantalla estable.

**Afirmá después de esperar.** Si el paso anterior fue una acción y lo que
mirás aparece como consecuencia (un error de validación, una pantalla nueva),
el `Entonces` empieza con `EsperarA(...)` y después afirma. Es la diferencia
entre un escenario estable y uno que falla uno de cada diez.

**Afirmá sobre lo observable, no sobre el control.** Los segmentos y las tabs
de la app no publican si están elegidos
([GAP-1](./flutter-web-notes.md#gap-1--los-segmentos-y-las-tabs-no-exponen-que-están-elegidos)):
en vez de preguntarle al control, afirmá su consecuencia —la URL
(`QueryParam.named('country')`), la pantalla que se abrió, el valor que
cambió—. Los chips sí lo publican y ahí `IsSelected` funciona.

**Los montos, por su forma hablada o por su número.** La app expone
`"22.800 pesos colombianos"`, no `"$ 22.800 COP"`. Para un valor exacto,
`SemanticText`; para comparar un antes y un después sin atarte al idioma,
`AmountValue`, que devuelve el número.

**Comparar un antes y un después.** Los actores toman notas:

```ts
Y('anota su saldo', notes<Notas>().set('saldoAnterior', AmountValue.of(Available.COP()))),
// …
Y('su saldo subió', Ensure.that(AmountValue.of(Available.COP()), isGreaterThan(notes<Notas>().get('saldoAnterior')))),
```

Es preferible a escribir el número sembrado: si mañana cambia la semilla del
backend falso, el escenario sigue diciendo la verdad.

**Datos de la cuenta demo.** Están sembrados y son determinísticos: ECOPETROL
(120), ICOLCAP (20), WALMEX (50), BAP (5) y una orden rechazada en el
historial. Cada test arranca con un contexto nuevo, así que el backend falso
vuelve a cero: no hace falta limpiar nada, ni importa el orden de los tests.

## Tags

| Tag | Para qué |
|---|---|
| `@smoke` | el camino crítico; `npm run test:smoke` |
| `@acceso` `@mercado` `@inversion` `@dinero` `@seguimiento` `@plataforma` | por capacidad |
| `@seed-empty` | solo corre con un build `FAKE_SEED=empty` (y `MILA_SEED=empty`) |

```bash
npm run test:smoke
npx playwright test --grep @inversion
npx playwright test --grep-invert @seed-empty
```

## Dónde va cada archivo

`test/specs/<capacidad>/<característica>.spec.ts`. La carpeta es la capacidad
y el archivo la característica: así sale la jerarquía del reporte
(capacidad → característica → escenario). Si tu escenario no entra en
ninguna capacidad existente, creá la carpeta: es una decisión de producto,
no de código.
