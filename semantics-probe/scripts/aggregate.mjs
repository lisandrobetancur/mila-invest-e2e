// Resume results/{on,off}.jsonl por caso. Salida: markdown en stdout.
import fs from 'node:fs';
import path from 'node:path';

const R = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'results');
const load = (m) => (fs.existsSync(path.join(R, `${m}.jsonl`)) ? fs.readFileSync(path.join(R, `${m}.jsonl`), 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
const all = [...load('on'), ...load('off')];
const by = (pred) => all.filter(pred);
const med = (xs) => { const s = xs.filter((x) => x != null).sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null; };
const rng = (xs) => { const s = xs.filter((x) => x != null); return s.length ? `${Math.min(...s)}–${Math.max(...s)}` : '—'; };
const count = (xs) => { const m = new Map(); for (const x of xs) m.set(x, (m.get(x) ?? 0) + 1); return [...m].map(([k, v]) => `${v}× ${k}`).join(' · '); };
const out = [];
const p = (s = '') => out.push(s);

p('# Resumen de sondas');
const disc = by((r) => r.discarded);
p(`\nDescartadas: ${disc.length}`);
for (const d of disc) p(`- ${d.mode} ${d.case} r${d.run}: ${d.reason} ${d.screen ?? ''}/${d.id ?? ''} ${d.diff != null ? (d.diff * 100).toFixed(2) + ' %' : ''}`);

// ---------- A1–A5 matriz ----------
for (const c of ['A1', 'A2', 'A2c', 'A3', 'A4', 'A5']) {
  p(`\n## ${c}`);
  p('| espera | tecla | ON ok/n | OFF ok/n | ON fallos (valores) | OFF fallos (valores) |');
  p('|---|---|---|---|---|---|');
  for (const d of [0, 50, 100, 250, 500]) for (const k of [0, 50]) {
    const cell = (m) => {
      const rs = by((r) => r.case === c && r.mode === m && r.d === d && r.k === k && !r.discarded);
      const ok = rs.filter((r) => (c === 'A1' ? r.home : r.ok));
      const bad = rs.filter((r) => !(c === 'A1' ? r.home : r.ok)).map((r) => {
        if (c === 'A1') return `email=${JSON.stringify(r.email?.value)} pw=${JSON.stringify(r.password?.value)}`;
        if (c === 'A2' || c === 'A2c') return JSON.stringify(Object.values(r.values));
        if (c === 'A3') return `campo=${JSON.stringify(r.reads?.[2]?.field)} q=${JSON.stringify(r.reads?.[2]?.q)}`;
        return `campo=${JSON.stringify(r.field)}`;
      });
      return { s: `${ok.length}/${rs.length}`, bad: count(bad) };
    };
    const on = cell('on'), off = cell('off');
    p(`| ${d} | ${k} | ${on.s} | ${off.s} | ${on.bad} | ${off.bad} |`);
  }
  // espera mínima con 5/5
  for (const m of ['on', 'off']) for (const k of [0, 50]) {
    let min = null;
    for (const d of [0, 50, 100, 250, 500]) {
      const rs = by((r) => r.case === c && r.mode === m && r.d === d && r.k === k && !r.discarded);
      if (rs.length && rs.every((r) => (c === 'A1' ? r.home : r.ok))) { min = d; break; }
    }
    p(`- ${m.toUpperCase()} tecla ${k} ms → espera mínima con todas las corridas completas: ${min == null ? 'ninguna de las probadas' : min + ' ms'}`);
  }
  // activeElement en pasos clave
  const steps = by((r) => r.case === c && r.log).flatMap((r) => r.log.map((s) => ({ mode: r.mode, step: s.step, a: `${s.active.tag}${s.active.node ? '#' + s.active.node : ''}${s.active.value != null ? '=' + JSON.stringify(s.active.value) : ''}` })));
  const names = [...new Set(steps.map((s) => s.step))];
  if (names.length) {
    p('\nactiveElement por paso (todas las combinaciones):');
    for (const n of names) for (const m of ['on', 'off']) {
      const xs = steps.filter((s) => s.step === n && s.mode === m).map((s) => s.a.replace(/=".*"$/, (v) => (v.length > 40 ? v.slice(0, 40) + '…"' : v)));
      if (xs.length) p(`- ${m} · ${n}: ${count(xs)}`);
    }
  }
}

// ---------- A3 lecturas en el tiempo ----------
p('\n## A3 lecturas (+0/+400/+1000 ms) — campo / q');
for (const m of ['on', 'off']) {
  const rs = by((r) => r.case === 'A3' && r.mode === m);
  for (const at of [0, 1, 2]) p(`- ${m} +${[0, 400, 1000][at]}: ${count(rs.map((r) => `campo=${JSON.stringify(r.reads[at].field)} q=${JSON.stringify(r.reads[at].q)}`))}`);
}

// ---------- A3b ----------
p('\n## A3b');
for (const m of ['on', 'off']) for (const k of [0, 50]) {
  const rs = by((r) => r.case === 'A3b' && r.mode === m && r.k === k);
  p(`- ${m} tecla ${k}: ${count(rs.map((r) => `medio=${JSON.stringify(r.mid.value)}/q=${JSON.stringify(r.mid.q)} → final=${JSON.stringify(r.field)}/q=${JSON.stringify(r.q)}`))}`);
}

// ---------- eager ----------
for (const c of ['A4-eager', 'A5-eager']) {
  p(`\n## ${c} (solo ON)`);
  for (const d of [0, 50, 100, 250, 500]) {
    const rs = by((r) => r.case === c && r.d === d);
    p(`- espera ${d}: ${rs.filter((r) => r.ok).length}/${rs.length} · ${count(rs.map((r) => JSON.stringify(r.field)))}`);
  }
}

// ---------- A6–A10 ----------
p('\n## A6–A10 vecino');
p('| caso | modo | n | activeElement tras el vecino | efecto visible del vecino | foco al tocar el campo después | valor final | tecla entró |');
p('|---|---|---|---|---|---|---|---|');
for (const c of ['A6', 'A7', 'A8', 'A9+', 'A9-', 'A10']) for (const m of ['on', 'off']) {
  const rs = by((r) => r.case === c && r.mode === m && !r.discarded);
  if (!rs.length) continue;
  p(`| ${c} | ${m} | ${rs.length} | ${count(rs.map((r) => r.afterNeighbor.tag + (r.afterNeighbor.node ? '#' + r.afterNeighbor.node : '')))} | ${count(rs.map((r) => (r.cambioVisual > 0.05 ? 'sí' : 'no') + ` (${(r.cambioVisual * 100).toFixed(0)} %)`))} | ${count(rs.map((r) => (r.final.timeline ?? []).map((t) => t.replace(/^\d:\+\d+ms /, '')).join('→')))} | ${count(rs.map((r) => JSON.stringify(r.finalValue)))} | ${rs.filter((r) => r.keyEntered).length}/${rs.length} |`);
}
p('\nq (A8) por modo:');
for (const m of ['on', 'off']) p(`- ${m}: ${count(by((r) => r.case === 'A8' && r.mode === m).map((r) => JSON.stringify(r.q)))}`);

// ---------- B ----------
p('\n## B1–B8 scroll');
p('| caso | modo | n | desplazamientos por paso | saltos | tope desde | ¿siguió moviéndose? |');
p('|---|---|---|---|---|---|---|');
for (const c of ['B1', 'B2', 'B3', 'B4', 'B4b', 'B5', 'B5b', 'B6', 'B7', 'B8']) for (const m of ['on', 'off']) {
  const rs = by((r) => r.case === c && r.mode === m && !r.discarded);
  if (!rs.length) continue;
  p(`| ${c} | ${m} | ${rs.length} | ${count(rs.map((r) => r.shifts.join(',')))} | ${count(rs.map((r) => JSON.stringify(r.saltos)))} | ${count(rs.map((r) => r.topeDesde))} | ${count(rs.map((r) => r.late))} |`);
}
p('\nON scrollTop por paso:');
for (const c of ['B1', 'B2', 'B3', 'B4', 'B4b', 'B5', 'B5b', 'B6', 'B7', 'B8']) {
  const rs = by((r) => r.case === c && r.mode === 'on');
  if (rs.length) p(`- ${c}: ${count(rs.map((r) => r.steps.map((s) => (s.tops ?? []).map((t) => t.top).join('/')).join(',')))}`);
}
p('\n## B9 latencia (ms)');
for (const m of ['on', 'off']) {
  const rs = by((r) => r.case === 'B9' && r.mode === m);
  p(`- ${m}: n=${rs.length} llegó=${rs.filter((r) => r.reached).length} · up→nav mediana ${med(rs.map((r) => r.upToNav))} (rango ${rng(rs.map((r) => r.upToNav))}) · down→nav mediana ${med(rs.map((r) => r.downToNav))} (rango ${rng(rs.map((r) => r.downToNav))}) · destino ${count(rs.map((r) => r.downTarget))}`);
}
p('\n## B10 arrastre táctil');
for (const c of ['B10', 'B10b']) for (const m of ['on', 'off']) {
  const rs = by((r) => r.case === c && r.mode === m);
  if (rs.length) p(`- ${c} ${m}: n=${rs.length} · primer movimiento mediana ${med(rs.map((r) => r.timeToMove))} ms (rango ${rng(rs.map((r) => r.timeToMove))}) · desplazamiento final ${rng(rs.map((r) => r.final))} px · abrió el detalle ${rs.filter((r) => r.openedDetail).length}/${rs.length} · destino ${count(rs.map((r) => (r.touchTargets ?? []).map((t) => t.type + '@' + t.target).slice(0, 1).join()))}`);
}

// ---------- C ----------
p('\n## C');
p('| caso | objetivo | forma | n | con efecto | intento | en DOM |');
p('|---|---|---|---|---|---|---|');
for (const c of ['C1', 'C2', 'C3', 'C4', 'C5']) {
  const rs = by((r) => r.case === c && r.mode === 'on');
  const keys = [...new Set(rs.map((r) => `${r.objetivo ?? (c === 'C1' ? 'auth_register_submit_button' : c === 'C4' ? 'settings_theme_dark_segment' : '')}|${r.forma}`))];
  for (const k of keys) {
    const [obj, forma] = k.split('|');
    const xs = rs.filter((r) => `${r.objetivo ?? (c === 'C1' ? 'auth_register_submit_button' : c === 'C4' ? 'settings_theme_dark_segment' : '')}|${r.forma}` === k);
    p(`| ${c} | ${obj || '(ninguno solapado)'} | ${forma} | ${xs.length} | ${xs.filter((r) => r.efecto).length}/${xs.length} | ${count(xs.map((r) => (r.intento ? r.intento.outcome + (r.intento.error ? ': ' + r.intento.error.slice(0, 120) : '') : r.nota ?? '')))} | ${count(xs.map((r) => String(r.enDom ?? '—')))} |`);
  }
}
const c1 = by((r) => r.case === 'C1');
p(`\nC1 alto elegido: ${count(c1.map((r) => r.alto))} · fuera del viewport: ${count(c1.map((r) => r.fuera))} · scrolleó: ${count(c1.map((r) => r.forma + '=' + r.scrolleo))}`);
const c5 = by((r) => r.case === 'C5-relevamiento');
p(`C5 snackbar: ${count(c5.map((r) => JSON.stringify(r.snack)))} · solapados: ${count(c5.map((r) => JSON.stringify(r.solapados)))}`);
for (const c of ['C2', 'C3', 'C4']) {
  const rs = by((r) => r.case === c);
  p(`${c} ids con el modal abierto: ${count(rs.map((r) => (r.idsConModal ?? []).slice().sort().join(', ')))}`);
}
p('\nC6:');
for (const m of ['on', 'off']) {
  const rs = by((r) => r.case === 'C6' && r.mode === m);
  p(`- ${m}: n=${rs.length} actuó ${rs.filter((r) => r.actuo).length}/${rs.length} (cambio visual ${rng(rs.map((r) => Math.round(r.cambioVisual * 100)))} %) · el campo recibió el pointerdown ${rs.filter((r) => r.campoRecibio).length}/${rs.length} · pointerdown en ${count(rs.map((r) => (r.eventos.find((e) => e.type === 'pointerdown') ?? {}).target))} · activeElement después ${count(rs.map((r) => r.despues.tag + (r.despues.node ? '#' + r.despues.node : '')))} · type del <input> después ${count(rs.map((r) => String(r.typeDespuesDom)))}`);
}

// ---------- D ----------
p('\n## D1');
for (const c of ['D1a', 'D1b', 'D1c']) for (const r of by((x) => x.case === c)) p(`- ${c} r${r.run}: ${JSON.stringify({ ...r, title: undefined, at: undefined, layoutNotes: undefined, maxLayoutDiff: undefined }).slice(0, 1200)}`);
p('\n## D2 (faltantes por vista; unión de corridas)');
const d2 = by((r) => r.case === 'D2');
for (const v of [...new Set(d2.map((r) => r.vista))]) {
  const rs = d2.filter((r) => r.vista === v);
  const faltan = count(rs.map((r) => r.faltan.join(', ')));
  p(`- **${v}** (${rs.length} corridas, ${rng(rs.map((r) => r.ids.length))} ids): ${faltan || 'ninguno'}`);
}

fs.writeFileSync(path.join(R, 'resumen.md'), out.join('\n'));
console.log(out.join('\n'));
