// Borra el trace de los tests que pasaron (o se saltearon) para no llenar el
// disco; los de los tests que fallaron se conservan como evidencia.
import fs from 'node:fs';
const [report] = process.argv.slice(2);
const r = JSON.parse(fs.readFileSync(report, 'utf8'));
let kept = 0, removed = 0;
const walk = (s) => {
  for (const sp of s.specs ?? []) for (const t of sp.tests) for (const res of t.results) {
    for (const a of res.attachments ?? []) {
      if (a.name !== 'trace' || !a.path) continue;
      if (res.status === 'passed' || res.status === 'skipped') { try { fs.rmSync(a.path); removed++; } catch {} }
      else kept++;
    }
  }
  for (const c of s.suites ?? []) walk(c);
};
for (const s of r.suites) walk(s);
console.log(`traces: ${kept} conservados (fallidos), ${removed} borrados (verdes)`);
