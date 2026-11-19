/**
 * Configuración de la suite mobile. **Único lugar que lee `process.env`.**
 *
 * | Variable | Default | Para qué |
 * |---|---|---|
 * | `MILA_APP_PATH` | `../mila-invest-app` | repo de la app (para encontrar el APK) |
 * | `MILA_APK` | el APK de debug del repo de la app | APK bajo prueba |
 * | `MILA_DEVICE` | `emulator-5554` | `adb` device bajo prueba |
 * | `MILA_PLATFORM_VERSION` | sin fijar | versión de Android, si hay varias |
 * | `APPIUM_HOST` / `APPIUM_PORT` | `127.0.0.1` / `4723` | servidor de Appium |
 * | `CI` | ausente | activa reintentos |
 */
import { resolve } from 'node:path';

const milaAppPath = process.env.MILA_APP_PATH ?? '../mila-invest-app';

/** Ruta al APK de debug que compila el repo de la app. */
const apkPorDefecto = resolve(
    process.cwd(),
    milaAppPath,
    'packages/apps/mila_invest_app/build/app/outputs/flutter-apk/app-debug.apk',
);

export const env = {
    /** Raíz del repo `mila-invest-app`. */
    milaAppPath,

    /** APK bajo prueba. */
    apk: process.env.MILA_APK ?? apkPorDefecto,

    /** Paquete y actividad de la app. */
    appPackage: 'com.milainvest.app',
    appActivity: '.MainActivity',

    /** Dispositivo o emulador. */
    device: process.env.MILA_DEVICE ?? 'emulator-5554',

    /** Versión de Android, si hace falta desambiguar. */
    platformVersion: process.env.MILA_PLATFORM_VERSION,

    /** Servidor de Appium. */
    appium: {
        host: process.env.APPIUM_HOST ?? '127.0.0.1',
        port: Number(process.env.APPIUM_PORT ?? 4723),
    },

    /** `true` dentro de CI. */
    isCI: Boolean(process.env.CI),

    /**
     * Timeouts, en milisegundos. Más holgados que en web: arrancar la app en
     * un emulador no se parece a recargar una página.
     */
    timeouts: {
        /** Espera por un elemento dentro de una vista ya cargada. */
        element: 20_000,
        /** Espera por un cambio de pantalla o el arranque de la app. */
        navigation: 60_000,
        /** Techo de cada interacción. */
        interaction: 20_000,
    },
} as const;
