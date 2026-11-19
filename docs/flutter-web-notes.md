# Flutter web: cómo se comporta la app bajo automatización

Resultados del **paso 0**: todo lo de acá se midió contra la app real
(`flutter build web --release` con los flags de abajo), no se dedujo. Cada
respuesta está codificada **solo** en
[`src/screenplay/interactions/`](../src/screenplay/interactions/) y
[`src/screenplay/questions/`](../src/screenplay/questions/); ninguna tarea ni
spec repite estos detalles.

```bash
# desde mila-invest-app/packages/apps/mila_invest_app
flutter build web --release \
  --dart-define=ENABLE_SEMANTICS=true \
  --dart-define=FAST_ANIMATIONS=true \
  --dart-define=PRICE_REFRESH_SECONDS=0

# desde la raíz de mila-invest-app
python3 scripts/serve_web.py 8080
```

> El build se corre **dentro del paquete de la app**
> (`packages/apps/mila_invest_app`), no en la raíz del repo: en la raíz no
> hay `lib/main.dart` y falla con `Target file "lib/main.dart" not found`.

## 1. Anatomía de un nodo

Con `ENABLE_SEMANTICS=true`, Flutter dibuja sobre el canvas y mantiene encima
un árbol de `<flt-semantics>` dentro de `<flt-semantics-host>`. Cada control
identificado aparece así:

```html
<flt-semantics id="flt-semantic-node-16" role="button" tabindex="0" flt-tappable
               flt-semantics-identifier="auth_login_demo_button"
               style="position:absolute; pointer-events:all; width:392px; height:40px;
                      transform: matrix(1,0,0,1,524,308);">Usar cuenta demo</flt-semantics>
```

Los nodos tienen tamaño real, `pointer-events: all`, `opacity: 1` y un
bounding box correcto: para Playwright son elementos normales. Los nodos
contenedores llevan `pointer-events: none`, así que no tapan a sus hijos.

## 2. Click

**`Click` normal funciona.** Se midieron cinco estrategias contra un control
que navega de verdad (`auth_login_register_link`): `click()`,
`click({force:true})`, `dispatchEvent('click')`, `mouse.click(centro)` y
`mouse.down()/up()`. Las cinco disparan la acción. `click()` repetido 10
veces sobre el mismo control: 10/10 sin timeouts.

El riesgo real no es el gesto sino la **estabilidad del nodo**: Flutter
reconstruye el árbol semántico entre frames y Playwright puede quedarse
reintentando con `element was detached from the DOM` durante una transición
de ruta. Por eso [`TapOn`](../src/screenplay/interactions/TapOn.ts):

1. espera a que el target sea visible (`Wait.until`, nunca una espera fija);
2. hace el click nativo con el timeout de `env.ts`;
3. si el nodo se desprendió en el medio, reintenta **una** vez tocando el
   centro de su bounding box con `mouse.down()/up()`, que no depende de las
   comprobaciones de accionabilidad.

> **Trampa:** `auth_login_demo_button` no inicia sesión, **solo rellena** el
> formulario con las credenciales demo. Medir "si el click funciona" mirando
> si cambia la URL después de tocarlo da un falso negativo.

## 3. Escritura

Un campo expone un `<input>` (o `<textarea>`) **hijo** del nodo semántico:

```html
<flt-semantics flt-semantics-identifier="auth_login_email_field">
  <input data-semantics-role="text-field" aria-label="Correo" type="text" inputmode="email">
</flt-semantics>
```

`fill()` sobre ese hijo funciona y la app se entera (el `onChanged` del
`AppTextField` corre). Por eso
[`TypeInto`](../src/screenplay/interactions/TypeInto.ts) baja al hijo
`input, textarea` —la única excepción permitida a "solo
`flt-semantics-identifier`"— en vez de usar `Enter.theValue` sobre el nodo.

Pero hay dos trampas, y las dos costaron caro:

1. **Hay que tocar el campo antes de escribir.** Un `fill()` sobre un campo
   que la app no tiene en edición deja el `<input>` vacío: el texto no llega
   ni al DOM. El login lo disimula (su primer campo arranca enfocado); el
   registro no, y fallaba con los cuatro campos llenos en pantalla y cuatro
   errores de "campo obligatorio".
2. **Flutter puede reconstruir el `<input>` mientras se escribe** y llevarse
   lo escrito. Pasa de a ratos y era el único flaky que tuvo la suite. Por
   eso `TypeInto` vuelve a resolver el nodo después de escribir, comprueba
   que el valor haya quedado y reintenta (hasta tres veces).

Ojo con una explicación que parece buena y no lo es: *esperar a que el
`<input>` tenga el foco del DOM*. En el buscador del mercado, tocar el campo
deja `document.activeElement` en `BODY` y aun así `fill()` funciona; esperar
el foco cuelga la interacción 15 segundos y rompe el escenario. El invariante
correcto no es el foco, es **que el valor haya quedado escrito**.

