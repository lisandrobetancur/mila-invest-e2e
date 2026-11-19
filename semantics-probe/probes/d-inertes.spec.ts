/**
 * D · P7 y P8 (solo ON).
 *
 * D1: qué hace Playwright, sin `force`, sobre nodos que no son tappables,
 *     campos ni sliders (hover sobre el gráfico, click sobre un texto con
 *     id, pull-to-refresh). No se resuelve con `force: true`.
 * D2: ids del DOM contra `docs/semantics-ids.md`, vista por vista y estado
 *     por estado, scrolleando antes de dar un id por faltante.
 */
import fs from 'node:fs';
import path from 'node:path';

import type { Browser, Page } from '@playwright/test';

import { type App, RESULTS, diffRatio, sel, test } from '../lib/probe';

const APP_REPO = process.env.MILA_APP_PATH ?? path.join(__dirname, '..', '..', '..', '..', 'dart', 'mila-invest-app');

async function intento(fn: () => Promise<unknown>): Promise<{ outcome: string; ms: number; error?: string }> {
    const t0 = Date.now();
    try {
        await fn();
        return { outcome: 'éxito', ms: Date.now() - t0 };
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const lines = msg.split('\n').filter((l) => l.trim()).slice(0, 14);
        return { outcome: 'error', ms: Date.now() - t0, error: lines.join(' | ').slice(0, 900) };
    }
}

test.describe('D1', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('D1a hover sobre market_detail_chart (sin force)', async ({ app, page, mode }) => {
        test.skip(mode === 'off', 'solo ON');
        await app.boot();
        await app.login();
        await app.go('/market/instrument/ECOPETROL-CO', 'market_detail_state_data');
        const node = page.locator(sel('market_detail_chart')).first();
        const box = await node.boundingBox();
        const pe = await node.evaluate((e) => getComputedStyle(e).pointerEvents);
        const antes = await page.screenshot({ clip: box! });
        const r = await intento(() => node.hover({ timeout: 10_000 }));
        await page.waitForTimeout(400);
        const tooltipConHover = await diffRatio(antes, await page.screenshot({ clip: box! }));
        // Referencia: lo mismo con el mouse real en el centro (lo que haría una persona).
        await page.mouse.move(1, 1);
        await page.waitForTimeout(400);
        const base = await page.screenshot({ clip: box! });
        await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
        await page.waitForTimeout(400);
        const tooltipMouse = await diffRatio(base, await page.screenshot({ clip: box! }));
        await page.mouse.down();
        await page.waitForTimeout(400);
        const tooltipMouseDown = await diffRatio(base, await page.screenshot({ clip: box! }));
        await page.mouse.up();
        app.rec('D1a', { pointerEvents: pe, box, playwright: r, tooltipConHover, tooltipMouse, tooltipMouseDown });
    });

    test('D1b click sobre dashboard_home_total_text (sin force)', async ({ app, page, mode }) => {
        test.skip(mode === 'off', 'solo ON');
        await app.boot();
        await app.login();
        const node = page.locator(sel('dashboard_home_total_text')).first();
        const pe = await node.evaluate((e) => getComputedStyle(e).pointerEvents);
        const urlAntes = app.path();
        const r = await intento(() => node.click({ timeout: 10_000 }));
        await page.waitForTimeout(500);
        app.rec('D1b', { pointerEvents: pe, playwright: r, urlAntes, urlDespues: app.path(), box: await node.boundingBox() });
    });

    test('D1c pull-to-refresh en /home', async ({ app, page, mode, browser }) => {
        test.skip(mode === 'off', 'solo ON');
        await app.boot();
        await app.login();
        const v = page.viewportSize()!;
        const top = { x: 0, y: 56, width: v.width, height: 120 };
        // (1) API de Playwright sin force: dragTo desde el total hacia abajo.
        const tile = page.locator(sel('dashboard_home_total_tile')).first();
        const base = await page.screenshot({ clip: top });
        const drag = await intento(() => tile.dragTo(page.locator(sel('dashboard_home_day_change_text')).first(), { timeout: 10_000, targetPosition: { x: 10, y: 300 } }));
        const dragDiff = await diffRatio(base, await page.screenshot({ clip: top }));
        await app.stable();
        // (2) Mouse real: down arriba, mover 300 px hacia abajo despacio, sostener y capturar.
        const b = (await tile.boundingBox())!;
        await page.mouse.move(b.x + b.width / 2, b.y + 10);
        await page.mouse.down();
        for (let i = 1; i <= 15; i++) await page.mouse.move(b.x + b.width / 2, b.y + 10 + i * 20);
        const mouseDiff = await diffRatio(base, await page.screenshot({ clip: top }));
        await page.mouse.up();
        await app.stable();
        // (3) Touch por CDP en un contexto táctil aparte.
        const touch = await pullConTouch(browser, app);
        app.rec('D1c', { dragTo: drag, dragDiff, mouseDiff, touch });
    });
});

