# Fábrica de Catálogo — Skills de productos (Luna 3D)

Dos skills que cargan productos a la web Luna 3D (que lee de Supabase en vivo, Fase B):

1. **producto-borrador** — recibe FOTOS, propone la ficha completa (tú corriges),
   pregunta los datos internos (costo/gramos/tiempo), y guarda cada producto en
   `_Borradores_Productos/<categoria>/<slug>/` (ficha.json + foto optimizada).
2. **publicar-producto** — sube esos borradores al bucket `productos` + tabla
   `products` (como borrador) y los **publica** con tu OK. También lista estados,
   avisa faltantes y permite despublicar.

## Requisitos
- `.claude-secrets/supabase.env` con `SUPABASE_URL` + `SUPABASE_SECRET_KEY`
  (y `SUPABASE_PUBLISHABLE_KEY`). La secret nunca se imprime ni se commitea.
- Python con `Pillow` (optimización de imágenes) — `pip install Pillow`.

## Instalación de las skills
Estos son los archivos fuente. Para usarlas como skills se instalan desde los
paquetes `.skill` (botón "Guardar skill") o en Configuración > Capacidades.

## Flujo típico
Fotos → `producto-borrador` (borradores) → `publicar-producto` listar → subir → publicar.
