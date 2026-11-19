/**
 * Genera `src/screenplay/ids/ids.generated.ts` desde el inventario de
 * identificadores semánticos de la app (`docs/semantics-ids.md`).
 *
 * ```bash
 * npm run ids:sync     # regenera el archivo
 * npm run ids:check    # regenera en memoria y falla si difiere (corre en CI)
 * ```
 *
 * La app es la fuente única: si cambia un id, la suite se entera acá y no a
 * mitad de un escenario.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { env } from '../src/config/env';

// Los dos npm scripts corren desde la raíz del repo, igual que el default de
// `MILA_APP_PATH` (`../mila-invest-app`), que es relativo a ella.
const SOURCE = resolve(process.cwd(), env.milaAppPath, 'docs/semantics-ids.md');
const TARGET = resolve(process.cwd(), 'src/screenplay/ids/ids.generated.ts');

/** Nombre del objeto exportado para cada sección `##` del inventario. */
const EXPORTED_AS: Record<string, string> = {
    shell: 'ShellIds',
    app_cross: 'AppCrossIds',
    authentication: 'AuthIds',
    dashboard: 'DashboardIds',
    market: 'MarketIds',
    orders: 'OrdersIds',
    wallet: 'WalletIds',
    portfolio: 'PortfolioIds',
    transactions: 'TransactionsIds',
};

interface StaticId {
    readonly kind: 'static';
    readonly name: string;
    readonly id: string;
    readonly note: string;
}

interface DynamicId {
    readonly kind: 'dynamic';
    readonly name: string;
    readonly prefix: string;
    readonly param: string;
    readonly note: string;
}

type Entry = StaticId | DynamicId;

interface Feature {
    readonly title: string;
    readonly exportedAs: string;
    readonly entries: Entry[];
}

interface Derived {
    readonly name: string;
    readonly suffix: string;
    readonly note: string;
}

const camel = (snake: string): string =>
    snake
        .split('_')
        .filter(Boolean)
        .map((part, index) =>
            index === 0 ? part : part[0].toUpperCase() + part.slice(1),
        )
        .join('');

/** Fila de una tabla markdown: devuelve sus celdas ya limpias. */
const cells = (line: string): string[] =>
    line
        .slice(1, -1)
        .split('|')
        .map((cell) => cell.trim());

const unquote = (cell: string): string => cell.replace(/`/g, '').trim();

const isTableRow = (line: string): boolean =>
    line.startsWith('|') && line.endsWith('|') && !/^\|[\s|:-]+\|$/.test(line);

/**
 * Ids que un componente deriva del id de su raíz
 * (`<id del campo>_error_text`, `<id del ítem>_price_text`, …).
 */
const parseComponentDerived = (markdown: string): Derived[] => {
    const derived: Derived[] = [];
    const section = markdown.slice(
        markdown.indexOf('Ids que entregan los componentes'),
        markdown.indexOf('## '),
    );
    for (const line of section.split('\n')) {
        if (!isTableRow(line)) continue;
        const [component, ids] = cells(line);
        if (component === 'Componente') continue;
        for (const match of ids.matchAll(/`(?:<[^>]+>)?(_[a-z0-9_]+)`/g)) {
            derived.push({
                name: `${camel(match[1])}Of`,
                suffix: match[1],
                note: `${unquote(component)}: \`<id de la raíz>${match[1]}\`.`,
            });
        }
    }
    return derived;
};

/** Secciones `##` del inventario, con sus ids estáticos y dinámicos. */
const parseFeatures = (
    markdown: string,
): { features: Feature[]; derived: Derived[] } => {
    const features: Feature[] = [];
    const derived: Derived[] = [];
    let title = '';
    let entries: Entry[] = [];
    const seen = new Set<string>();

    const flush = (): void => {
        const key = title.toLowerCase().replace(/\s+/g, '_');
        const exportedAs = EXPORTED_AS[key];
        if (exportedAs && entries.length > 0) {
            features.push({ title, exportedAs, entries });
        }
    };

    for (const line of markdown.split('\n')) {
        if (line.startsWith('## ')) {
            flush();
            title = line.slice(3).trim();
            entries = [];
            continue;
        }
        if (!isTableRow(line)) continue;
        const [rawId, , note] = cells(line);
        const id = unquote(rawId);
        if (id === 'Id' || !/^[a-z<]/.test(id)) continue;

        // `<…>_amount_text`: lo entrega un componente a partir de su raíz.
        const asDerived = /^<…>(_[a-z0-9_]+)$/.exec(id);
        if (asDerived) {
            derived.push({
                name: `${camel(asDerived[1])}Of`,
                suffix: asDerived[1],
                note: note.replace(/\s+/g, ' '),
            });
            continue;
        }
        if (seen.has(id)) continue;
        seen.add(id);

        const dynamic = /^([a-z0-9_]+)_<([A-Za-z]+)>$/.exec(id);
        if (dynamic) {
            entries.push({
                kind: 'dynamic',
                name: camel(dynamic[1]),
                prefix: `${dynamic[1]}_`,
                param: dynamic[2],
                note: note.replace(/\s+/g, ' '),
            });
            continue;
        }
        if (/^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(id)) {
            entries.push({
                kind: 'static',
                name: camel(id),
                id,
                note: note.replace(/\s+/g, ' '),
            });
        }
    }
    flush();

    const unique = new Map<string, Derived>();
    for (const one of derived) unique.set(one.name, one);
    return { features, derived: [...unique.values()] };
};

