/**
 * Sondas de medición: semantics ON (8081) contra OFF (8082).
 *
 * No es una suite: cada spec mide un caso de RESULTADOS-SEMANTICS.md y deja
 * sus datos en `results/<modo>.jsonl`. Los dos proyectos usan exactamente la
 * misma configuración; solo cambia el build servido.
 *
 *   python3 scripts/serve_web.py 8081 packages/apps/mila_invest_app/build/web_sem_on
 *   python3 scripts/serve_web.py 8082 packages/apps/mila_invest_app/build/web_sem_off
 *
 * OFF lee las coordenadas que dejó ON: siempre se corre ON primero.
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './probes',
    outputDir: process.env.PROBE_OUT ?? './test-results',
    fullyParallel: false,
    workers: 1,
    retries: 0,
    timeout: 120_000,
    reporter: [['line'], ['json', { outputFile: process.env.PROBE_REPORT ?? 'results/pw-report.json' }]],
    use: {
        browserName: 'chromium',
        headless: true,
        deviceScaleFactor: 1,
        locale: 'es',
        trace: 'on',
    },
    projects: [
        { name: 'on', use: { baseURL: 'http://127.0.0.1:8081' } },
        { name: 'off', use: { baseURL: 'http://127.0.0.1:8082' } },
    ],
});
