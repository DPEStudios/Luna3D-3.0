#!/usr/bin/env python3
"""
servidor.py — Editor visual de borradores de productos Luna 3D.

Levanta un mini-servidor LOCAL (solo en tu PC) que:
  - sirve el editor (se ve como la página, reusa styles.css del proyecto),
  - lee los borradores de _Borradores_Productos/**/ficha.json,
  - guarda tus ediciones de vuelta al ficha.json (recalcula el margen),
  - permite marcar la DECISIÓN de cada producto: pendiente | listo | rechazado.
    Al rechazar, mueve la carpeta del borrador a _Papelera (no borra).

Categorías y subcategorías son LIBRES (texto): no hay lista cerrada. El editor
ofrece las existentes como sugerencia, pero puedes escribir una nueva.

Uso:
    python3 _editor/servidor.py     ->  http://localhost:8090
No instala nada (solo librería estándar). No sube nada a internet.
"""
import json, os, re, shutil, datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial

AQUI = os.path.dirname(os.path.abspath(__file__))
PROYECTO = os.path.dirname(AQUI)
BORRADORES = os.path.join(PROYECTO, '_Borradores_Productos')
PAPELERA = os.path.join(PROYECTO, '_Papelera')
IMG_EXT = ('.jpg', '.jpeg', '.png', '.webp')
# Campos que el editor puede modificar; el resto de la ficha queda intacto.
EDITABLES = ['name', 'cat', 'cat_nombre', 'subcat', 'price', 'desc', 'colors',
             'dimensiones', 'costo', 'gramos', 'tiempo_min', 'decision']
DECISIONES = ('pendiente', 'listo', 'rechazado')
PORT = int(os.environ.get('EDITOR_PORT', '8090'))


def _slug(txt):
    txt = (txt or '').lower().strip()
    for a, b in {'á':'a','é':'e','í':'i','ó':'o','ú':'u','ñ':'n','ü':'u'}.items():
        txt = txt.replace(a, b)
    txt = re.sub(r'[^a-z0-9]+', '-', txt).strip('-')
    return re.sub(r'-+', '-', txt)


def _num(v):
    if v is None or v == '':
        return None
    try:
        f = float(v)
        return int(f) if f == int(f) else f
    except (TypeError, ValueError):
        return None


def _margen(price, costo):
    p, c = _num(price), _num(costo)
    if p and c is not None and p > 0:
        return round((p - c) / p, 4)
    return None


def _img_rel(carpeta, fid):
    cand = [f"{fid}{e}" for e in IMG_EXT]
    archivos = sorted(os.listdir(carpeta))
    elegido = next((a for a in cand if a in archivos), None)
    if not elegido:
        elegido = next((a for a in archivos if a.lower().endswith(IMG_EXT)), None)
    if not elegido:
        return None
    rel = os.path.relpath(os.path.join(carpeta, elegido), PROYECTO)
    return '/' + rel.replace(os.sep, '/')


def escanear():
    out = []
    if not os.path.isdir(BORRADORES):
        return out
    for raiz, _dirs, files in os.walk(BORRADORES):
        if 'ficha.json' not in files:
            continue
        ruta = os.path.join(raiz, 'ficha.json')
        try:
            with open(ruta, encoding='utf-8') as fh:
                f = json.load(fh)
        except Exception as e:
            f = {'name': '(ficha ilegible)', '_error': str(e)}
        f.setdefault('decision', 'pendiente')
        f['_ruta'] = '/' + os.path.relpath(ruta, PROYECTO).replace(os.sep, '/')
        f['_img'] = _img_rel(raiz, f.get('id', ''))
        out.append(f)
    out.sort(key=lambda x: (x.get('decision', ''), x.get('cat', ''), x.get('name', '')))
    return out


