#!/bin/bash
# Suite existente 5× contra ON (semantics activado). OFF no se prueba con
# Playwright: ese build es para pruebas manuales.
set -u
cd "$(dirname "$0")/../.."
mkdir -p semantics-probe/results/runs
suite() {
  local name=$1; shift
  echo "== $name $(date +%H:%M:%S)"
  BASE_URL=http://127.0.0.1:8081 PLAYWRIGHT_JSON_OUTPUT_NAME=semantics-probe/results/runs/$name.json npx playwright test "$@" \
    --repeat-each=5 --retries=0 --workers=1 --reporter=line,json --output=semantics-probe/results/runs/$name > semantics-probe/results/runs/$name.log 2>&1
  tail -6 semantics-probe/results/runs/$name.log
  node semantics-probe/scripts/prune-traces.mjs semantics-probe/results/runs/$name.json
}
suite suite-on \
  test/specs/acceso/iniciar-sesion.spec.ts test/specs/acceso/registrarse.spec.ts \
  test/specs/mercado/explorar-mercado.spec.ts test/specs/mercado/detalle-de-instrumento.spec.ts \
  test/specs/inversion/comprar-acciones.spec.ts test/specs/dinero/depositar.spec.ts \
  test/specs/seguimiento/inicio.spec.ts test/specs/seguimiento/actividad.spec.ts test/specs/seguimiento/portafolio.spec.ts
suite vender-on test/specs/inversion/vender-acciones.spec.ts
echo "== fin $(date +%H:%M:%S)"
