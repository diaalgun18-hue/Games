// ====== Extras: perfil personal por usuario, categorías generales con iconos,
// tarjetas de navegación y efecto de mouse en el banner. ======
// Nada de esto toca los datos originales del catálogo (discos / juegos):
// todo lo personal vive en un "perfil" aparte (localStorage si no hay cuenta,
// tabla perfiles_usuario de Supabase si hay cuenta).

// ---------------------------------------------------------------- Iconos
const SVG_ICONS = {
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  sword: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/>',
  crosshair: '<circle cx="12" cy="12" r="10"/><path d="M22 12h-4M6 12H2M12 6V2M12 22v-4"/><circle cx="12" cy="12" r="1.5"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-1.21 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98 1.21 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  skull: '<circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/>',
  swords: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/><path d="M14.5 6.5 18 3h3v3l-3.5 3.5"/><path d="M5 14l4 4"/><path d="M7 17l-3 3"/><path d="M3 19l2 2"/>',
  wheel: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2.5"/><path d="M3.5 9.5 9.6 11M20.5 9.5 14.4 11M12 14.5V22"/>',
  stairs: '<polyline points="3 20 3 16 8 16 8 12 13 12 13 8 18 8 18 4 21 4"/><path d="M3 20h18"/>',
  gamepad: '<path d="M6 11h4M8 9v4"/><path d="M15 12h.01M18 10h.01"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258A4 4 0 0 0 17.32 5z"/>',
  joystick: '<circle cx="12" cy="6" r="3"/><path d="M12 9v6"/><rect x="4" y="15" width="16" height="6" rx="2"/><path d="M8 18h.01M16 18h.01"/>',
  tag: '<path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.2"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  pencil: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
};
export function iconSvg(name, size = 24) {
  const body = SVG_ICONS[name] || SVG_ICONS.tag;
  return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

// ---------------------------------------------------- Categorías generales
// Cada juego tiene una categoría libre (ej. "Survival Horror", "Hack and Slash").
// Para navegar fácil se agrupan en pocas categorías generales con su icono.
export const GENERAL_CATS = [
  { id: "Acción",      icon: "zap",       re: /acci[oó]n|hack|beat|sigilo|infiltra|mecha|espionaje/ },
  { id: "Aventura",    icon: "compass",   re: /aventura|mundo abierto|exploraci/ },
  { id: "RPG",         icon: "sword",     re: /\brpg\b|rol\b/ },
  { id: "Disparos",    icon: "crosshair", re: /shooter|disparo|\bfps\b|tirador/ },
  { id: "Deportes",    icon: "trophy",    re: /deporte|f[uú]tbol|baloncesto|boxeo|tenis|golf/ },
  { id: "Terror",      icon: "skull",     re: /terror|horror|survival/ },
  { id: "Lucha",       icon: "swords",    re: /lucha|pelea|fighting/ },
  { id: "Carreras",    icon: "wheel",     re: /carrera|conducci|racing|tuning/ },
  { id: "Plataformas", icon: "stairs",    re: /plataforma/ },
  { id: "Arcade",      icon: "joystick",  re: /arcade|fiesta|musical|trivia|puzzle|party|minijuego/ },
];
const GENERAL_BY_ID = Object.fromEntries(GENERAL_CATS.map(c => [c.id, c]));

export function normalizeText(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
// Texto libre -> categoría general. Si no encaja en ninguna, se conserva tal cual
// (así una categoría nueva que cree el editor igual aparece como tarjeta propia).
export function generalCategoryOf(raw) {
  const t = String(raw || "").toLowerCase();
  if (!t.trim()) return "Otros";
  const hit = GENERAL_CATS.find(c => c.re.test(t));
  if (hit) return hit.id;
  return String(raw).trim();
}
export function categoryIconName(id) {
  return (GENERAL_BY_ID[id] && GENERAL_BY_ID[id].icon) || "tag";
}
// Orden de las tarjetas: primero las generales (en su orden fijo), después las propias.
export function sortCategoryIds(ids) {
  const order = GENERAL_CATS.map(c => c.id);
  return [...ids].sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b);
  });
}

