/* Personaliza aquí las fotos, la canción y las frases.
   Al añadir una foto a assets/fotos, añade también su nombre a esta lista.
   Funciona al abrir index.html directamente y en alojamientos estáticos. */
const CONFIG = {
  carpetaFotos: "assets/fotos",
  fotos: [
    { archivo: "WhatsApp Image 2026-09-21 at 10.50.56.jpeg", texto: "Mi lugar favorito" },
    { archivo: "WhatsApp Image 2026-09-21 at 10.50.57.jpeg", texto: "Un ratito contigo" },
    { archivo: "WhatsApp Image 2026-09-21 at 10.50.57 (1).jpeg", texto: "De esos días bonitos" },
    { archivo: "WhatsApp Image 2026-09-21 at 10.50.57 (2).jpeg", texto: "Y todos los que faltan" }
  ],
  cancion: "assets/cancion.mp3",
  frases: ["Te quiero", "Eres mi sol ☀️", "Mi amor", "Siempre juntos", "Me encantas",
    "Eres preciosa", "Mi flor favorita", "Contigo todo brilla", "Te adoro"]
};

(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const random = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
  const pick = items => items[Math.floor(Math.random() * items.length)];
  const q = new URLSearchParams(location.search);
  const para = (q.get("para") || "Gianella").trim().slice(0, 30) || "Gianella";
  const de = (q.get("de") || "").trim().slice(0, 30);
  $("cardTitle").textContent = "Para ti, " + para + " 💛";
  $("sign").textContent = de ? "— " + de : "";
  const phrases = [...CONFIG.frases, para + " 💛"];
  const blooms = ["🌻", "🌼", "🌻"];
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = motion.matches;
  document.body.classList.toggle("still", reduced);
  const cv = $("sky");
  const ctx = cv.getContext("2d");
  const layer = $("floaters");
  const veil = $("veil");
  const viewer = $("photoViewer");
  const sound = $("sound");
  const gallery = $("gallery");
  let W = innerWidth, H = innerHeight, elapsed = 0, last = null, frameId = 0;
  let ready = false, nextPhoto = 0, nextPhrase = 0, nextFlower = 0;
  let heart = [], photoBag = [], lastPhoto = null, viewerIndex = 0;
  let photoSettled = 0, photoFailures = 0, audioFailed = false, musicPending = false;
  let musicTouched = false;
  const fotos = [];
  const dust = Array.from({ length: 240 }, () => ({
    x: Math.random(), y: Math.random(), radius: random(.4, 1.6), phase: random(0, Math.PI * 2), speed: random(.2, .6)
  }));
  const warp = Array.from({ length: 420 }, () => ({
    x: random(-1, 1), y: random(-1, 1), z: random(.08, 1), speed: random(.32, .85)
  }));
  const audio = CONFIG.cancion ? new Audio(CONFIG.cancion) : null;
  if (audio) { audio.loop = true; audio.preload = "metadata"; }

  function heartLayout() {
    return { x: W * (W > 700 ? .54 : .51), y: H * .36, scale: Math.min(W * .023, H * .014) };
  }

  function buildHeart() {
    // Grosor irregular, leve inclinación y llegadas escalonadas.
    heart = Array.from({ length: 280 }, (_, i) => {
      const k = i / 280 * Math.PI * 2 + random(-.015, .015);
      const x = 16 * Math.sin(k) ** 3;
      const y = -(13 * Math.cos(k) - 5 * Math.cos(2 * k) - 2 * Math.cos(3 * k) - Math.cos(4 * k));
      const angle = -.1;
      return {
        x: x * Math.cos(angle) - y * Math.sin(angle) + random(-.38, .38),
        y: x * Math.sin(angle) + y * Math.cos(angle) + random(-.38, .38),
        originX: Math.random(), originY: Math.random(), delay: random(0, .8),
        bend: random(-100, 100), phase: random(0, Math.PI * 2), radius: random(.7, 1.8)
      };
    });
  }

  function resize() {
    W = innerWidth; H = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Recoloca las fotos al rotar el móvil sin reiniciar el corazón.
    for (const el of layer.children) {
      if (el.classList.contains("photo")) sizePhoto(el);
      place(el);
    }
    if (reduced) render(0);
  }

  function nebula(x, y, radius, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color); g.addColorStop(1, "transparent");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  function drawUniverse(time) {
    const arrival = reduced ? 1 : smooth((time - 2.8) / 2.6);
    ctx.save(); ctx.globalAlpha = arrival;
    nebula(W * .3, H * .66, Math.max(W, H) * .6, "rgba(144, 71, 38, .17)");
    nebula(W * .85, H * .3, Math.max(W, H) * .48, "rgba(68, 48, 114, .16)");
    for (const p of dust) {
      const x = (p.x * W + Math.sin(time * .09 + p.phase) * 14 + W) % W;
      const y = (p.y * H + Math.cos(time * .06 + p.phase) * 10 + H) % H;
      const alpha = .22 + .45 * (.5 + .5 * Math.sin(time * p.speed + p.phase));
      ctx.fillStyle = "rgba(255, 224, 161, " + alpha + ")";
      ctx.beginPath(); ctx.arc(x, y, p.radius, 0, Math.PI * 2); ctx.fill();
    }
    const shape = heartLayout();
    const beat = reduced ? 1 : 1 + Math.sin(time * 1.5) * .013 + Math.sin(time * 2.8) * .004;
    ctx.shadowColor = "#ffd173"; ctx.shadowBlur = 7;
    for (const p of heart) {
      const progress = reduced ? 1 : smooth((time - 3.5 - p.delay) / 3.3);
      const tx = shape.x + p.x * shape.scale * beat + Math.sin(time * .5 + p.phase) * 1.4;
      const ty = shape.y + p.y * shape.scale * beat + Math.cos(time * .65 + p.phase) * 1.8;
      const arc = Math.sin(progress * Math.PI) * p.bend;
      const x = p.originX * W * (1 - progress) + tx * progress + arc;
      const y = p.originY * H * (1 - progress) + ty * progress - arc * .5;
      const alpha = (.48 + .28 * Math.sin(time * 1.2 + p.phase)) * (reduced ? 1 : smooth((time - 3.2) / 1.3));
      ctx.fillStyle = "rgba(255, 215, 129, " + alpha + ")";
      ctx.beginPath(); ctx.arc(x, y, p.radius, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawWarp(time, dt) {
    if (reduced || time >= 5.7) return;
    const intensity = 1 - smooth((time - 3.1) / 2.6);
    const speed = (.2 + smooth(time / 1.3) * 2) * (1 - .94 * smooth((time - 2.9) / 2.8));
    const cx = W * .5 + Math.sin(time * .65) * W * .035;
    const cy = H * .46 + Math.sin(time * .8) * H * .025;
    ctx.save(); ctx.globalAlpha = intensity;
    for (const p of warp) {
      p.z -= p.speed * dt * speed;
      if (p.z < .035) { p.z = 1; p.x = random(-1, 1); p.y = random(-1, 1); }
      const tail = p.z + .07 * speed;
      const x = cx + p.x / p.z * W * .55;
      const y = cy + p.y / p.z * H * .55;
      ctx.strokeStyle = "rgba(255, " + Math.round(219 + p.z * 28) + ", " + Math.round(170 + p.z * 65) + ", " + clamp(1 - p.z, .1, .9) + ")";
      ctx.lineWidth = .5 + (1 - p.z) * 1.1;
      ctx.beginPath(); ctx.moveTo(cx + p.x / tail * W * .55, cy + p.y / tail * H * .55); ctx.lineTo(x, y); ctx.stroke();
    }
    ctx.restore();
  }

  function render(dt) {
    if (!ctx) return;
    ctx.fillStyle = "#07060a"; ctx.fillRect(0, 0, W, H);
    drawUniverse(reduced ? 8 : elapsed);
    drawWarp(elapsed, dt);
  }

  function frame(now) {
    frameId = 0;
    const dt = last === null ? 0 : clamp((now - last) / 1000, 0, .05);
    last = now;
    elapsed += dt;
    render(dt);
    if (!ready && (reduced || elapsed >= 6.8)) startAmbient();
    if (ready && !reduced) {
      if (elapsed >= nextPhoto) { spawnPhoto(); nextPhoto = elapsed + random(5.8, 8.6); }
      if (elapsed >= nextPhrase) { spawnDecoration("phrase"); nextPhrase = elapsed + random(4.2, 7.2); }
      if (elapsed >= nextFlower) { spawnDecoration("flower"); nextFlower = elapsed + random(2.7, 5.4); }
    }
    if (!reduced && !isPaused()) frameId = requestAnimationFrame(frame);
  }

  function isPaused() { return document.hidden || veil.open || viewer.open; }
  function syncPause() {
    const paused = isPaused();
    document.body.classList.toggle("paused", paused);
    cancelAnimationFrame(frameId); frameId = 0; last = null;
    if (!paused) frameId = requestAnimationFrame(frame);
  }

  function startAmbient() {
    ready = true;
    document.body.classList.add("ready");
    document.querySelector(".intro-note")?.remove();
    sound.hidden = !audio;
    updateMusic();
    spawnPhoto();
    if (reduced) { spawnPhoto(); spawnDecoration("phrase"); }
    nextPhoto = elapsed + random(6, 8);
    nextPhrase = elapsed + 1.2;
    nextFlower = elapsed + 2.1;
  }

  function place(el) {
    const width = el.offsetWidth || 120, height = el.offsetHeight || 150;
    const margin = 28;
    const right = Math.max(margin, W - width - margin);
    const bottom = Math.max(112, H - height - 106);
    const shape = heartLayout();
    const occupied = [...layer.children].filter(other => other !== el).map(other => other.getBoundingClientRect());
    let best = { x: margin, y: bottom, score: Infinity };
    for (let i = 0; i < 36; i++) {
      const x = random(margin, right), y = random(Math.min(120, bottom), bottom);
      const overlap = occupied.reduce((score, r) => score + Math.max(0, Math.min(x + width + 20, r.right) - Math.max(x - 20, r.left)) * Math.max(0, Math.min(y + height + 35, r.bottom) - Math.max(y - 35, r.top)), 0);
      const crossesHeart = x < shape.x + 16 * shape.scale && x + width > shape.x - 16 * shape.scale && y < shape.y + 17 * shape.scale && y + height > shape.y - 13 * shape.scale;
      const score = overlap + (crossesHeart ? width * height * 2 : 0);
      if (score < best.score) best = { x, y, score };
      if (score === 0) break;
    }
    el.style.left = best.x + "px"; el.style.top = best.y + "px";
  }

  function float(el, duration) {
    el.style.setProperty("--dur", duration + "s");
    el.style.setProperty("--r0", random(-11, 9) + "deg");
    el.style.setProperty("--rm", random(-6, 7) + "deg");
    el.style.setProperty("--r1", random(-9, 12) + "deg");
    el.style.setProperty("--dx", random(-12, 12) + "px");
    el.style.setProperty("--end-x", random(-10, 10) + "px");
    layer.appendChild(el); place(el);
    if (!reduced) el.addEventListener("animationend", () => el.remove(), { once: true });
  }

  function spawnDecoration(kind) {
    if (layer.querySelectorAll("." + kind).length >= (kind === "phrase" ? 2 : 4)) return;
    const el = document.createElement("div");
    el.className = kind; el.setAttribute("aria-hidden", "true");
    el.textContent = pick(kind === "phrase" ? phrases : blooms);
    el.style.fontSize = (kind === "phrase" ? random(23, 30) : random(22, 35)) + "px";
    el.style.setProperty("--alpha", kind === "phrase" ? ".85" : ".65");
    float(el, random(11, 16));
  }

  function sizePhoto(el) {
    el.style.setProperty("--w", (W < 600 ? clamp(W * .31, 94, 138) : random(145, 185)) + "px");
  }

  function spawnPhoto() {
    if (!ready || !fotos.length || layer.querySelectorAll(".photo").length >= (W < 600 ? 2 : 3)) return;
    const visible = new Set([...layer.querySelectorAll(".photo")].map(el => el.dataset.src));
    if (!photoBag.length) {
      photoBag = fotos.slice();
      for (let i = photoBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [photoBag[i], photoBag[j]] = [photoBag[j], photoBag[i]];
      }
    }
    let idx = photoBag.findIndex(photo => !visible.has(photo.src) && photo !== lastPhoto);
    if (idx < 0) idx = photoBag.findIndex(photo => !visible.has(photo.src));
    if (idx < 0) return;
    const photo = photoBag.splice(idx, 1)[0]; lastPhoto = photo;
    const el = document.createElement("button");
    el.type = "button"; el.className = "photo"; el.dataset.src = photo.src;
    el.setAttribute("aria-label", "Ampliar recuerdo: " + photo.texto);
    sizePhoto(el);
    const img = document.createElement("img"); img.src = photo.src; img.alt = "";
    const caption = document.createElement("span"); caption.textContent = photo.texto;
    el.append(img, caption);
    el.addEventListener("click", () => openPhoto(fotos.indexOf(photo)));
    float(el, random(17, 21));
  }

  function updateGallery() {
    gallery.disabled = !fotos.length;
    gallery.textContent = fotos.length ? "Nuestros recuerdos · " + fotos.length : photoSettled === CONFIG.fotos.length ? "Sin fotos disponibles" : "Cargando recuerdos…";
    if (photoSettled === CONFIG.fotos.length && photoFailures) {
      console.warn(photoFailures + " foto(s) no se pudieron cargar. Revisa CONFIG.fotos y assets/fotos.");
    }
  }

  async function loadPhoto(entry) {
    const photo = typeof entry === "string" ? { archivo: entry, texto: "Contigo" } : entry;
    const src = CONFIG.carpetaFotos.replace(/\/$/, "") + "/" + encodeURIComponent(photo.archivo);
    const loaded = await new Promise(resolve => {
      const img = new Image();
      const timeout = setTimeout(() => finish(false), 15000);
      function finish(ok) { clearTimeout(timeout); img.onload = null; img.onerror = null; resolve(ok); }
      img.onload = () => finish(img.naturalWidth > 0); img.onerror = () => finish(false); img.src = src;
    });
    photoSettled++;
    if (loaded) {
      fotos.push({ ...photo, src }); photoBag = [];
      if (ready && (reduced || !layer.querySelector(".photo"))) spawnPhoto();
    } else { photoFailures++; }
    updateGallery();
  }

  function updateMusic() {
    const playing = audio && !audio.paused && !audioFailed;
    sound.textContent = audioFailed ? "!" : playing ? "🔊" : "♫";
    sound.setAttribute("aria-label", audioFailed ? "Volver a intentar reproducir música" : playing ? "Pausar música" : "Reproducir música");
    sound.setAttribute("aria-pressed", String(Boolean(playing)));
  }

  async function startMusic() {
    if (!audio || musicPending || !audio.paused) return;
    musicPending = true;
    try {
      if (audioFailed) { audioFailed = false; audio.load(); }
      await audio.play(); $("status").textContent = "";
    } catch {
      $("status").textContent = audioFailed ? "No se pudo cargar la canción." : "Toca ♫ para activar la música.";
    } finally { musicPending = false; updateMusic(); }
  }
  if (audio) {
    audio.addEventListener("play", updateMusic);
    audio.addEventListener("pause", updateMusic);
    audio.addEventListener("error", () => { audioFailed = true; updateMusic(); if (ready) $("status").textContent = "No se pudo cargar la canción."; });
  }
  sound.addEventListener("click", () => {
    musicTouched = true;
    if (!audio) return;
    if (audio.paused) startMusic(); else audio.pause();
  });

  function showPhoto(index) {
    viewerIndex = (index + fotos.length) % fotos.length;
    const photo = fotos[viewerIndex];
    $("fullPhoto").src = photo.src; $("fullPhoto").alt = photo.texto;
    $("photoCaption").textContent = photo.texto + " · " + (viewerIndex + 1) + "/" + fotos.length;
    $("prevPhoto").disabled = $("nextPhoto").disabled = fotos.length < 2;
  }
  function openPhoto(index = 0) { if (!fotos.length) return; showPhoto(index); viewer.showModal(); syncPause(); }
  gallery.addEventListener("click", () => openPhoto());
  $("prevPhoto").addEventListener("click", () => showPhoto(viewerIndex - 1));
  $("nextPhoto").addEventListener("click", () => showPhoto(viewerIndex + 1));
  $("closePhoto").addEventListener("click", () => viewer.close());
  viewer.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); showPhoto(viewerIndex + (e.key === "ArrowLeft" ? -1 : 1)); }
  });
  $("hint").addEventListener("click", () => { veil.showModal(); syncPause(); });
  $("close").addEventListener("click", () => veil.close());
  for (const dialog of [veil, viewer]) {
    dialog.addEventListener("close", () => {
      syncPause();
      if (!document.activeElement || document.activeElement === document.body) (dialog === viewer ? gallery : $("hint")).focus();
    });
    dialog.addEventListener("click", e => {
      const r = dialog.getBoundingClientRect();
      if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close();
    });
  }

  addEventListener("pointerdown", e => {
    if (!ready || isPaused() || e.button !== 0 || e.target.closest("button, dialog")) return;
    if (audio && !audioFailed && sound.getAttribute("aria-pressed") === "false" && !musicTouched) startMusic();
    if (reduced || document.querySelectorAll(".pop").length >= 8) return;
    const el = document.createElement("div"); el.className = "pop"; el.setAttribute("aria-hidden", "true"); el.textContent = pick(blooms);
    el.style.left = e.clientX + "px"; el.style.top = e.clientY + "px"; el.style.fontSize = random(28, 42) + "px";
    document.body.appendChild(el); el.addEventListener("animationend", () => el.remove(), { once: true });
  });
  document.addEventListener("visibilitychange", syncPause);
  addEventListener("resize", resize);
  motion.addEventListener("change", e => {
    reduced = e.matches; document.body.classList.toggle("still", reduced);
    layer.replaceChildren(); elapsed = Math.max(elapsed, 8);
    if (!ready) startAmbient();
    else { spawnPhoto(); if (reduced) { spawnPhoto(); spawnDecoration("phrase"); } }
    render(0); syncPause();
  });

  buildHeart(); resize();
  if (!ctx || reduced) { elapsed = 8; startAmbient(); render(0); }
  CONFIG.fotos.forEach(loadPhoto);
  updateGallery();
  syncPause();
})();
