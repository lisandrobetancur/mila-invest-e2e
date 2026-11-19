/**
 * Herramientas comunes de las sondas.
 *
 * - En ON se localiza por `[flt-semantics-identifier]` y se guarda el
 *   bounding box de cada objetivo (`results/coords/`).
 * - En OFF se usa ese bounding box (mismo viewport, mismo estado) y se
 *   acciona con `page.mouse` / `page.keyboard`.
 * - En los dos modos se acciona con el mouse en el centro del objetivo, para
 *   que la única diferencia sea el árbol de semantics.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { test as base, type Page, type TestInfo } from '@playwright/test';
import sharp from 'sharp';

export type Mode = 'on' | 'off';
export interface Box { x: number; y: number; width: number; height: number }

export const RESULTS = path.join(__dirname, '..', 'results');
const COORDS = path.join(RESULTS, 'coords');
const SHOTS = path.join(RESULTS, 'shots');
for (const dir of [RESULTS, COORDS, SHOTS]) fs.mkdirSync(dir, { recursive: true });

/** Fracción de píxeles distintos que se tolera entre ON y OFF (cursor que parpadea, etc.). */
export const LAYOUT_TOLERANCE = 0.005;

export const sel = (id: string): string => `[flt-semantics-identifier="${id}"]`;

/** Script que corre antes que la app: onboarding visto + registro de eventos. */
const INIT = `
  try { localStorage.setItem('flutter.mila_invest.onboarding_seen', 'true'); } catch (e) {}
  window.__probe = { nav: [], ptr: [], clicks: [] };
  const wrap = (k) => { const o = history[k]; history[k] = function (...a) { const r = o.apply(this, a); window.__probe.nav.push({ t: performance.now(), url: location.pathname + location.search, k }); return r; }; };
  wrap('pushState'); wrap('replaceState');
  addEventListener('popstate', () => window.__probe.nav.push({ t: performance.now(), url: location.pathname + location.search, k: 'pop' }));
  const desc = (e) => { const el = e.target; if (!el || !el.tagName) return String(el); const n = el.closest && el.closest('[flt-semantics-identifier]'); return el.tagName + (n ? '#' + n.getAttribute('flt-semantics-identifier') : ''); };
  for (const type of ['pointerdown', 'pointerup', 'click', 'touchstart', 'touchend']) {
    addEventListener(type, (e) => window.__probe.ptr.push({ type, t: performance.now(), target: desc(e) }), true);
  }
`;

export interface ActiveInfo { tag: string; cls: string; type: string | null; value: string | null; node: string | null }

export class App {
    readonly vp: string;
    constructor(
        readonly page: Page,
        readonly mode: Mode,
        readonly info: TestInfo,
    ) {
        const v = page.viewportSize()!;
        this.vp = `${v.width}x${v.height}`;
    }

    get run(): number { return this.info.repeatEachIndex; }

    // ---------- registro ----------
    rec(caseId: string, data: Record<string, unknown>): void {
        const line = JSON.stringify({
            case: caseId,
            mode: this.mode,
            vp: this.vp,
            run: this.run,
            title: this.info.title,
            at: new Date().toISOString(),
            maxLayoutDiff: this.layoutChecks.length ? Math.max(...this.layoutChecks.map((c) => c.diff ?? 0)) : null,
            layoutNotes: this.layoutChecks.filter((c) => (c as { note?: string }).note).map((c) => `${c.screen}/${c.id}: ${(c as { note?: string }).note}`),
            ...data,
        });
        fs.appendFileSync(path.join(RESULTS, `${this.mode}.jsonl`), line + '\n');
    }

    // ---------- coordenadas ----------
    private coordFile(screen: string, id: string): string {
        return path.join(COORDS, `${screen}__${id}__${this.vp}.json`.replace(/[^\w.\-]/g, '_'));
    }

    /** Bounding box de [id] en [screen]. ON: lo mide y lo guarda. OFF: lo lee. */
    /** Diferencias de layout ON/OFF medidas en este test (solo OFF). */
    readonly layoutChecks: { screen: string; id: string; diff: number | null }[] = [];

