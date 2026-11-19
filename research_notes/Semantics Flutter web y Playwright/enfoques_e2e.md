# Enfoques de E2E para Flutter web con automatización de navegador (Playwright y afines), estado a noviembre de 2026

Notas de investigación hechas el 2026-11-19. Contexto de quien las pide: una suite Playwright + Serenity/JS ya existente contra una app Flutter web (CanvasKit, semántica forzada, ids vía `Semantics(identifier:)` que en el DOM salen como `flt-semantics-identifier`). Las fechas y versiones de Flutter se indican cuando la fuente las da.

Advertencia general: casi no hay material "canónico" (ni del equipo de Flutter ni del de Playwright) sobre cómo probar Flutter web desde Playwright. Lo más concreto y actual está en issues de flutter/flutter de 2025-2026 abiertos por gente que automatiza con Playwright o CDP, y en uno o dos proyectos comunitarios muy chicos.

## 1. Guías publicadas (2023-2026): cómo activan la semántica, cómo localizan elementos y qué helpers construyen

### Takeaway
El patrón dominante y convergente es: (a) activar la semántica desde la app con `SemanticsBinding.instance.ensureSemantics()`, o, si no se puede tocar la app, hacer clic por JS en `flt-semantics-placeholder` / `[aria-label="Enable accessibility"]`; (b) localizar por `Semantics(identifier:)` → `flt-semantics-identifier` (en Playwright, `testIdAttribute: 'flt-semantics-identifier'` + `getByTestId`), con `aria-label`/rol como alternativa; (c) un helper de "app lista" que espera el evento `flutter-first-frame` y el árbol `flt-semantics`, más un helper de escritura que enfoca, espera frames, escribe, verifica y reintenta. No encontré ninguna guía extensa de Playwright para Flutter web en Medium/dev.to de 2025-2026; lo más parecido son issues de GitHub y un kit comunitario.

