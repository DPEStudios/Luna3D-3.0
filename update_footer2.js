const fs = require('fs');
const file = 'C:/Users/danie/.gemini/antigravity/scratch/luna3d-repo/app.js';
let content = fs.readFileSync(file, 'utf8');

const oldEnlaces = '<h4>Enlaces Ústiles</h4>\\n            <ul>\\n              <li><a href="index.html#nosotros">Sobre Nosotros</a></li>\\n              <li><a href="#">Términos y Condiciones</a></li>\\n              <li><a href="#">Política de Devolución</a></li>\\n              <li><a href="#">Seguimiento de Envío</a></li>\\n            </ul>';

const newEnlaces = '<h4>Enlaces Ústiles</h4>\\n            <ul>\\n              <li><a href="index.html#nosotros">Sobre Nosotros</a></li>\\n              <li><a href="legal.html#terminos">Términos y Condiciones</a></li>\\n              <li><a href="legal.html#devoluciones">Cambios y Garantía</a></li>\\n              <li><a href="legal.html#despacho">Despacho y Envíos</a></li>\\n              <li><a href="legal.html#privacidad">Política de Privacidad</a></li>\\n            </ul>';

// Use a simple regex to match the Enlaces block, accounting for exact characters if possible, or just a wildcard
content = content.replace(/<h4>Enlaces.*?stiles<\\/h4>[\\s\\S]*?<\\/ul>/g, newEnlaces);

const oldLegal = '<div class="fb-legal">\\n            <a href="#">Términos</a><span class="dot">·</span>\\n            <a href="#">Privacidad</a><span class="dot">·</span>\\n            <span>v3.0.0 — Hecho en Chile 🌙</span>\\n          </div>';

const newLegal = '<div class="fb-legal">\\n            <a href="legal.html#terminos">Términos</a><span class="dot">·</span>\\n            <a href="legal.html#privacidad">Privacidad</a><span class="dot">·</span>\\n            <span>v3.0.0 — Hecho en Chile 🌙</span>\\n          </div>';

content = content.replace(/<div class="fb-legal">[\\s\\S]*?<\\/div>/g, newLegal);

// Hide social links except whatsapp
content = content.replace(/<a class="soc soc-ig"[^>]+>[\\s\\S]*?<\\/span><\\/a>/g, '');
content = content.replace(/<a class="soc soc-fb"[^>]+>[\\s\\S]*?<\\/span><\\/a>/g, '');
content = content.replace(/<a class="soc soc-tt"[^>]+>[\\s\\S]*?<\\/span><\\/a>/g, '');
content = content.replace(/<a class="soc soc-yt"[^>]+>[\\s\\S]*?<\\/span><\\/a>/g, '');

fs.writeFileSync(file, content, 'utf8');
