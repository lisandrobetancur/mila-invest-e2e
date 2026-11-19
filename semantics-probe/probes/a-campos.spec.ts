/**
 * A · Campos de texto (P3, P2).
 *
 * A1–A5: secuencia de teclado con 0/50/100/250/500 ms entre el click y la
 * primera tecla, y `keyboard.type` a 0 y 50 ms por tecla. Se registra qué
 * quedó escrito, dónde quedó `document.activeElement` después de cada paso,
 * y el resultado. A6–A10: click en el control vecino con texto a medio
 * escribir y seguir tecleando.
 *
 * En los dos modos el click es `page.mouse.click` en el centro del objetivo
 * (en ON el centro sale del nodo; en OFF, de la corrida ON).
 */
import path from 'node:path';

import { type App, DELAYS, KEY_DELAYS, RESULTS, diffRatio, expect, test } from '../lib/probe';

test.use({ viewport: { width: 390, height: 844 } });

const SEL_ALL = process.platform === 'darwin' ? 'Meta+A' : 'Control+A';

async function step(app: App, log: unknown[], name: string): Promise<void> {
    log.push({ step: name, t: Date.now(), url: app.path(), active: await app.active() });
}

for (const d of DELAYS) {
    for (const k of KEY_DELAYS) {
        const combo = `espera ${d}ms, tecla ${k}ms`;

        test(`A1 login · ${combo}`, async ({ app, page }) => {
            const log: unknown[] = [];
            await app.boot();
            await app.tap('login', 'auth_login_email_field');
            await step(app, log, 'click email');
            await page.waitForTimeout(d);
            await page.keyboard.type('demo@milainvest.app', { delay: k });
            await step(app, log, 'email tecleado');
            await page.keyboard.press('Enter');
            await step(app, log, 'Enter 1');
            await page.keyboard.type('Demo1234!', { delay: k });
            await step(app, log, 'password tecleada');
            await page.keyboard.press('Enter');
            const home = await page.waitForURL(/\/home$/, { timeout: 5_000 }).then(() => true, () => false);
            await step(app, log, 'Enter 2');
            const valid = await app.offStillOff('A1');
            let email: unknown = null;
            let password: unknown = null;
            if (!home) {
                email = await app.readField('auth_login_email_field');
                password = await app.readField('auth_login_password_field');
            }
            app.rec('A1', { d, k, home, email, password, valid, postMortem: !home && app.mode === 'off', log });
            expect(home, 'debe terminar en /home').toBe(true);
        });

        test(`A2 registro · ${combo}`, async ({ app, page }) => {
            const log: unknown[] = [];
            await app.boot();
            await app.go('/register', 'auth_register_view');
            await app.tap('register', 'auth_register_country_co_chip');
            await app.stable();
            await step(app, log, 'click país CO');
            await app.tap('register', 'auth_register_name_field');
            await step(app, log, 'click nombre');
            await page.waitForTimeout(d);
            await page.keyboard.type('Ana Prueba', { delay: k });
            await step(app, log, 'nombre');
            await page.keyboard.press('Enter');
            await step(app, log, 'Enter 1');
            await page.keyboard.type('ana.prueba@example.com', { delay: k });
            await step(app, log, 'email');
            await page.keyboard.press('Enter');
            await step(app, log, 'Enter 2');
            await page.keyboard.type('1234567890', { delay: k });
            await step(app, log, 'documento');
            await page.keyboard.press('Enter');
            await step(app, log, 'Enter 3');
            await page.keyboard.type('Clave1234', { delay: k });
            await step(app, log, 'password');
            const valid = await app.offStillOff('A2');
            const raw = {
                name: await app.readField('auth_register_name_field'),
                email: await app.readField('auth_register_email_field'),
                document: await app.readField('auth_register_document_field'),
                password: await app.readField('auth_register_password_field'),
            };
            const values = { name: raw.name.value, email: raw.email.value, document: raw.document.value, password: raw.password.value };
            const ok =
                values.name === 'Ana Prueba' &&
                values.email === 'ana.prueba@example.com' &&
                values.document === '1234567890' &&
                values.password === 'Clave1234';
            app.rec('A2', { d, k, ok, values, raw, valid, postMortem: app.mode === 'off', log });
            expect(values).toEqual({ name: 'Ana Prueba', email: 'ana.prueba@example.com', document: '1234567890', password: 'Clave1234' });
        });

        /**
         * A2c: igual que A2 pero tocando cada campo antes de teclear (con la
         * misma espera [d]). En A2 literal, el Enter del correo lleva el foco
         * a los chips de tipo de documento (orden de foco de la app).
         */
        test(`A2c registro tocando cada campo · ${combo}`, async ({ app, page }) => {
            const log: unknown[] = [];
            await app.boot();
            await app.go('/register', 'auth_register_view');
            await app.tap('register', 'auth_register_country_co_chip');
            await app.stable();
            const campos: [string, string][] = [
                ['auth_register_name_field', 'Ana Prueba'],
                ['auth_register_email_field', 'ana.prueba@example.com'],
                ['auth_register_document_field', '1234567890'],
                ['auth_register_password_field', 'Clave1234'],
            ];
            for (const [id, texto] of campos) {
                await app.tap('register-co', id);
                await step(app, log, `click ${id}`);
                await page.waitForTimeout(d);
                await page.keyboard.type(texto, { delay: k });
                await step(app, log, `tecleado ${id}`);
            }
            const valid = await app.offStillOff('A2c');
            const raw: Record<string, unknown> = {};
            const values: Record<string, string | null> = {};
            for (const [id] of campos) {
                const r = await app.readField(id);
                raw[id] = r;
                values[id] = r.value;
            }
            const ok = campos.every(([id, t]) => values[id] === t);
            app.rec('A2c', { d, k, ok, values, raw, valid, postMortem: app.mode === 'off', log });
            expect(ok, JSON.stringify(values)).toBe(true);
        });

        test(`A3 búsqueda · ${combo}`, async ({ app, page }) => {
            const log: unknown[] = [];
            await app.boot();
            await app.login();
            await app.go('/market', 'market_list_view');
            await app.tap('market', 'market_list_search_field');
            await step(app, log, 'click buscador');
            await page.waitForTimeout(d);
            await page.keyboard.type('eco', { delay: k });
            const reads: unknown[] = [];
            const t0 = Date.now();
            for (const at of [0, 400, 1000]) {
                const wait = at - (Date.now() - t0);
                if (wait > 0) await page.waitForTimeout(wait);
                const a = await app.active();
                const field = app.mode === 'on' ? await app.fieldValue('market_list_search_field') : a.value;
                reads.push({ at, field, activeValue: a.value, active: a, q: new URL(page.url()).searchParams.get('q') });
            }
            const valid = await app.offStillOff('A3');
            const last = reads[2] as { field: string | null; q: string | null };
            app.rec('A3', { d, k, reads, valid, ok: last.field === 'eco' && last.q === 'eco', log });
            expect(last.field).toBe('eco');
        });
    }
}

