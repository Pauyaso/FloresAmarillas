/* =========================================================
   CONFIGURACIÓN — cambia aquí lo que quieras
   ========================================================= */
const CONFIG = {
  // Carpeta de fotos: sube tus imágenes a assets/fotos/ y aparecerán solas,
  // con cualquier nombre (jpg, jpeg, png, webp o gif).
  carpetaFotos: "assets/fotos",
  // Canción opcional (mp3). Empieza al tocar el botón, porque el iPhone
  // no deja poner música sola. Déjalo en "" si no quieres música.
  cancion: "assets/cancion.mp3",
  // Frases que flotan
  frases: ["Te quiero", "Eres mi sol ☀️", "Mi amor", "Siempre juntos", "Me encantas",
           "Eres preciosa", "Mi flor favorita", "Contigo todo brilla", "Te adoro"],
};

(() => {
  // Personalización por enlace: ?para=Lucía&de=Carlos
  const q = new URLSearchParams(location.search);
  const para = (q.get("para") || "Gianella").trim().slice(0, 30);
  const de = (q.get("de") || "").trim().slice(0, 30);
  if (para) document.getElementById("cardTitle").textContent = `Para ti, ${para} 💛`;
  if (de) document.getElementById("sign").textContent = `— ${de}`;

  const phrases = CONFIG.frases.slice();
  if (para) phrases.push(para + " 💛");

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cv = document.getElementById("sky");
  const ctx = cv.getContext("2d");
  let W, H, dpr, t = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildHeart();
    if (reduce) { ctx.fillStyle = "#07060a"; ctx.fillRect(0, 0, W, H); draw(); }
  }

  // Polvo dorado que gira en espiral
  const dust = Array.from({ length: 420 }, () => ({
    a: Math.random() * Math.PI * 2,
    r: Math.pow(Math.random(), .6),
    s: .002 + Math.random() * .006,
    z: .4 + Math.random() * 1.6,
    tw: Math.random() * Math.PI * 2
  }));

  // Partículas que forman el corazón
  let heart = [];
  function buildHeart() {
    const scale = Math.min(W, H) / 38;
    const cx = W / 2, cy = H * .36;
    heart = [];
    for (let i = 0; i < 260; i++) {
      const k = (i / 260) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(k), 3);
      const y = -(13 * Math.cos(k) - 5 * Math.cos(2 * k) - 2 * Math.cos(3 * k) - Math.cos(4 * k));
      heart.push({
        tx: cx + x * scale, ty: cy + y * scale,
        x: reduce ? cx + x * scale : W / 2 + (Math.random() - .5) * W,
        y: reduce ? cy + y * scale : H * .65 + (Math.random() - .5) * 40,
        z: .6 + Math.random() * 1.4, tw: Math.random() * 6
      });
    }
  }

  function draw() {
    t++;
    ctx.fillStyle = "rgba(7, 6, 10, 0.28)";
    ctx.fillRect(0, 0, W, H);

    // Resplandor central
    const cx = W / 2, cy = H * .65;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * .45);
    g.addColorStop(0, "rgba(255, 220, 90, 0.20)");
    g.addColorStop(1, "rgba(255, 220, 90, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Galaxia de polvo
    const R = Math.max(W, H) * .6;
    for (const p of dust) {
      p.a += reduce ? 0 : p.s;
      const x = cx + Math.cos(p.a) * p.r * R;
      const y = cy + Math.sin(p.a) * p.r * R * .28;
      const alpha = .35 + .65 * Math.abs(Math.sin(t * .03 + p.tw));
      ctx.fillStyle = `rgba(255, ${200 + (p.z * 20 | 0)}, 60, ${alpha})`;
      ctx.beginPath(); ctx.arc(x, y, p.z, 0, 7); ctx.fill();
    }

    // Corazón que se va formando
    const pull = Math.min(1, t / 240);
    const beat = 1 + Math.sin(t * .06) * .025;
    for (const p of heart) {
      const tx = W / 2 + (p.tx - W / 2) * beat, ty = H * .36 + (p.ty - H * .36) * beat;
      p.x += (tx - p.x) * .04 * pull;
      p.y += (ty - p.y) * .04 * pull;
      const alpha = .5 + .5 * Math.sin(t * .05 + p.tw);
      ctx.fillStyle = `rgba(255, 215, 80, ${alpha})`;
      ctx.shadowColor = "rgba(255, 200, 40, .9)"; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.z, 0, 7); ctx.fill();
    }
    ctx.shadowBlur = 0;

    if (!reduce) requestAnimationFrame(draw);
  }

  const layer = document.getElementById("floaters");
  function spawn(cls, text, size) {
    const el = document.createElement("div");
    el.className = cls;
    el.textContent = text;
    el.style.left = (4 + Math.random() * (cls === "phrase" ? 52 : 82)) + "%";
    el.style.top = (15 + Math.random() * 72) + "%";
    el.style.fontSize = size + "px";
    el.style.setProperty("--dur", (7 + Math.random() * 5) + "s");
    el.style.setProperty("--r0", (Math.random() * 30 - 15) + "deg");
    el.style.setProperty("--r1", (Math.random() * 30 - 15) + "deg");
    layer.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
  const blooms = ["🌻", "🌼", "💐", "🌻", "🌼"];
  setInterval(() => spawn("flower", blooms[Math.random() * blooms.length | 0], 26 + Math.random() * 30), 700);
  setInterval(() => spawn("phrase", phrases[Math.random() * phrases.length | 0], 20 + Math.random() * 14), 1300);

  // Fotos: se leen solas de la carpeta
  const fotos = [];
  const esImagen = n => /\.(jpe?g|png|webp|gif)$/i.test(n);
  function probar(src) {
    return new Promise(ok => {
      const im = new Image();
      im.onload = () => { fotos.push(src); ok(true); };
      im.onerror = () => ok(false);
      im.src = src;
    });
  }
  function usarLista(carpeta, nombres) {
    nombres = [...new Set(nombres)].filter(esImagen);
    nombres.sort(() => Math.random() - .5);
    nombres.forEach(n => probar(`${carpeta}/${encodeURIComponent(n)}`));
    return nombres.length > 0;
  }
  async function listarGitHub(carpeta) {
    const host = location.hostname;
    if (!host.endsWith(".github.io")) return [];
    const usuario = host.split(".")[0];
    const primera = location.pathname.split("/").filter(Boolean)[0];
    const repo = primera && !primera.includes(".") ? primera : host;
    const api = `https://api.github.com/repos/${usuario}/${repo}`;
    const listar = async ref => {
      try {
        const r = await fetch(`${api}/contents/${carpeta}${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`);
        if (!r.ok) return [];
        return (await r.json()).filter(f => f.type === "file").map(f => f.name);
      } catch (e) { return []; }
    };
    // Primero la rama por defecto; si ahí no hay fotos, probamos las demás ramas
    let nombres = await listar("");
    if (nombres.some(esImagen)) return nombres;
    try {
      const r = await fetch(`${api}/branches`);
      if (r.ok) {
        for (const b of await r.json()) {
          nombres = await listar(b.name);
          if (nombres.some(esImagen)) return nombres;
        }
      }
    } catch (e) {}
    return [];
  }
  async function listarServidor(carpeta) {
    // Servidores locales (Live Server, python -m http.server...) muestran el
    // contenido de la carpeta como una página con enlaces: los leemos.
    try {
      const r = await fetch(`${carpeta}/`);
      if (!r.ok) return [];
      const doc = new DOMParser().parseFromString(await r.text(), "text/html");
      return [...doc.querySelectorAll("a[href]")]
        .map(a => decodeURIComponent(a.getAttribute("href").split(/[?#]/)[0].split("/").pop()));
    } catch (e) { return []; }
  }
  async function cargarFotos() {
    const carpeta = CONFIG.carpetaFotos.replace(/\/$/, "");
    // 1) En GitHub Pages: pedimos a GitHub la lista de archivos de la carpeta
    if (usarLista(carpeta, await listarGitHub(carpeta))) return;
    // 2) En local con servidor: leemos el listado de la carpeta
    if (usarLista(carpeta, await listarServidor(carpeta))) return;
    // 3) Plan B (otros sitios o sin conexión con GitHub): foto1.jpg, foto2.jpg...
    for (let i = 1; i <= 40; i++) {
      let ok = false;
      for (const ext of ["jpg", "jpeg", "png", "webp"]) {
        if (await probar(`${carpeta}/foto${i}.${ext}`)) { ok = true; break; }
      }
      if (!ok) break;
    }
  }
  cargarFotos();
  let fotoIdx = 0;
  function spawnPhoto() {
    if (!fotos.length) return;
    const el = document.createElement("div");
    el.className = "photo";
    const img = document.createElement("img");
    img.src = fotos[fotoIdx++ % fotos.length];
    img.alt = "";
    el.appendChild(img);
    el.style.left = (4 + Math.random() * 56) + "%";
    el.style.top = (12 + Math.random() * 60) + "%";
    el.style.setProperty("--w", (90 + Math.random() * 40) + "px");
    el.style.setProperty("--dur", (10 + Math.random() * 4) + "s");
    el.style.setProperty("--r0", (Math.random() * 24 - 12) + "deg");
    el.style.setProperty("--r1", (Math.random() * 24 - 12) + "deg");
    layer.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
  setTimeout(spawnPhoto, 2500);
  setInterval(spawnPhoto, 4200);

  // Música
  const sound = document.getElementById("sound");
  let audio = null;
  if (CONFIG.cancion) {
    audio = new Audio(CONFIG.cancion);
    audio.loop = true;
    audio.preload = "auto";
  }
  function startMusic() {
    if (!audio || !audio.paused) return;
    audio.play().then(() => { sound.style.display = "block"; }).catch(() => {});
  }
  sound.addEventListener("click", e => {
    e.stopPropagation();
    if (audio.paused) { audio.play(); sound.textContent = "🔊"; sound.setAttribute("aria-label", "Silenciar música"); }
    else { audio.pause(); sound.textContent = "🔇"; sound.setAttribute("aria-label", "Poner música"); }
  });

  // Al tocar la pantalla brota una flor
  addEventListener("pointerdown", e => {
    if (e.target.closest(".card, #sound")) return;
    startMusic();
    const f = document.createElement("div");
    f.className = "pop";
    f.textContent = blooms[Math.random() * blooms.length | 0];
    f.style.left = e.clientX + "px";
    f.style.top = e.clientY + "px";
    f.style.fontSize = (34 + Math.random() * 20) + "px";
    document.body.appendChild(f);
    f.addEventListener("animationend", () => f.remove());
  });

  const veil = document.getElementById("veil");
  const hint = document.getElementById("hint");
  veil.classList.remove("open");
  hint.style.display = "";
  function openCard() { veil.classList.add("open"); hint.style.opacity = 0; document.getElementById("close").focus(); }
  function closeCard() { veil.classList.remove("open"); hint.style.opacity = 1; }
  hint.addEventListener("click", openCard);
  document.getElementById("close").addEventListener("click", closeCard);
  setTimeout(() => { if (!veil.classList.contains("open")) openCard(); }, 11000);

  addEventListener("resize", resize);
  resize();
  if (!reduce) { ctx.fillStyle = "#07060a"; ctx.fillRect(0, 0, W, H); draw(); }
})();
