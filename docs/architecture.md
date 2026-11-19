# Arquitectura de la suite

Screenplay con Serenity/JS sobre Playwright Test, con el reporte HTML de
Serenity/JS (`@serenity-js/html-reporter`), que genera la propia corrida. La idea de fondo: un
escenario se lee como lo contaría una persona del negocio, y todo lo que
huele a navegador vive lo más abajo posible.

```
specs  →  tasks  →  interactions / questions  →  ui  →  ids
```

Cada flecha es "puede importar". Al revés, nunca.

| Capa | Dónde | Qué sabe | Qué no sabe |
|---|---|---|---|
| **specs** | `test/specs/<capacidad>/<feature>.spec.ts` | el dominio: iniciar sesión, comprar, depositar | nada de targets, selectores ni ids |
| **tasks** | `src/screenplay/tasks/` | pasos del dominio, componibles | que exista Flutter, Playwright o el DOM |
| **interactions** | `src/screenplay/interactions/` | **todo** lo de Flutter web: tap, foco, `addInitScript` | el dominio |
| **questions** | `src/screenplay/questions/` | cómo leer un valor, un estado, la URL | el dominio |
| **ui** | `src/screenplay/ui/` | qué id corresponde a cada cosa, con nombre de negocio | cómo se usa |
| **ids** | `src/screenplay/ids/ids.generated.ts` | los identificadores, tal cual los publica la app | todo lo demás |

## Por qué así

**Los specs no mencionan selectores.** Un escenario que habla de
`PageElement.located(By.css(...))` deja de ser una conversación sobre el
producto. Si un spec necesita un target, falta una tarea o una pregunta.

**Las tareas no saben de Flutter.** `ComprarInstrumento.conId('ISA-CO').cantidad(2)`
vale igual si mañana la app se reescribe en otra cosa. Todo lo que aprendimos
en el paso 0 —que hay que enfocar un campo antes de escribir, que los valores
viven en `textContent` y no en `aria-label`— está en las interacciones y las
preguntas, y en ningún otro lado. Si Flutter cambia, se tocan cuatro archivos.

**Un solo selector en todo el repo.** `src/screenplay/ui/selector.ts` es el
único lugar que construye `[flt-semantics-identifier="…"]`; hay una regla de
ESLint que falla si aparece en cualquier otra parte. El contrato con la app
es ese atributo y nada más: no hay XPath, ni CSS de estructura, ni texto
visible (que cambia con el idioma).

**Los ids se generan, no se escriben.** `scripts/sync-ids.ts` los lee de
`mila-invest-app/docs/semantics-ids.md`. `npm run ids:check` corre en CI: si
la app renombra un id, la suite falla ahí, con un mensaje claro, y no a mitad
de un escenario con un timeout.

## Las piezas

### `src/config/env.ts`

El **único** lugar que lee `process.env`. `BASE_URL`, `MILA_APP_PATH`,
`MILA_SEED` y los timeouts. Si algo necesita configuración, la pide acá.

### `src/screenplay/ui/`

Un archivo por feature. Cada target es una función con nombre de negocio y su
descripción en castellano, que es la que sale en el reporte:

```ts
export const LoginForm = {
    email: (): Target => target(AuthIds.loginEmailField, 'el campo de correo'),
};
```

Los ids dinámicos replican las funciones de Dart:
`MarketIds.listInstrumentItem('ECOPETROL-CO')` →
`market_list_instrument_item_ECOPETROL-CO`. Los ids derivados de componentes
salen de `DerivedIds`: `DerivedIds.priceTextOf(…)`, `errorTextOf(…)`.

### `src/screenplay/interactions/`

`TapOn`, `TypeInto`, `ClearAndType`, `ScrollIntoView` y `MarkOnboardingSeen`.
`native.ts` es el puente con Playwright (el `Locator`, la `Page`, el `<input>`
hijo de un campo) y es lo único que importa `playwright-core`.

Lo que cada una resuelve está medido y explicado en
[`flutter-web-notes.md`](./flutter-web-notes.md).

### `src/screenplay/questions/`

`SemanticText` (el valor que muestra un control), `AmountValue` (su número,
para comparar sin atarse al formato), `IsDisplayed`, `IsSelected`,
`ElementCount`, `CurrentPath` / `CurrentQuery` / `QueryParam`.

### `src/screenplay/tasks/`

Por feature, en castellano y componibles. Dos reglas:

1. **Una tarea deja la app en un estado estable.** Si navega, espera a que la
   pantalla esté; si filtra, espera a que el filtro se haya aplicado. Así un
   spec puede afirmar lo que sigue sin esperar nada por su cuenta.
2. **Una tarea se puede llamar desde donde esté #actor.** `AbrirLaBilletera()`
   comprueba primero si ya está abierta (`Check.whether(…)`), porque la
   billetera y los ajustes son pantallas completas donde el shell no tiene
   tabs. Eso permite componer `Depositar.monto('…').en('COP')` sin saber de
   dónde viene.

### Esperas

Nunca `waitForTimeout` ni `sleep`. Siempre `Wait.until(…)` con el techo de
`env.ts`, en dos sabores: `EsperarA` (algo dentro de una vista ya cargada) y
`EsperarLaCargaDe` (un cambio de pantalla).

Las esperas usan `IsDisplayed`, no el `isVisible()` de `@serenity-js/web`:
ese hace *hit-testing* con `elementFromPoint` y los nodos contenedores de
Flutter tienen `pointer-events: none`, así que daría `false` para vistas
perfectamente visibles. Está explicado en `esperas.ts`.

## Cómo crece

| Si querés… | Tocá… |
|---|---|
| un escenario nuevo | solo `test/specs/` (y si falta un paso, una tarea) |
| un paso de dominio nuevo | `src/screenplay/tasks/<feature>/` |
| leer un valor que nadie lee todavía | `src/screenplay/ui/<feature>.ui.ts` y, si hace falta, una pregunta |
| algo que Flutter web hace raro | `src/screenplay/interactions/` + una nota en `flutter-web-notes.md` |
| ids nuevos de la app | nada a mano: `npm run ids:sync` |
