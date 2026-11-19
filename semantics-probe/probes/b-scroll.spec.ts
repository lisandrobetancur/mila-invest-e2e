/**
 * B · Scroll (P4, P6).
 *
 * B1–B8: puntero sobre un tipo de hijo, 10 × `mouse.wheel(0, 100)` con 150 ms
 * entre pasos. El desplazamiento de cada paso se mide igual en los dos
 * modos: estimando cuánto se movió el contenido entre capturas
 * consecutivas. En ON además se registra el `scrollTop` de los scrollables
 * del árbol (`flt-semantics-scroll-overflow`).
 *
 * B9: latencia del tap (pointerup → pushState), medida dentro de la página.
 * B10: arrastre táctil de 300 px por CDP, con screencast para fechar el
 * primer frame en que la lista se mueve.
 */
import fs from 'node:fs';
import path from 'node:path';

import type { CDPSession } from '@playwright/test';
import sharp from 'sharp';

import { type App, type Box, RESULTS, estimateShift, expect, grayRegion, sel, test } from '../lib/probe';

const PICKS = path.join(RESULTS, 'picks.json');
const loadPicks = (): Record<string, string> => (fs.existsSync(PICKS) ? JSON.parse(fs.readFileSync(PICKS, 'utf8')) : {});
const savePick = (k: string, v: string): void => {
    const p = loadPicks();
    p[k] = v;
    fs.writeFileSync(PICKS, JSON.stringify(p, null, 1));
};

/** ON: scrollTop de cada scrollable del árbol. */
async function scrollTops(app: App): Promise<{ id: string | null; top: number }[] | null> {
    if (app.mode !== 'on') return null;
    return app.page.evaluate(() =>
        [...document.querySelectorAll('flt-semantics-scroll-overflow')].map((o) => {
            const p = o.parentElement!;
            return { id: p.getAttribute('flt-semantics-identifier') ?? p.id, top: p.scrollTop };
        }),
    );
}

/** Primer nodo cuyo id empieza con [prefix] y está entero dentro del viewport. */
async function firstVisible(app: App, prefix: string): Promise<string | null> {
    return app.page.evaluate(
        ({ prefix }) => {
            const h = innerHeight;
            for (const e of document.querySelectorAll(`[flt-semantics-identifier^="${prefix}"]`)) {
                const id = e.getAttribute('flt-semantics-identifier')!;
                if (/_(text|price_text|change_text|country_text)$/.test(id)) continue;
                const r = e.getBoundingClientRect();
                if (r.height > 0 && r.top >= 60 && r.bottom <= h - 90) return id;
            }
            return null;
        },
        { prefix },
    );
}

/** Un texto sin id, sin rol interactivo, dentro de la franja [y0, y1]. */
async function plainTextBox(app: App, y0: number, y1: number, text?: string): Promise<Box | null> {
    return app.page.evaluate(
        ({ y0, y1, text }) => {
            for (const e of document.querySelectorAll('flt-semantics')) {
                if (e.hasAttribute('flt-semantics-identifier') || e.hasAttribute('flt-tappable') || e.querySelector('input')) continue;
                if (e.querySelector('flt-semantics')) continue;
                const t = (e.textContent ?? '').trim() || e.getAttribute('aria-label') || '';
                if (!t || (text && t !== text)) continue;
                const r = e.getBoundingClientRect();
                if (r.height > 0 && r.top >= y0 && r.bottom <= y1) return { x: r.x, y: r.y, width: r.width, height: r.height, t } as never;
            }
            return null;
        },
        { y0, y1, text },
    );
}

interface Start { label: string; box: Box }

async function wheelSeries(app: App, caseId: string, start: Start, region: Box): Promise<void> {
    const { page } = app;
    const cx = start.box.x + start.box.width / 2;
    const cy = start.box.y + start.box.height / 2;
    await page.mouse.move(cx, cy);
    await page.waitForTimeout(300);
    let prev = await page.screenshot();
    const steps: { i: number; shift: number; score: number; tops: unknown; t: number }[] = [];
    const tops0 = await scrollTops(app);
    for (let i = 1; i <= 10; i++) {
        await page.mouse.wheel(0, 100);
        await page.waitForTimeout(150);
        const cur = await page.screenshot();
        const s = estimateShift(await grayRegion(prev, region), await grayRegion(cur, region));
        steps.push({ i, shift: s.shift, score: Math.round(s.score * 10) / 10, tops: await scrollTops(app), t: Date.now() });
        prev = cur;
    }
    // Una captura más después de 600 ms: ¿siguió moviéndose (scroll animado)?
    await page.waitForTimeout(600);
    const late = estimateShift(await grayRegion(prev, region), await grayRegion(await page.screenshot(), region)).shift;
    const shifts = steps.map((s) => s.shift);
    // Tope: a partir de un paso todos dan 0 (se llegó al final).
    let topeDesde = -1;
    for (let i = shifts.length - 1; i >= 0 && shifts[i] === 0; i--) topeDesde = i + 1;
    // El paso anterior al primer 0 puede ser parcial (llegó al final): no es salto.
    const ultimoUtil = topeDesde === -1 ? 11 : topeDesde - 1;
    const saltos = steps
        .filter((s) => Math.abs(s.shift - 100) > 50 && s.i < ultimoUtil + (s.shift > 100 ? 1 : 0))
        .map((s) => ({ i: s.i, shift: s.shift }));
    const valid = await app.offStillOff(caseId);
    app.rec(caseId, {
        start: start.label, startBox: start.box, region, shifts, total: shifts.reduce((a, b) => a + b, 0), late,
        topeDesde, saltos, tops0, steps, url: app.path(), valid,
    });
}

