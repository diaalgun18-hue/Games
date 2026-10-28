#!/usr/bin/env python3
"""
EXPORTAR SUPABASE -> CARPETA ESTÁTICA (para publicar en GitHub Pages)

Qué hace:
  1) Lee discos, juegos, consolas y config desde tu Supabase (lectura pública).
  2) Descarga TODAS las imágenes (carátulas y capturas) a la carpeta  img/
     - las que pegaste a mano por link
     - las automáticas (libretro) para los juegos que no tenían carátula
  3) Guarda todo en  data/catalogo.json  con las rutas ya apuntando a img/

Cuando existe data/catalogo.json la app funciona sola, SIN Supabase y sin
internet (salvo trailers de YouTube). Si lo borrás, vuelve a usar Supabase.

Uso (Windows o Mac/Linux), parado en la carpeta del proyecto:
    python exportar_supabase.py            (completo: carátulas + capturas)
    python exportar_supabase.py --rapido   (no busca capturas automáticas; solo
                                            baja lo que ya tenías cargado y las
                                            carátulas automáticas)
Solo usa la librería estándar de Python 3.8+. No hay que instalar nada.
Se puede volver a correr cuando quieras: reutiliza lo ya descargado.
"""
import json, os, re, sys, hashlib, time, urllib.request, urllib.parse, urllib.error
from concurrent.futures import ThreadPoolExecutor

AQUI = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(AQUI, "img")
DATA_DIR = os.path.join(AQUI, "data")
UA = {"User-Agent": "Mozilla/5.0 (exportar_supabase)"}

LIBRETRO_ROOT = "https://raw.githubusercontent.com/libretro-thumbnails"
LIBRETRO = {
    "ps2": "Sony_-_PlayStation_2", "ps1": "Sony_-_PlayStation", "psp": "Sony_-_PlayStation_Portable",
    "xbox": "Microsoft_-_Xbox", "xbox360": "Microsoft_-_Xbox_360", "gamecube": "Nintendo_-_GameCube",
    "wii": "Nintendo_-_Wii", "n64": "Nintendo_-_Nintendo_64",
    "snes": "Nintendo_-_Super_Nintendo_Entertainment_System",
    "nes": "Nintendo_-_Nintendo_Entertainment_System", "gba": "Nintendo_-_Game_Boy_Advance",
    "dreamcast": "Sega_-_Dreamcast", "megadrive": "Sega_-_Mega_Drive_-_Genesis",
}
RAPIDO = "--rapido" in sys.argv
REGIONS = ["(USA)", "(Europe)", "(Europe, Australia)", "(Japan)", ""]


def leer_config():
    txt = open(os.path.join(AQUI, "supabase-config.js"), encoding="utf-8").read()
    url = re.search(r'url:\s*"([^"]+)"', txt).group(1).rstrip("/")
    key = re.search(r'anonKey:\s*"([^"]+)"', txt).group(1)
    return url, key


