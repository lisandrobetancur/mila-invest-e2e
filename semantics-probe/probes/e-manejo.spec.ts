/**
 * E · Validación de manejos desde Playwright (solo ON).
 *
 * Repite los casos que fallaron en A con una estrategia distinta cada vez:
 *
 * - `base`: tocar y teclear enseguida (control, igual que A con 0 ms).
 * - `foco`: esperar a que `document.activeElement` sea el input del campo y
 *   siga siéndolo durante N frames seguidos.
 * - `activo`: esperar a que el input tenga foco **y** la sonda `mousedown`
 *   devuelva `defaultPrevented` (la pone `preventDefaultForMouseEvents()`,
 *   que el engine instala en `addEventHandlers()` junto con el listener de
 *   `input`: si la sonda da true, el campo ya escucha teclas).
 * - `activo+verif`: `activo` + leer el valor y, si no quedó, reintentar
 *   (hasta 3 intentos, cada uno volviendo a esperar).
 *
 * P2: re-tocar un campo después de tocar un control vecino, con clicks en
 * coordenadas enteras o fraccionarias (`_isIntegerCoordinateNavigation` en
 * `platform_dispatcher.dart` de 3.41.9 trata un click entero sobre un
 * `role="button"` como tecnología asistiva y le da el foco al botón).
 */
import type { Page } from '@playwright/test';

import { type App, expect, test } from '../lib/probe';

test.use({ viewport: { width: 390, height: 844 } });
test.beforeEach(({ mode }) => test.skip(mode === 'off', 'los manejos se validan solo en ON'));

const SEL_ALL = process.platform === 'darwin' ? 'Meta+A' : 'Control+A';
const sem = (id: string): string => `[flt-semantics-identifier="${id}"]`;

type Coords = 'entero' | 'fraccional';
type Estrategia = 'base' | 'foco' | 'activo' | 'activo+verif';

/** Click real en el centro del nodo, redondeado a entero o a ,5. */
async function tocar(page: Page, id: string, coords: Coords): Promise<{ x: number; y: number }> {
    const loc = page.locator(sem(id)).first();
    await loc.waitFor({ state: 'visible' });
    const b = (await loc.boundingBox())!;
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const p = coords === 'entero' ? { x: Math.round(cx), y: Math.round(cy) } : { x: Math.floor(cx) + 0.5, y: Math.floor(cy) + 0.5 };
    await page.mouse.click(p.x, p.y);
    return p;
}

/**
 * Espera, frame a frame, a que el input del campo tenga el foco (y, si
 * [sonda], a que la sonda `mousedown` dé `defaultPrevented`) durante [n]
 * frames seguidos. Devuelve cuántos frames tardó, o null si no llegó.
 */
async function esperarCampo(page: Page, id: string, sonda: boolean, n = 3, timeout = 3_000): Promise<number | null> {
    await page.evaluate(() => {
        const w = window as unknown as { __mc: { ok: number; frames: number } };
        w.__mc = { ok: 0, frames: 0 };
    });
    const ok = await page
        .waitForFunction(
            ({ sel, sonda, n }) => {
                const w = window as unknown as { __mc: { ok: number; frames: number } };
                w.__mc.frames++;
                const input = document.querySelector(sel)?.querySelector('input, textarea');
                let listo = !!input && document.activeElement === input;
                if (listo && sonda) {
                    const ev = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
                    input!.dispatchEvent(ev);
                    listo = ev.defaultPrevented;
                }
                w.__mc.ok = listo ? w.__mc.ok + 1 : 0;
                return w.__mc.ok >= n;
            },
            { sel: sem(id), sonda, n },
            { polling: 'raf', timeout },
        )
        .then(() => true, () => false);
    const frames = await page.evaluate(() => (window as unknown as { __mc: { frames: number } }).__mc.frames);
    return ok ? frames : null;
}

/** Valor del input enfocado, dos frames después. */
async function valorEnfocado(page: Page, id: string): Promise<string | null> {
    return page.evaluate(async (sel) => {
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const input = document.querySelector(sel)?.querySelector('input, textarea') as HTMLInputElement | null;
        return input && document.activeElement === input ? input.value : null;
    }, sem(id));
}

/** Toca [id] y escribe [texto] con la estrategia dada. Devuelve el detalle. */
async function escribir(app: App, page: Page, id: string, texto: string, e: Estrategia, coords: Coords = 'fraccional') {
    const intentos: unknown[] = [];
    const max = e === 'activo+verif' ? 3 : 1;
    for (let i = 1; i <= max; i++) {
        const click = await tocar(page, id, coords);
        let frames: number | null = null;
        let retoque = false;
        if (e !== 'base') {
            const sonda = e !== 'foco';
            frames = await esperarCampo(page, id, sonda);
            if (frames === null) {
                retoque = true;
                await tocar(page, id, coords);
                frames = await esperarCampo(page, id, sonda);
            }
        }
        if (i > 1) await page.keyboard.press(SEL_ALL);
        await page.keyboard.type(texto);
        const visto = await valorEnfocado(page, id);
        intentos.push({ i, click, frames, retoque, visto, active: await app.active() });
        if (visto === texto || e !== 'activo+verif') break;
    }
    return intentos;
}

