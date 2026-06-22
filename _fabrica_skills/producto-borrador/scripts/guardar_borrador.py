#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
guardar_borrador.py — Captura un producto del catálogo Luna 3D a un borrador local.

Categorías DINÁMICAS: no hay lista cerrada. Daniel decide la categoría (y
subcategoría) al cargar cada producto; si no existe se crea sola, si ya existe
se reutiliza. Se guarda `cat` (slug estable), `cat_nombre` (etiqueta visible) y
`subcat` (texto libre o null). NO sube nada a internet (eso lo hace publicar-producto).

Uso:
  python3 guardar_borrador.py --json '{"name":"...","cat":"Cultura pop","subcat":"Pokémon",...}' \
      --imagen /ruta/foto.jpg [--galeria /r/g1.jpg /r/g2.jpg] [--proyecto /ruta]
"""
import sys, os, json, re, glob, argparse, datetime
from PIL import Image, ImageOps

MAX_LADO = 1400
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
    raw_cat = (f.get('cat') or '').strip()
    if not raw_cat:
        raise SystemExit("La ficha necesita una categoría ('cat'). Las categorías son libres: indícala.")
    cat = slugify(raw_cat)
    f['cat'] = cat
    f['cat_nombre'] = (f.get('cat_nombre') or raw_cat).strip()
    f['subcat'] = (str(f['subcat']).strip() or None) if f.get('subcat') else None

    f.setdefault('id', f"{cat}-{slugify(f['name'])}")
    f['id'] = slugify(f['id'])
    f.setdefault('fuente', 'original'); f.setdefault('riesgo_ip', 'verde')
    f.setdefault('reviews', 0); f.setdefault('rating', None)
    f.setdefault('featured', False); f.setdefault('tag', None)
    if f.get('margen') is None: f['margen'] = calc_margen(f)

    proyecto = find_proyecto(args.proyecto)
    sub = slugify(f.get('subcat') or '')
    _parts = [proyecto, '_Borradores_Productos', cat] + ([sub] if sub else []) + [f['id']]
    carpeta = os.path.join(*_parts)
    os.makedirs(carpeta, exist_ok=True)

    if args.imagen:
        if not os.path.isfile(args.imagen): raise SystemExit(f"No existe la imagen {args.imagen}")
        dst = os.path.join(carpeta, f"{f['id']}.jpg")
        kb = optimizar(args.imagen, dst) // 1024
        f['imagen_local'] = f"{f['id']}.jpg"
        print(f"   foto principal -> {f['id']}.jpg ({kb} KB)")
    gal_local = []
    for i, g in enumerate(args.galeria):
        if not os.path.isfile(g): print(f"   galeria: no existe {g}"); continue
        nombre = f"{f['id']}-g{i+1}.jpg"
        optimizar(g, os.path.join(carpeta, nombre)); gal_local.append(nombre)
    if gal_local: f['galeria_local'] = gal_local

    f.setdefault('estado_local', 'borrador')
    f.setdefault('decision', 'pendiente')
    f.setdefault('creado', datetime.datetime.now().isoformat(timespec='seconds'))
    f['actualizado'] = datetime.datetime.now().isoformat(timespec='seconds')

    with open(os.path.join(carpeta, 'ficha.json'), 'w', encoding='utf-8') as fh:
        json.dump(f, fh, ensure_ascii=False, indent=2)

    precio = f.get('price'); ps = f"${int(precio):,}".replace(',', '.') if precio else "Precio a confirmar"
    sub_s = f" > {f['subcat']}" if f.get('subcat') else ""
    print(f"\nBorrador guardado: {f['id']}")
    print(f"   {f['name']}  .  {f['cat_nombre']}{sub_s}  .  {ps}  .  margen: {f.get('margen')}")
    print(f"   -> {carpeta}")
    falt = [c for c in ('price','costo','gramos','tiempo_min') if f.get(c) in (None,'')]
    if not f.get('imagen_local') and not f.get('img'): falt.append('foto')
    if falt: print(f"   pendiente para poder publicar: {', '.join(falt)}")


if __name__ == "__main__":
    main()