def pedir(url, headers=None, timeout=30):
    req = urllib.request.Request(url, headers={**UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read(), r.headers


def tabla(url, key, nombre):
    """Trae una tabla completa (paginando de a 1000 filas)."""
    filas, desde = [], 0
    while True:
        h = {"apikey": key, "Authorization": "Bearer " + key,
             "Range-Unit": "items", "Range": f"{desde}-{desde + 999}"}
        try:
            cuerpo, _ = pedir(f"{url}/rest/v1/{nombre}?select=*", h)
        except urllib.error.HTTPError as e:
            if e.code in (404, 400):   # tabla inexistente (proyectos viejos)
                return []
            raise
        lote = json.loads(cuerpo)
        filas += lote
        if len(lote) < 1000:
            return filas
        desde += 1000


# ---- misma lógica de nombres que usa la app para buscar carátulas libretro ----
def libretro_base(n):
    n = re.sub(r":\s*", " - ", n)
    n = re.sub(r'[*?"<>|]', "_", n)
    return n.replace("/", "_").strip()


def variantes(nombre):
    base = libretro_base(nombre)
    bases = [base, re.sub(r" - .*", "", base).strip(), re.sub(r"\(.*?\)", "", base, 1).strip(),
             re.sub(r"\(.*?\)", "", nombre, 1).strip()]
    extra = []
    for b in bases:
        if not b:
            continue
        if "&" in b: extra.append(b.replace("&", "and"))
        if re.search(r"\band\b", b, re.I): extra.append(re.sub(r"\band\b", "&", b, flags=re.I))
        if re.match(r"^the\s+", b, re.I): extra.append(re.sub(r"^the\s+", "", b, flags=re.I) + ", The")
        extra.append(re.sub(r"\s*:\s*", " - ", b))
        extra.append(b.replace("’", "'").replace("‘", "'"))
    out, vistos = [], set()
    for b in bases + extra:
        if not b: continue
        for r in REGIONS:
            v = f"{b} {r}" if r else b
            if v not in vistos:
                vistos.add(v); out.append(v)
    return out


def ext_de(url, cabeceras):
    ct = (cabeceras.get("Content-Type") or "").split(";")[0].strip().lower()
    m = {"image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png", "image/webp": ".webp",
         "image/gif": ".gif", "image/avif": ".avif", "image/svg+xml": ".svg"}
    if ct in m: return m[ct]
    e = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower()
    return e if e in (".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg") else ".jpg"


def descargar(url, destino_base):
    """Descarga url a destino_base+ext. Devuelve ruta relativa o None."""
    for ya in os.listdir(os.path.dirname(destino_base)) if os.path.isdir(os.path.dirname(destino_base)) else []:
        if ya.startswith(os.path.basename(destino_base) + "."):
            return os.path.relpath(os.path.join(os.path.dirname(destino_base), ya), AQUI).replace("\\", "/")
    try:
        cuerpo, cab = pedir(url, timeout=12)
        ct = (cab.get("Content-Type") or "").lower()
        if len(cuerpo) < 500 or ("image" not in ct and "octet" not in ct and not ct.startswith("binary")):
            return None
        os.makedirs(os.path.dirname(destino_base), exist_ok=True)
        ruta = destino_base + ext_de(url, cab)
        open(ruta, "wb").write(cuerpo)
        return os.path.relpath(ruta, AQUI).replace("\\", "/")
    except Exception:
        return None


def slug(s):
    s = re.sub(r"[^a-zA-Z0-9_-]+", "-", str(s)).strip("-")[:60] or "x"
    return s + "-" + hashlib.md5(str(s).encode()).hexdigest()[:6]


def procesar_juego(args):
    g, plat_disco = args
    carpeta = os.path.join(IMG_DIR, slug(g["id"]))
    log = []
    campos = [("caratula", "box", "Named_Boxarts"), ("shot1", "snap1", "Named_Snaps"),
              ("shot2", "snap2", "Named_Titles")]
    for campo, nombre_arch, carpeta_libretro in campos:
        if RAPIDO and campo != "caratula" and not g.get(campo):
            continue
        destino = os.path.join(carpeta, nombre_arch)
        original = g.get(campo)
        if original and original.startswith(("http://", "https://")):
            # Si es un link de búsqueda (Google/Bing) no es imagen directa; se ignora.
            ruta = descargar(original, destino)
            if ruta: g[campo] = ruta
            else: log.append(f"   ✗ {g['nombre']} · {campo}: no se pudo bajar ({original[:70]})")
        elif original and not original.startswith("img/"):
            pass
        elif not original:
            repo = LIBRETRO.get(plat_disco)
            if repo:
                for v in variantes(g["nombre"]):
                    u = f"{LIBRETRO_ROOT}/{repo}/master/{carpeta_libretro}/{urllib.parse.quote(v + '.png')}"
                    ruta = descargar(u, destino)
                    if ruta:
                        g[campo] = ruta
                        break
    return g, log


def main():
    url, key = leer_config()
    print("→ Leyendo datos de Supabase…")
    discos = tabla(url, key, "discos")
    juegos = tabla(url, key, "juegos")
    plataformas = tabla(url, key, "plataformas")
    cfg = tabla(url, key, "config")
    config = cfg[0] if cfg else {"link_descarga_general": None}
    print(f"   {len(discos)} discos · {len(juegos)} juegos · {len(plataformas)} consolas propias")

    if not discos and not juegos:
        print("✗ No llegó ningún dato. Revisá supabase-config.js y tu internet."); sys.exit(1)

    plat_de = {str(d["id"]): (d.get("plataforma") or "ps2") for d in discos}
    print("→ Descargando imágenes (puede tardar unos minutos, se puede repetir sin problema)…")
    os.makedirs(IMG_DIR, exist_ok=True)
    tareas = [(g, plat_de.get(str(g["disco"]), "ps2")) for g in juegos]
    hechos, fallos, n = [], [], 0
    with ThreadPoolExecutor(max_workers=12) as ex:
        for g, log in ex.map(procesar_juego, tareas):
            hechos.append(g); fallos += log; n += 1
            if n % 25 == 0 or n == len(tareas):
                print(f"   {n}/{len(tareas)} juegos procesados")

    # Logos de marca de discos/consolas, si existieran en alguna tabla, no se usan en modo estático.
    os.makedirs(DATA_DIR, exist_ok=True)
    salida = {"exportado_en": time.strftime("%Y-%m-%d %H:%M:%S"), "discos": discos,
              "juegos": hechos, "plataformas": plataformas, "config": config}
    with open(os.path.join(DATA_DIR, "catalogo.json"), "w", encoding="utf-8") as f:
        json.dump(salida, f, ensure_ascii=False, indent=1)

    con_img = sum(1 for g in hechos if str(g.get("caratula") or "").startswith("img/"))
    print(f"\n✔ Listo: data/catalogo.json  ·  {con_img}/{len(hechos)} juegos con carátula local")
    if fallos:
        print(f"⚠ {len(fallos)} imágenes no se pudieron bajar (links rotos o caídos); la app muestra el póster con iniciales:")
        for l in fallos[:40]: print(l)
        if len(fallos) > 40: print(f"   … y {len(fallos)-40} más")
    print("\nSiguiente paso: probá abriendo la carpeta con un servidor local, y subila a GitHub.")


if __name__ == "__main__":
    main()