async function pullConTouch(browser: Browser, app: App): Promise<unknown> {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: 'es', hasTouch: true });
    await ctx.addInitScript(`localStorage.setItem('flutter.mila_invest.onboarding_seen','true')`);
    const page = await ctx.newPage();
    try {
        const base = app.info.project.use.baseURL!;
        await page.goto(base + '/');
        await page.waitForURL(/\/login$/);
        await page.locator(sel('auth_login_demo_button')).click();
        await page.locator(sel('auth_login_submit_button')).click();
        await page.waitForURL(/\/home$/);
        await page.locator(sel('dashboard_home_state_data')).first().waitFor({ state: 'attached' });
        await page.waitForTimeout(800);
        const top = { x: 0, y: 56, width: 390, height: 120 };
        const b0 = await page.screenshot({ clip: top });
        const tile = (await page.locator(sel('dashboard_home_total_tile')).first().boundingBox())!;
        const cdp = await ctx.newCDPSession(page);
        const x = tile.x + tile.width / 2;
        const y = tile.y + 10;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        for (let i = 1; i <= 15; i++) {
            await page.waitForTimeout(16);
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + i * 20 }] });
        }
        const durante = await diffRatio(b0, await page.screenshot({ clip: top }));
        await page.screenshot({ path: path.join(RESULTS, 'shots', `D1c-touch-pull-r${app.run}.png`) });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForTimeout(300);
        const loading = await page.locator(sel('dashboard_home_state_loading')).count();
        return { durante, indicadorDeCargaConId: loading > 0 };
    } finally {
        await ctx.close();
    }
}

// ---------------- D2 inventario ----------------

interface Inventario { estaticos: string[]; dinamicos: RegExp[] }

