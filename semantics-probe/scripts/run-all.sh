#!/bin/bash
# Corre todas las sondas 5 veces en ON y después en OFF (OFF usa las
# coordenadas y capturas de ON), y la suite existente 5 veces contra ON.
set -u
cd "$(dirname "$0")/.."
mkdir -p results/runs
run() {
  local name=$1; shift
  echo "== $name $(date +%H:%M:%S)"
  PROBE_OUT=results/runs/$name PROBE_REPORT=results/runs/$name.json npx playwright test "$@" --repeat-each=5 > results/runs/$name.log 2>&1
  tail -4 results/runs/$name.log
  node scripts/prune-traces.mjs results/runs/$name.json
}
run a-on probes/a-campos.spec.ts --project=on
run b-on probes/b-scroll.spec.ts --project=on
run c-on probes/c-inalcanzable.spec.ts --project=on
run d-on probes/d-inertes.spec.ts --project=on
run a-off probes/a-campos.spec.ts --project=off
run b-off probes/b-scroll.spec.ts --project=off
run c-off probes/c-inalcanzable.spec.ts --project=off
echo "== suite existente $(date +%H:%M:%S)"
cd ..
BASE_URL=http://127.0.0.1:8081 PLAYWRIGHT_JSON_OUTPUT_NAME=semantics-probe/results/runs/suite-on.json npx playwright test \
  test/specs/acceso/iniciar-sesion.spec.ts test/specs/acceso/registrarse.spec.ts \
  test/specs/mercado/explorar-mercado.spec.ts test/specs/mercado/detalle-de-instrumento.spec.ts \
  test/specs/inversion/comprar-acciones.spec.ts test/specs/dinero/depositar.spec.ts \
  test/specs/seguimiento/inicio.spec.ts test/specs/seguimiento/actividad.spec.ts test/specs/seguimiento/portafolio.spec.ts \
  --repeat-each=5 --retries=0 --workers=1 --reporter=line,json --output=semantics-probe/results/runs/suite-on > semantics-probe/results/runs/suite-on.log 2>&1
tail -6 semantics-probe/results/runs/suite-on.log
node semantics-probe/scripts/prune-traces.mjs semantics-probe/results/runs/suite-on.json
echo "== fin $(date +%H:%M:%S)"
