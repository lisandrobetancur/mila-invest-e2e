/**
 * C · P5 — aserción invertida.
 *
 * Se intenta accionar algo que el usuario NO puede alcanzar (fuera del
 * viewport, debajo de un modal, debajo de un snackbar). El test pasa solo
 * si el intento NO tuvo efecto. Si el tap funciona, el test queda rojo: es
 * el hallazgo, y así se reporta.
 *
 * Tres formas de entrega, cada una en su propio test (contexto nuevo):
 *   click        → locator.click()
 *   force        → locator.click({ force: true })
 *   dom-click    → locator.evaluate(el => el.click())
 *
 * Solo en ON (en OFF no hay nodo que accionar), salvo C6, que es directo y
 * se hace con el mouse real en los dos modos.
 */
import type { Locator, Page } from '@playwright/test';

import { type App, diffRatio, expect, sel, test } from '../lib/probe';

type Forma = 'click' | 'force' | 'dom-click';
const FORMAS: Forma[] = ['click', 'force', 'dom-click'];
/** Techo del intento con `click()`: si Playwright no lo logra en este tiempo, el intento no tuvo efecto. */
const INTENTO_MS = 10_000;

async function intentar(loc: Locator, forma: Forma): Promise<{ outcome: string; error?: string; ms: number }> {
    const t0 = Date.now();
    try {
        if (forma === 'click') await loc.click({ timeout: INTENTO_MS });
        else if (forma === 'force') await loc.click({ force: true, timeout: INTENTO_MS });
        else await loc.evaluate((el) => (el as HTMLElement).click(), undefined, { timeout: INTENTO_MS });
        return { outcome: 'entregado', ms: Date.now() - t0 };
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const lines = msg.split('\n').filter((l) => /intercepts|not visible|outside of the viewport|detached|Timeout|waiting for|retrying|not stable|receives events/i.test(l));
        return { outcome: 'error', error: [...new Set(lines)].slice(0, 6).join(' | ').slice(0, 600), ms: Date.now() - t0 };
    }
}

async function idsPresentes(page: Page): Promise<string[]> {
    return page.evaluate(() => [...new Set([...document.querySelectorAll('[flt-semantics-identifier]')].map((e) => e.getAttribute('flt-semantics-identifier')!))]);
}

async function existe(page: Page, id: string): Promise<boolean> {
    return (await page.locator(sel(id)).count()) > 0;
}

async function scrollTops(page: Page): Promise<number[]> {
    return page.evaluate(() => [...document.querySelectorAll('flt-semantics-scroll-overflow')].map((o) => o.parentElement!.scrollTop));
}

