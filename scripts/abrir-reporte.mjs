#!/usr/bin/env node
/**
 * Abre el `index.html` del reporte de Serenity/JS en el navegador por
 * defecto, sin servidor: el reporte es autocontenido (`index.html`,
 * `data.js` y las capturas, con rutas relativas).
 *
 *   node scripts/abrir-reporte.mjs <carpeta del reporte>
 */
import { spawn } from 'node:child_process';
import console from 'node:console';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { argv, exit, platform } from 'node:process';

const dir = argv[2] ?? './reports/serenity-js';
const index = resolve(dir, 'index.html');

if (!existsSync(index)) {
    console.error(`No hay reporte en ${index}: la corrida no llegó a generarlo.`);
    exit(1);
}

console.log(`Abriendo ${index}`);
const [comando, ...args] =
    platform === 'darwin' ? ['open', index] : platform === 'win32' ? ['cmd', '/c', 'start', '', index] : ['xdg-open', index];
spawn(comando, args, { stdio: 'ignore', detached: true }).unref();
