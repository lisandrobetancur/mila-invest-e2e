# Sondas de semantics (ON contra OFF)

Mediciones de `RESULTADOS-SEMANTICS.md`. No es una suite: cada spec mide un
caso y deja sus datos en `results/<modo>.jsonl`.

## Correr

Desde `mila-invest-app/packages/apps/mila_invest_app`:

```bash
flutter build web --dart-define=ENABLE_SEMANTICS=true --dart-define=FAST_ANIMATIONS=true --dart-define=PRICE_REFRESH_SECONDS=0 -o "$PWD/build/web_sem_on"
```

```bash
flutter build web --dart-define=FAST_ANIMATIONS=true --dart-define=PRICE_REFRESH_SECONDS=0 -o "$PWD/build/web_sem_off"
```

Desde la raíz de `mila-invest-app`, cada uno en su terminal:

```bash
python3 scripts/serve_web.py 8081 packages/apps/mila_invest_app/build/web_sem_on
```

```bash
python3 scripts/serve_web.py 8082 packages/apps/mila_invest_app/build/web_sem_off
```

Desde esta carpeta (usa el `node_modules` de la raíz del repo):

```bash
./scripts/run-all.sh
```

```bash
node scripts/aggregate.mjs
```

`run-all.sh` corre todo 5 veces en ON y después en OFF (OFF necesita las
coordenadas y capturas que deja ON en `results/coords/`), y la suite
existente 5 veces contra ON. Tarda unas tres horas.

## Cómo opera cada modo

- **ON**: localiza por `[flt-semantics-identifier]`, guarda el bounding box
  de cada objetivo y una captura de la pantalla en ese momento.
- **OFF**: usa ese bounding box. Antes compara su captura con la de ON; si
  la franja alrededor del objetivo se desplazó, aborta con `LAYOUT:` y no
  usa las coordenadas. Acciona con `page.mouse`/`page.keyboard`, lee la URL,
  las capturas y `document.activeElement`, y al final de cada test verifica
  que `flt-semantics` siga sin existir.
- Lo que en OFF necesita el árbol se lee **post-mortem**: último paso del
  test, activando `flt-semantics-placeholder`.
- En los dos modos el click es `page.mouse.click` en el centro del objetivo,
  para que la única diferencia sea el árbol.
