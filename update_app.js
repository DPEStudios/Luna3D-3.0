const fs = require('fs');
const file = 'C:/Users/danie/.gemini/antigravity/scratch/luna3d-repo/app.js';
let content = fs.readFileSync(file, 'utf8');

// Replace Enlaces Utiles (using match to ignore exact encoding problems)
content = content.replace(
  /<h4>Enlaces Ústiles<\/h4>[\s\S]*?<\/ul>/,
  \<h4>Enlaces Ústiles</h4>
            <ul>
              <li><a href="index.html#nosotros">Sobre Nosotros</a></li>
              <li><a href="legal.html#terminos">Términos y Condiciones</a></li>
              <li><a href="legal.html#devoluciones">Cambios y Garantía</a></li>
              <li><a href="legal.html#despacho">Despacho y Envíos</a></li>
              <li><a href="legal.html#privacidad">Política de Privacidad</a></li>
            </ul>\
);
// Also try with potential incorrect character matching
content = content.replace(
  /<h4>Enlaces .*stiles<\/h4>[\s\S]*?<\/ul>/,
  \<h4>Enlaces Ústiles</h4>
            <ul>
              <li><a href="index.html#nosotros">Sobre Nosotros</a></li>
              <li><a href="legal.html#terminos">Términos y Condiciones</a></li>
              <li><a href="legal.html#devoluciones">Cambios y Garantía</a></li>
              <li><a href="legal.html#despacho">Despacho y Envíos</a></li>
              <li><a href="legal.html#privacidad">Política de Privacidad</a></li>
            </ul>\
);

// Remove social networks except WhatsApp
content = content.replace(/<a class="soc soc-ig"[^>]+>[\s\S]*?<\/span><\/a>/g, '');
content = content.replace(/<a class="soc soc-fb"[^>]+>[\s\S]*?<\/span><\/a>/g, '');
content = content.replace(/<a class="soc soc-tt"[^>]+>[\s\S]*?<\/span><\/a>/g, '');
content = content.replace(/<a class="soc soc-yt"[^>]+>[\s\S]*?<\/span><\/a>/g, '');

// Bottom links
content = content.replace(
  /<a href="#">Términos<\/a><span class="dot">·<\/span>\s*<a href="#">Privacidad<\/a>/g,
  \<a href="legal.html#terminos">Términos</a><span class="dot">·</span>
            <a href="legal.html#privacidad">Privacidad</a>\
);
content = content.replace(
  /<a href="#">T.*?rminos<\/a><span class="dot">.*?<\/span>\s*<a href="#">Privacidad<\/a>/g,
  \<a href="legal.html#terminos">Términos</a><span class="dot">·</span>
            <a href="legal.html#privacidad">Privacidad</a>\
);

// Disable auth
content = content.replace(
  /<button data-auth-action="login">Iniciar sesión<\/button>\s*<button data-auth-action="register">Crear cuenta<\/button>/,
  'El sistema de usuarios estará disponible próximamente'
);
content = content.replace(
  /<div class="nav-popover compact" id="orders-popover">Debes iniciar sesión para ver tus compras<\/div>/,
  '<div class="nav-popover compact" id="orders-popover">El seguimiento de compras estará disponible próximamente<\/div>'
);
content = content.replace(
  /document.getElementById\('profile-btn'\).onclick=\(\)=>openAuth\('login'\);/g,
  "document.getElementById('profile-btn').onclick=()=>toast('Los perfiles de usuario estarán disponibles próximamente');"
);
content = content.replace(
  /document.querySelectorAll\('\\[data-auth-action\\]'\).forEach\(btn=>\{[^}]+\}\);/g,
  "//"
);
content = content.replace(
  /if\(ordersBtn\) ordersBtn\.onclick=\(\)=>toast\('Debes iniciar sesión para ver tus compras'\);/g,
  "if(ordersBtn) ordersBtn.onclick=()=>toast('El seguimiento de compras estará disponible próximamente');"
);
content = content.replace(
  /setLinkToast\('sidebar-history-link', 'Inicia sesión para acceder a tu historial'\);/g,
  "setLinkToast('sidebar-history-link', 'Inicia sesión para acceder a tu historial (Próximamente)');"
);
content = content.replace(
  /bindSidebarAction\('sb-login-link',    \(\) => openAuth\('login'\)\);/g,
  "bindSidebarAction('sb-login-link',    () => toast('El inicio de sesión estará disponible próximamente'));"
);
content = content.replace(
  /bindSidebarAction\('sb-register-link', \(\) => openAuth\('register'\)\);/g,
  "bindSidebarAction('sb-register-link', () => toast('El registro de cuentas estará disponible próximamente'));"
);
content = content.replace(
  /bindSidebarAction\('sb-orders-link',   \(\) => toast\('Debes iniciar sesión para ver tus compras'\)\);/g,
  "bindSidebarAction('sb-orders-link',   () => toast('El seguimiento de compras estará disponible próximamente'));"
);

fs.writeFileSync(file, content, 'utf8');
