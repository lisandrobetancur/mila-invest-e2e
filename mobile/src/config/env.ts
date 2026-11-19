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
 * | `MILA_PHOTOS` | `failures` | `all` saca una captura por interacción |
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

/** Cuándo saca capturas el `Camarografo`. */
export type Photos = 'failures' | 'all';

const asPhotos = (value: string | undefined): Photos => (value === 'all' ? 'all' : 'failures');

/** Sacar una captura por interacción cuesta tiempo: los techos se agrandan. */
const conFotos = asPhotos(process.env.MILA_PHOTOS) === 'all';

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
     * Capturas del reporte: `failures` (default) o `all`.
     *
     * Con `all` se fotografía cada interacción y el reporte queda con el paso
     * a paso completo de cada escenario; cuesta tiempo y espacio, así que en
     * CI y en el día a día conviene `failures`.
     */
    photos: asPhotos(process.env.MILA_PHOTOS),

    /**
     * Timeouts, en milisegundos. Más holgados que en web: arrancar la app en
     * un emulador no se parece a recargar una página.
     */
    timeouts: {
        /** Espera por un elemento dentro de una vista ya cargada. */
        element: conFotos ? 40_000 : 20_000,
        /** Espera por un cambio de pantalla o el arranque de la app. */
        navigation: conFotos ? 90_000 : 60_000,
        /** Techo de cada interacción. */
        interaction: conFotos ? 40_000 : 20_000,
    },
} as const;