## 4. Lectura de valores

Los nodos de valor **no tienen `aria-label`**: el texto está en
`textContent`, y es la **forma hablada**, no la visual.

| Id | `textContent` | En pantalla |
|---|---|---|
| `market_detail_price_text` | `17.800 pesos colombianos` | `$ 17.800 COP` |
| `market_detail_change_text` | `sube 180 pesos colombianos, 1,02 por ciento` | `▲ $180 (1,02 %)` |
| `market_detail_ticker_text` | `ISA` | `ISA` |
| `orders_result_status_text` | `Ejecutada` | `Ejecutada` |

Los nodos **contenedores** sí usan `aria-label` (el ítem
`market_list_instrument_item_BAP-PE` tiene `aria-label="BAP\nCredicorp"` y un
`textContent` que concatena a sus hijos).

[`SemanticText`](../src/screenplay/questions/SemanticText.ts) lee
`textContent` y cae a `aria-label` si está vacío. Para montos, los escenarios
afirman sobre la forma hablada (`'22.800 pesos colombianos'`), que es estable
frente al tema y al layout, o usan
[`AmountValue`](../src/screenplay/questions/AmountValue.ts), que extrae el
número.

## 5. Onboarding

La primera visita siempre manda a `/onboarding`, venga la URL que venga.
Terminarlo (o saltarlo) escribe en `localStorage`:

```
flutter.mila_invest.onboarding_seen = "true"
```

Confirmado: es `shared_preferences` con su prefijo `flutter.` y el valor
`true` serializado como string. `SaltarOnboarding()` lo escribe con
`page.addInitScript(...)` **antes** de cargar la app, así que el redirect ni
siquiera pasa por el onboarding.

## 6. Selección

| Control | Cómo expone que está elegido |
|---|---|
| Chips (`market_list_country_pe_chip`, filtros) | `role="checkbox"` + **`aria-checked`** (`"true"`/`"false"`) |
| Segmentos (`market_detail_range_1m_segment`, lado de la orden, tema, idioma) | **no lo exponen**: `role="button"`, sin `aria-checked` ni `aria-selected` |
| Tabs del shell (`nav_market_tab`) | **no lo exponen**: `role="button"`, sin `aria-selected` |

[`IsSelected`](../src/screenplay/questions/IsSelected.ts) lee `aria-checked`
y, si no está, `aria-selected`. Sirve para chips. Para segmentos y tabs, los
escenarios afirman sobre la **consecuencia** (la URL refleja el filtro, la
vista que quedó abierta), no sobre el control. Ver *Pedidos al equipo de la
app*, GAP-1.

## 7. Sesión, URLs y navegación

- **La sesión no sobrevive a un reload.** Con `API_MODE=fake` el token store
  es `InMemoryTokenStore`: cualquier `page.goto(...)` después del login
  vuelve a `/login`. Las tareas navegan **dentro** de la app (tocando tabs,
  ítems y botones); `Navigate.to(...)` solo se usa para entrar y para probar
  deep links.
- **Los filtros van en la URL**: `/market?country=PE&q=zzz`. Es la forma más
  barata y estable de afirmar que un filtro se aplicó.
- El ticket, la confirmación y el resultado comparten URL
  (`/orders/ticket/:id/:side`): se distinguen por su raíz de vista
  (`orders_ticket_view`, `orders_confirm_view`, `orders_result_view`).
- Un deep link a una ruta **protegida** sin sesión funciona como dice el
  contrato: `/market/instrument/ISA-CO` → login → vuelve al instrumento.

## 8. El arranque, muy de vez en cuando, no pinta

Alrededor de 1 de cada 400 arranques (medido en corridas seguidas) la app
queda en blanco: ni un solo nodo `flt-semantics`, ni la raíz del splash. No
es el servidor —`serve_web.py` aguanta 30 descargas concurrentes de
`main.dart.js` sin un error— sino el canvas de Flutter, que se queda sin
primer frame.

[`EsperarElArranque`](../src/screenplay/interactions/EsperarElArranque.ts)
hace lo que haría una persona frente a una pantalla en blanco: recarga, una
sola vez, y vuelve a esperar. Solo se usa al **entrar** a la app: más
adelante una recarga perdería la sesión, que con el backend falso vive en
memoria.

---

# Pedidos al equipo de la app

## BUG-1 (bloqueante) · entrar directo a `/login` deja la sesión en el aire

**Qué pasa.** Con la app recién cargada en `/login`, iniciar sesión no lleva
a ningún lado: el formulario queda igual, sin error, sin spinner y sin
excepción en consola. La sesión **sí** se abre; lo que falla es el redirect.

**Traza** (build instrumentado con prints en `AppRedirect.resolve`):

```
PROBE: redirect(/login) auth=false -> /        ← el gate estaciona "/login"
PROBE: bootstrap sesion restaurada
PROBE: redirect(/)      auth=false -> /login
PROBE: submit() llama al service
PROBE: submit() volvio del service con demo@milainvest.app
PROBE: session.authenticate()
PROBE: redirect(/login) auth=true  -> /login   ← take() devuelve "/login"
```

