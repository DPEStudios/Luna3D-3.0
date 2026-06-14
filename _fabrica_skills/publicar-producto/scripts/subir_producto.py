#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
subir_producto.py — Motor de publicación del catálogo Luna 3D (Fábrica de Catálogo).

Sube borradores locales de _Borradores_Productos/ a Supabase:
  1) sube la(s) foto(s) al bucket público `productos` (Storage),
  2) hace UPSERT de la fila en la tabla `products` como `estado='borrador'`,
  3) publica / despublica con el OK de Daniel.

SoC: este es el ÚNICO archivo que conoce la forma de subir a Supabase.
Seguridad: la SECRET key se lee del .env del proyecto (nunca se imprime ni se
hardcodea). Se envía SOLO en el header `apikey` (llaves nuevas Supabase).

Uso:
  python3 subir_producto.py listar
  python3 subir_producto.py subir <slug> [<slug> ...] | --todos
  python3 subir_producto.py publicar <slug> [<slug> ...] | --todos-subidos
  python3 subir_producto.py despublicar <slug> [<slug> ...]
Opcional: --proyecto /ruta/a/Web_Luna3D_v3  (si no, se autodescubre)
"""
import sys, os, json, glob, mimetypes, argparse, urllib.request, urllib.error, datetime

# ---------- Localizar el proyecto (autodescubrimiento robusto) ----------
def find_proyecto(arg=None):
    cands = []
    if arg: cands.append(arg)
    if os.environ.get('LUNA_PROYECTO'): cands.append(os.environ['LUNA_PROYECTO'])
    cands += glob.glob('/sessions/*/mnt/AI/01_Estrella3D/Web_Luna3D_v3')
    cands += glob.glob('/mnt/AI/01_Estrella3D/Web_Luna3D_v3')
    cands.append(r'C:\Users\danie\AI\01_Estrella3D\Web_Luna3D_v3')
    for c in cands:
        if c and os.path.isdir(c) and os.path.isfile(os.path.join(c, '.claude-secrets', 'supabase.env')):
            return c
    raise SystemExit("ERROR: no encuentro Web_Luna3D_v3 con .claude-secrets/supabase.env. Usa --proyecto.")

def load_env(proyecto):
    env = {}
    with open(os.path.join(proyecto, '.claude-secrets', 'supabase.env'), encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line: continue
            k, v = line.split('=', 1); env[k.strip()] = v.strip()
    url = env.get('SUPABASE_URL')
    secret = env.get('SUPABASE_SECRET_KEY') or env.get('SUPABASE_SERVICE_ROLE_KEY')
    if not url or not secret:
        raise SystemExit("ERROR: faltan SUPABASE_URL o SECRET en el .env.")
    return url.rstrip('/'), secret

# ---------- HTTP helpers (urllib, sin dependencias) ----------
def http(method, url, secret, data=None, headers=None, raw=False):
    h = {'apikey': secret}            # llaves nuevas: SOLO apikey (no Bearer)
    if headers: h.update(headers)
    body = data if raw else (json.dumps(data).encode('utf-8') if data is not None else None)
    if data is not None and not raw: h['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()

# ---------- Campos obligatorios para poder publicar ----------
REQUERIDOS_WEB = ['name', 'price', 'cat']     # + imagen subida
REQUERIDOS_INT = ['costo', 'gramos', 'tiempo_min']
CATS_VALIDAS = ['maceteros', 'decoracion', 'llaveros', 'cultura-pop', 'oficina']

def borradores_dir(proyecto): return os.path.join(proyecto, '_Borradores_Productos')

def iter_fichas(proyecto):
    base = borradores_dir(proyecto)
    for fp in sorted(glob.glob(os.path.join(base, '*', '*', 'ficha.json'))):
        try:
            with open(fp, encoding='utf-8') as f: yield fp, json.load(f)
        except Exception as e:
            print(f"  ⚠️  no pude leer {fp}: {e}")

def faltantes(ficha, carpeta):
    falt = [c for c in REQUERIDOS_WEB if ficha.get(c) in (None, '', [])]
    if ficha.get('cat') not in CATS_VALIDAS: falt.append("cat-inválida")
    falt += [c for c in REQUERIDOS_INT if ficha.get(c) in (None, '')]
    # imagen: o ya subida (img URL) o archivo local presente
    tiene_img = bool(ficha.get('img')) or bool(_imagen_local(ficha, carpeta))
    if not tiene_img: falt.append('foto')
    return falt

def _imagen_local(ficha, carpeta):
    nombre = ficha.get('imagen_local')
    if nombre:
        p = os.path.join(carpeta, nombre)
        if os.path.isfile(p): return p
    for ext in ('jpg', 'jpeg', 'png', 'webp'):
        for p in glob.glob(os.path.join(carpeta, f"*.{ext}")):
            return p
    return None

def _galeria_local(ficha, carpeta):
    out = []
    for nombre in (ficha.get('galeria_local') or []):
        p = os.path.join(carpeta, nombre)
        if os.path.isfile(p): out.append(p)
    return out

def calc_margen(ficha):
    precio, costo = ficha.get('price'), ficha.get('costo')
    if precio and costo not in (None, ''):
        try: return round((float(precio) - float(costo)) / float(precio), 4)
        except Exception: return None
    return None

# ---------- Subcomandos ----------
def cmd_listar(proyecto, url, secret, args):
    print(f"📦 Borradores en {borradores_dir(proyecto)}\n")
    n = 0
    for fp, ficha in iter_fichas(proyecto):
        n += 1; carpeta = os.path.dirname(fp)
        falt = faltantes(ficha, carpeta)
        estado = ficha.get('estado_local', 'borrador')
        marca = {'borrador':'📝','subido':'⬆️','publicado':'✅'}.get(estado, '❔')
        precio = ficha.get('price'); precio_s = f"${int(precio):,}".replace(',', '.') if precio else "—"
        print(f"{marca} [{estado}] {ficha.get('id','?')}  ·  {ficha.get('name','(sin nombre)')}  ·  {ficha.get('cat','?')}  ·  {precio_s}")
        print(f"     {'LISTO para subir' if not falt else 'faltan: ' + ', '.join(falt)}")
    if n == 0: print("  (no hay borradores todavía)")
    print(f"\nTotal: {n} borrador(es).")

def _subir_imagen(url, secret, proyecto, slug, ruta_local, sufijo=''):
    ctype = mimetypes.guess_type(ruta_local)[0] or 'image/jpeg'
    ext = os.path.splitext(ruta_local)[1].lstrip('.').lower() or 'jpg'
    objeto = f"{slug}{sufijo}.{ext}"
    with open(ruta_local, 'rb') as f: data = f.read()
    # upsert del objeto (x-upsert para reemplazar si ya existe)
    st, body = http('POST', f"{url}/storage/v1/object/productos/{objeto}", secret,
                    data=data, raw=True, headers={'Content-Type': ctype, 'x-upsert': 'true'})
    if st not in (200, 201):
        raise RuntimeError(f"fallo subiendo imagen ({st}): {body[:200]}")
    return f"{url}/storage/v1/object/public/productos/{objeto}"

def _fila_db(ficha, img_url, galeria_urls):
    def jb(v): return v if v else None
    return {
        'id': ficha['id'], 'cat': ficha['cat'], 'name': ficha['name'],
        'price': ficha.get('price'),
        'img': img_url, 'gallery': galeria_urls or None,
        'tag': ficha.get('tag') or None,
        'featured': bool(ficha.get('featured', False)),
        'rating': ficha.get('rating'), 'reviews': ficha.get('reviews', 0) or 0,
        'colors': jb(ficha.get('colors')), 'sizes': jb(ficha.get('sizes')),
        'desc': ficha.get('desc') or None,
        'estado': 'borrador', 'fuente': ficha.get('fuente', 'original'),
        'riesgo_ip': ficha.get('riesgo_ip', 'verde'),
        'licencia': ficha.get('licencia'),
        'costo': ficha.get('costo'), 'gramos': ficha.get('gramos'),
        'tiempo_min': ficha.get('tiempo_min'),
        'margen': ficha.get('margen') if ficha.get('margen') is not None else calc_margen(ficha),
        'modelo_3d_url': ficha.get('modelo_3d_url') or None,
    }

def _guardar_ficha(fp, ficha):
    ficha['actualizado'] = datetime.datetime.now().isoformat(timespec='seconds')
    with open(fp, 'w', encoding='utf-8') as f: json.dump(ficha, f, ensure_ascii=False, indent=2)

def _seleccion(proyecto, slugs, todos, filtro_estado=None):
    sel = []
    for fp, ficha in iter_fichas(proyecto):
        if todos or ficha.get('id') in slugs:
            if filtro_estado and ficha.get('estado_local') not in filtro_estado: continue
            sel.append((fp, ficha))
    return sel

def cmd_subir(proyecto, url, secret, args):
    sel = _seleccion(proyecto, set(args.slugs), args.todos)
    if not sel: raise SystemExit("No hay borradores que coincidan.")
    for fp, ficha in sel:
        carpeta = os.path.dirname(fp); falt = faltantes(ficha, carpeta)
        if falt:
            print(f"⏭️  {ficha.get('id')} — NO subido (faltan: {', '.join(falt)})"); continue
        print(f"⬆️  Subiendo {ficha['id']} …")
        img_local = _imagen_local(ficha, carpeta)
        img_url = _subir_imagen(url, secret, proyecto, ficha['id'], img_local)
        gal_urls = [_subir_imagen(url, secret, proyecto, ficha['id'], g, sufijo=f"-g{i+1}")
                    for i, g in enumerate(_galeria_local(ficha, carpeta))]
        fila = _fila_db(ficha, img_url, gal_urls)
        st, body = http('POST', f"{url}/rest/v1/products?on_conflict=id", secret, data=[fila],
                        headers={'Prefer': 'resolution=merge-duplicates,return=representation'})
        if st not in (200, 201):
            print(f"   ❌ error UPSERT ({st}): {body[:300]}"); continue
        ficha['img'] = img_url; ficha['gallery'] = gal_urls
        ficha['margen'] = fila['margen']; ficha['estado_local'] = 'subido'
        _guardar_ficha(fp, ficha)
        print(f"   ✅ subido como BORRADOR. img: {img_url}")
    print("\nListo. Revisa y luego: publicar <slug>")

def _set_estado(proyecto, url, secret, slugs, todos, estado_db, estado_local, desde):
    sel = _seleccion(proyecto, set(slugs), todos, filtro_estado=desde)
    if not sel: raise SystemExit("No hay productos que coincidan (¿ya están subidos?).")
    for fp, ficha in sel:
        st, body = http('PATCH', f"{url}/rest/v1/products?id=eq.{ficha['id']}", secret,
                        data={'estado': estado_db}, headers={'Prefer': 'return=representation'})
        if st not in (200, 204):
            print(f"   ❌ {ficha['id']} error ({st}): {body[:300]}"); continue
        ficha['estado_local'] = estado_local; _guardar_ficha(fp, ficha)
        print(f"   {'✅ PUBLICADO' if estado_db=='publicado' else '📝 a borrador'}: {ficha['id']}")

def cmd_publicar(proyecto, url, secret, args):
    _set_estado(proyecto, url, secret, args.slugs, args.todos_subidos,
                'publicado', 'publicado', desde={'subido', 'publicado'})
    print("\n🌙 Publicado(s). Aparecen en la web al instante.")

def cmd_despublicar(proyecto, url, secret, args):
    _set_estado(proyecto, url, secret, args.slugs, False, 'borrador', 'subido', desde=None)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--proyecto')
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('listar')
    p = sub.add_parser('subir'); p.add_argument('slugs', nargs='*'); p.add_argument('--todos', action='store_true')
    p = sub.add_parser('publicar'); p.add_argument('slugs', nargs='*'); p.add_argument('--todos-subidos', action='store_true')
    p = sub.add_parser('despublicar'); p.add_argument('slugs', nargs='+')
    args = ap.parse_args()
    proyecto = find_proyecto(args.proyecto)
    url, secret = load_env(proyecto)
    {'listar': cmd_listar, 'subir': cmd_subir, 'publicar': cmd_publicar, 'despublicar': cmd_despublicar}[args.cmd](proyecto, url, secret, args)

if __name__ == '__main__':
    main()