/**
 * Prefijo común a todos los ids de una feature (`auth_`, `market_`, …), que
 * se quita del nombre porque ya lo dice el objeto: `AuthIds.loginEmailField`.
 * Si la feature mezcla prefijos (el shell: `nav_`, `shell_`) no se quita nada.
 */
const commonPrefix = (entries: Entry[]): string => {
    const first = (entry: Entry): string =>
        (entry.kind === 'static' ? entry.id : entry.prefix).split('_')[0];
    const head = first(entries[0]);
    return entries.every((entry) => first(entry) === head) ? `${head}_` : '';
};

const lowerFirst = (name: string): string =>
    name.length > 0 ? name[0].toLowerCase() + name.slice(1) : name;

const stripPrefix = (name: string, prefix: string): string => {
    const head = camel(prefix);
    return prefix && name.startsWith(head) && name.length > head.length
        ? lowerFirst(name.slice(head.length))
        : name;
};

const renderFeature = (feature: Feature): string => {
    const prefix = commonPrefix(feature.entries);
    const members = feature.entries.map((entry) => {
        const name = stripPrefix(entry.name, prefix);
        if (entry.kind === 'static') {
            return `    /** ${entry.note} */\n    ${name}: '${entry.id}',`;
        }
        return `    /** ${entry.note} */\n    ${name}: (${entry.param}: string): string =>\n        \`${entry.prefix}\${${entry.param}}\`,`;
    });
    return [
        `/** Ids de la feature \`${feature.title}\`. */`,
        `export const ${feature.exportedAs} = {`,
        members.join('\n'),
        `} as const;`,
    ].join('\n');
};

const renderDerived = (derived: Derived[]): string =>
    [
        '/**',
        ' * Ids que los componentes derivan del id de su raíz. El argumento es el id',
        ' * de la raíz, no el de la feature.',
        ' */',
        'export const DerivedIds = {',
        derived
            .map(
                (one) =>
                    `    /** ${one.note} */\n    ${one.name}: (rootId: string): string => \`\${rootId}${one.suffix}\`,`,
            )
            .join('\n'),
        '} as const;',
    ].join('\n');

/** Contenido completo de `ids.generated.ts` para un inventario dado. */
export const generate = (markdown: string): string => {
    const { features, derived } = parseFeatures(markdown);
    const all = [...parseComponentDerived(markdown), ...derived];
    const unique = new Map(all.map((one) => [one.name, one]));
    const count =
        features.reduce((total, feature) => total + feature.entries.length, 0) +
        unique.size;

    const header = [
        '/**',
        ' * GENERADO por `scripts/sync-ids.ts` desde',
        ' * `mila-invest-app/docs/semantics-ids.md`. **No se edita a mano.**',
        ' *',
        ' * `npm run ids:sync` regenera, `npm run ids:check` falla si quedó viejo.',
        ' *',
        ` * ${count} entradas.`,
        ' */',
    ].join('\n');

    return `${[header, ...features.map(renderFeature), renderDerived([...unique.values()])].join('\n\n')}\n`;
};

const main = (): void => {
    const markdown = readFileSync(SOURCE, 'utf8');
    const generated = generate(markdown);
    const check = process.argv.includes('--check');

    if (!check) {
        writeFileSync(TARGET, generated);
        console.log(`ids:sync — ${TARGET} regenerado desde ${SOURCE}`);
        return;
    }

    const current = readFileSync(TARGET, 'utf8');
    if (current === generated) {
        console.log('ids:check — los ids están al día.');
        return;
    }
    console.error(
        [
            'ids:check — `src/screenplay/ids/ids.generated.ts` no coincide con',
            `  ${SOURCE}`,
            'La app cambió sus identificadores. Corré `npm run ids:sync`, revisá el',
            'diff y acomodá los targets y las tareas que usen los ids que cambiaron.',
        ].join('\n'),
    );
    process.exitCode = 1;
};

main();
