# Prompt para continuar en Claude Code — Cielo de Luna3D (fugaces + pájaros + nubes)

Pega esto como primer mensaje en Claude Code, con la carpeta del sitio (`Luna3D-3.0`) abierta.

---

Estoy trabajando en el sitio estático de **Luna3D** (`Luna3D-3.0/`, HTML+CSS+JS sin build). Tiene dos modos de fondo, alternados por `setTheme(...)` que añade/quita la clase `light-mode` en `<body>`:

- **Modo oscuro (noche):** starfield en `#stars` (canvas) + **estrellas fugaces** en `#shooting-stars`.
- **Modo claro (día):** **nubes** (video timelapse real) + **pájaros** (bandada real de un video con fondo verde, recortado en vivo con canvas y teñido al azul de la paleta).

Los efectos viven en `app.js` (funciones `initStars`, `buildShootingStars`, `buildDaySky`, `buildDaySkyBirds`) y sus estilos en `styles.css`. Paleta base: navy `#070C20`, magenta `#E81F9D`, azul pájaro `rgb(45,62,98)`.

## Estado actual (ya definido, respétalo salvo que pida cambios)

**Estrellas fugaces (noche):** sutiles, finas, sin destello en la punta. Caen en diagonal, mitad izquierda→derecha (ángulo 30–62°) y mitad derecha→izquierda (118–150°), misma velocidad. Aparecen cada ~2.6–5.2 s, a veces un par seguidas.

**Pájaros (día):** pequeños y a lo lejos, **poco frecuentes** (cada ~6.5–14 s), no protagonistas. Cruzan toda la pantalla; unos en manada, otros solos, en ambos sentidos y en distintos ángulos de caída (4–22°). Aleteo relajado (video a `playbackRate` ≈ 1.35). Se dibujan como "sprites" que muestrean un buffer keyed del video.

**Nubes (día):** timelapse real muy sutil (opacidad ~0.2 + lavado pálido encima). **No tocar, están perfectas.**

## Assets (en `assets/`)
- `birds.mp4` — bandada real, fondo verde (chroma). 2560×1440 (conviene recomprimir a 1280×720 para peso).
- `clouds.mp4` — timelapse de nubes.

## Cómo funciona el keying de pájaros
En `buildDaySkyBirds`: un `<video>` oculto reproduce `birds.mp4`; cada frame se dibuja en un canvas buffer y se recorre pixel a pixel — el verde (`g>90 && g>r*1.25 && g>b*1.25`) se vuelve transparente, el resto se tiñe a `rgb(45,62,98)` con alfa según qué tan oscuro es. Luego se dibujan sprites pequeños de ese buffer en un canvas a pantalla completa, moviéndose en ángulo. `loop`, `muted`, `playsInline` se fuerzan por JS. Carga diferida: `preload="none"` hasta pasar a día.

## Parámetros que probablemente querré tocar
- Frecuencia de pájaros: `setTimeout(scheduleLoop, rand(6500, 14000))`.
- Tamaño: `w = solo ? rand(24,44) : rand(60,118)`.
- Aleteo: `video.playbackRate` (subir = más aleteo, bajar = más planeo).
- Sutileza fugaces: `peak = rand(0.28, 0.5)`, `thick = rand(0.8, 1.5)`.

## Lo que quiero hacer ahora
[ESCRIBE AQUÍ tu siguiente cambio — p. ej. "recomprime birds.mp4 a 720p", "haz los pájaros aún más pequeños", "sube un poco el aleteo", etc.]

El código de referencia funcional está en `handoff/Luna Cielo.reference.html` (mismo comportamiento, hecho en el entorno de diseño). Úsalo solo como referencia de lógica; intégralo en `app.js`/`styles.css` del sitio real, no lo copies tal cual.
