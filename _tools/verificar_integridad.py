#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Guard de integridad — Web_Luna3D_v3
===================================
Detecta y previene la corrupcion de escritura del sistema de archivos virtual de
Google Drive para Escritorio (documentada el 2026-07-01). Dos firmas reales:

  1. TRUNCAMIENTO: la escritura se corta a mitad; el archivo queda como un
     prefijo del contenido correcto, terminando a mitad de token. Sin bytes nulos.
  2. COLA DE NULOS: el contenido correcto queda completo pero se le agregan bytes
     \\x00 al final, inflando el tamano por encima del contenido real.

Los archivos de codigo/texto (.css .js .html .md .json .svg) NUNCA contienen
\\x00 de forma legitima, asi que un solo byte nulo == corrupcion.

USO
---
  python3 verificar_integridad.py scan [RAIZ]
      Escanea RAIZ (por defecto la carpeta del script hacia arriba) y reporta
      cualquier archivo de texto con bytes nulos. Sale con codigo 1 si hay algo.

  python3 verificar_integridad.py verify ORIGEN DESTINO
      Verifica que DESTINO sea byte-identico a ORIGEN (sha256) y sin nulos.
      Sale con codigo 1 si difieren. Usar tras copiar un archivo al mount.

  python3 verificar_integridad.py safecopy ORIGEN DESTINO [INTENTOS]
      Copia ORIGEN -> DESTINO y verifica sha256 tras cada intento (default 4).
      Reintenta si no coincide. Sale 0 solo si el destino quedo integro; si
      falla, deja el destino y sale 1 (NO declarar exito ni hacer push).

Pensado para que CUALQUIER sesion futura, en vez de editar/copiar a ciegas sobre
el mount, use `safecopy` (o `verify` despues) y jamas suba a produccion un archivo
que no haya pasado la verificacion.
"""
import sys, os, hashlib, shutil, time

TEXT_EXTS = {'.css','.js','.mjs','.cjs','.html','.htm','.md','.json','.svg','.txt','.xml','.csv'}
SKIP_DIRS = {'.git','_Papelera','node_modules','.vercel','.claude-secrets'}

def sha256(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()

def nulls(path):
    with open(path,'rb') as f:
        return f.read().count(b'\x00')

def cmd_scan(root):
    root=os.path.abspath(root)
    bad=[]; checked=0
    for dp,dns,fns in os.walk(root):
        dns[:]=[d for d in dns if d not in SKIP_DIRS]
        for fn in fns:
            if '.bak' in fn: continue
            if os.path.splitext(fn)[1].lower() not in TEXT_EXTS: continue
            p=os.path.join(dp,fn)
            try: n=nulls(p)
            except Exception: continue
            checked+=1
            if n: bad.append((p, os.path.getsize(p), n))
    print(f"[scan] {checked} archivos de texto revisados en {root}")
    if bad:
        print("[scan] !!! CORRUPTOS (bytes nulos) — NO desplegar:")
        for p,s,n in bad: print(f"        {p}  size={s} nulls={n}")
        return 1
    print("[scan] OK — 0 archivos con bytes nulos.")
    return 0

def cmd_verify(src, dst):
    if not os.path.exists(dst):
        print(f"[verify] FALLA — destino no existe: {dst}"); return 1
    n=nulls(dst)
    if n:
        print(f"[verify] FALLA — destino tiene {n} bytes nulos: {dst}"); return 1
    hs, hd = sha256(src), sha256(dst)
    ss, sd = os.path.getsize(src), os.path.getsize(dst)
    if hs==hd:
        print(f"[verify] OK — identico ({ss} bytes, sha256 {hs[:12]}...)")
        return 0
    print(f"[verify] FALLA — difieren  origen={ss}B {hs[:12]}  destino={sd}B {hd[:12]}")
    return 1

def cmd_safecopy(src, dst, intentos=4):
    hs=sha256(src); ss=os.path.getsize(src)
    for i in range(1,intentos+1):
        shutil.copyfile(src,dst)
        try:    os.replace(dst,dst)  # no-op, fuerza flush de metadatos en algunos FS
        except Exception: pass
        time.sleep(0.4)  # dar margen al cliente de sync
        if os.path.exists(dst) and nulls(dst)==0 and sha256(dst)==hs:
            print(f"[safecopy] OK en intento {i} — {ss} bytes, sha256 {hs[:12]}...")
            return 0
        print(f"[safecopy] intento {i} fallo (destino corrupto o distinto); reintentando…")
    print(f"[safecopy] FALLA tras {intentos} intentos — NO declarar exito ni hacer push: {dst}")
    return 1

def main(argv):
    if len(argv)<2:
        print(__doc__); return 2
    c=argv[1]
    if c=='scan':
        return cmd_scan(argv[2] if len(argv)>2 else os.path.dirname(os.path.abspath(__file__)) or '.')
    if c=='verify' and len(argv)>=4:
        return cmd_verify(argv[2], argv[3])
    if c=='safecopy' and len(argv)>=4:
        return cmd_safecopy(argv[2], argv[3], int(argv[4]) if len(argv)>4 else 4)
    print(__doc__); return 2

if __name__=='__main__':
    sys.exit(main(sys.argv))
