#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
guardar_borrador.py — Captura un producto del catálogo Luna 3D a un borrador local.

Recibe la ficha (JSON) que Claude propuso y Daniel corrigió, + la(s) foto(s),
y deja todo ordenado en:
    _Borradores_Productos/<categoria>/<slug>/
        ├── ficha.json        (todos los datos del producto)
        ├── <slug>.jpg        (foto principal optimizada para web)
        └── <slug>-g1.jpg …   (galería opcional)

NO sube nada a internet — eso lo hace `publicar-producto`. Solo persiste el
borrador. No inventa datos: guarda exactamente lo que viene en la ficha.

Uso:
  python3 guardar_borrador.py --json '{"name":"...","cat":"maceteros",...}' \
      --imagen /ruta/foto.jpg [--galeria /r/g1.jpg /r/g2.jpg] [--proyecto /ruta]
  (o --ficha ficha.json en vez de --json)
"""
import sys, os, json, re, glob, argparse, datetime
from PIL import Image, ImageOps

CATS_VALIDAS = ['maceteros', 'decoracion', 'llaveros', 'cultura-pop', 'oficina']
MAX_LADO = 1400          # px lado mayor para la foto principal
JPEG_Q = 85

def find_proyecto(arg=None):
    cands = []
    if arg: cands.append(arg)
    if os.environ.get('LUNA_PROYECTO'): cands.append(os.environ['LUNA_PROYECTO'])
    cands += glob.glob('/sessions/*/mnt/AI/01_Estrella3D/Web_Luna3D_v3')
    cands += glob.glob('/mnt/AI/01_Estrella3D/Web_Luna3D_v3')
    cands.append(r'C:\Users\danie\AI\01_Estrella3D\Web_Luna3D_v3')
    for c in cands:
        if c and os.path.isdir(c): return c
    raise SystemExit("ERROR: no encuentro Web_Luna3D_v3. Usa --proyecto.")

def slugify(txt):
    txt = txt.lower().strip()
    repl = {'á':'a','é':'e','í':'i','ó':'o','ú':'u','ñ':'n','ü':'u'}
    txt = ''.join(repl.get(c, c) for c in txt)
    txt = re.sub(r'[^a-z0-9]+', '-', txt).strip('-')
    return re.sub(r'-+', '-', txt)

def optimizar(src, dst):
    """Reorienta por EXIF, recorta metadatos, redimensiona y guarda JPEG."""
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)
    if im.mode not in ('RGB', 'L'): im = im.convert('RGB')
    im.thumbnail((MAX_LADO, MAX_LADO), Image.LANCZOS)
    im.save(dst, 'JPEG', quality=JPEG_Q, optimize=True)
    return os.path.getsize(dst)

def calc_margen(f):
    p, c = f.get('price'), f.get('costo')
    if p and c not in (None, ''):
        try: return round((float(p) - float(c)) / float(p), 4)
        except Exception: return None
    return None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--proyecto')
    ap.add_argument('--json'); ap.add_argument('--ficha')
    ap.add_argument('--imagen'); ap.add_argument('--galeria', nargs='*', default=[])
    args = ap.parse_args()

    if args.json: f = json.loads(args.json)
    elif args.ficha:
        with open(args.ficha, encoding='utf-8') as fh: f = json.load(fh)
    else: raise SystemExit("Pasa --json o --ficha.")

    if not f.get('name'): raise SystemExit("La ficha necesita al menos 'name'.")
    cat = f.get('cat')
    if cat not in CATS_VALIDAS:
        raise SystemExit(f"cat inválida '{cat}'. Debe ser una de: {', '.join(CATS_VALIDAS)}")

    f.setdefault('id', f"{cat}-{slugify(f['name'])}")
    f['id'] = slugify(f['id'])
    # Defaults de productos propios (no curados): verde + original.
    f.setdefault('fuente', 'original'); f.setdefault('riesgo_ip', 'verde')
    f.setdefault('reviews', 0); f.setdefault('rating', None)
    f.setdefault('featured', False); f.setdefault('tag', None)
    if f.get('margen') is None: f['margen'] = calc_margen(f)

    proyecto = find_proyecto(args.proyecto)
    carpeta = os.path.join(proyecto, '_Borradores_Productos', cat, f['id'])
    os.makedirs(carpeta, exist_ok=True)

    if args.imagen:
        if not os.path.isfile(args.imagen): raise SystemExit(f"No existe la imagen {args.imagen}")
        dst = os.path.join(carpeta, f"{f['id']}.jpg")
        kb = optimizar(args.imagen, dst) // 1024
        f['imagen_local'] = f"{f['id']}.jpg"
        print(f"   🖼️  foto principal → {f['id']}.jpg ({kb} KB)")
    gal_local = []
    for i, g in enumerate(args.galeria):
        if not os.path.isfile(g): print(f"   ⚠️ galería: no existe {g}"); continue
        nombre = f"{f['id']}-g{i+1}.jpg"
        optimizar(g, os.path.join(carpeta, nombre)); gal_local.append(nombre)
    if gal_local: f['galeria_local'] = gal_local

    f.setdefault('estado_local', 'borrador')   # borrador | subido | publicado
    f.setdefault('creado', datetime.datetime.now().isoformat(timespec='seconds'))
    f['actualizado'] = datetime.datetime.now().isoformat(timespec='seconds')

    with open(os.path.join(carpeta, 'ficha.json'), 'w', encoding='utf-8') as fh:
        json.dump(f, fh, ensure_ascii=False, indent=2)

    precio = f.get('price'); ps = f"${int(precio):,}".replace(',', '.') if precio else "Precio a confirmar"
    print(f"\n✅ Borrador guardado: {f['id']}")
    print(f"   {f['name']}  ·  {cat}  ·  {ps}  ·  margen: {f.get('margen')}")
    print(f"   → {carpeta}")
    falt = [c for c in ('price','costo','gramos','tiempo_min') if f.get(c) in (None,'')]
    if not f.get('imagen_local') and not f.get('img'): falt.append('foto')
    if falt: print(f"   ⚠️ pendiente para poder publicar: {', '.join(falt)}")
    else:    print("   🟢 LISTO para subir a la web.")

if __name__ == '__main__':
    main()
