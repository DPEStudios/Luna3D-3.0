#!/usr/bin/env node
/* ============================================================
   LUNA3D — Guardián de integridad (Bloque 2, red de seguridad)
   ------------------------------------------------------------
   Corre en el pre-commit y en CI. Bloquea el commit/deploy si:
     · un .js no parsea (node --check)  → atrapa truncamientos
     · un .css tiene llaves desbalanceadas
     · un .html no cierra con </html>
     · cualquier archivo de texto tiene bytes NUL (\x00)  → corrupción
   Una sola dependencia: Node (ya presente para desplegar el sitio).
   Uso:  node _tools/check.js            (revisa todo el repo)
         node _tools/check.js a.js b.css (revisa solo esos)
   Sale 0 si todo OK; 1 si hay cualquier problema.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const TEXT = new Set(['.js','.mjs','.cjs','.css','.html','.htm','.md','.json','.svg','.txt','.xml','.csv']);
const SKIP = new Set(['.git','node_modules','.vercel','.claude-secrets','_Papelera','_Borradores_Productos','_Futuros_Productos','graphify-out','footer-handoff','_editor','_fabrica_skills','preview']);

let problems = [];
const flag = (f, msg) => problems.push(`${f}: ${msg}`);

function walk(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function checkFile(p) {
  const rel = path.relative(ROOT, p);
  const base = path.basename(p);
  if (base.includes('.bak')) return;
  const ext = path.extname(p).toLowerCase();
  if (!TEXT.has(ext)) return;
  const buf = fs.readFileSync(p);
  // 1) bytes NUL = corrupción, en cualquier archivo de texto
  let nul = 0; for (const b of buf) if (b === 0) nul++;
  if (nul) flag(rel, `${nul} byte(s) NUL — archivo corrupto`);
  const txt = buf.toString('utf8');
  // 2) sintaxis JS (atrapa truncamientos que dejan el archivo sin parsear)
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
    try { cp.execSync(`node --check "${p}"`, { stdio: 'pipe' }); }
    catch (e) { flag(rel, 'no parsea (node --check) — posible truncamiento'); }
  }
  // 3) balance de llaves CSS
  if (ext === '.css') {
    const open = (txt.match(/{/g) || []).length;
    const close = (txt.match(/}/g) || []).length;
    if (open !== close) flag(rel, `llaves desbalanceadas {=${open} }=${close}`);
  }
  // 4) cierre de HTML
  if (ext === '.html' || ext === '.htm') {
    if (!/<\/html>\s*$/i.test(txt.trimEnd())) flag(rel, 'no termina en </html> — posible truncamiento');
  }
}

const args = process.argv.slice(2);
const files = args.length ? args.map(a => path.resolve(a)) : walk(ROOT, []);
for (const f of files) { try { checkFile(f); } catch (e) { flag(path.relative(ROOT, f), 'no se pudo leer: ' + e.message); } }

if (problems.length) {
  console.error('\x1b[31m[guardián] BLOQUEADO — ' + problems.length + ' problema(s):\x1b[0m');
  for (const p of problems) console.error('  ✗ ' + p);
  console.error('\nNo se commiteó/desplegó nada. Repará los archivos y reintentá.');
  process.exit(1);
}
console.log('\x1b[32m[guardián] OK — ' + files.length + ' archivo(s) revisados, 0 problemas.\x1b[0m');
process.exit(0);
