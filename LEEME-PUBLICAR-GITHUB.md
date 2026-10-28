# Publicar en GitHub (sin Supabase)

1. Instalá Python 3 si no lo tenés. En esta carpeta hacé doble clic en **EXPORTAR.bat**
   (o corré `python exportar_supabase.py`; con `--rapido` va más veloz y se saltea las capturas automáticas).
2. Se crean:
   - `data/catalogo.json` → discos, juegos, consolas, precios, stock y links de descarga.
   - `img/` → todas las carátulas y capturas descargadas.
3. Probalo local: `python -m http.server 8000` y abrí http://localhost:8000
4. Subí **toda la carpeta** a un repositorio de GitHub y activá Settings → Pages (rama main, carpeta /root).

Mientras exista `data/catalogo.json` la app NO usa Supabase: funciona sin internet
(salvo trailers de YouTube y fuentes), y se ocultan los botones de editor/revendedor.
Si algún día borrás `data/catalogo.json`, vuelve a funcionar con Supabase como antes.

Para actualizar el catálogo: editá `data/catalogo.json` a mano, o volvé a correr el exportador
mientras Supabase siga activo. Los links de revendedores (?rev=...) y las cuentas no se exportan
(en modo estático no hay login). Antes de publicar, podés borrar la clave de `supabase-config.js`
si no vas a volver a usar Supabase.
