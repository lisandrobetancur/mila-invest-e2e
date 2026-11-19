/**
 * Playwright Test + Serenity/JS.
 *
 * Dos proyectos, uno por breakpoint de la app (teléfono < 768 px y pantalla
 * ancha). Los mismos specs corren en los dos: los identificadores semánticos
 * no cambian con el layout.
 *
 * Los proyectos se llaman `web-movil` y `web-escritorio` —y no
 * `mobile-chromium`— para que en el reporte no se confundan con la suite
 * mobile de verdad, que corre sobre Android con Appium y vive en `mobile/`.
 */
import { defineConfig, devices } from '@playwright/test';
import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';

import { env } from './src/config/env';

export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
    testDir: './test/specs',
    outputDir: './test-results',
    fullyParallel: true,
    forbidOnly: env.isCI,
    // Los escenarios `@fallo-demo` fallan a propósito: sirven para mostrar
    // cómo se ve un fallo en el reporte, no para romper el CI.
    grepInvert: env.isCI ? /@fallo-demo/ : undefined,
    retries: env.isCI ? 1 : 0,
    workers: env.isCI ? 2 : undefined,
    timeout: 90_000,
    expect: { timeout: env.timeouts.element },

    reporter: [
        ['line'],
        ['html', { open: 'never' }],
        [
            '@serenity-js/playwright-test',
            {
                crew: [
                    '@serenity-js/console-reporter',
                    // El reporte HTML de Serenity/JS: un `index.html` autocontenido,
                    // con el árbol de actividades de cada escenario, las capturas y
                    // el historial entre corridas. No necesita Java ni el CLI de
                    // Serenity BDD: lo genera la propia corrida.
                    [
                        '@serenity-js/html-reporter',
                        {
                            outputDirectory: './reports/serenity-js',
                            specDirectory: './test/specs',
                            title: 'MILA Invest · Web',
                            projectName: 'mila-invest-ui-e2e · web',
                        },
                    ],
                ],
            },
        ],
    ],

    use: {
        baseURL: env.baseUrl,
        defaultActorName: 'Licho',
        // Por defecto, fotos solo de los fallos: una por interacción cuesta
        // tiempo. `MILA_PHOTOS=all` las saca todas y deja el reporte con el
        // paso a paso completo de cada escenario.
        crew: [
            [
                '@serenity-js/web:Photographer',
                {
                    strategy:
                        env.photos === 'all'
                            ? 'TakePhotosOfInteractions'
                            : 'TakePhotosOfFailures',
                },
            ],
        ],
        trace: 'retain-on-failure',
        // Flutter web dibuja en canvas: las esperas son por condición, pero
        // la navegación inicial necesita su propio techo.
        navigationTimeout: env.timeouts.navigation,
        actionTimeout: env.timeouts.interaction,
    },

    projects: [
        {
            name: 'web-movil',
            use: {
                browserName: 'chromium',
                viewport: { width: 390, height: 844 },
                deviceScaleFactor: 3,
                isMobile: true,
                hasTouch: true,
            },
        },
        {
            name: 'web-escritorio',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1440, height: 900 },
            },
        },
    ],

    // Si nadie dijo dónde está la app, la servimos desde el repo de la app.
    // El build de Flutter no se hace acá: lo hace CI o la persona, antes.
    webServer: process.env.BASE_URL
        ? undefined
        : {
              command: `python3 ${env.milaAppPath}/scripts/serve_web.py 8080`,
              url: 'http://localhost:8080/',
              reuseExistingServer: true,
              timeout: 60_000,
          },
});
