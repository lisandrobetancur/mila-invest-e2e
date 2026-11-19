# Android: cómo se comporta la app bajo Appium

Resultados del paso 0 de la suite mobile, todos medidos contra la app real
corriendo en un emulador. Lo que está acá está codificado **solo** en
[`mobile/src/screenplay/interactions/`](../mobile/src/screenplay/interactions/)
y [`questions/`](../mobile/src/screenplay/questions/); ninguna tarea ni spec
repite estos detalles.

## 1. El contrato de ids es el mismo que en web

La app es Flutter y declara cada control con `Semantics(identifier:)`. En
Android eso sale como el **`resource-id`** del nodo, con exactamente el mismo
string que en web expone `flt-semantics-identifier`:

```
resource-id="onboarding_skip_button"
resource-id="market_list_instrument_item_ECOPETROL-CO"
```

Por eso las dos suites comparten `src/screenplay/ids/ids.generated.ts` y
`npm run ids:check` las protege a las dos: si la app renombra un id, se
entera tanto la suite web como la mobile.

## 2. Selector: `UiSelector().resourceId(...)`

Medido sobre el mismo control:

| Estrategia | Resultado |
|---|---|
| `android=new UiSelector().resourceId("…")` | **37 ms** |
| `//*[@resource-id="…"]` (XPath) | 59 ms, y serializa toda la jerarquía |
| `~…` (accessibility id) | **no encuentra nada** |
| `id=…` | no encuentra nada |

El `~` no sirve porque en Flutter el `content-desc` lleva la **etiqueta
hablada** del control ("Saltar"), no su identificador.

## 3. Los valores se leen de `content-desc`

Flutter deja el `text` vacío y pone el valor en `content-desc`, en su forma
hablada, igual que en web lo pone en `textContent`:

| Id | `content-desc` |
|---|---|
| `market_detail_price_text` | `17.800 pesos colombianos` |
| `orders_result_status_text` | `Ejecutada` |

`SemanticText` lee `content-desc` y cae a `text` por si algún widget hiciera
lo contrario.

## 4. Nada de `@serenity-js/web` en esta suite

Serenity/JS aporta el Screenplay y el reporte; **hablar con el dispositivo es
Appium directo**. La capa web de Serenity da por sentado que hay un
navegador, y en una sesión nativa se rompe de tres formas distintas:

| Lo que usa la capa web | Qué pasa en nativo |
|---|---|
| `isVisible()` | termina en `browser.execute(...)`: no hay JavaScript que ejecutar |
| `Photographer` | pide la ventana activa (`GET /window`): comando inexistente |
| cierre de sesión del actor | consulta `window/handles`: comando inexistente |

Por eso el elenco se arma sin `BrowseTheWebWithWebdriverIO`, los targets son
valores simples (`mobile/src/screenplay/ui/selector.ts`) y las preguntas
usan `isDisplayed()` del driver.

## 5. `hideKeyboard()` cierra la pantalla

En Android, `hideKeyboard()` termina mandando **BACK**, y en una app Flutter
eso no baja el teclado: cierra la ruta actual. El síntoma fue desconcertante
—al escribir la cantidad, el ticket de la orden se cerraba solo y el
escenario seguía contra el detalle del instrumento—.

Lo que se usa es `mobile: performEditorAction` con `done`, que es el botón de
confirmar del propio teclado: lo baja y deja la pantalla donde estaba.

## 6. Hay que desplazarse, y por eso existe `Desplazarse`

En un teléfono, media pantalla de contenido empieza fuera de la vista: las
posiciones del portafolio, el final del ticket, los instrumentos del fondo de
la lista. Medido con `FERREYC1-PE`, el último de la lista del mercado:

| Estrategia | Resultado |
|---|---|
| `UiScrollable(...).scrollIntoView(...)` | funciona, 8,9 s |
| arrastres acotados, comprobando entre uno y otro | funciona, y permite parar apenas aparece |

`Desplazarse.haciaAbajo.hasta(target)` hace arrastres de a poco y pregunta
después de cada uno; si tras diez no apareció, delega el recorrido completo
en `UiScrollable`. Las listas de Flutter exponen un único nodo
`scrollable="true"`, que es el que `UiScrollable` encuentra.

El escenario *"abre un instrumento que está fuera de la pantalla"* existe
justamente para que esto no se rompa sin que nadie se entere: afirma que el
instrumento **no** se ve, se desplaza, y afirma que ya se ve.

## 7. Aislamiento: reiniciar la app entre escenarios

El backend falso vive en memoria dentro de la app, así que cerrarla y
abrirla deja los datos como recién sembrados. Es el equivalente mobile del
contexto nuevo que la suite web tiene por test, y lo hace el hook
`beforeTest` de `wdio.conf.ts`.

La preferencia del onboarding sí persiste en el dispositivo, por eso
`SaltarOnboarding()` es condicional: toca "Saltar" solo si está.

## 8. El APK tiene que estar al día

Trabajando con un APK de la tarde anterior, la app abría la tab **Mercado**
después de iniciar sesión en vez del inicio, y parecía un bug de routing.
No lo era: recompilando el APK desde el código actual, el login lleva al
inicio, como en web.

Conviene compilarlo con los mismos flags que la suite web usa para estabilidad:

```bash
flutter build apk --debug --dart-define=FAST_ANIMATIONS=true --dart-define=PRICE_REFRESH_SECONDS=0
```

`ENABLE_SEMANTICS` no hace falta en Android: el árbol semántico se activa
solo cuando hay un servicio de accesibilidad, y UiAutomator2 lo es.

---

# Pedidos al equipo de la app

Ninguno nuevo. Los dos abiertos desde la suite web —BUG-1 (entrar directo a
`/login`) y GAP-1 (segmentos y tabs sin estado de selección)— están en
[`flutter-web-notes.md`](./flutter-web-notes.md). BUG-1 no afecta a mobile,
donde no hay URL que estacionar.