def _a_papelera(carpeta_prod, fid):
    """Mueve la carpeta del borrador a _Papelera con timestamp (nunca borra)."""
    os.makedirs(PAPELERA, exist_ok=True)
    ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    destino = os.path.join(PAPELERA, f"{ts}_{fid or 'producto'}")
    n = 1
    while os.path.exists(destino):
        destino = os.path.join(PAPELERA, f"{ts}_{fid or 'producto'}_{n}"); n += 1
    shutil.move(carpeta_prod, destino)
    return destino


def guardar(payload):
    """Reescribe el ficha.json indicado por _ruta con los campos editables.
    Si decision == 'rechazado', mueve la carpeta a _Papelera."""
    ruta_rel = re.sub(r'^/+', '', payload.get('_ruta', ''))
    abs_ruta = os.path.normpath(os.path.join(PROYECTO, ruta_rel))
    if not abs_ruta.startswith(BORRADORES) or not abs_ruta.endswith('ficha.json'):
        return False, 'ruta inválida', False
    if not os.path.isfile(abs_ruta):
        return False, 'ficha no encontrada', False
    with open(abs_ruta, encoding='utf-8') as fh:
        ficha = json.load(fh)

    for k in EDITABLES:
        if k in payload:
            ficha[k] = payload[k]

    # Categoría libre: el nombre visible manda; el slug se deriva.
    nombre_cat = (ficha.get('cat_nombre') or ficha.get('cat') or '').strip()
    if not nombre_cat:
        return False, 'falta la categoría', False
    ficha['cat_nombre'] = nombre_cat
    ficha['cat'] = _slug(nombre_cat)
    ficha['subcat'] = (str(ficha.get('subcat')).strip() or None) if ficha.get('subcat') else None

    if ficha.get('decision') not in DECISIONES:
        ficha['decision'] = 'pendiente'

    ficha['price'] = _num(ficha.get('price'))
    ficha['costo'] = _num(ficha.get('costo'))
    ficha['gramos'] = _num(ficha.get('gramos'))
    ficha['tiempo_min'] = _num(ficha.get('tiempo_min'))
    ficha['margen'] = _margen(ficha.get('price'), ficha.get('costo'))
    ficha['actualizado'] = datetime.datetime.now().isoformat(timespec='seconds')

    with open(abs_ruta, 'w', encoding='utf-8') as fh:
        json.dump(ficha, fh, ensure_ascii=False, indent=2)

    # Rechazado -> a la papelera (después de dejar la ficha actualizada).
    if ficha['decision'] == 'rechazado':
        carpeta_prod = os.path.dirname(abs_ruta)
        if os.path.commonpath([carpeta_prod, BORRADORES]) == BORRADORES and carpeta_prod != BORRADORES:
            destino = _a_papelera(carpeta_prod, ficha.get('id'))
            ficha['_papelera'] = destino
            return True, ficha, True
    return True, ficha, False


class Handler(SimpleHTTPRequestHandler):
    def _json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == '/' or self.path.startswith('/editor'):
            self.path = '/_editor/index.html'
            return super().do_GET()
        if self.path.startswith('/api/borradores'):
            return self._json({'ok': True, 'items': escanear()})
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/guardar'):
            n = int(self.headers.get('Content-Length', 0))
            try:
                payload = json.loads(self.rfile.read(n) or b'{}')
            except Exception as e:
                return self._json({'ok': False, 'error': f'json inválido: {e}'}, 400)
            ok, res, rechazado = guardar(payload)
            if not ok:
                return self._json({'ok': False, 'error': res}, 400)
            return self._json({'ok': True, 'ficha': res, 'rechazado': rechazado})
        return self._json({'ok': False, 'error': 'ruta no encontrada'}, 404)

    def log_message(self, *a):
        pass


def main():
    os.chdir(PROYECTO)
    srv = ThreadingHTTPServer(('127.0.0.1', PORT), partial(Handler, directory=PROYECTO))
    print(f"Editor Luna 3D corriendo en  http://localhost:{PORT}")
    print(f"Proyecto: {PROYECTO}")
    print("Ctrl+C para detener.")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nDetenido.")


if __name__ == '__main__':
    main()
