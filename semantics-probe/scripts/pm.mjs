import { chromium } from '@playwright/test';
import fs from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: 'es' });
await ctx.addInitScript(`localStorage.setItem('flutter.mila_invest.onboarding_seen','true')`);
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8082/'); await p.waitForURL(/login/); await p.waitForTimeout(1500);
const box = (k) => JSON.parse(fs.readFileSync('results/coords/'+k,'utf8')).box;
const e = box('login__auth_login_email_field__390x844.json');
await p.mouse.click(e.x+e.width/2, e.y+e.height/2); await p.waitForTimeout(300);
await p.keyboard.type('hola@x.com', {delay:30});
await p.mouse.click(200, 30); await p.waitForTimeout(300);
console.log('active', await p.evaluate(()=>document.activeElement.tagName));
await p.evaluate(()=>document.querySelector('flt-semantics-placeholder').click());
for (const w of [300, 1000, 3000]) {
  await p.waitForTimeout(w);
  console.log(w, await p.evaluate(()=>{const n=document.querySelector('[flt-semantics-identifier="auth_login_email_field"]'); return n? n.outerHTML.slice(0,600) : 'none';}));
  console.log('   value prop', await p.evaluate(()=>document.querySelector('[flt-semantics-identifier="auth_login_email_field"] input')?.value));
}
// focus the field via semantics and see
await b.close();