    async box(screen: string, id: string, opts: { timeout?: number; visible?: boolean; check?: boolean } = {}): Promise<Box> {
        const file = this.coordFile(screen, id);
        const shot = file.replace(/\.json$/, '.png');
        const check = opts.check !== false;
        if (this.mode === 'on') {
            const loc = this.page.locator(sel(id)).first();
            await loc.waitFor({ state: opts.visible === false ? 'attached' : 'visible', timeout: opts.timeout ?? 15_000 });
            const b = await loc.boundingBox();
            if (!b) throw new Error(`sin bounding box: ${id}`);
            let prev: { runs: Box[] } = { runs: [] };
            if (fs.existsSync(file)) prev = JSON.parse(fs.readFileSync(file, 'utf8'));
            const runs = [...prev.runs.slice(-9), b];
            fs.writeFileSync(file, JSON.stringify({ screen, id, vp: this.vp, box: b, runs }, null, 1));
            if (check) fs.writeFileSync(shot, await this.page.screenshot({ caret: 'hide' }));
            return b;
        }
        if (!fs.existsSync(file)) throw new Error(`OFF sin coordenadas de ON para ${screen}/${id}@${this.vp}`);
        const b = JSON.parse(fs.readFileSync(file, 'utf8')).box as Box;
        if (check && fs.existsSync(shot)) {
            const onShot = fs.readFileSync(shot);
            const offShot = await this.page.screenshot({ caret: 'hide' });
            const diff = await diffRatio(onShot, offShot);
            let note: string | undefined;
            if (diff > LAYOUT_TOLERANCE) {
                // ¿Layout distinto o solo contenido distinto (p. ej. texto escrito)?
                // Layout igual = la franja alrededor del objetivo no se desplazó y
                // el rectángulo del objetivo es casi el mismo.
                const v = this.page.viewportSize()!;
                const top = Math.max(0, Math.round(b.y - 150));
                const band = { x: 0, y: top, width: v.width, height: Math.min(v.height, Math.round(b.y + b.height + 150)) - top };
                const shift = estimateShift(await grayRegion(onShot, band), await grayRegion(offShot, band), 120).shift;
                const inner = { x: Math.max(0, b.x), y: Math.max(0, b.y), width: Math.min(b.width, v.width - Math.max(0, b.x)), height: Math.min(b.height, v.height - Math.max(0, b.y)) };
                const targetDiff = await diffRatio(onShot, offShot, inner);
                note = `global ${(diff * 100).toFixed(2)} %, desplazamiento ${shift}px, objetivo ${(targetDiff * 100).toFixed(1)} %`;
                if (shift === 0 && targetDiff <= 0.1) {
                    this.layoutChecks.push({ screen, id, diff, note: 'contenido distinto, layout igual: ' + note } as never);
                    return b;
                }
            }
            this.layoutChecks.push({ screen, id, diff, note } as never);
            if (diff > LAYOUT_TOLERANCE) {
                this.rec('LAYOUT', { screen, id, diff, discarded: true, reason: 'la captura OFF no coincide con la ON: las coordenadas no valen' });
                throw new Error(`LAYOUT: ${screen}/${id} difiere ${(diff * 100).toFixed(2)} % de la captura ON; no se usan las coordenadas`);
            }
        }
        return b;
    }

    /** Guarda una caja medida a mano (p. ej. un texto sin id) para que OFF la use. */
    saveBox(screen: string, key: string, b: Box): void {
        fs.writeFileSync(this.coordFile(screen, key), JSON.stringify({ screen, id: key, vp: this.vp, box: b, runs: [b] }, null, 1));
    }
    loadBox(screen: string, key: string): Box {
        return JSON.parse(fs.readFileSync(this.coordFile(screen, key), 'utf8')).box as Box;
    }

    async center(screen: string, id: string): Promise<{ x: number; y: number }> {
        const b = await this.box(screen, id);
        return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    }

    /** Click con el mouse en el centro de [id]. */
    async tap(screen: string, id: string): Promise<void> {
        const c = await this.center(screen, id);
        await this.page.mouse.click(c.x, c.y);
    }

    // ---------- espera de estabilidad (sirve para los dos modos) ----------
    /** Espera a que dos capturas seguidas (100 ms) sean idénticas. */
    async stable(maxMs = 8_000): Promise<number> {
        const t0 = Date.now();
        let prev = '';
        let same = 0;
        while (Date.now() - t0 < maxMs) {
            const h = createHash('md5').update(await this.page.screenshot({ animations: 'allow', caret: 'initial' })).digest('hex');
            if (h === prev) {
                same++;
                if (same >= 1) return Date.now() - t0;
            } else {
                same = 0;
            }
            prev = h;
            await this.page.waitForTimeout(100);
        }
        return -1;
    }

    // ---------- arranque y navegación ----------
    async boot(): Promise<void> {
        await this.page.goto('/');
        await this.page.waitForURL(/\/login$/, { timeout: 30_000 });
        if (this.mode === 'on') {
            await this.page.locator(sel('auth_login_view')).first().waitFor({ state: 'visible', timeout: 15_000 });
        }
        await this.stable();
    }

    async login(): Promise<void> {
        await this.tap('login', 'auth_login_demo_button');
        await this.page.waitForTimeout(200);
        await this.tap('login', 'auth_login_submit_button');
        await this.page.waitForURL(/\/home$/, { timeout: 15_000 });
        if (this.mode === 'on') {
            await this.page.locator(sel('dashboard_home_state_data')).first().waitFor({ state: 'attached', timeout: 15_000 });
        }
        await this.stable();
    }