// Tarjetas de navegación (icono arriba, nombre abajo) + tarjeta ancha "todas".
export function renderCatTiles(box, o) {
  if (!box) return;
  box.innerHTML = "";
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  o.items.forEach(({ id, count }) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cat-tile" + (id === o.current ? " active" : "");
    b.dataset.cat = id;
    b.setAttribute("aria-pressed", id === o.current ? "true" : "false");
    b.innerHTML = `<span class="cat-ic">${iconSvg(categoryIconName(id), 34)}</span><span class="cat-lb">${esc(id)}</span><span class="cat-n">${count}</span>`;
    b.onclick = () => o.onPick(id === o.current ? "Todas" : id);
    box.appendChild(b);
  });
  const all = document.createElement("button");
  all.type = "button";
  all.className = "cat-tile cat-all" + (o.current === "Todas" ? " active" : "");
  all.setAttribute("aria-pressed", o.current === "Todas" ? "true" : "false");
  all.innerHTML = `<span class="cat-ic">${iconSvg("gamepad", 40)}</span>
    <span class="cat-all-txt"><b class="t-full">${esc(o.allTitle)}</b><b class="t-short">Todos</b><small>${esc(o.allSub)}</small></span>`;
  all.onclick = () => o.onPick("Todas");
  box.appendChild(all);
}

// ----------------------------------------------------------------- Aviso
let toastTimer = null;
export function toast(msg) {
  let el = document.getElementById("ps2Toast");
  if (!el) { el = document.createElement("div"); el.id = "ps2Toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
  el.textContent = msg; el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

// ---------------------------------------------------------------- Perfil
const LS_GUEST = "ps2gp_perfil_invitado_v1";
const LS_CACHE = (uid) => `ps2gp_perfil_cache_${uid}`;
const USER_DOMAIN = "usuarios.ps2gamepass.local";
const VALID_ESTADOS = new Set(["no_jugado", "para_jugar", "en_curso", "finalizado"]);

const emptyData = () => ({ estados: {}, categorias: {}, discos: {} });
function sanitize(d) {
  const out = emptyData();
  if (!d || typeof d !== "object") return out;
  for (const [k, v] of Object.entries(d.estados || {})) if (VALID_ESTADOS.has(v)) out.estados[k] = v;
  for (const [k, v] of Object.entries(d.categorias || {})) if (typeof v === "string" && v.trim()) out.categorias[k] = v.trim().slice(0, 40);
  for (const [k, v] of Object.entries(d.discos || {})) if (typeof v === "string" && v.trim()) out.discos[k] = v.trim().slice(0, 60);
  return out;
}
const hasContent = (d) => Object.keys(d.estados).length + Object.keys(d.categorias).length + Object.keys(d.discos).length > 0;
const readLS = (key) => { try { return sanitize(JSON.parse(localStorage.getItem(key))); } catch (e) { return emptyData(); } };
const writeLS = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* almacenamiento lleno o bloqueado */ } };

export function userEmail(usuario) { return `u_${usuario}@${USER_DOMAIN}`; }
export function cleanUsername(u) { return String(u || "").trim().toLowerCase(); }
export function isValidUsername(u) { return /^[a-z0-9._-]{3,20}$/.test(u); }

function friendlyAuthError(err) {
  const m = String((err && err.message) || err || "").toLowerCase();
  if (m.includes("invalid login")) return "Usuario o contraseña incorrectos.";
  if (m.includes("already") && m.includes("registered")) return "Ese usuario ya existe. Probá con otro.";
  if (m.includes("rate limit")) return "Demasiados intentos. Esperá un rato y probá de nuevo.";
  if (m.includes("not confirmed")) return "La cuenta necesita confirmación. El administrador tiene que desactivar \"Confirm email\" en Supabase (ver README, paso 4.2).";
  if (m.includes("signups not allowed") || m.includes("signup is disabled") || m.includes("signups are disabled")) return "El registro de cuentas está desactivado en Supabase.";
  if (m.includes("password")) return "La contraseña tiene que tener al menos 6 caracteres.";
  return "No se pudo completar la operación. Revisá tu conexión e intentá de nuevo.";
}