function leerInventario(): Inventario {
    const md = fs.readFileSync(path.join(APP_REPO, 'docs', 'semantics-ids.md'), 'utf8');
    const ids = [...md.matchAll(/^\| `([^`]+)` \|/gm)].map((m) => m[1]);
    return {
        estaticos: ids.filter((i) => !i.includes('<')),
        dinamicos: ids.filter((i) => i.includes('<')).map((i) => new RegExp('^' + i.replace(/<[^>]+>/g, '.+') + '$')),
    };
}

/** Junta los ids mientras baja la vista (rueda en pasos de 250 px) hasta que no cambie nada. */
async function juntarIds(page: Page, punto: { x: number; y: number }): Promise<string[]> {
    const vistos = new Set<string>();
    const tomar = async (): Promise<void> => {
        for (const id of await page.evaluate(() => [...document.querySelectorAll('[flt-semantics-identifier]')].map((e) => e.getAttribute('flt-semantics-identifier')!))) vistos.add(id);
    };
    await tomar();
    await page.mouse.move(punto.x, punto.y);
    let quietos = 0;
    for (let i = 0; i < 30 && quietos < 2; i++) {
        const antes = vistos.size;
        const shot0 = await page.screenshot();
        await page.mouse.wheel(0, 250);
        await page.waitForTimeout(250);
        await tomar();
        const movio = (await diffRatio(shot0, await page.screenshot())) > 0.001;
        quietos = !movio && vistos.size === antes ? quietos + 1 : 0;
    }
    return [...vistos].sort();
}

interface Estado {
    vista: string;
    prefijos: string[];
    vp?: { width: number; height: number };
    login?: boolean;
    ir: (app: App, page: Page) => Promise<void>;
}

const tap = async (page: Page, id: string): Promise<void> => {
    await page.locator(sel(id)).first().click({ timeout: 10_000 });
};

const ESTADOS: Estado[] = [
    { vista: 'login', prefijos: ['auth_login_'], login: false, ir: async () => undefined },
    { vista: 'login · errores de campo', prefijos: ['auth_login_'], login: false, ir: async (app, page) => { await tap(page, 'auth_login_submit_button'); await app.stable(); } },
    { vista: 'login · credenciales incorrectas', prefijos: ['auth_login_'], login: false, ir: async (app, page) => {
        await tap(page, 'auth_login_email_field'); await page.keyboard.type('demo@milainvest.app', { delay: 30 });
        await tap(page, 'auth_login_password_field'); await page.waitForTimeout(300); await page.keyboard.type('Incorrecta1', { delay: 30 });
        await tap(page, 'auth_login_submit_button'); await page.locator(sel('auth_login_error_text')).first().waitFor({ state: 'attached', timeout: 5_000 }).catch(() => undefined); await app.stable();
    } },
    { vista: 'register', prefijos: ['auth_register_'], login: false, ir: async (app) => { await app.go('/register', 'auth_register_view'); } },
    { vista: 'register · errores', prefijos: ['auth_register_'], login: false, ir: async (app, page) => { await app.go('/register', 'auth_register_view'); await tap(page, 'auth_register_submit_button'); await app.stable(); } },
    ...(['co', 'mx', 'pe'] as const).map((p): Estado => ({ vista: `register · país ${p.toUpperCase()}`, prefijos: ['auth_register_'], login: false, ir: async (app, page) => { await app.go('/register', 'auth_register_view'); await tap(page, `auth_register_country_${p}_chip`); await app.stable(); } })),
    { vista: 'home', prefijos: ['dashboard_', 'nav_'], ir: async () => undefined },
    { vista: 'home (1280)', prefijos: ['dashboard_', 'nav_'], vp: { width: 1280, height: 800 }, ir: async () => undefined },
    { vista: 'settings', prefijos: ['settings_'], ir: async (app) => { await app.go('/settings', 'settings_view'); } },
    { vista: 'settings · diálogo', prefijos: ['settings_'], ir: async (app, page) => { await app.go('/settings', 'settings_view'); await tap(page, 'settings_logout_button'); await app.stable(); } },
    { vista: 'market', prefijos: ['market_list_'], ir: async (app) => { await app.go('/market', 'market_list_state_data'); } },
    { vista: 'market · vacío', prefijos: ['market_list_'], ir: async (app) => { await app.go('/market?q=zzzz', 'market_list_view'); } },
    { vista: 'detalle ECOPETROL (con posición)', prefijos: ['market_detail_'], ir: async (app) => { await app.go('/market/instrument/ECOPETROL-CO', 'market_detail_state_data'); } },
    { vista: 'detalle no encontrado', prefijos: ['market_detail_'], ir: async (app) => { await app.go('/market/instrument/NOPE-XX', 'market_detail_view'); } },
    { vista: 'ticket compra', prefijos: ['orders_ticket_', 'orders_summary_'], ir: async (app, page) => { await app.go('/market/instrument/ECOPETROL-CO', 'market_detail_state_data'); await tap(page, 'market_detail_buy_button'); await page.locator(sel('orders_ticket_view')).first().waitFor(); await app.stable(); } },
    { vista: 'ticket venta', prefijos: ['orders_ticket_', 'orders_summary_'], ir: async (app, page) => { await app.go('/market/instrument/ECOPETROL-CO', 'market_detail_state_data'); await tap(page, 'market_detail_sell_button'); await page.locator(sel('orders_ticket_view')).first().waitFor(); await app.stable(); } },
    { vista: 'confirmación', prefijos: ['orders_confirm_', 'orders_summary_'], ir: async (app, page) => { await app.go('/market/instrument/ECOPETROL-CO', 'market_detail_state_data'); await tap(page, 'market_detail_buy_button'); await app.stable(); await tap(page, 'orders_ticket_review_button'); await page.locator(sel('orders_confirm_view')).first().waitFor(); await app.stable(); } },
    { vista: 'resultado', prefijos: ['orders_result_', 'orders_summary_'], ir: async (app, page) => { await app.go('/market/instrument/ECOPETROL-CO', 'market_detail_state_data'); await tap(page, 'market_detail_buy_button'); await app.stable(); await tap(page, 'orders_ticket_review_button'); await app.stable(); await tap(page, 'orders_confirm_submit_button'); await page.locator(sel('orders_result_view')).first().waitFor(); await app.stable(); } },
    { vista: 'historial de órdenes', prefijos: ['orders_history_'], ir: async (app) => { await app.go('/activity/orders', 'orders_history_view'); } },
    { vista: 'detalle de orden', prefijos: ['orders_detail_'], ir: async (app, page) => {
        await app.go('/activity/orders', 'orders_history_state_data');
        const id = await page.evaluate(() => [...document.querySelectorAll('[flt-semantics-identifier^="orders_history_item_"]')].map((e) => e.getAttribute('flt-semantics-identifier')!).find((i) => !/_text$/.test(i)));
        await tap(page, id!); await page.locator(sel('orders_detail_view')).first().waitFor(); await app.stable();
    } },
    { vista: 'billetera', prefijos: ['wallet_accounts_', 'wallet_cop_', 'wallet_mxn_', 'wallet_pen_', 'wallet_account_'], ir: async (app) => { await app.go('/wallet', 'wallet_accounts_state_data'); } },
    { vista: 'depósito', prefijos: ['wallet_deposit_'], ir: async (app, page) => { await app.go('/wallet', 'wallet_accounts_state_data'); await tap(page, 'wallet_cop_deposit_button'); await page.locator(sel('wallet_deposit_view')).first().waitFor(); await app.stable(); } },
    { vista: 'depósito · error (monto vacío)', prefijos: ['wallet_deposit_'], ir: async (app, page) => { await app.go('/wallet', 'wallet_accounts_state_data'); await tap(page, 'wallet_cop_deposit_button'); await page.locator(sel('wallet_deposit_view')).first().waitFor(); await app.stable(); await tap(page, 'wallet_deposit_submit_button'); await app.stable(); } },
    { vista: 'depósito · snackbar', prefijos: ['wallet_deposit_'], ir: async (app, page) => { await app.go('/wallet', 'wallet_accounts_state_data'); await tap(page, 'wallet_cop_deposit_button'); await page.locator(sel('wallet_deposit_view')).first().waitFor(); await app.stable(); await tap(page, 'wallet_deposit_suggested_item_1000000'); await tap(page, 'wallet_deposit_submit_button'); await page.locator(sel('wallet_deposit_success_snackbar')).first().waitFor({ timeout: 10_000 }); } },
    { vista: 'portafolio', prefijos: ['portfolio_'], ir: async (app) => { await app.go('/portfolio', 'portfolio_overview_state_data'); } },
    { vista: 'actividad · movimientos', prefijos: ['transactions_'], ir: async (app) => { await app.go('/activity', 'transactions_list_state_data'); } },
    { vista: 'no encontrado', prefijos: ['shell_not_found_'], ir: async (app) => { await app.go('/no-existe', 'shell_not_found_view'); } },
];

for (const e of ESTADOS) {
    test.describe(`D2 ${e.vista}`, () => {
        test.use({ viewport: e.vp ?? { width: 390, height: 844 } });
        test(`D2 ids · ${e.vista}`, async ({ app, page, mode }) => {
            test.skip(mode === 'off', 'solo ON');
            await app.boot();
            if (e.login !== false) await app.login();
            await e.ir(app, page);
            const v = page.viewportSize()!;
            const ids = await juntarIds(page, { x: v.width / 2, y: v.height / 2 });
            const inv = leerInventario();
            const esperados = inv.estaticos.filter((i) => e.prefijos.some((p) => i.startsWith(p)));
            const faltan = esperados.filter((i) => !ids.includes(i));
            const fueraDeInventario = ids.filter((i) => !inv.estaticos.includes(i) && !inv.dinamicos.some((r) => r.test(i)));
            app.rec('D2', { vista: e.vista, url: app.path(), ids, faltan, fueraDeInventario });
        });
    });
}

test.describe('D2 onboarding', () => {
    test.use({ viewport: { width: 390, height: 844 } });
    test('D2 ids · onboarding (3 pasos)', async ({ browser, mode }, info) => {
        test.skip(mode === 'off', 'solo ON');
        const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: 'es' });
        const page = await ctx.newPage();
        const vistos = new Set<string>();
        try {
            await page.goto(info.project.use.baseURL + '/');
            await page.locator(sel('onboarding_view')).first().waitFor({ timeout: 30_000 });
            for (let i = 0; i < 3; i++) {
                await page.waitForTimeout(600);
                for (const id of await page.evaluate(() => [...document.querySelectorAll('[flt-semantics-identifier]')].map((x) => x.getAttribute('flt-semantics-identifier')!))) vistos.add(id);
                if (i < 2) await page.locator(sel('onboarding_next_button')).first().click({ timeout: 10_000 }).catch(() => undefined);
            }
        } finally {
            await ctx.close();
        }
        const inv = leerInventario();
        const ids = [...vistos].sort();
        const esperados = inv.estaticos.filter((i) => i.startsWith('onboarding_'));
        fs.appendFileSync(path.join(RESULTS, 'on.jsonl'), JSON.stringify({ case: 'D2', mode: 'on', vp: '390x844', run: info.repeatEachIndex, title: info.title, vista: 'onboarding (3 pasos)', ids, faltan: esperados.filter((i) => !ids.includes(i)) }) + '\n');
    });
});