    /** Navega dentro de la app sin recargar (la sesión vive en memoria). */
    async go(route: string, viewId?: string): Promise<void> {
        await this.page.evaluate((r) => {
            history.pushState({}, '', r);
            dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
        }, route);
        await this.page.waitForURL((u) => u.pathname + u.search === route || u.pathname === route.split('?')[0], { timeout: 15_000 });
        if (this.mode === 'on' && viewId) {
            await this.page.locator(sel(viewId)).first().waitFor({ state: 'visible', timeout: 15_000 });
        }
        await this.stable();
    }

    path(): string {
        const u = new URL(this.page.url());
        return u.pathname + u.search;
    }

    // ---------- lectura ----------
    async active(): Promise<ActiveInfo> {
        return this.page.evaluate(() => {
            const a = document.activeElement as HTMLInputElement | null;
            if (!a) return { tag: 'null', cls: '', type: null, value: null, node: null };
            const n = a.closest?.('[flt-semantics-identifier]');
            return {
                tag: a.tagName,
                cls: typeof a.className === 'string' ? a.className : '',
                type: a.getAttribute('type'),
                value: 'value' in a ? String(a.value) : null,
                node: n ? n.getAttribute('flt-semantics-identifier') : null,
            };
        });
    }

    /** Valor del `<input>` hijo de [id] (requiere el árbol: ON o post-mortem). */
    async fieldValue(id: string): Promise<string | null> {
        return this.page.evaluate((s) => {
            const i = document.querySelector(s)?.querySelector('input, textarea') as HTMLInputElement | null;
            return i ? i.value : null;
        }, sel(id));
    }

    /**
     * Valor que tiene el framework en el campo [id]: se toca el campo y se lee
     * el `<input>` de edición (Flutter le copia su estado al enfocarlo).
     * Mismo procedimiento en los dos modos; en OFF enciende el árbol antes
     * (post-mortem), así que solo se usa al final de un test.
     * `dom` es lo que tenía el `<input>` semántico antes de tocarlo (solo ON
     * o post-mortem; en un campo sin foco puede estar viejo o vacío).
     */
    async readField(id: string): Promise<{ value: string | null; type: string | null; dom: string | null; node: string | null; missing?: boolean }> {
        if (this.mode === 'off' && !(await this.semanticsPresent())) await this.postMortem();
        const loc = this.page.locator(sel(id)).first();
        if (!(await loc.count())) return { value: null, type: null, dom: null, node: null, missing: true };
        const dom = await this.fieldValue(id);
        const b = await loc.boundingBox();
        if (!b) return { value: null, type: null, dom, node: null, missing: true };
        // Un poco a la izquierda del centro: a la derecha suele haber un ícono.
        const x = b.x + b.width * 0.4;
        const y = b.y + b.height / 2;
        // Se sigue `activeElement` 1,2 s: el valor que vale es el que tenía el
        // `<input>` mientras estuvo enfocado (en ON el foco puede irse después).
        let seen: ActiveInfo | null = null;
        const timeline: string[] = [];
        let clicks = 0;
        for (; clicks < 2 && !seen; ) {
            await this.page.mouse.click(x, y);
            clicks++;
            const t0 = Date.now();
            let last = '';
            while (Date.now() - t0 < 1_200) {
                const a = await this.active();
                const tag = `${a.tag}${a.node ? '#' + a.node : ''}`;
                if (tag !== last) timeline.push(`${clicks}:+${Date.now() - t0}ms ${tag}`);
                last = tag;
                if (a.tag === 'INPUT' || a.tag === 'TEXTAREA') seen = a;
                await this.page.waitForTimeout(40);
            }
        }
        return { value: seen?.value ?? null, type: seen?.type ?? null, dom, node: seen?.node ?? null, clicks, timeline } as never;
    }

    async fieldType(id: string): Promise<string | null> {
        return this.page.evaluate((s) => document.querySelector(s)?.querySelector('input')?.getAttribute('type') ?? null, sel(id));
    }

    async ids(): Promise<string[]> {
        return this.page.evaluate(() =>
            [...document.querySelectorAll('[flt-semantics-identifier]')].map((e) => e.getAttribute('flt-semantics-identifier')!),
        );
    }

    async semanticsPresent(): Promise<boolean> {
        return this.page.evaluate(() => !!document.querySelector('flt-semantics'));
    }

    /** OFF: verifica que el árbol siga apagado. Devuelve true si la corrida vale. */
    async offStillOff(caseId: string): Promise<boolean> {
        if (this.mode !== 'off') return true;
        const on = await this.semanticsPresent();
        if (on) this.rec(caseId, { discarded: true, reason: 'flt-semantics apareció en OFF' });
        return !on;
    }