export function createPerfil({ getClient, onChange }) {
  let data = readLS(LS_GUEST);
  let uid = null, usuario = null, loadedFor = null, saveTimer = null, warned = false;

  const key = () => (uid ? LS_CACHE(uid) : LS_GUEST);
  const fire = (kind, extra) => onChange && onChange({ kind, ...extra });

  async function pushCloud() {
    const sb = getClient();
    if (!sb || !uid) return true;
    const { error } = await sb.from("perfiles_usuario").upsert(
      { user_id: uid, usuario, datos: data, actualizado_en: new Date().toISOString() },
      { onConflict: "user_id" });
    if (error) {
      console.error(error);
      if (!warned) { warned = true; toast("No se pudo guardar en tu cuenta. Quedó guardado en este navegador."); }
      return false;
    }
    warned = false;
    return true;
  }
  function persist() {
    writeLS(key(), data);
    if (!uid) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(pushCloud, 600);
  }
  function mutate(kind, fn, extra) { fn(); persist(); fire(kind, extra); }

  let inflight = null;
  const doAttach = (session) => api._doAttach(session);
  const api = {
    get uid() { return uid; },
    get usuario() { return usuario; },
    get isAccount() { return !!uid; },
    getEstado: (id) => data.estados[id] || null,
    setEstado(id, val) { mutate("estado", () => { if (val && VALID_ESTADOS.has(val)) data.estados[id] = val; else delete data.estados[id]; }, { id }); },
    getCategoria: (id) => data.categorias[id] || null,
    setCategoria(id, val) { mutate("categoria", () => { const v = (val || "").trim().slice(0, 40); if (v) data.categorias[id] = v; else delete data.categorias[id]; }, { id }); },
    getDiscoNombre: (id) => data.discos[id] || null,
    setDiscoNombre(id, val) { mutate("disco", () => { const v = (val || "").trim().slice(0, 60); if (v) data.discos[id] = v; else delete data.discos[id]; }, { id }); },
    counts() {
      const c = { para_jugar: 0, en_curso: 0, finalizado: 0, categorias: Object.keys(data.categorias).length, discos: Object.keys(data.discos).length };
      Object.values(data.estados).forEach(v => { if (c[v] != null) c[v]++; });
      return c;
    },
    hasChanges: () => hasContent(data),
    reset() { mutate("todo", () => { data = emptyData(); }); },

    // Decide de dónde salen los datos según la sesión actual.
    attach(session) {
      const id = session && session.user ? session.user.id : "guest";
      if (inflight && inflight.id === id) return inflight.p;
      const p = doAttach(session).finally(() => { if (inflight && inflight.p === p) inflight = null; });
      inflight = { id, p };
      return p;
    },
    async _doAttach(session) {
      const email = (session && session.user && session.user.email) || "";
      const esCuenta = email.endsWith("@" + USER_DOMAIN);
      if (!esCuenta) {
        if (uid === null && loadedFor === "guest") return;
        clearTimeout(saveTimer);
        uid = null; usuario = null; loadedFor = "guest";
        data = readLS(LS_GUEST);
        fire("todo");
        return;
      }
      if (uid === session.user.id && loadedFor === uid) return;
      uid = session.user.id;
      usuario = email.slice(2, email.indexOf("@"));
      const sb = getClient();
      let cloud = null;
      if (sb) {
        const { data: row, error } = await sb.from("perfiles_usuario").select("datos").eq("user_id", uid).maybeSingle();
        if (error) { console.error(error); toast("No se pudo leer tu perfil (¿falta correr migracion_perfiles_usuario.sql?). Se usa la copia de este navegador."); }
        else cloud = sanitize(row && row.datos);
      }
      data = cloud || readLS(LS_CACHE(uid));
      // Lo que marcaste como invitado en este navegador se suma a tu cuenta (lo de la cuenta manda si hay choque).
      const guest = readLS(LS_GUEST);
      if (hasContent(guest)) {
        data = {
          estados: { ...guest.estados, ...data.estados },
          categorias: { ...guest.categorias, ...data.categorias },
          discos: { ...guest.discos, ...data.discos },
        };
        writeLS(LS_CACHE(uid), data);
        if (cloud && (await pushCloud())) { try { localStorage.removeItem(LS_GUEST); } catch (e) {} toast("Tus marcas de invitado se pasaron a tu cuenta."); }
      } else writeLS(LS_CACHE(uid), data);
      loadedFor = uid;
      fire("todo");
    },

    async signUp(user, pass) {
      const sb = getClient();
      if (!sb) return { error: "Las cuentas no están disponibles en este modo." };
      const u = cleanUsername(user);
      if (!isValidUsername(u)) return { error: "El usuario va de 3 a 20 caracteres: letras, números, punto, guion o guion bajo." };
      if (String(pass).length < 6) return { error: "La contraseña tiene que tener al menos 6 caracteres." };
      const { data: res, error } = await sb.auth.signUp({ email: userEmail(u), password: pass });
      if (error) return { error: friendlyAuthError(error) };
      if (!res.session) return { error: friendlyAuthError("not confirmed") };
      return { ok: true };
    },
    async signIn(user, pass) {
      const sb = getClient();
      if (!sb) return { error: "Las cuentas no están disponibles en este modo." };
      const u = cleanUsername(user);
      if (!u || !pass) return { error: "Completá usuario y contraseña." };
      const { error } = await sb.auth.signInWithPassword({ email: userEmail(u), password: pass });
      if (error) return { error: friendlyAuthError(error) };
      return { ok: true };
    },
    async signOut() {
      clearTimeout(saveTimer);
      await pushCloud();
      const sb = getClient();
      if (sb) await sb.auth.signOut();
    },
  };
  return api;
}

