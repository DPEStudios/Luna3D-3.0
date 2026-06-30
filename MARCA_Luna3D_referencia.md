# MARCA Luna 3D — Referencia para desarrollo web (extracto del Manual v1.1, 2026)

> Extracto operativo del PDF `01_Estrella3D/Luna3D — Manual de Marca.pdf` para que cualquier
> sesión de la web trabaje con la marca sin abrir el PDF (17 MB). Los tokens ya viven en
> `:root` de `styles.css`; este archivo es la **fuente de verdad documental** y la guía de día.
> **Concepto:** ✦ Cósmico ✦ Premium ✦ Cercano ✦ Creativo. Marca **dark-first**.

## Color — Modo Noche (principal)
| Rol | Nombre | HEX |
|---|---|---|
| Acento primario / CTA / enlaces | Magenta Nebular | `#E81F9D` |
| Segundo acento / isotipo / fin gradiente | Violeta Cósmico | `#9B27E0` |
| Fondo primario marca | Azul Espacial | `#0B1437` |
| Fondo base (full-bleed) | Noche Profunda | `#070C20` |
| Tarjetas / contenedores | Superficie | `#101B40` |
| Texto principal / wordmark | Blanco Estelar | `#F5F6FB` |
| Texto secundario | Plata Lunar | `#C4C9DE` |
| Texto de apoyo / descripciones | Gris Orbital | `#8A93B6` |

- **Gradiente Aurora Lunar:** `linear-gradient(125°, #E81F9D → #9B27E0)`.
  (El resumen para dev del manual menciona `#8E2BE6` como fin; el oficial de color es `#9B27E0`.
  Usar el que ya está en `:root`; no introducir un tercer valor.)
- **Proporción de uso:** 70% fondos oscuros · 20% neutros/texto · 10% Aurora/acentos.
- **Accesibilidad:** Blanco Estelar sobre Azul Espacial = AAA. **Nunca** texto Magenta sobre
  Violeta (contraste insuficiente).

## Color — Modo Día (CLAVE para la Sesión 1)
> "El mismo cielo, horas más tarde." Luminoso, calmo, **sin neón, sin saturar**. Pero ojo:
> Daniel pidió más **contraste y profundidad** que el día actual (lo ve plano) y **mantener el
> header oscuro** en día. Reconciliar: dar profundidad CON la paleta día (superficies en capas,
> sombras azuladas, Azul Niebla para bordes), no volviéndolo neón.

**Equivalencia de tokens noche → día (implementar bajo `[data-theme="day"]`):**
| Rol | Noche | Día |
|---|---|---|
| Fondo base | `#070C20` | `#EAF2FA` |
| Superficie / tarjetas | `#101B40` | `#FFFFFF` |
| Banda hero / cielo | `#0B1437` | `#CFE3F6` |
| Texto principal | `#F5F6FB` | `#0B1437` (Tinta Lunar) |
| Texto secundario | `#C4C9DE` | `#42507E` |
| Texto de apoyo | `#8A93B6` | `#5C6B94` |
| Acento CTA / enlaces | `#E81F9D` | `#7B4FC8` (Violeta Funcional) |
| Gradiente | Aurora `#E81F9D→#9B27E0` | Pastel `#E5A8CD→#B79CE4` |

**Paleta día completa:** Celeste Cielo `#CFE3F6`, Blanco Cálido `#FBFAF7`, Lila Pastel `#B79CE4`,
Sol Suave `#F4D488`, Rosa Bruma `#E5A8CD`, Azul Niebla `#9FBFE2`, Violeta Funcional `#7B4FC8`
(enlaces/CTA, AA sobre blanco), Tinta Lunar `#0B1437` (texto, viene de la noche).
- **Proporción día:** 65% blancos/cielo · 25% Tinta Lunar (texto/logo) · 10% pasteles + Sol.
- **Evitar en día:** neón, contrastes excesivos, tonos saturados, elementos agresivos. Para
  texto/enlaces/botones usar SIEMPRE Tinta Lunar o Violeta Funcional (los pasteles son decorativos).

## Tipografía
- **Space Grotesk** → display y titulares (400/500/600/700).
- **Manrope** → cuerpo y UI (400–800).
- **Space Mono** → solo etiquetas técnicas, overlines, metadatos, micro-copy (**nunca** párrafos).
- **Escala (base 16px):** Display 64/700 · H1 44/700 · H2 32/600 · H3 22/600 · Body 16/500 ·
  Caption 13 mono.

## Iconografía
- Línea, trazo uniforme **1.75px** (1.5 en pequeño), esquinas redondeadas, solo contorno (sin
  relleno), grilla 24px. Color **Plata Lunar** por defecto; **Magenta** en hover/activo.
- Librería recomendada: **Lucide** o **Phosphor** (no mezclar estilos). → Útil para el ícono
  nuevo de Favoritos (Sesión 2).

## Layout y componentes (Guía Web del manual)
- **Dark-first siempre.** Radios **12–18px**. Espaciado **base 8px** ("generoso" en el manual,
  pero la filosofía de Daniel pide compactar para "sentir tienda": compactar sin bajar de los
  ritmos de 8px). Acento Aurora **con moderación**.
- **Botones:** primario = Aurora Lunar, reservado a la acción principal; secundarios neutros.
- **Tarjeta de producto:** imagen sobre superficie oscura, **categoría en Space Mono**, precio
  destacado, CTA con gradiente. Badge "NUEVO".
- **Inputs:** sobre navy profundo, **foco con anillo magenta** (día: anillo Violeta Funcional).
- **Foco accesible:** Violeta Funcional; soporte teclado; `prefers-reduced-motion` → cambios
  instantáneos.

## Constelaciones / fondo cósmico
- Puntos brillantes + líneas finas sobre Azul Espacial. **Sutil:** estrellas 15–60% opacidad,
  **nunca** restan legibilidad. Solo nodos principales con halo magenta; resto plata tenue.
  → Coherente con la filosofía "menos protagonismo a lo decorativo".

## Fotografía de producto
- Fondos oscuros (navy/carbón/negro), luz lateral suave, acento magenta/violeta, **un producto
  por toma**, mucho aire negativo, edición fría coherente en todo el catálogo. Formato WebP.

## Selector de tema (referencia, Sesión 7 o cuando se retome)
- Botón con `aria-pressed`, 78×40px, knob 30px, transición 600ms `cubic-bezier(.45,.05,.25,1)`,
  iconos luna/sol 16px crossfade. Extremo derecho del header, visible en todas las páginas.

---
**Regla de marca:** la identidad se conserva siempre; la filosofía "tienda real" la pone al
servicio de vender (ver `PLAN_Mejoras_Tienda_2026-06-14.md` y memoria `projects/estrella3d.md`).