### Cited Findings
**Activación de la semántica**
- La documentación oficial dice que en web la accesibilidad está apagada por defecto "for performance reasons"; el usuario la enciende pulsando un botón invisible con `aria-label="Enable accessibility"`, o el desarrollador la fuerza en código con `SemanticsBinding.instance.ensureSemantics()` dentro de `if (kIsWeb)` en `main()` — [docs.flutter.dev: Web accessibility](https://docs.flutter.dev/ui/accessibility/web-accessibility.md)
- La misma página tiene notas de versión de Flutter 3.50+ (preservación del foco DOM al cambiar roles, landmarks `role="region"` para rutas con nombre, `<input type="range" role="slider">` para Slider). Son cosas que cambian el DOM que ven los tests según la versión de Flutter — [docs.flutter.dev: Web accessibility](https://docs.flutter.dev/ui/accessibility/web-accessibility.md)
- Habr (abril de 2024, Leonid Netrebskii, con Selenium JS): dos opciones. Una es clic en el placeholder dentro del shadow root: `document.querySelector('flt-glass-pane').shadowRoot.querySelector('flt-semantics-placeholder').click()`. La otra es `ensureSemantics()` después de `runApp`. Localiza con XPath `//flt-semantics[contains(@aria-label, "...")]`. Dice que `identifier` (Flutter 3.19) "doesn't work for the Web" en ese momento. Hay que enfocar los inputs antes de escribir ("a click sometimes works"). Publicó un paquete npm `@rentready/flutter-selenium-bridge` (no verifiqué su estado en npm). El selector con shadow root es de la época en que existía `flt-glass-pane` con shadow DOM — [Habr 809137](https://habr.com/en/articles/809137)
- Equipos que usan Selenium/Playwright contra apps desplegadas activan la semántica con clic JS en `[aria-label="Enable accessibility"]` o `flt-semantics-placeholder`. Funciona en Chrome (cualquier SO) y en Safari de Mac, pero no en iOS Safari (Flutter issue #174016, agosto de 2025, cerrado por el bot por falta de repro y sin fix) — [flutter/flutter#174016](https://github.com/flutter/flutter/issues/174016)
- El placeholder está en -1px/-1px (fuera de pantalla), así que Maestro (y "probablemente" Appium) no lo pueden tocar. mdebbar (equipo de Flutter web) respondió en enero de 2026 que la solución es un query parameter que active la semántica, pero que eso "should be done in user code, not in Flutter code", o bien llamar a `ensureSemantics()`. El issue se cerró sin cambio en Flutter (2025-10 a 2026-02) — [flutter/flutter#177670](https://github.com/flutter/flutter/issues/177670)

**Localización**
- `SemanticsData.identifier` está pensado para herramientas de UI test basadas en accesibilidad. En web pone el atributo `flt-semantics-identifier` en el elemento DOM del nodo — [api.flutter.dev: SemanticsData.identifier](https://api.flutter.dev/flutter/semantics/SemanticsData/identifier.html)
- Bug histórico: `Semantics(identifier:)` alrededor de un `TextField` no generaba el atributo en web (reportado en 3.24.1, septiembre de 2024). Se arregló con el PR #170395, mergeado a master el 12 de junio de 2025. La página no dice en qué stable entró — [flutter/flutter#155323](https://github.com/flutter/flutter/issues/155323)
- `excludeSemantics: true` sobre un `TextFormField` rompe el `aria-label` del `<input>` y además impide escribir programáticamente con Playwright/Selenium/Cypress — [flutter/flutter#172206](https://github.com/flutter/flutter/issues/172206) (solo el resumen del buscador; no abrí el issue)
- Maestro recomienda `Semantics(identifier:)` (Flutter 3.19+) en vez de `Key`, porque las keys no llegan al puente de accesibilidad. En web exige `ensureSemantics()` — [Maestro docs: Flutter](https://docs.maestro.dev/get-started/supported-platform/flutter)

**Capas de helpers**
- `playwright-e2e-kit` (YuraBerez, MIT) agrega un entry point opt-in `playwright-e2e-kit/flutter`, con estas piezas:
  - `flutterReady(page)` espera el evento de ventana `flutter-first-frame`, con el listener instalado vía `addInitScript` antes de navegar "so a fast first frame isn't missed". Si la app no llamó a `ensureSemantics()`, activa el placeholder una vez y espera el árbol `flt-semantics`; si ya está activa, no hace nada.
  - `flutterConfig()` fija `testIdAttribute: 'flt-semantics-identifier'`.
  - Fuentes: [issue #2](https://github.com/YuraBerez/playwright-e2e-kit/issues/2) (abierto y cerrado el 10 de noviembre de 2026 vía PR #9)
- El mismo kit exporta `flutterConfig`, `flutterFixture`, `flutterReady`, `enableFlutterSemantics`, `installFlutterFirstFrameListener`, `FlutterScreen`, `scrollUntilVisible`, `flutterType` y `flutterErrorAllowList`. Tiene 0 estrellas, 0 forks y 19 commits, no está publicado en npm (se instala como dependencia git pinneada a un tag, p. ej. `#v0.3.0`) y es muy nuevo — [GitHub: playwright-e2e-kit](https://github.com/YuraBerez/playwright-e2e-kit)
- `flutterType(locator, text)` responde a que "Flutter drops a fill() made before it takes the field". El algoritmo es: enfocar, esperar dos animation frames, `fill`, confirmar el valor a través del nodo de semántica. El PR #33 le agrega un bucle de reintento (3 intentos por defecto) y acepta tanto el input como el nodo `Semantics(identifier:)` que lo envuelve — [issue #25](https://github.com/YuraBerez/playwright-e2e-kit/issues/25); [PR #33](https://github.com/YuraBerez/playwright-e2e-kit/pull/33) (resumen del buscador)
- En el PR de self-tests del kit se dice que el clic en el placeholder activa la semántica en Flutter 3.47.8. También se dice que axe apunta a los elementos por su `id` (`#flt-semantic-node-N`), así que las exclusiones de axe basadas en `flt-semantics-identifier` no matchean — [PR #13](https://github.com/YuraBerez/playwright-e2e-kit/pull/13) (resumen del buscador)
- DevAssure (blog de vendor, 2026, sin versión de Flutter) muestra en Playwright tres esperas: `page.waitForSelector('flt-glass-pane')`, `page.waitForFunction(() => Boolean(window.devTest))` para hooks de test expuestos desde Dart, y `waitForResponse` sobre la API. También propone hooks JS (`tapByKey`, `enterTextByKey`, `login`) detrás de `--dart-define=ENABLE_TEST_HOOKS` y de un chequeo de host. Usa el interop antiguo `dart:js` — [DevAssure: Flutter Web E2E When the DOM Is Canvas](https://www.devassure.io/blog/flutter-web-app-agent-testing/)

### Inferences
- Para esta suite (semántica forzada + ids), el setup "de consenso" ya está en su lugar. Lo que agregan las fuentes son tres patrones:
  - Un `appReady` basado en `flutter-first-frame` instalado con `addInitScript`, más la espera de al menos un `flt-semantics`.
  - Escritura con enfocar → esperar frames → escribir → verificar → reintentar.
  - Cuidado con cómo se hace el clic (ver la sección 4).
- El atributo `flt-semantics-identifier` como `testIdAttribute` es la convención que usan tanto el kit comunitario como Maestro y BrowserStack (por el resumen del repo de ejemplo). Parece la elección correcta; `getByRole` sirve como capa secundaria, pero el mapeo de roles cambia entre versiones de Flutter (3.50 agrega roles nuevos).

### Gaps
- No encontré guías en Medium/dev.to/blogs de empresa de 2025-2026 dedicadas específicamente a Playwright + Flutter web con código de helpers. El buscador no devolvió nada relevante en Medium.
- No pude abrir el repo de ejemplo `BrowserStackCE/selenium-flutter-web` (404 al hacer fetch). Lo que sé de él (que usa `ensureSemantics()` + `Semantics(identifier:)`) viene solo del resumen del buscador.
- No encontré charlas de Flutter Forward/FlutterCon/Fluttercon EU sobre este tema.
- No vi el contenido de `docs/flutter-web.md` del kit, donde estaría la lista de "role-mapping quirks".

## 2. Librerías y plugins: estado y madurez 2025-2026

### Takeaway
No existe un paquete npm consolidado tipo "playwright-flutter". Lo que hay del lado de Playwright son un kit comunitario de 0 estrellas (git, no npm) y `self_test` en pub.dev (adopción mínima). La alternativa madura que usa Playwright por debajo es Patrol 4.x, pero corre tests escritos en Dart dentro de la app (caja blanca) y no sirve para una suite TS/Serenity. Appium Flutter Driver / Integration Driver son solo nativos. integration_test en web sigue siendo `flutter drive` + chromedriver. Maestro dice soportar Flutter web, pero la parte web figura como beta.

### Cited Findings
- **Patrol (LeanCode)**:
  - Soporte web desde 4.0 (anunciado el 8 de diciembre de 2025). Reemplaza el runner nativo por Playwright: `flutter run -d web-server` sirve la app, Patrol lee el puerto y lo usa como `baseURL`, Dart y JS se comunican por `js_interop`, y se ejecuta con `patrol test --device chrome` o `npx playwright test`. Expone `$.platform.web` (resize, historial, portapapeles, cookies, uploads/downloads).
  - Limitación: no hay develop mode en web.
  - El post critica a integration_test en web por "complicated ChromeDriver setup", por no dar exit codes correctos y por encerrar el código en `widgetTester`.
  - Fuente: [LeanCode: Patrol Web](https://leancode.co/blog/patrol-web-support)
- Changelog de Patrol:
  - 4.0.0 introdujo los flags `--web-*` (timeouts, retries, workers, sharding, video, headless, locale, viewport…).
  - 4.7.0 agregó multi-tab; 4.8.0 sumó opciones de Playwright (slow-mo, trace, storage state, etc.).
  - 4.11.0 (hace unos 16 días) corrigió que el runner web ignoraba sus esperas de inicialización de 60/120/300 s y se quedaba con el default de 30 s de Playwright.
  - Fuente: [pub.dev: patrol changelog](https://pub.dev/packages/patrol/changelog)
- La documentación web de Patrol solo menciona Chromium. Hay un PR abierto para elegir Firefox/WebKit con `--web-browser` — [Patrol docs: web](https://patrol.leancode.co/documentation/web); [PR #3306](https://github.com/leancodepl/patrol/pull/3306) (sin confirmar si se mergeó)
- Antecedente: en septiembre de 2023, bartekpacia (miembro de Flutter y autor de Patrol) dijo que "integration_test can't be considered production ready" y que web estaba "on our radar, but it won't happen anytime soon" — [flutter/flutter#133451](https://github.com/flutter/flutter/issues/133451)
- **integration_test en web**: la documentación oficial actual indica instalar chromedriver (`npx @puppeteer/browsers install chromedriver@stable`), levantarlo con `--port=4444`, y correr `flutter drive --driver=test_driver/integration_test.dart --target=integration_test/app_test.dart -d chrome`, o `-d web-server` para headless. Los tests usan `find.byKey` y `WidgetTester` (caja blanca) — [docs.flutter.dev: integration tests](https://docs.flutter.dev/testing/integration-tests.md)
- **Appium Flutter Driver / Flutter Integration Driver**: el listado de drivers de Appium 3 los describe solo para apps iOS/Android en modo nativo, con mantenimiento comunitario (`@AppiumTestDistribution` en el caso del integration driver). No encontré soporte para Flutter web — [appium.io: drivers 3.0](https://appium.io/docs/en/3.0/ecosystem/drivers)
- En 2023 los mantenedores de Selenium sugirieron appium-flutter-driver. titusfortner aclaró que Selenium solo trabaja sobre el HTML/DOM y que el driver de Appium apunta a apps nativas. El issue se cerró como "not planned" — [SeleniumHQ/selenium#12288](https://github.com/SeleniumHQ/selenium/issues/12288)
- **Maestro**: su página de Flutter dice que Flutter Web está "fully supported", pero la página general de navegadores web dice que el soporte web está en beta (contradicción entre sus propias páginas). Para web exige `ensureSemantics()` y recomienda `Semantics(identifier:)` (Flutter 3.19+) — [Maestro docs: Flutter](https://docs.maestro.dev/get-started/supported-platform/flutter); [Maestro docs: Web Browsers](https://docs.maestro.dev/get-started/supported-platform/web-browser)
- **self_test (pub.dev)**: "Bridgeless Web Testing - Test any Flutter web app via Playwright + semantics tree" (modo `BRIDGE_MODE=web-external`), con un MCP server para agentes de IA. Versión 2.3.3 (hace unos 6 días), 0 likes, 150 pub points, 580 descargas, uploader no verificado y contradicción en la licencia (MIT en metadatos frente a una restricción en el README) — [pub.dev: self_test](https://pub.dev/packages/self_test)
- **playwright-e2e-kit**: ver la sección 1. Tiene 0 estrellas, no está en npm y sus issues de Flutter son de noviembre de 2026 — [GitHub](https://github.com/YuraBerez/playwright-e2e-kit)
- **@rentready/flutter-selenium-bridge**: lo menciona el artículo de Habr de 2024 como ayuda de inicio rápido para Selenium — [Habr 809137](https://habr.com/en/articles/809137) (no verifiqué versión ni mantenimiento en npm)

### Inferences
- Para una suite TS + Serenity/JS que quiere seguir siendo caja negra, ninguna librería justifica adoptarse como dependencia. Lo razonable es tomar los patrones del kit comunitario (first-frame + addInitScript, flutterType con verificación y reintento, scrollUntilVisible) e implementarlos como Interactions/Questions propias de Serenity/JS.
- Patrol web es la opción madura "con Playwright adentro", pero implica escribir tests en Dart con acceso al árbol de widgets. Sirve como contraste o complemento (por ejemplo, para flujos difíciles de estabilizar desde fuera), no como reemplazo directo.

### Gaps
- No encontré los paquetes "flutter-playwright" ni "playwright-flutter" en npm. El buscador no devolvió nada con esos nombres, así que no puedo afirmar que existan.
- No obtuve estrellas ni fecha exacta de la última release de Patrol (solo "4.11.0, hace unos 16 días").
- No verifiqué el estado actual de `flutter_driver` en web más allá de la wiki "Running Flutter Driver tests with Web", que no abrí.

## 3. Recomendaciones del equipo de Flutter sobre automatizar Flutter web desde fuera

### Takeaway
No hay una guía oficial para Selenium/Playwright. Lo que dicen los mantenedores en los issues se resume en dos cosas: activen la semántica desde su propio código (`ensureSemantics()` o un query parameter propio) y usen `integration_test` para caja blanca. Las preguntas generales ("¿cómo pruebo Flutter web con Selenium?") se cierran como no accionables. Los bugs concretos de semántica que aparecen al automatizar sí se triagean y a veces se arreglan rápido (P1 en octubre de 2026).

### Cited Findings
- En agosto de 2023 (Flutter 3.10.6), un tester pidió una forma de probar Flutter web con Selenium. huycozy (Flutter) lo cerró como "too general to be actionable" y "not planned", con la etiqueta "r: invalid" — [flutter/flutter#133451](https://github.com/flutter/flutter/issues/133451)
- mdebbar (Flutter web), en enero de 2026, ante el pedido de mover el placeholder para que lo toquen las herramientas: la solución con query parameter "should be done in user code, not in Flutter code". También preguntó si un usuario normal puede activar el placeholder: si sí, es una limitación de Maestro/Appium; si no, es un bug de Flutter — [flutter/flutter#177670](https://github.com/flutter/flutter/issues/177670)
- La documentación oficial solo ofrece dos vías para activar la semántica (botón invisible o `ensureSemantics()` en código) y no menciona herramientas de automatización externas — [docs.flutter.dev: Web accessibility](https://docs.flutter.dev/ui/accessibility/web-accessibility.md)
- Para web, la documentación oficial de testing sigue proponiendo `flutter drive` + chromedriver con `integration_test` — [docs.flutter.dev: integration tests](https://docs.flutter.dev/testing/integration-tests.md)
- El blog de Flutter dijo que el equipo quisiera "eventually turn the semantics on by default" en web. La fuente es antigua y la documentación actual sigue diciendo que está apagada por defecto — [flutter.dev blog: Accessibility in Flutter on the Web](https://flutter.dev/blog/accessibility-in-flutter-on-the-web) (resumen del buscador; post anterior a 2023)
- Ante bugs reproducidos por automatización, la reacción es mixta:
  - #194636 (texto borrado al reciclar el nodo) se marcó P1 y se arregló en 13 días.
  - #195812 (clic programático en un input) recibió de mdebbar la observación de que los clics programáticos "may not trigger the full pointer-event logic". Igual se triageó como P2.
  - Fuentes: [#194636](https://github.com/flutter/flutter/issues/194636); [#195812](https://github.com/flutter/flutter/issues/195812)

### Inferences
- El equipo de Flutter trata el DOM de semántica como superficie de accesibilidad, no como API de testing estable. Los cambios de rol/DOM entre versiones (por ejemplo, las novedades de 3.50) pueden romper selectores basados en rol. Los `flt-semantics-identifier` son lo más estable porque los controla la app.
- Conviene que los clics de la suite se parezcan a la entrada de un usuario real (eventos de puntero confiables) y no a `element.click()` por JS: los mantenedores consideran "edge case" lo que no reproduce un usuario real.

### Gaps
- No encontré ninguna discusión en microsoft/playwright con respuesta de mantenedores sobre Flutter web. El buscador no devolvió issues relevantes y no pude listar los issues del repo.
- No encontré documentación oficial que nombre un query parameter estándar para activar la semántica. Según mdebbar, cada app lo implementa en su propio código.

## 4. Fuentes de inestabilidad reportadas y mitigaciones (incluida la configuración de Playwright)

### Takeaway
Las fuentes de flakiness documentadas en 2025-2026 se concentran en la capa de semántica web: arranque/primer frame, escritura perdida si se escribe antes de que Flutter tome el foco, foco que se va a `<body>` o `flutter-view` cuando el árbol se reordena, clics programáticos que se enrutan a un ancestro, y nodos de semántica que se reciclan al hacer scroll (con borrado de texto, ya arreglado en master a fines de octubre de 2026). Las mitigaciones son esperar `flutter-first-frame`, enfocar-esperar-escribir-verificar-reintentar, usar clics de mouse reales (`page.mouse.click` en el centro), y listeners de foco como parche. No encontré reportes específicos de configuración de Playwright (actionTimeout, toPass, slowMo) para Flutter web.

### Cited Findings
**Arranque**
- Esperar `flutter-first-frame` con un listener instalado vía `addInitScript` antes de navegar evita perder un primer frame rápido. Después, esperar el árbol `flt-semantics` — [playwright-e2e-kit#2](https://github.com/YuraBerez/playwright-e2e-kit/issues/2)
- Patrol tuvo que arreglar en 4.11.0 que sus esperas de inicialización de la app (60/120/300 s) quedaban en el default de 30 s de Playwright. Es una señal de que el arranque de Flutter web puede superar los 30 s en CI — [pub.dev: patrol changelog](https://pub.dev/packages/patrol/changelog)

**Escritura y teclas perdidas**
- "Flutter drops a fill() made before it takes the field". La mitigación es enfocar, esperar 2 rAF, `fill`, verificar el valor vía el nodo de semántica, y reintentar hasta 3 veces — [playwright-e2e-kit#25](https://github.com/YuraBerez/playwright-e2e-kit/issues/25); [PR #33](https://github.com/YuraBerez/playwright-e2e-kit/pull/33)
- Un campo puede quedar con foco visual y caret pero sin aceptar entrada, porque las teclas caen en `flutter-view` cuando no hay elemento editable. Reportado tras `TextInput.updateConfig` — [flutter/flutter#192544](https://github.com/flutter/flutter/issues/192544) (resumen del buscador)
- Teclas perdidas mientras está en vuelo una petición de foco (en Flet, sobre Flutter web, automatizado con Playwright/Chromium) — [flet-dev/flet#7059](https://github.com/flet-dev/flet/issues/7059) (resumen del buscador)
- Playwright recomienda `locator.pressSequentially()` (con `delay` opcional) cuando la página tiene manejo especial de teclado, y aclara que `keyboard.type()` escribe en el elemento que tenga el foco — [Playwright: Locator](https://playwright.dev/docs/api/class-locator); [Playwright: Keyboard](https://playwright.dev/docs/api/class-keyboard). No hay evidencia publicada de que esto sea más confiable que `fill` en Flutter web.

**Clics y foco**
- #195812 (abierto, P2, Flutter 3.47.5 / 3.50 pre):
  - Problema: con la semántica activa, `input.click()` sobre el `<input>` de semántica, sin eventos de puntero previos, burbujea a un `flt-tappable` ancestro, que dispara `SemanticsAction.tap`. Si ese ancestro desenfoca, se pierde el texto. Se reprodujo con Playwright en Chromium, Chrome, Edge, WebKit y Firefox.
  - Mitigación para tests: usar `page.mouse.click()` en el centro del campo, o despachar `pointerdown`/`pointerup` antes del clic.
  - Mitigación en la app: `excludeFromSemantics: true` en el `GestureDetector`, o `onTapOutside`.
  - Fuente: [flutter/flutter#195812](https://github.com/flutter/flutter/issues/195812)
- #195291 (abierto, P2, Flutter 3.47.7):
  - Problema: con `ensureSemantics()`, un clic dentro de un `TextFieldTapRegion` mueve el foco del navegador a `flutter-view` y el `TextField` deja de recibir teclas, aunque `FocusNode.hasFocus` siga en true.
  - Workaround del reporter: un listener `mousedown` en fase de captura con `preventDefault()`.
  - Fuente: [flutter/flutter#195291](https://github.com/flutter/flutter/issues/195291)
- #194550 (Flutter 3.47.4; cerrado por el bot el 9 de noviembre de 2026 sin fix):
  - Problema: tras un clic DOM (con Playwright) en un `flt-semantics`, cuando `updateChildren` mueve el subárbol (por ejemplo, al aparecer un Tooltip unos 310 ms después), el foco cae a `<body>` y Escape deja de funcionar.
  - Workaround: un listener `focusout` en captura que re-enfoca el target si `relatedTarget` es null.
  - Fuente: [flutter/flutter#194550](https://github.com/flutter/flutter/issues/194550)

**Listas perezosas y nodos que se desprenden**
- #194636 (Flutter 3.47.7; P1; cerrado por el PR #195141 el 30 de octubre de 2026):
  - Problema: un `TextField` enfocado pierde su texto (y `controller.text` queda vacío) cuando su nodo de semántica sale del árbol y vuelve, por ejemplo al hacer scroll en un `ListView` o al cambiar el ancho del viewport. El host `flt-semantics` del campo se elimina del DOM y se crea un `<input>` nuevo.
  - El reporter lo encontró con entrada de confianza vía CDP y con eventos wheel sobre `flt-glass-pane`. Con la semántica apagada no ocurre.
  - Fuente: [flutter/flutter#194636](https://github.com/flutter/flutter/issues/194636)
- El kit comunitario incluye un helper `scrollUntilVisible`, lo que confirma la necesidad de desplazarse para materializar nodos de listas perezosas antes de localizarlos — [GitHub: playwright-e2e-kit](https://github.com/YuraBerez/playwright-e2e-kit) (solo se ve el nombre del export)

**Accesibilidad/axe**
- axe usa `#flt-semantic-node-N` como target, así que las exclusiones por `flt-semantics-identifier` no funcionan — [playwright-e2e-kit PR #13](https://github.com/YuraBerez/playwright-e2e-kit/pull/13) (resumen del buscador)

**Configuración de Playwright**
- Patrol 4.8 expone `slow-mo`, `trace` y `storage state` como flags del runner web, y 4.0 expone retries, timeouts y workers. Es decir, el runner de referencia "Flutter + Playwright" considera útiles esas palancas, aunque no publica qué valores usa — [pub.dev: patrol changelog](https://pub.dev/packages/patrol/changelog)

### Inferences
- Hay una lista concreta de chequeos para la suite actual:
  - **Clics:** clics de mouse reales sobre el centro del bounding box. El `locator.click()` de Playwright ya genera eventos de puntero reales, a diferencia de `element.click()` por JS o de `dispatchEvent('click')`; hay que evitar estos dos últimos en inputs.
  - **Escritura:** después del clic, esperar a que `document.activeElement` sea el `<input>`/`<textarea>` de semántica del campo antes de escribir. Verificar el valor con una Question (por ejemplo, `toHaveValue` o el `aria-label`/`value` del nodo) y reintentar con `toPass`.
  - **Listas:** no hacer scroll con un campo enfocado y con texto sin confirmar si la versión de Flutter de la app es anterior al fix de #194636. Hay que confirmar en qué stable entró el PR #195141.
  - **Esperas:** subir el timeout de arranque por encima de 30 s en CI y esperar `flutter-first-frame` y luego un `flt-semantics`.
- Que los bugs de foco (#195291, #194550) sigan abiertos o cerrados sin fix implica que algunos flujos (menús con tooltip, tap regions) pueden necesitar workarounds en la suite: re-clic y verificación, o pulsar Escape tras re-enfocar.

### Gaps
- No encontré reportes de equipos con valores concretos de `actionTimeout`, `expect.poll`/`toPass`, `slowMo` o `keyboard.type({delay})` para Flutter web, ni comparaciones entre `fill` y `pressSequentially` en Flutter. Es una inferencia, no un dato.
- No encontré en qué versión stable de Flutter entraron los fixes de #155323 (PR #170395) y #194636 (PR #195141).
- No encontré material sobre la latencia de tap (debounce de clics en semántica) más allá de la mención de `ClickDebouncer` y la ventana de unos 50 ms entre `pointerup` y `click` en #195812.

## 5. Probar con la semántica apagada (coordenadas, visual, imagen)

### Takeaway
El único material encontrado sobre probar Flutter web sin semántica (por coordenadas o por imagen) viene de un vendor (DevAssure) que lo presenta como frágil para vender su propia herramienta de IA. No encontré reportes independientes de equipos que lo hayan mantenido a largo plazo. Todas las fuentes no comerciales convergen en activar la semántica.

### Cited Findings
- DevAssure (vendor, 2026) muestra el fallback por coordenadas en Playwright: `setViewportSize(1440, 900)` + `page.mouse.click(x, y)` + `page.keyboard.type(...)`, con validación por URL, red o screenshots. Lo considera frágil frente a cambios de layout, resolución, zoom y responsive, y recomienda keys, hooks de test o su agente. Sus métricas comparativas no tienen fuente — [DevAssure blog](https://www.devassure.io/blog/flutter-web-app-agent-testing/)
- DevAssure en dev.to (29 de julio de 2025, marketing): las herramientas basadas en imagen son "a quick fix" que se rompe con cambios de resolución y de navegador, es lento y difícil de depurar, y "not built to scale". Termina en un CTA de demo y no habla de la semántica — [dev.to: DevAssure](https://dev.to/devassure/reliable-flutter-web-automation-without-fragile-image-based-workarounds-1h7b)
- En el issue de Selenium de 2023, el autor menciona las herramientas basadas en imagen como fallback, junto a integration_test — [SeleniumHQ/selenium#12288](https://github.com/SeleniumHQ/selenium/issues/12288)
- En #177670, el reporter explica por qué su equipo de QA no quería modificar la app para forzar la semántica: rendimiento, bugs de overlays/dropdowns y bugs reportados por QA con la semántica activa. Es el argumento más concreto que encontré a favor de probar "como la app real en producción" (sin semántica forzada) — [flutter/flutter#177670](https://github.com/flutter/flutter/issues/177670)
- Varios bugs solo aparecen con la semántica activa (#195291, #194636), lo que sostiene la preocupación de que forzarla cambia el comportamiento frente al usuario típico — [#195291](https://github.com/flutter/flutter/issues/195291); [#194636](https://github.com/flutter/flutter/issues/194636)
- Desde Flutter 3.35 el renderer HTML ya no existe; solo quedan CanvasKit/Skwasm, así que no hay DOM "normal" al que recurrir sin semántica — [claudeissues.com #48124](https://claudeissues.com/issue/48124-flutter-web-apps-dont-render-in-claude-preview-canvaskit-requires-webgl) (fuente secundaria, a verificar en el changelog de Flutter)

### Inferences
- Probar con la semántica apagada no es una práctica que la comunidad documente como sostenible para E2E funcional. El costo de mantener coordenadas o imágenes con CanvasKit es alto y no hay herramientas maduras no comerciales.
- El riesgo real de la estrategia actual (semántica forzada) es el inverso: los tests ejercitan un modo que la mayoría de los usuarios no usa, y hay bugs exclusivos de ese modo. Una mitigación posible, que no está documentada como práctica en las fuentes, es activar la semántica solo en entornos de test, con un query parameter o un `--dart-define` como sugiere mdebbar, en vez de forzarla en producción. Además se pueden complementar con unos pocos smoke tests visuales o de screenshot sin semántica.

### Gaps
- No encontré informes de equipos (blogs de ingeniería, charlas) que hayan probado con la semántica apagada y documenten por qué lo dejaron o lo mantuvieron. Solo hay material de vendor y menciones de pasada.
- No encontré datos cuantitativos sobre el costo de rendimiento de forzar la semántica en web. La documentación solo dice "for performance reasons".