// ------------------------------------------------------ Panel "Mi cuenta"
export function renderUserPanel(body, perfil, o) {
  let tab = "ingresar", busy = false;
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function summary() {
    const c = perfil.counts();
    return `<div class="um-stats">
      <div><b>${c.para_jugar}</b><span>Para jugar</span></div>
      <div><b>${c.en_curso}</b><span>En curso</span></div>
      <div><b>${c.finalizado}</b><span>Jugados</span></div>
    </div>
    <p class="um-note">${c.categorias} categoría${c.categorias === 1 ? "" : "s"} y ${c.discos} nombre${c.discos === 1 ? "" : "s"} de disco personalizados.</p>`;
  }
  function resetBtn() {
    return perfil.hasChanges() ? `<button type="button" class="btn-secondary um-reset">Quitar todos mis cambios</button>` : "";
  }
  function bindReset() {
    const r = body.querySelector(".um-reset");
    if (r) r.onclick = () => {
      if (confirm("Se borran tus estados, categorías y nombres de disco personalizados. Los datos originales del catálogo no se tocan. ¿Seguir?")) { perfil.reset(); draw(); }
    };
  }

  function draw() {
    if (perfil.isAccount) {
      body.innerHTML = `
        <div class="um-head"><div class="um-avatar">${esc(perfil.usuario[0].toUpperCase())}</div>
          <div><h2>${esc(perfil.usuario)}</h2><p class="um-note">Sesión guardada en este navegador. Tus cambios se sincronizan con tu cuenta.</p></div></div>
        ${summary()}
        <div class="um-actions">${resetBtn()}<button type="button" class="btn-save um-out">Cerrar sesión</button></div>`;
      body.querySelector(".um-out").onclick = async () => { await perfil.signOut(); o.close(); };
      bindReset();
      return;
    }
    if (!o.canLogin) {
      body.innerHTML = `<h2>Mis marcas</h2>
        <p class="um-note">En este modo no hay cuentas: tus estados, categorías y nombres de disco se guardan solo en este navegador.</p>
        ${summary()}<div class="um-actions">${resetBtn()}</div>`;
      bindReset();
      return;
    }
    body.innerHTML = `
      <h2>Mi cuenta</h2>
      <p class="um-note">Sin cuenta, lo que marques queda solo en este navegador. Con cuenta lo tenés en cualquier dispositivo, y lo que ya marcaste acá se suma a tu cuenta.</p>
      <div class="um-tabs" role="tablist">
        <button type="button" role="tab" data-tab="ingresar" class="${tab === "ingresar" ? "active" : ""}">Ingresar</button>
        <button type="button" role="tab" data-tab="crear" class="${tab === "crear" ? "active" : ""}">Crear cuenta</button>
      </div>
      <form class="um-form" autocomplete="on">
        <label>Usuario<input name="user" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="20" placeholder="Ej: lucas23" required></label>
        <label>Contraseña<input name="pass" type="password" autocomplete="${tab === "crear" ? "new-password" : "current-password"}" minlength="6" placeholder="Mínimo 6 caracteres" required></label>
        <div class="um-error" role="alert"></div>
        <button type="submit" class="btn-save">${tab === "crear" ? "Crear cuenta" : "Ingresar"}</button>
      </form>
      ${perfil.hasChanges() ? summary() + `<div class="um-actions">${resetBtn()}</div>` : ""}`;
    body.querySelectorAll(".um-tabs button").forEach(b => b.onclick = () => { tab = b.dataset.tab; draw(); });
    const form = body.querySelector(".um-form");
    const err = body.querySelector(".um-error");
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (busy) return;
      busy = true; err.textContent = "";
      const btn = form.querySelector("button[type=submit]"); btn.disabled = true;
      const f = new FormData(form);
      const r = tab === "crear" ? await perfil.signUp(f.get("user"), f.get("pass")) : await perfil.signIn(f.get("user"), f.get("pass"));
      busy = false; btn.disabled = false;
      if (r.error) { err.textContent = r.error; return; }
      await o.afterAuth();
      o.close();
    };
    bindReset();
  }
  draw();
  return draw;
}