    /** OFF: enciende el árbol activando el placeholder (último paso del test). */
    async postMortem(): Promise<boolean> {
        if (this.mode === 'on') return true;
        const ok = await this.page.evaluate(() => {
            const p = document.querySelector('flt-semantics-placeholder') as HTMLElement | null;
            if (!p) return false;
            p.click();
            return true;
        });
        if (!ok) return false;
        try {
            await this.page.locator('flt-semantics').first().waitFor({ state: 'attached', timeout: 5_000 });
            await this.page.waitForTimeout(300);
            return true;
        } catch {
            return false;
        }
    }

    async probeEvents(): Promise<{ nav: { t: number; url: string; k: string }[]; ptr: { type: string; t: number; target: string }[] }> {
        return this.page.evaluate(() => (window as unknown as { __probe: never }).__probe);
    }

    // ---------- capturas ----------
    /**
     * Compara la pantalla actual con la captura ON de la misma [key].
     * ON: guarda la captura. OFF: devuelve la fracción de píxeles distintos.
     */
    async compareWithOn(key: string, region?: Box): Promise<number | null> {
        const file = path.join(SHOTS, `${key}__${this.vp}.png`);
        const buf = await this.page.screenshot({ caret: 'hide' });
        if (this.mode === 'on') {
            fs.writeFileSync(file, buf);
            return null;
        }
        fs.writeFileSync(file.replace(/\.png$/, '.off.png'), buf);
        if (!fs.existsSync(file)) return null;
        return diffRatio(fs.readFileSync(file), buf, region);
    }
}

export async function diffRatio(a: Buffer, b: Buffer, region?: Box): Promise<number> {
    const load = (x: Buffer) => {
        let s = sharp(x);
        if (region) s = s.extract({ left: Math.round(region.x), top: Math.round(region.y), width: Math.round(region.width), height: Math.round(region.height) });
        return s.removeAlpha().raw().toBuffer({ resolveWithObject: true });
    };
    const [ra, rb] = await Promise.all([load(a), load(b)]);
    if (ra.info.width !== rb.info.width || ra.info.height !== rb.info.height) return 1;
    let diff = 0;
    const n = ra.info.width * ra.info.height;
    for (let i = 0; i < n; i++) {
        const o = i * 3;
        if (Math.abs(ra.data[o] - rb.data[o]) + Math.abs(ra.data[o + 1] - rb.data[o + 1]) + Math.abs(ra.data[o + 2] - rb.data[o + 2]) > 48) diff++;
    }
    return diff / n;
}

/** Gris de una región, para estimar desplazamientos. */
export async function grayRegion(buf: Buffer, r: Box): Promise<{ d: Uint8Array; w: number; h: number }> {
    const { data, info } = await sharp(buf)
        .extract({ left: Math.round(r.x), top: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) })
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });
    return { d: new Uint8Array(data), w: info.width, h: info.height };
}

/**
 * Cuánto subió el contenido de [a] a [b] (px). Positivo = el contenido se
 * movió hacia arriba (scroll hacia abajo). `score` es el error medio del
 * mejor ajuste; `flat` indica que la región no tiene textura suficiente.
 */
export function estimateShift(a: { d: Uint8Array; w: number; h: number }, b: { d: Uint8Array; w: number; h: number }, maxShift = 600): { shift: number; score: number; zeroScore: number } {
    const { w, h } = a;
    const minOverlap = 80;
    let best = 0;
    let bestScore = Infinity;
    let zeroScore = Infinity;
    for (let s = -maxShift; s <= maxShift; s++) {
        const y0 = Math.max(0, -s);
        const y1 = Math.min(h, h - s);
        if (y1 - y0 < minOverlap) continue;
        let sum = 0;
        let cnt = 0;
        for (let y = y0; y < y1; y += 2) {
            const ra = (y + s) * w;
            const rb = y * w;
            for (let x = 0; x < w; x += 3) {
                sum += Math.abs(a.d[ra + x] - b.d[rb + x]);
                cnt++;
            }
        }
        const score = sum / cnt;
        if (s === 0) zeroScore = score;
        if (score < bestScore - 1e-9) {
            bestScore = score;
            best = s;
        }
    }
    return { shift: best, score: bestScore, zeroScore };
}

// ---------- fixture ----------
export const test = base.extend<{ app: App; mode: Mode }>({
    mode: async ({}, use, info) => {
        await use(info.project.name === 'off' ? 'off' : 'on');
    },
    app: async ({ page, mode }, use, info) => {
        await page.addInitScript(INIT);
        await use(new App(page, mode, info));
    },
});

export { expect } from '@playwright/test';

export const DELAYS = [0, 50, 100, 250, 500];
export const KEY_DELAYS = [0, 50];