async function abrirTicket(app: App): Promise<void> {
    await app.go('/market/instrument/ECOPETROL-CO', 'market_detail_state_data');
    await app.page.locator(sel('market_detail_buy_button')).click();
    await app.page.waitForURL(/\/orders\/ticket\//);
    await app.page.locator(sel('orders_ticket_view')).first().waitFor({ state: 'visible' });
    await app.stable();
}

// ---------------- C1 fuera del viewport ----------------
test.describe('C1', () => {
    test.use({ viewport: { width: 390, height: 844 } });
    for (const forma of FORMAS) {
        test(`C1 fuera del viewport · auth_register_submit_button · ${forma}`, async ({ app, page, mode }) => {
            test.skip(mode === 'off', 'no aplica en OFF: no hay nodo que accionar');
            await app.boot();
            await app.go('/register', 'auth_register_view');
            // Bajar el alto hasta que el botón quede fuera del viewport.
            let alto = 844;
            let box = await page.locator(sel('auth_register_submit_button')).boundingBox().catch(() => null);
            const medidas: unknown[] = [{ alto, box }];
            for (const h of [700, 600, 560, 520, 480]) {
                if (box && box.y < alto) {
                    alto = h;
                    await page.setViewportSize({ width: 390, height: h });
                    await app.stable();
                    box = await page.locator(sel('auth_register_submit_button')).boundingBox().catch(() => null);
                    medidas.push({ alto, box, enDom: await existe(page, 'auth_register_submit_button') });
                }
            }
            const enDom = await existe(page, 'auth_register_submit_button');
            const fuera = !box || box.y >= alto;
            const tops0 = await scrollTops(page);
            const loc = page.locator(sel('auth_register_submit_button')).first();
            const r = enDom ? await intentar(loc, forma) : { outcome: 'no existe en el DOM', ms: 0 };
            await page.waitForTimeout(1000);
            const errores = (await idsPresentes(page)).filter((id) => /_error_text$/.test(id));
            const tops1 = await scrollTops(page);
            const efecto = errores.length > 0;
            app.rec('C1', { forma, alto, fuera, enDom, medidas, intento: r, errores, efecto, tops0, tops1, scrolleo: JSON.stringify(tops0) !== JSON.stringify(tops1) });
            expect(efecto, `el botón fuera del viewport respondió (${errores.join(', ')})`).toBe(false);
        });
    }
});

// ---------------- C2 / C3 debajo del ticket ----------------
for (const [caseId, vp, objetivos] of [
    ['C2', { width: 390, height: 844 }, ['market_detail_sell_button', 'nav_market_tab']],
    ['C3', { width: 1280, height: 800 }, ['nav_market_tab', 'nav_home_tab']],
] as const) {
    test.describe(caseId, () => {
        test.use({ viewport: vp });
        for (const objetivo of objetivos) {
            for (const forma of FORMAS) {
                test(`${caseId} debajo del ticket (${vp.width}x${vp.height}) · ${objetivo} · ${forma}`, async ({ app, page, mode }) => {
                    test.skip(mode === 'off', 'no aplica en OFF: no hay nodo que accionar');
                    await app.boot();
                    await app.login();
                    await abrirTicket(app);
                    const urlAntes = app.path();
                    const ids = await idsPresentes(page);
                    const enDom = await existe(page, objetivo);
                    const box = enDom ? await page.locator(sel(objetivo)).first().boundingBox() : null;
                    const r = enDom ? await intentar(page.locator(sel(objetivo)).first(), forma) : { outcome: 'no existe en el DOM', ms: 0 };
                    await page.waitForTimeout(1000);
                    const ticketAbierto = await existe(page, 'orders_ticket_view');
                    const urlDespues = app.path();
                    const efecto = !ticketAbierto || urlDespues !== urlAntes;
                    app.rec(caseId, { objetivo, forma, enDom, box, intento: r, ticketAbierto, urlAntes, urlDespues, efecto, idsConModal: ids, platform: process.platform });
                    expect(efecto, `${objetivo} respondió debajo del modal (url ${urlDespues}, ticket abierto ${ticketAbierto})`).toBe(false);
                });
            }
        }
    });
}

// ---------------- C4 debajo del diálogo de logout ----------------
test.describe('C4', () => {
    test.use({ viewport: { width: 390, height: 844 } });
    for (const forma of FORMAS) {
        test(`C4 debajo del diálogo · settings_theme_dark_segment · ${forma}`, async ({ app, page, mode }) => {
            test.skip(mode === 'off', 'no aplica en OFF: no hay nodo que accionar');
            await app.boot();
            await app.login();
            await app.go('/settings', 'settings_view');
            const fondo = async (): Promise<number[]> => {
                const buf = await page.screenshot({ clip: { x: 2, y: 400, width: 4, height: 4 } });
                const { default: sharp } = await import('sharp');
                const { data } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
                return [data[0], data[1], data[2]];
            };
            await page.locator(sel('settings_logout_button')).click();
            await page.locator(sel('settings_logout_dialog')).first().waitFor({ state: 'visible' });
            await app.stable();
            const ids = await idsPresentes(page);
            const colorAntes = await fondo();
            const enDom = await existe(page, 'settings_theme_dark_segment');
            const r = enDom ? await intentar(page.locator(sel('settings_theme_dark_segment')).first(), forma) : { outcome: 'no existe en el DOM', ms: 0 };
            await page.waitForTimeout(1000);
            const colorDespues = await fondo();
            const dialogo = await existe(page, 'settings_logout_dialog');
            const temaCambio = colorAntes.some((c, i) => Math.abs(c - colorDespues[i]) > 30);
            const efecto = temaCambio || !dialogo;
            app.rec('C4', { forma, enDom, intento: r, colorAntes, colorDespues, temaCambio, dialogo, efecto, idsConModal: ids });
            expect(efecto, `el segmento respondió debajo del diálogo (tema cambió ${temaCambio}, diálogo abierto ${dialogo})`).toBe(false);
        });
    }
});

// ---------------- C5 debajo del snackbar ----------------
test.describe('C5', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    async function conSnackbar(app: App): Promise<{ snack: { x: number; y: number; width: number; height: number } | null; solapados: { id: string; area: number }[] }> {
        const { page } = app;
        await app.go('/wallet', 'wallet_accounts_state_data');
        await page.locator(sel('wallet_cop_deposit_button')).click();
        await page.locator(sel('wallet_deposit_view')).first().waitFor({ state: 'visible' });
        await app.stable();
        await page.locator(sel('wallet_deposit_suggested_item_1000000')).click();
        await page.locator(sel('wallet_deposit_submit_button')).click();
        const s = page.locator(sel('wallet_deposit_success_snackbar')).first();
        await s.waitFor({ state: 'visible', timeout: 10_000 });
        const snack = await s.boundingBox();
        const solapados = await page.evaluate((sb) => {
            const out: { id: string; area: number }[] = [];
            if (!sb) return out;
            for (const e of document.querySelectorAll('[flt-tappable][flt-semantics-identifier], [flt-semantics-identifier] > input')) {
                const n = e.tagName === 'INPUT' ? e.parentElement! : e;
                const id = n.getAttribute('flt-semantics-identifier')!;
                if (id === 'wallet_deposit_success_snackbar' || n.closest('[flt-semantics-identifier="wallet_deposit_success_snackbar"]')) continue;
                const r = n.getBoundingClientRect();
                const w = Math.min(r.right, sb.x + sb.width) - Math.max(r.left, sb.x);
                const h = Math.min(r.bottom, sb.y + sb.height) - Math.max(r.top, sb.y);
                if (w > 0 && h > 0) out.push({ id, area: Math.round(w * h) });
            }
            return out;
        }, snack);
        return { snack, solapados };
    }

    test('C5 relevamiento: qué tappable con id se solapa con el snackbar', async ({ app, page, mode }) => {
        test.skip(mode === 'off', 'no aplica en OFF: no hay nodo que accionar');
        await app.boot();
        await app.login();
        const { snack, solapados } = await conSnackbar(app);
        app.rec('C5-relevamiento', { snack, solapados, url: app.path(), ids: await idsPresentes(page) });
    });

    for (const forma of FORMAS) {
        test(`C5 debajo del snackbar · el primer tappable solapado · ${forma}`, async ({ app, page, mode }) => {
            test.skip(mode === 'off', 'no aplica en OFF: no hay nodo que accionar');
            await app.boot();
            await app.login();
            const { snack, solapados } = await conSnackbar(app);
            if (!solapados.length) {
                app.rec('C5', { forma, snack, solapados, nota: 'ningún tappable con id se solapa con el snackbar' });
                return;
            }
            const objetivo = solapados.sort((a, b) => b.area - a.area)[0].id;
            const urlAntes = app.path();
            const vistasAntes = (await idsPresentes(page)).filter((i) => /_view$/.test(i));
            const r = await intentar(page.locator(sel(objetivo)).first(), forma);
            await page.waitForTimeout(800);
            const urlDespues = app.path();
            const vistasDespues = (await idsPresentes(page)).filter((i) => /_view$/.test(i));
            const snackSigue = await existe(page, 'wallet_deposit_success_snackbar');
            const efecto = urlDespues !== urlAntes || JSON.stringify(vistasAntes) !== JSON.stringify(vistasDespues);
            app.rec('C5', { forma, snack, solapados, objetivo, intento: r, urlAntes, urlDespues, vistasAntes, vistasDespues, snackSigue, efecto });
            expect(efecto, `${objetivo} respondió debajo del snackbar (url ${urlDespues})`).toBe(false);
        });
    }
});