// ------------------------------------------------ Efecto de mouse del banner
// Un collage de carátulas (las del disco que estás viendo) que se inclina y se
// desplaza en capas siguiendo el mouse, con un brillo que persigue el cursor.
const DEPTHS = [16, -10, 24, -18, 8, 28, -12, 20, -6];
export function mountHero(banner, games, ctx) {
  if (banner._fxCleanup) { banner._fxCleanup(); banner._fxCleanup = null; }
  banner.classList.remove("has-fx");
  const old = banner.querySelector(".fx-layer"); if (old) old.remove();
  if (!games.length || !banner.offsetParent) return; // sin disco o banner oculto (celular): no se cargan imágenes de más

  // Selección estable (siempre las mismas para un mismo conjunto): primero las que tienen carátula propia.
  const sorted = [...games].sort((a, b) => (!!b.caratula - !!a.caratula) || a.id.localeCompare(b.id));
  const withCover = sorted.filter(g => g.caratula);
  const pool = withCover.length >= 9 ? withCover : sorted;
  const step = Math.max(1, Math.floor(pool.length / 9));
  const picks = [];
  for (let i = 0; i < pool.length && picks.length < 9; i += step) picks.push(pool[i]);

  const layer = document.createElement("div");
  layer.className = "fx-layer"; layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = `<div class="fx-glow"></div><div class="fx-stage"></div>`;
  const stage = layer.querySelector(".fx-stage");
  for (let c = 0; c < 3; c++) {
    const col = document.createElement("div"); col.className = "fx-col";
    for (let r = 0; r < 3; r++) {
      const i = c * 3 + r, g = picks[i % picks.length];
      const tile = document.createElement("div");
      tile.className = "fx-tile"; tile.style.setProperty("--d", DEPTHS[i]);
      const fb = document.createElement("div"); fb.className = "cover-fallback"; fb.style.display = "none";
      const img = document.createElement("img"); img.alt = ""; img.decoding = "async";
      const fail = () => { img.style.display = "none"; ctx.autoCover(fb, g.nombre); fb.style.display = "flex"; };
      ctx.fillImg(img, g, fail);
      tile.appendChild(img); tile.appendChild(fb); col.appendChild(tile);
    }
    stage.appendChild(col);
  }
  banner.appendChild(layer);
  banner.classList.add("has-fx");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  const loop = () => {
    cx += (tx - cx) * 0.09; cy += (ty - cy) * 0.09;
    layer.style.setProperty("--px", cx.toFixed(3)); layer.style.setProperty("--py", cy.toFixed(3));
    layer.style.setProperty("--sx", ((cx + 1) * 50).toFixed(1) + "%"); layer.style.setProperty("--sy", ((cy + 1) * 50).toFixed(1) + "%");
    raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002) ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const onMove = (e) => {
    if (e.pointerType === "touch") return;
    const r = banner.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    kick();
  };
  const onLeave = () => { tx = 0; ty = 0; kick(); };
  banner.addEventListener("pointermove", onMove);
  banner.addEventListener("pointerleave", onLeave);
  banner._fxCleanup = () => { banner.removeEventListener("pointermove", onMove); banner.removeEventListener("pointerleave", onLeave); cancelAnimationFrame(raf); };
}
