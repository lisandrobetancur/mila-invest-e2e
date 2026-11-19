# mila-invest-ui-e2e

Suite end-to-end **black-box** de [MILA Invest](https://github.com/lisandrobetancur/mila-invest-app):
Playwright Test + patrón **Screenplay** de Serenity/JS, escenarios en Gherkin
dentro de `describe`/`it` y el reporte HTML de Serenity/JS.

No hay Cucumber, ni archivos `.feature`, ni Page Objects, ni esperas fijas.
El único acople con la app es su contrato de identificadores semánticos
(`flt-semantics-identifier`), que se genera desde el repo de la app.

## Requisitos

| | |
|---|---|
| Node | 22 LTS (`.nvmrc`) |
| Python 3 | para servir el build web de la app |
| Flutter | 3.41.9, solo si vas a compilar la app |

## Correr la suite localmente

### 1. Compilar la app con los flags del contrato

Desde el repo de la app, **dentro del paquete de la app**:

```bash
cd mila-invest-app/packages/apps/mila_invest_app
```

```bash
flutter build web --release --dart-define=ENABLE_SEMANTICS=true --dart-define=FAST_ANIMATIONS=true --dart-define=PRICE_REFRESH_SECONDS=0
```

Sin `ENABLE_SEMANTICS=true` no existen los identificadores y **no hay suite
que valga**: todos los escenarios fallan por timeout.

### 2. Servirlo con fallback de SPA

Desde la raíz de `mila-invest-app`:

```bash
python3 scripts/serve_web.py 8080
```

### 3. Correr los escenarios

```bash
npm ci
```

```bash
npx playwright install chromium
```

```bash
npm test
```

Si `mila-invest-app` no está en `../mila-invest-app`, decile dónde está:

```bash
MILA_APP_PATH=../../dart/mila-invest-app npm test
```

Y si la app está servida en otro lado:

```bash
BASE_URL=http://localhost:8080 npm test
```

Sin `BASE_URL`, Playwright levanta `serve_web.py` por su cuenta (reusa el que
ya esté corriendo). El build de Flutter nunca lo hace la suite: lo hacés vos o
lo hace CI.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm test` | toda la suite web, en los dos breakpoints |
| `npm run test:smoke` | solo `@smoke` |
| `npm run test:web:movil` / `test:web:escritorio` | un breakpoint a la vez |
| `npm run test:web:full` | borra el reporte anterior, corre todo con fotos de cada paso y abre el reporte |
| `npm run report:web` | abre el `index.html` del reporte web de la última corrida |
| `npm run ids:sync` | regenera los ids desde el contrato de la app |
| `npm run ids:check` | falla si los ids quedaron viejos (corre en CI) |
| `npm run lint` / `typecheck` | ESLint y TypeScript |
| `npm run clean` | borra `target/`, `playwright-report/`, `test-results/` |

### El reporte

Lo genera la **propia corrida**: no hay un paso aparte, ni CLI de Java, ni
`serenity-bdd`. Cada `npm test` deja `reports/serenity-js/` con un
`index.html` autocontenido, que **se abre con doble clic**, sin servidor.

```bash
open reports/serenity-js/index.html
```

`npm run report:web` hace lo mismo. Para verlo desde otra máquina,
`npx html-reporter serve --dir ./reports/serenity-js` lo sirve por HTTP. Tiene la
jerarquía capacidad → característica → escenario, el árbol de actividades de
cada escenario con sus pasos Dado/Cuando/Entonces, las capturas, el historial
entre corridas y el análisis de consistencia (qué test se puso inestable).

#### Capturas

Por defecto solo se fotografían los **fallos**: una foto por interacción
cuesta tiempo. Para ver el paso a paso completo de cada escenario:

```bash
MILA_PHOTOS=all npm test
```

El reporte pasa de ~1 MB a ~80 MB y la corrida tarda unas cinco veces más,
así que conviene dejarlo para cuando lo necesites.

#### Corrida completa con reporte

`test:web:full` y `test:android:full` hacen todo de una: borran el reporte
anterior, corren la suite con `MILA_PHOTOS=all` y, terminen verdes o rojos,
abren el `index.html` del reporte en el navegador por defecto. Incluyen
el escenario `@fallo-demo`, que falla a propósito para ver cómo se muestra
un assert.

```bash
BASE_URL=http://127.0.0.1:8081 npm run test:web:full
```

```bash
MILA_DEVICE=RF8R41GQYHF MILA_APP_PATH=../../dart/mila-invest-app npm run test:android:full
```

#### Solo una parte de los escenarios

`MILA_GREP` corre solo los escenarios que tienen ese tag o ese texto en el
nombre, en las dos suites y también con los scripts `:full`:

```bash
MILA_GREP=@mercado BASE_URL=http://127.0.0.1:8081 npm run test:web:full
```

```bash
MILA_GREP="búsqueda sin resultados" MILA_DEVICE=RF8R41GQYHF MILA_APP_PATH=../../dart/mila-invest-app npm run test:android:full
```

Tags: `@smoke`, `@acceso`, `@mercado`, `@inversion`, `@dinero`,
`@seguimiento`, `@plataforma`, `@fallo-demo`, `@seed-empty`.

#### Segunda ejecución de los fallos

`MILA_RETRIES` dice cuántas veces se vuelve a correr un escenario que falló
(default: 1 en CI, 0 afuera). Vale para las dos suites:

```bash
MILA_RETRIES=1 BASE_URL=http://127.0.0.1:8081 npm run test:web:full
```

## Los dos proyectos

Los mismos escenarios corren en los dos breakpoints de la app:

| Proyecto | Viewport | Qué cubre |
|---|---|---|
| `web-movil` | 390 × 844 | bottom bar |
| `web-escritorio` | 1440 × 900 | rail lateral |

Los identificadores son los mismos en los dos, así que no hay un solo
escenario duplicado. Se llaman `web-…` y no `mobile-chromium` a propósito:
el teléfono de verdad es la suite de Android, y en el reporte no tienen que
confundirse.

## Usuario vacío

Los escenarios de estados vacíos (`@seed-empty`) necesitan un build distinto:

```bash
flutter build web --release --dart-define=ENABLE_SEMANTICS=true --dart-define=FAST_ANIMATIONS=true --dart-define=PRICE_REFRESH_SECONDS=0 --dart-define=FAKE_SEED=empty
```

```bash
MILA_SEED=empty npx playwright test --grep @seed-empty
```

Con la semilla `demo` (la de siempre) esos escenarios se saltan solos.

## La suite mobile (Android)

Los mismos escenarios, contra la app Android, con **Appium**: el runner es el
de WebdriverIO y Serenity/JS aporta el Screenplay y el reporte. El contrato
de ids es el mismo —en Android los `Semantics(identifier:)` de Flutter salen
como `resource-id`—, así que las dos suites comparten
`src/screenplay/ids/ids.generated.ts`.

Hace falta un emulador o un teléfono conectado (`adb devices`) y el APK
compilado desde el repo de la app:

```bash
flutter build apk --debug --dart-define=FAST_ANIMATIONS=true --dart-define=PRICE_REFRESH_SECONDS=0
```

```bash
MILA_APP_PATH=../../dart/mila-invest-app npm run test:android
```

| Comando | Qué hace |
|---|---|
| `npm run test:android` | toda la suite mobile |
| `npm run test:android:smoke` | solo `@smoke` |
| `npm run test:android:full` | borra el reporte anterior, corre todo con fotos de cada paso y abre el reporte |
| `npm run report:android` | abre el `index.html` del reporte de Android |
| `npm run typecheck:android` | tipos de la suite mobile |

El reporte es el mismo de Serenity/JS pero **independiente**: la suite web
escribe en `reports/serenity-js` y la mobile en `reports/serenity-js-mobile`.

Lo que Android hace distinto —y lo que costó descubrir— está en
[`docs/android-notes.md`](docs/android-notes.md).

## CI

El workflow tiene dos jobs:

- **Lint y tipos**: no depende de nada externo y siempre tiene que estar en
  verde.
- **Escenarios**: compila `mila-invest-app` y corre la suite. Si el ref de la
  app todavía no tiene el código (falta `pubspec.yaml` o
  `docs/semantics-ids.md`), el job **avisa y se saltea** en vez de fallar: un
  rojo permanente por una dependencia que no existe no informa nada. El aviso
  queda visible en el PR como *warning*.

Cuando la app esté publicada, ese job corre entero: `ids:check`, la suite en
los dos breakpoints y los dos reportes como artifacts.

## Documentación

- [`docs/architecture.md`](docs/architecture.md): las capas, las reglas de
  dependencia y por qué.
- [`docs/writing-scenarios.md`](docs/writing-scenarios.md): cómo se escribe un
  escenario nuevo.
- [`docs/flutter-web-notes.md`](docs/flutter-web-notes.md): cómo se comporta
  Flutter web bajo automatización (resultados medidos, no supuestos) y los
  pedidos abiertos al equipo de la app.

> **Ojo:** hay un bug abierto en la app que condiciona la suite —entrar
> directo a `/login` deja la sesión en el aire—. Está documentado en
> [BUG-1](docs/flutter-web-notes.md#bug-1-bloqueante--entrar-directo-a-login-deja-la-sesión-en-el-aire)
> con repro, causa y arreglo sugerido. Por eso las tareas entran por `/`.