**Causa.** En
`packages/apps/mila_invest_app/lib/router/app_redirect.dart`, la rama de
"bootstrap todavía no listo" estaciona **cualquier** ubicación que no sea el
splash, sin mirar si es pública:

```dart
if (!gate.isReady) {
  if (isSplash) {
    return null;
  }
  gate.park(location);        // ← también estaciona /login y /register
  return AppCrossRoutes.splashPath;
}
```

Más abajo, el mismo método sí distingue (`if (!isPublic) { gate.park(location); }`).
La primera rama es la que se olvida. Al autenticarse,
`gate.take()` devuelve `/login` y el router redirige de `/login` a `/login`:
el usuario queda logueado, mirando el login.

**Cómo reproducirlo a mano.** Navegador limpio → `http://localhost:8080/login`
→ "Usar cuenta demo" → "Iniciar sesión". No pasa nada. Entrando por
`http://localhost:8080/` el mismo login llega a `/home`.

**Alcance.** Cualquier entrada directa a una ruta pública mientras arranca la
app: `/login` y `/register`. Entrar a `/register` y loguearse después manda
al registro en vez de al inicio.

**Arreglo sugerido.** Que la rama de arranque no estacione rutas públicas:

```dart
if (!gate.isReady) {
  if (isPublic) {
    return isSplash ? null : AppCrossRoutes.splashPath;
  }
  gate.park(location);
  return AppCrossRoutes.splashPath;
}
```

**Test que lo hubiera atajado.** `app_redirect_test.dart` cubre el
estacionamiento de rutas protegidas, pero no el caso "pedir `/login` con el
gate cerrado": `resolve(Uri.parse('/login'))` con `gate.isReady == false` y
después `gate.parkedLocation` tiene que ser `null`.

### La regla general, para la próxima app

El patrón "estacionar la ubicación pedida mientras arranco y volver a ella
cuando haya sesión" es correcto, pero tiene **una sola** invariante y es
fácil de romper: **nunca se estaciona un destino al que no querrías volver
después de autenticarte.** Es decir, el login, el registro, el onboarding, el
splash y cualquier pantalla que solo existe *mientras no hay sesión*.

Tres cosas lo hacen especialmente traicionero:

1. **Falla en silencio.** Redirigir de `/login` a `/login` no es un error: el
   router hace exactamente lo que se le pide. No hay excepción, ni log, ni
   estado de error. Desde afuera parece que "el botón no hace nada", y se
   pierde el tiempo buscando en el botón, en el service y en el storage —que
   es justo lo que pasó acá.
2. **Depende de por dónde entraste.** Si siempre arrancás en `/`, no lo ves
   nunca. Aparece solo con deep links, F5 en una ruta pública, o una suite
   E2E que va derecho a `/login`. Es decir: en producción, no en tu máquina.
3. **La condición de "listo" y la de "público" se escriben en lugares
   distintos**, y nada obliga a que coincidan.

Lo que sí ayuda:

- **Una sola función pura** que decida el redirect (acá ya existe y está
  bien: `AppRedirect.resolve(Uri)` se testea sin widgets). El bug no fue de
  arquitectura, fue una rama sin cubrir.
- **Un único predicado `isPublic`** usado por *todas* las ramas, incluida la
  de arranque. Si una rama decide por su cuenta qué estacionar, se desalinea.
- **Tests de tabla sobre el redirect**: para cada ruta pública, con el gate
  abierto y cerrado, verificar que no queda nada estacionado; para cada ruta
  protegida, que sí queda. Son tests baratos y cubren la matriz entera.
- **Afirmar sobre la ubicación final, no sobre "no hubo error"**: un
  escenario E2E de login tiene que terminar con "estoy en el inicio", que es
  lo que rompió acá.

## GAP-1 · los segmentos y las tabs no exponen que están elegidos

`market_detail_range_1m_segment`, `orders_ticket_side_buy_segment`,
`settings_theme_dark_segment`, `settings_language_en_segment` y las tabs
`nav_*_tab` salen en web como `role="button"` sin `aria-checked` ni
`aria-selected`, aun estando elegidos. Los chips sí lo exponen
(`role="checkbox"` + `aria-checked`), así que la diferencia parece del widget,
no del contrato.

Mientras tanto, los escenarios que tocan un segmento afirman sobre su
consecuencia observable. Si el equipo agrega `Semantics(selected: ...)` (o
`toggled:`) a esos widgets, `IsSelected` empieza a funcionar para ellos sin
tocar los specs.

## Nota · el botón de cuenta demo solo rellena

`auth_login_demo_button` completa correo y contraseña; no envía el
formulario. Es razonable, pero conviene que esté escrito: la tarea
`IniciarSesion.conLaCuentaDemo()` toca el botón **y después** el submit.