// ---------------- C6 superposición campo / toggle (directo) ----------------
test.describe('C6', () => {
    test.use({ viewport: { width: 390, height: 844 } });
    test('C6 click con mouse real en el toggle de la contraseña', async ({ app, page }) => {
        await app.boot();
        await app.tap('login', 'auth_login_password_field');
        await page.waitForTimeout(500);
        await page.keyboard.type('Demo1234!', { delay: 50 });
        await app.stable();
        const antes = await app.active();
        const typeAntes = app.mode === 'on' ? await app.fieldType('auth_login_password_field') : antes.type;
        const nPtr = (await app.probeEvents()).ptr.length;
        const fb = await app.box('login', 'auth_login_password_field', { check: false });
        const clip = { x: fb.x, y: fb.y, width: fb.width * 0.7, height: fb.height };
        const r0 = await page.screenshot({ clip, caret: 'hide' });
        await app.tap('login-con-texto', 'auth_login_password_toggle');
        await page.waitForTimeout(500);
        const cambioVisual = await diffRatio(r0, await page.screenshot({ clip, caret: 'hide' }));
        const despues = await app.active();
        const typeDespuesDom = app.mode === 'on' ? await app.fieldType('auth_login_password_field') : despues.type;
        const eventos = (await app.probeEvents()).ptr.slice(nPtr);
        await page.screenshot({ path: `results/shots/C6-${app.mode}-r${app.run}.png` });
        const valid = await app.offStillOff('C6');
        const final = await app.readField('auth_login_password_field');
        // Actuó = el campo dejó de ocultar el texto (puntos → texto). Criterio
        // visual: en OFF el <input> de edición conserva type="password"
        // aunque el toggle haya actuado.
        const actuo = cambioVisual > 0.05;
        const campoRecibio = eventos.some((e) => e.type === 'pointerdown' && /^INPUT/.test(e.target));
        app.rec('C6', { antes, typeAntes, despues, typeDespuesDom, eventos, final, cambioVisual, actuo, campoRecibio, valid });
        expect(actuo, 'el toggle debe mostrar la contraseña').toBe(true);
        expect(campoRecibio, 'el campo no debe recibir el click').toBe(false);
    });
});
