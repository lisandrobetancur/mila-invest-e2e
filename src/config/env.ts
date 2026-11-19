/**
 * Configuración de la suite. **Único lugar que lee `process.env`.**
 *
 * | Variable | Default | Para qué |
 * |---|---|---|
 * | `BASE_URL` | `http://localhost:8080` | dónde está servida la app web |
 * | `MILA_APP_PATH` | `../mila-invest-app` | repo de la app (para `ids:sync`) |
 * | `MILA_SEED` | `demo` | semilla del backend falso del build bajo prueba |
 * | `MILA_PHOTOS` | `failures` | `all` saca una foto por interacción |
 * | `CI` | ausente | activa reintentos y un solo worker |
 */

/** Semilla del backend falso con la que se compiló el build bajo prueba. */
export type Seed = 'demo' | 'empty';

/** Cuándo saca fotos el `Photographer`. */
export type Photos = 'failures' | 'all';

const asSeed = (value: string | undefined): Seed =>
    value === 'empty' ? 'empty' : 'demo';

const asPhotos = (value: string | undefined): Photos =>
    value === 'all' ? 'all' : 'failures';

/** Sacar una foto por interacción cuesta tiempo: los techos se agrandan. */
const conFotos = asPhotos(process.env.MILA_PHOTOS) === 'all';

export const env = {
    /** Base de la app web bajo prueba. */
    baseUrl: process.env.BASE_URL ?? 'http://localhost:8080',

    /** Raíz del repo `mila-invest-app`, relativa a este repo o absoluta. */
    milaAppPath: process.env.MILA_APP_PATH ?? '../mila-invest-app',

    /** Semilla del backend falso: `demo` (default) o `empty`. */
    seed: asSeed(process.env.MILA_SEED),

    /**
     * Fotos del reporte: `failures` (default) o `all`.
     *
     * Con `all` el `Photographer` saca una foto por interacción y el reporte
     * queda con el paso a paso completo de cada escenario; cuesta tiempo, así
     * que en CI y en el día a día conviene `failures`.
     */
    photos: asPhotos(process.env.MILA_PHOTOS),

    /** `true` dentro de CI. */
    isCI: Boolean(process.env.CI),

    /**
     * Timeouts, en milisegundos. Flutter web pinta sobre un canvas y
     * reconstruye el árbol semántico entre frames: las esperas son de
     * condición (`Wait.until`), nunca fijas, pero necesitan un techo.
     *
     * Con `MILA_PHOTOS=all` cada interacción paga una captura, así que el
     * presupuesto se duplica: si no, un escenario largo como el registro se
     * queda sin tiempo por el costo de fotografiarlo, no por un problema de
     * la app.
     */
    timeouts: {
        /** Espera por un elemento o un estado dentro de una vista ya cargada. */
        element: conFotos ? 30_000 : 15_000,
        /** Espera por un cambio de ruta o la carga inicial de la app. */
        navigation: conFotos ? 60_000 : 30_000,
        /** Techo de cada interacción (click, escritura). */
        interaction: conFotos ? 30_000 : 15_000,
    },
} as const;
