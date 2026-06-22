const fs = require('fs');
const file = 'C:/Users/danie/.gemini/antigravity/scratch/luna3d-repo/app.js';
let content = fs.readFileSync(file, 'utf8');

// Find the start and end of the footer HTML string
const startTag = 'mount.innerHTML=\';
const startIndex = content.indexOf(startTag);
if (startIndex === -1) { console.error('Start not found'); process.exit(1); }

const contentAfterStart = content.substring(startIndex + startTag.length);
const endIndex = contentAfterStart.indexOf('\;');
if (endIndex === -1) { console.error('End not found'); process.exit(1); }

const newFooter = \
    <footer class="footer">
      <div class="wrap">
  
        <!-- NEWSLETTER -->
        <section class="footer-newsletter" aria-labelledby="nf-title">
          <div class="fn-text">
            <span class="fn-kicker">\ Comunidad Luna3D</span>
            <h3 class="fn-title" id="nf-title">Suscríbete a nuestro newsletter</h3>
            <p class="fn-sub">Recibe novedades, ofertas exclusivas, lanzamientos y tendencias del mundo de la impresión 3D.</p>
          </div>
          <form class="newsletter-form" id="newsletter-form" novalidate>
            <div class="nf-field">
              <input type="email" id="newsletter-email" placeholder="tu@email.cl" aria-label="Correo electrónico" aria-describedby="newsletter-msg" autocomplete="email">
              <button class="btn primary nf-btn" type="submit">Suscribirme \</button>
            </div>
            <p class="nf-msg" id="newsletter-msg" role="status" aria-live="polite"></p>
          </form>
        </section>
  
        <!-- GRID PRINCIPAL -->
        <div class="footer-top">
          <div class="footer-brand">
            <img class="brand-logo" src="\" alt="Luna3D">
            <p>La revolución de la impresión 3D mediante optimización radical de modelos y un ecosistema completamente autónomo.</p>
          </div>
          <div class="footer-col">
            <h4>Enlaces Ústiles</h4>
            <ul>
              <li><a href="index.html#nosotros">Sobre Nosotros</a></li>
              <li><a href="legal.html#terminos">Términos y Condiciones</a></li>
              <li><a href="legal.html#devoluciones">Cambios y Garantía</a></li>
              <li><a href="legal.html#despacho">Despacho y Envíos</a></li>
              <li><a href="legal.html#privacidad">Política de Privacidad</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Catálogo</h4>
            <ul>
              <li><a href="catalogo.html">Todos los productos</a></li>
              <li><a href="catalogo.html">Categorías</a></li>
              <li><a href="catalogo.html?col=featured">Más vendidos</a></li>
              <li><a href="catalogo.html?col=new">Nuevos lanzamientos</a></li>
            </ul>
          </div>
        </div>
  
        <!-- REDES SOCIALES (Solo WhatsApp) -->
        <section class="footer-social-band" aria-labelledby="fsb-title">
          <div class="fsb-head">
            <h4 class="fsb-title" id="fsb-title">Síguenos en redes</h4>
            <p class="fsb-sub">Inspiración, lanzamientos y el detrás de cámara de cada impresión.</p>
          </div>
          <div class="footer-social">
            <!-- Otras redes temporalmente deshabilitadas -->
            <a class="soc soc-wa" href="\" target="_blank" rel="noopener" aria-label="WhatsApp"><span class="soc-ico">\</span><span class="soc-txt"><span class="soc-name">WhatsApp</span><span class="soc-handle">Contáctanos por WhatsApp</span></span></a>
          </div>
        </section>
  
        <!-- INFORMACIÓN LEGAL -->
        <div class="footer-bottom">
          <div class="fb-left">
            <span>© 2026 Estrella 3D SpA. Todos los derechos reservados.</span>
          </div>
          <div class="fb-legal">
            <a href="legal.html#terminos">Términos</a><span class="dot">·</span>
            <a href="legal.html#privacidad">Privacidad</a><span class="dot">·</span>
            <span>v3.0.0 — Hecho en Chile 🌙</span>
          </div>
        </div>
      </div>
    </footer>\;

const newContent = content.substring(0, startIndex + startTag.length) + newFooter + content.substring(startIndex + startTag.length + endIndex);
fs.writeFileSync(file, newContent, 'utf8');
console.log('Footer updated successfully');