async function openTicket(app: App): Promise<void> {
    await app.go('/market/instrument/ECOPETROL-CO', 'market_detail_state_data');
    await app.tap('detail', 'market_detail_buy_button');
    await app.page.waitForURL(/\/orders\/ticket\//);
    if (app.mode === 'on') await app.page.locator(sel('orders_ticket_view')).first().waitFor({ state: 'visible' });
    await app.stable();
}

// ---------------- B1–B4, B6, B7 a 390×844 ----------------
test.describe('390x844', () => {
    test.use({ viewport: { width: 390, height: 844 } });
    const REGION: Box = { x: 0, y: 70, width: 390, height: 680 };

    const marketStarts: [string, string, (app: App) => Promise<Start>][] = [
        ['B1', 'ítem ECOPETROL-CO', async (app) => ({ label: 'market_list_instrument_item_ECOPETROL-CO', box: await app.box('market', 'market_list_instrument_item_ECOPETROL-CO') })],
        ['B2', 'campo de búsqueda', async (app) => ({ label: 'market_list_search_field', box: await app.box('market', 'market_list_search_field') })],
        ['B3', 'chip CO', async (app) => ({ label: 'market_list_country_co_chip', box: await app.box('market', 'market_list_country_co_chip') })],
        ['B4', 'título de la vista', async (app) => {
            // El título del app bar no tiene nodo en el árbol (ni con id ni sin él):
            // se usa su posición en pantalla, igual en los dos modos.
            if (app.mode === 'on') app.rec('B4-nota', { titleNode: await plainTextBox(app, 0, 70, 'Mercado') });
            return { label: 'título "Mercado" (sin nodo en el árbol; punto fijo 58,28)', box: { x: 16, y: 16, width: 84, height: 24 } };
        }],
        ['B4b', 'texto no interactivo dentro de la lista', async (app) => ({ label: 'market_list_status_co_text', box: await app.box('market', 'market_list_status_co_text') })],
    ];

    for (const [id, label, start] of marketStarts) {
        test(`${id} scroll /market sobre ${label}`, async ({ app }) => {
            await app.boot();
            await app.login();
            await app.go('/market', 'market_list_state_data');
            await wheelSeries(app, id, await start(app), REGION);
        });
    }

    test('B6 scroll /home sobre un mover', async ({ app }) => {
        await app.boot();
        await app.login();
        if (app.mode === 'on') {
            const id = await firstVisible(app, 'dashboard_mover_item_');
            if (!id) throw new Error('ningún dashboard_mover_item_ visible');
            savePick('B6', id);
        }
        const id = loadPicks().B6;
        await wheelSeries(app, 'B6', { label: id, box: await app.box('home', id) }, REGION);
    });

    test('B7 scroll /activity sobre un movimiento', async ({ app }) => {
        await app.boot();
        await app.login();
        await app.go('/activity', 'transactions_list_state_data');
        if (app.mode === 'on') {
            const id = await firstVisible(app, 'transactions_list_item_');
            if (!id) throw new Error('ningún transactions_list_item_ visible');
            savePick('B7', id);
        }
        const id = loadPicks().B7;
        await wheelSeries(app, 'B7', { label: id, box: await app.box('activity', id) }, REGION);
    });

    // ---------------- B9 latencia del tap ----------------
    test('B9 latencia del tap en un ítem de /market', async ({ app, page }) => {
        await app.boot();
        await app.login();
        await app.go('/market', 'market_list_state_data');
        const c = await app.center('market', 'market_list_instrument_item_ECOPETROL-CO');
        await page.mouse.move(c.x, c.y);
        await page.waitForTimeout(200);
        await page.mouse.down();
        await page.mouse.up();
        const reached = await page.waitForURL(/\/market\/instrument\/ECOPETROL-CO/, { timeout: 5_000 }).then(() => true, () => false);
        const ev = await app.probeEvents();
        const down = [...ev.ptr].reverse().find((p) => p.type === 'pointerdown');
        const up = [...ev.ptr].reverse().find((p) => p.type === 'pointerup');
        const nav = ev.nav.find((n) => n.url.includes('/market/instrument/ECOPETROL-CO') && up && n.t >= up.t);
        const valid = await app.offStillOff('B9');
        app.rec('B9', {
            reached,
            upToNav: nav && up ? Math.round((nav.t - up.t) * 10) / 10 : null,
            downToNav: nav && down ? Math.round((nav.t - down.t) * 10) / 10 : null,
            downTarget: down?.target, upTarget: up?.target, valid,
        });
        expect(reached).toBe(true);
    });
});

// ---------------- B5 /register 390×600 ----------------
test.describe('390x600', () => {
    test.use({ viewport: { width: 390, height: 600 } });
    const REGION: Box = { x: 0, y: 70, width: 390, height: 520 };

    test('B5 scroll /register sobre el campo de nombre', async ({ app }) => {
        await app.boot();
        await app.go('/register', 'auth_register_view');
        await wheelSeries(app, 'B5', { label: 'auth_register_name_field', box: await app.box('register', 'auth_register_name_field') }, REGION);
    });

    test('B5b scroll /register sobre un texto no interactivo', async ({ app }) => {
        await app.boot();
        await app.go('/register', 'auth_register_view');
        if (app.mode === 'on') {
            const b = await plainTextBox(app, 60, 560);
            if (!b) throw new Error('no encontré un texto sin id en /register');
            app.saveBox('register', 'B5b-text', b);
        }
        const b = app.loadBox('register', 'B5b-text');
        await wheelSeries(app, 'B5b', { label: `texto "${(b as unknown as { t?: string }).t ?? '?'}" (sin id)`, box: b }, REGION);
    });

    test('B8 scroll en el ticket sobre el campo de cantidad', async ({ app }) => {
        await app.boot();
        await app.login();
        await openTicket(app);
        // La región: del borde superior del ticket hacia abajo.
        await wheelSeries(app, 'B8', { label: 'orders_ticket_quantity_field', box: await app.box('ticket', 'orders_ticket_quantity_field') }, { x: 0, y: 60, width: 390, height: 530 });
    });
});

// ---------------- B10 arrastre táctil ----------------
test.describe('táctil 390x844', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
    const REGION: Box = { x: 0, y: 70, width: 390, height: 680 };

    async function drag(app: App, cdp: CDPSession, x: number, y: number): Promise<{ t0: number; frames: { ts: number; data: Buffer }[] }> {
        const frames: { ts: number; data: Buffer }[] = [];
        cdp.on('Page.screencastFrame', (f) => {
            frames.push({ ts: (f.metadata.timestamp ?? 0) * 1000, data: Buffer.from(f.data, 'base64') });
            void cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => undefined);
        });
        await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
        await app.page.waitForTimeout(300);
        const t0 = Date.now();
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        for (let i = 1; i <= 20; i++) {
            await app.page.waitForTimeout(16);
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - 15 * i }] });
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await app.page.waitForTimeout(1500);
        await cdp.send('Page.stopScreencast');
        return { t0, frames };
    }

    const starts: [string, string, (app: App) => Promise<Box>][] = [
        ['B10', 'ítem ECOPETROL-CO', (app) => app.box('market', 'market_list_instrument_item_ECOPETROL-CO')],
        ['B10b', 'texto no interactivo (market_list_status_co_text)', (app) => app.box('market', 'market_list_status_co_text')],
    ];

    for (const [id, label, startBox] of starts) {
        test(`${id} arrastre táctil de 300 px desde ${label}`, async ({ app, page }) => {
            await app.boot();
            await app.login();
            await app.go('/market', 'market_list_state_data');
            const b = await startBox(app);
            const base = await page.screenshot();
            const cdp = await page.context().newCDPSession(page);
            const { t0, frames } = await drag(app, cdp, b.x + b.width / 2, b.y + b.height / 2);
            const g0 = await grayRegion(base, REGION);
            const series: { dt: number; shift: number }[] = [];
            for (const f of frames) {
                const png = await sharp(f.data).png().toBuffer();
                const meta = await sharp(png).metadata();
                if (meta.width !== 390) continue;
                series.push({ dt: Math.round(f.ts - t0), shift: estimateShift(g0, await grayRegion(png, REGION)).shift });
            }
            const firstMove = series.find((s) => s.dt >= 0 && Math.abs(s.shift) >= 5);
            const final = estimateShift(g0, await grayRegion(await page.screenshot(), REGION)).shift;
            const url = app.path();
            const ev = await app.probeEvents();
            const valid = await app.offStillOff(id);
            app.rec(id, {
                start: label, timeToMove: firstMove?.dt ?? null, final, openedDetail: /instrument/.test(url), url,
                series: series.filter((s) => s.dt >= -50).slice(0, 40), touchTargets: ev.ptr.filter((p) => p.type.startsWith('touch') || p.type.startsWith('pointer')).slice(-4), valid,
            });
            expect(/instrument/.test(url), 'el arrastre no debe abrir el detalle').toBe(false);
        });
    }
});