for (const k of KEY_DELAYS) {
    test(`A3b búsqueda con pausa · tecla ${k}ms`, async ({ app, page }) => {
        await app.boot();
        await app.login();
        await app.go('/market', 'market_list_view');
        await app.tap('market', 'market_list_search_field');
        await page.waitForTimeout(500);
        await page.keyboard.type('grupo ', { delay: k });
        await page.waitForTimeout(500);
        const mid = await app.active();
        const midQ = new URL(page.url()).searchParams.get('q');
        await page.keyboard.type('aval', { delay: k });
        await page.waitForTimeout(1000);
        const a = await app.active();
        const field = app.mode === 'on' ? await app.fieldValue('market_list_search_field') : a.value;
        const q = new URL(page.url()).searchParams.get('q');
        const valid = await app.offStillOff('A3b');
        app.rec('A3b', { k, mid: { value: mid.value, q: midQ }, field, q, active: a, valid, ok: field === 'grupo aval' });
        expect(field).toBe('grupo aval');
    });
}

for (const d of DELAYS) {
    for (const k of KEY_DELAYS) {
        const combo = `espera ${d}ms, tecla ${k}ms`;

        test(`A4 depósito · ${combo}`, async ({ app, page }) => {
            await app.boot();
            await app.login();
            await app.go('/wallet', 'wallet_accounts_state_data');
            await app.tap('wallet', 'wallet_cop_deposit_button');
            await page.waitForURL(/\/wallet\/deposit\/COP/i, { timeout: 10_000 });
            if (app.mode === 'on') await page.locator('[flt-semantics-identifier="wallet_deposit_view"]').first().waitFor({ state: 'visible' });
            await app.stable();
            await app.tap('deposit', 'wallet_deposit_amount_field');
            const afterClick = await app.active();
            await page.waitForTimeout(d);
            await page.keyboard.type('250000', { delay: k });
            await page.waitForTimeout(300);
            const a = await app.active();
            const field = app.mode === 'on' ? await app.fieldValue('wallet_deposit_amount_field') : a.value;
            const digits = (field ?? '').replace(/\D/g, '');
            const valid = await app.offStillOff('A4');
            app.rec('A4', { d, k, field, digits, afterClick, active: a, valid, ok: digits === '250000' });
            expect(digits).toBe('250000');
        });

        test(`A5 ticket · ${combo}`, async ({ app, page }) => {
            await app.boot();
            await app.login();
            await app.go('/market/instrument/ECOPETROL-CO', 'market_detail_state_data');
            await app.tap('detail', 'market_detail_buy_button');
            await page.waitForURL(/\/orders\/ticket\//, { timeout: 10_000 });
            if (app.mode === 'on') await page.locator('[flt-semantics-identifier="orders_ticket_view"]').first().waitFor({ state: 'visible' });
            await app.stable();
            await app.tap('ticket', 'orders_ticket_quantity_field');
            const afterClick = await app.active();
            await page.waitForTimeout(d);
            await page.keyboard.press(SEL_ALL);
            await page.keyboard.type('12', { delay: k });
            await page.waitForTimeout(300);
            const a = await app.active();
            const field = app.mode === 'on' ? await app.fieldValue('orders_ticket_quantity_field') : a.value;
            const valid = await app.offStillOff('A5');
            app.rec('A5', { d, k, field, afterClick, active: a, valid, ok: field === '12' });
            expect(field).toBe('12');
        });
    }
}

/** Variante solo-ON: tocar el campo "apenas aparece" el nodo, sin esperar a que la pantalla se quede quieta. */
for (const d of DELAYS) {
    test(`A4-eager depósito apenas aparece el nodo · espera ${d}ms`, async ({ app, page, mode }) => {
        test.skip(mode === 'off', 'en OFF no hay nodo que aparezca');
        await app.boot();
        await app.login();
        await app.go('/wallet', 'wallet_accounts_state_data');
        await app.tap('wallet', 'wallet_cop_deposit_button');
        const field = page.locator('[flt-semantics-identifier="wallet_deposit_amount_field"]').first();
        await field.waitFor({ state: 'visible' });
        const b = (await field.boundingBox())!;
        await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
        await page.waitForTimeout(d);
        await page.keyboard.type('250000');
        await page.waitForTimeout(300);
        const v = await app.fieldValue('wallet_deposit_amount_field');
        const digits = (v ?? '').replace(/\D/g, '');
        app.rec('A4-eager', { d, k: 0, field: v, digits, box: b, active: await app.active(), ok: digits === '250000' });
        expect(digits).toBe('250000');
    });

    test(`A5-eager ticket apenas aparece el nodo · espera ${d}ms`, async ({ app, page, mode }) => {
        test.skip(mode === 'off', 'en OFF no hay nodo que aparezca');
        await app.boot();
        await app.login();
        await app.go('/market/instrument/ECOPETROL-CO', 'market_detail_state_data');
        await app.tap('detail', 'market_detail_buy_button');
        const field = page.locator('[flt-semantics-identifier="orders_ticket_quantity_field"]').first();
        await field.waitFor({ state: 'visible' });
        const b = (await field.boundingBox())!;
        await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
        await page.waitForTimeout(d);
        await page.keyboard.press(SEL_ALL);
        await page.keyboard.type('12');
        await page.waitForTimeout(300);
        const v = await app.fieldValue('orders_ticket_quantity_field');
        app.rec('A5-eager', { d, k: 0, field: v, box: b, active: await app.active(), ok: v === '12' });
        expect(v).toBe('12');
    });
}

// ---------------- A6–A10: click en el vecino y seguir tecleando ----------------

interface Vecino {
    id: string;
    field: string;
    neighbor: string;
    screen: string;
    prep: (app: App) => Promise<void>;
    partial: string;
    probeKey: string;
    effect: (app: App) => Promise<unknown>;
    selectAll?: boolean;
}

const VECINOS: Vecino[] = [
    {
        id: 'A6', field: 'auth_login_password_field', neighbor: 'auth_login_password_toggle', screen: 'login',
        prep: async (app) => { await app.boot(); }, partial: 'Demo12', probeKey: 'x',
        effect: async (app) => (app.mode === 'on' ? app.fieldType('auth_login_password_field') : (await app.active()).type),
    },
    {
        id: 'A7', field: 'auth_register_password_field', neighbor: 'auth_register_password_toggle', screen: 'register',
        prep: async (app) => { await app.boot(); await app.go('/register', 'auth_register_view'); }, partial: 'Abc12', probeKey: 'x',
        effect: async (app) => (app.mode === 'on' ? app.fieldType('auth_register_password_field') : (await app.active()).type),
    },
    {
        id: 'A8', field: 'market_list_search_field', neighbor: 'market_list_search_clear_icon_button', screen: 'market',
        prep: async (app) => { await app.boot(); await app.login(); await app.go('/market', 'market_list_view'); }, partial: 'gru', probeKey: 'x',
        effect: async (app) => new URL(app.page.url()).searchParams.get('q'),
    },
    {
        id: 'A9+', field: 'orders_ticket_quantity_field', neighbor: 'orders_ticket_quantity_increase_stepper', screen: 'ticket',
        prep: async (app) => { await app.boot(); await app.login(); await app.go('/market/instrument/ECOPETROL-CO', 'market_detail_state_data'); await app.tap('detail', 'market_detail_buy_button'); await app.page.waitForURL(/\/orders\/ticket\//); if (app.mode === 'on') await app.page.locator('[flt-semantics-identifier="orders_ticket_view"]').first().waitFor({ state: 'visible' }); await app.stable(); },
        partial: '3', probeKey: '7', selectAll: true,
        effect: async () => null,
    },
    {
        id: 'A9-', field: 'orders_ticket_quantity_field', neighbor: 'orders_ticket_quantity_decrease_stepper', screen: 'ticket',
        prep: async (app) => { await app.boot(); await app.login(); await app.go('/market/instrument/ECOPETROL-CO', 'market_detail_state_data'); await app.tap('detail', 'market_detail_buy_button'); await app.page.waitForURL(/\/orders\/ticket\//); if (app.mode === 'on') await app.page.locator('[flt-semantics-identifier="orders_ticket_view"]').first().waitFor({ state: 'visible' }); await app.stable(); },
        partial: '3', probeKey: '7', selectAll: true,
        effect: async () => null,
    },
    {
        id: 'A10', field: 'wallet_deposit_amount_field', neighbor: 'wallet_deposit_suggested_item_1000000', screen: 'deposit',
        prep: async (app) => { await app.boot(); await app.login(); await app.go('/wallet', 'wallet_accounts_state_data'); await app.tap('wallet', 'wallet_cop_deposit_button'); await app.page.waitForURL(/\/wallet\/deposit\//i); if (app.mode === 'on') await app.page.locator('[flt-semantics-identifier="wallet_deposit_view"]').first().waitFor({ state: 'visible' }); await app.stable(); },
        partial: '25000', probeKey: '7',
        effect: async () => null,
    },
];

for (const v of VECINOS) {
    test(`${v.id} vecino · ${v.field} → ${v.neighbor}`, async ({ app, page }) => {
        await v.prep(app);
        await app.tap(v.screen, v.field);
        await page.waitForTimeout(500);
        if (v.selectAll) await page.keyboard.press(SEL_ALL);
        await page.keyboard.type(v.partial, { delay: 50 });
        await page.waitForTimeout(300);
        const before = await app.active();
        const valueBefore = app.mode === 'on' ? await app.fieldValue(v.field) : before.value;
        const effectBefore = await v.effect(app);
        // El vecino. En A8 el ícono aparece recién con texto.
        await app.stable();
        const fb = await app.box(v.screen, v.field, { check: false });
        const clip = { x: fb.x, y: fb.y, width: fb.width * 0.7, height: fb.height };
        const r0 = await page.screenshot({ clip, caret: 'hide' });
        await app.tap(v.screen + '-con-texto', v.neighbor);
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(RESULTS, 'shots', `${v.id}-vecino-${app.mode}-r${app.run}.png`) });
        const cambioVisual = await diffRatio(r0, await page.screenshot({ clip, caret: 'hide' }));
        const afterNeighbor = await app.active();
        const valueAfterNeighbor = app.mode === 'on' ? await app.fieldValue(v.field) : afterNeighbor.value;
        const effectAfter = await v.effect(app);
        await page.keyboard.type(v.probeKey);
        await page.waitForTimeout(300);
        const afterKey = await app.active();
        const ptr = (await app.probeEvents()).ptr.slice(-12);
        const q = new URL(page.url()).searchParams.get('q');
        const valid = await app.offStillOff(v.id);
        const final = await app.readField(v.field);
        const finalValue = final.value;
        const keyEntered = (finalValue ?? '').includes(v.probeKey);
        app.rec(v.id, {
            field: v.field, neighbor: v.neighbor, before, valueBefore, effectBefore,
            afterNeighbor, valueAfterNeighbor, effectAfter, cambioVisual, afterKey, final, finalValue, finalType: final.type, q, keyEntered, valid, ptr,
        });
    });
}
