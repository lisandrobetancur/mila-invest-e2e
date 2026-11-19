/**
 * WebdriverIO + Appium + Serenity/JS para la app Android.
 *
 * La app es la misma que prueba la suite web, y el contrato de
 * identificadores también: `Semantics(identifier:)` de Flutter sale en
 * Android como el `resource-id` de cada nodo, con el mismo string que en web
 * expone `flt-semantics-identifier`. Por eso las dos suites comparten
 * `src/screenplay/ids/ids.generated.ts`.
 *
 * El reporte es el mismo de Serenity/JS, pero **independiente**: esta suite
 * escribe en `reports/serenity-js-mobile` y la web en `reports/serenity-js`.
 */
import { Cast, TakeNotes } from '@serenity-js/core';
import type { WebdriverIOConfig } from '@serenity-js/webdriverio';

import { env } from './src/config/env';
import { Camarografo } from './src/reporte/Camarografo';
import { restartApp } from './src/screenplay/interactions/native';

export const config: WebdriverIOConfig = {
    runner: 'local',

    tsConfigPath: './mobile/tsconfig.json',

    specs: ['./spec/**/*.spec.ts'],

    maxInstances: 1,

    capabilities: [
        {
            platformName: 'Android',
            'appium:automationName': 'UiAutomator2',
            'appium:udid': env.device,
            'appium:app': env.apk,
            'appium:appPackage': env.appPackage,
            'appium:appActivity': env.appActivity,
            'appium:autoGrantPermissions': true,
            // Teclado invisible de Appium durante toda la sesión. Sin esto,
            // `performEditorAction` cambia de teclado en cada campo y espera
            // 500 ms; en un Samsung el cambio a veces tarda más, el teclado
            // del teléfono recibe el texto `/done/` (el campo queda `zzz/done`)
            // y no se baja, tapando los controles de abajo. Medido en un
            // SM-A315G: 3 de 8 sin esto, 0 de 8 con esto.
            'appium:hideKeyboard': true,
            'appium:newCommandTimeout': 300,
            // Cada escenario arranca la app de cero: el backend falso vive en
            // memoria, así que reinstalar no hace falta pero reiniciar sí.
            'appium:noReset': false,
            'appium:fullReset': false,
            ...(env.platformVersion ? { 'appium:platformVersion': env.platformVersion } : {}),
        },
    ],

    logLevel: 'error',
    bail: 0,
    waitforTimeout: env.timeouts.element,
    connectionRetryTimeout: 120_000,
    connectionRetryCount: 2,

    hostname: env.appium.host,
    port: env.appium.port,
    path: '/',

    // Levanta Appium con la suite; si ya hay uno escuchando, lo reusa.
    services: [
        [
            'appium',
            {
                args: { address: env.appium.host, port: env.appium.port },
                logPath: './reports',
            },
        ],
    ],

    framework: '@serenity-js/webdriverio',

    serenity: {
        runner: 'mocha',

        // Un elenco sin `BrowseTheWebWithWebdriverIO`: esa habilidad cierra la
        // sesión preguntando por `window/handles`, que en una sesión nativa de
        // Appium no existe. Acá los actores solo necesitan tomar notas; hablar
        // con el dispositivo es trabajo de las interacciones.
        actors: Cast.where((actor) => actor.whoCan(TakeNotes.usingAnEmptyNotepad())),

        crew: [
            '@serenity-js/console-reporter',
            [
                '@serenity-js/html-reporter',
                {
                    outputDirectory: './reports/serenity-js-mobile',
                    specDirectory: './mobile/spec',
                    title: 'MILA Invest · Mobile (Android)',
                    projectName: 'mila-invest-ui-e2e · android',
                },
            ],
            // Nada de `@serenity-js/web:Photographer`: para sacar la foto
            // pregunta por la ventana del navegador (`GET /window`), un
            // comando que una sesión nativa de Appium no implementa.
            // `MILA_PHOTOS=all` fotografía cada interacción.
            new Camarografo(env.photos === 'all' ? 'todas' : 'fallos'),
        ],
    },

    /**
     * Cada escenario arranca con la app recién abierta: el backend falso vive
     * en memoria dentro de la app, así que reiniciarla es el equivalente
     * mobile del contexto nuevo que la suite web tiene por test.
     */
    beforeTest: async (): Promise<void> => {
        await restartApp(env.appPackage);
    },

    mochaOpts: {
        ui: 'bdd',
        timeout: 180_000,
        retries: env.isCI ? 1 : 0,
    },
};