const ESTRATEGIAS: Estrategia[] = ['base', 'foco', 'activo', 'activo+verif'];

for (const e of ESTRATEGIAS) {
    test(`E1 registro tocando cada campo · ${e}`, async ({ app, page }) => {
        await app.boot();
        await app.go('/register', 'auth_register_view');
        await tocar(page, 'auth_register_country_co_chip', 'fraccional');
        await app.stable();
        const campos: [string, string][] = [
            ['auth_register_name_field', 'Ana Prueba'],
            ['auth_register_email_field', 'ana.prueba@example.com'],
            ['auth_register_document_field', '1234567890'],
            ['auth_register_password_field', 'Clave1234'],
        ];
        const detalle: Record<string, unknown> = {};
        for (const [id, texto] of campos) detalle[id] = await escribir(app, page, id, texto, e);
        const values: Record<string, string | null> = {};
        for (const [id] of campos) values[id] = (await app.readField(id)).value;
        const ok = campos.every(([id, t]) => values[id] === t);
        app.rec('E1', { e, ok, values, detalle });
        expect(ok, JSON.stringify(values)).toBe(true);
    });

    test(`E2 depósito · ${e}`, async ({ app, page }) => {
        await app.boot();
        await app.login();
        await app.go('/wallet', 'wallet_accounts_state_data');
        await tocar(page, 'wallet_cop_deposit_button', 'fraccional');
        await page.waitForURL(/\/wallet\/deposit\/COP/i, { timeout: 10_000 });
        await page.locator(sem('wallet_deposit_view')).first().waitFor({ state: 'visible' });
        await app.stable();
        const detalle = await escribir(app, page, 'wallet_deposit_amount_field', '250000', e);
        await page.waitForTimeout(300);
        const field = await app.fieldValue('wallet_deposit_amount_field');
        const digits = (field ?? '').replace(/\D/g, '');
        app.rec('E2', { e, ok: digits === '250000', field, detalle });
        expect(digits).toBe('250000');
    });
}

/** E3: login con Enter entre campos. `base` teclea enseguida; `foco-siguiente` espera el foco en la contraseña. */
for (const e of ['base', 'foco-siguiente'] as const) {
    test(`E3 login con Enter · ${e}`, async ({ app, page }) => {
        await app.boot();
        const email = await escribir(app, page, 'auth_login_email_field', 'demo@milainvest.app', e === 'base' ? 'base' : 'activo');
        await page.keyboard.press('Enter');
        let frames: number | null = null;
        if (e === 'foco-siguiente') frames = await esperarCampo(page, 'auth_login_password_field', true);
        const tras = await app.active();
        await page.keyboard.type('Demo1234!');
        await page.keyboard.press('Enter');
        const home = await page.waitForURL(/\/home$/, { timeout: 5_000 }).then(() => true, () => false);
        app.rec('E3', { e, ok: home, email, frames, trasEnter: tras });
        expect(home, 'debe terminar en /home').toBe(true);
    });
}

/**
 * E4 (P2): con texto en la contraseña, tocar el ojo (vecino), volver a tocar
 * el campo y teclear `x`. Coordenadas enteras o fraccionarias, con o sin
 * espera del campo antes de teclear.
 */
for (const coords of ['entero', 'fraccional'] as const) {
    for (const e of ['base', 'activo'] as const) {
        test(`E4 re-tocar tras vecino · ${coords} · ${e}`, async ({ app, page }) => {
            await app.boot();
            await escribir(app, page, 'auth_login_password_field', 'Demo12', 'activo+verif');
            await tocar(page, 'auth_login_password_toggle', coords);
            await app.stable();
            const trasVecino = await app.active();
            const timeline: unknown[] = [];
            const click = await tocar(page, 'auth_login_password_field', coords);
            for (let i = 0; i < 8; i++) {
                timeline.push({ ms: i * 25, active: (await app.active()).tag });
                await page.waitForTimeout(25);
            }
            let frames: number | null = null;
            if (e === 'activo') {
                frames = await esperarCampo(page, 'auth_login_password_field', true);
                if (frames === null) {
                    await tocar(page, 'auth_login_password_field', coords);
                    frames = await esperarCampo(page, 'auth_login_password_field', true);
                }
            }
            await page.keyboard.type('x');
            const value = (await app.readField('auth_login_password_field')).value;
            app.rec('E4', { coords, e, ok: value === 'Demo12x', value, click, frames, trasVecino, timeline });
            expect(value).toBe('Demo12x');
        });
    }
}
