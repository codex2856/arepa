/*
 * Arepa · capa a capa
 * Scroll-driven experience without dependencies: each <section class="scene"> is N viewport heights tall,
 * its content sticks to the screen, and a requestAnimationFrame loop maps the scroll progress (0 → 1)
 * of that section to transforms. Progress is smoothed with a lerp so movement feels weighty, not jumpy.
 */

// ---------------------------------------------------------------- data
const RECIPES = [
  {
    id: "reina",
    closed: "cerrada-reina.webp",
    name: "Reina Pepiada",
    accent: "#ffcc00",
    bg: "#0a1640",
    desc: "La reina de las areperas. Pollo guisado y desmechado, mezclado con aguacate cremoso. Fresca, suave y adictiva.",
    ingredients: [
      { img: "pollo.webp", label: "Pollo desmechado", note: "Guisado", from: "left", scale: 1.22, rot: 0 },
      { img: "aguacate.webp", label: "Aguacate", note: "En gajos", from: "right", scale: 1.05, rot: 10 },
      { img: "mayonesa.webp", label: "Mayonesa", note: "Un toque", from: "top", scale: 1.0, rot: -20 },
      { img: "cilantro.webp", label: "Cilantro", note: "Fresco", from: "top", scale: 1.0, rot: 0 },
    ],
  },
  {
    id: "pelua",
    closed: "cerrada-pelua.webp",
    name: "Pelúa",
    accent: "#ef3340",
    bg: "#1a0b1c",
    desc: "Carne mechada jugosa cubierta de queso amarillo rallado que se derrite con el calor de la masa. Por eso le dicen pelúa.",
    ingredients: [
      { img: "carne.webp", label: "Carne mechada", note: "Jugosa", from: "left", scale: 1.22, rot: 0 },
      { img: "queso-amarillo.webp", label: "Queso amarillo", note: "Rallado", from: "top", scale: 1.12, rot: 30 },
    ],
  },
  {
    id: "domino",
    closed: "cerrada-domino.webp",
    name: "Dominó",
    accent: "#f4f1ea",
    bg: "#07102e",
    desc: "Blanco y negro, como las fichas. Caraotas negras refritas y queso blanco duro desmoronado por encima.",
    ingredients: [
      { img: "caraotas.webp", label: "Caraotas negras", note: "Refritas", from: "right", scale: 1.22, rot: 0 },
      { img: "queso-blanco.webp", label: "Queso blanco", note: "Desmoronado", from: "top", scale: 1.1, rot: 12 },
    ],
  },
  {
    id: "perico",
    closed: "cerrada-perico.webp",
    name: "Perico",
    accent: "#ffcc00",
    bg: "#0c1a4a",
    desc: "El desayuno venezolano. Huevos revueltos con cebolla y tomate, en una arepa recién salida del budare.",
    ingredients: [
      { img: "huevo.webp", label: "Huevo revuelto", note: "Bien cocido", from: "left", scale: 1.22, rot: 0 },
      { img: "cebolla.webp", label: "Cebolla", note: "Picadita", from: "right", scale: 1.08, rot: 20 },
      { img: "tomate.webp", label: "Tomate", note: "Picado", from: "top", scale: 1.08, rot: 40 },
    ],
  },
];

// ---------------------------------------------------------------- helpers
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = {
  outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t) => { const c = 1.35; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const FROM = {
  left: { x: -130, y: -10, r: -55 },
  right: { x: 130, y: -15, r: 55 },
  top: { x: 15, y: -140, r: 35 },
};

// ---------------------------------------------------------------- build recipe scenes
const recipesRoot = document.getElementById("recipes");
RECIPES.forEach((r, i) => {
  const s = el("section", "scene scene--recipe");
  s.id = r.id;
  s.dataset.length = String(3.8 + r.ingredients.length * 0.9);
  s.dataset.index = String(i);
  s.innerHTML = `
    <div class="sticky">
      <div class="recipe__bgword" aria-hidden="true">${r.name}</div>
      <div class="recipe__copy">
        <p class="recipe__index">${String(i + 1).padStart(2, "0")} <b>/ ${String(RECIPES.length).padStart(2, "0")}</b></p>
        <h2 class="recipe__name"><span class="line"><span>${r.name}</span></span></h2>
        <p class="recipe__desc">${r.desc}</p>
        <ul class="ing-list">
          <li class="is-in"><span>Arepa de maíz</span><i>Del budare</i></li>
          ${r.ingredients.map((g) => `<li><span>${g.label}</span><i>${g.note}</i></li>`).join("")}
        </ul>
      </div>
      <div class="stage">
        <div class="stage__shadow"></div>
        <div class="spin">
          <img class="layer layer--base" src="img/arepa-base.webp" alt="" />
          ${r.ingredients.map((g) => `<img class="layer layer--ing" src="img/${g.img}" alt="${g.label}" />`).join("")}
          <img class="layer layer--lid" src="img/arepa-tapa.webp" alt="" />
        </div>
        <img class="layer layer--closed" src="img/${r.closed}" alt="Arepa ${r.name} cerrada" />
        <p class="stage__caption">Lista. Buen provecho.</p>
      </div>
    </div>`;
  recipesRoot.appendChild(s);

  // crumbs: little pieces of each ingredient that burst out when it lands
  const stage = s.querySelector(".stage");
  r.ingredients.forEach((g, gi) => {
    for (let k = 0; k < 7; k++) {
      const c = el("span", "crumb");
      c.style.backgroundImage = `url(img/${g.img})`;
      c.dataset.ing = String(gi);
      c.dataset.a = String(Math.random() * Math.PI * 2);
      c.dataset.d = String(0.35 + Math.random() * 0.35);
      c.dataset.r = String((Math.random() - 0.5) * 540);
      stage.appendChild(c);
    }
  });
});

// menu cards
const menu = document.getElementById("menuGrid");
RECIPES.forEach((r, i) => {
  const a = el("a", "card");
  a.href = `#${r.id}`;
  a.style.setProperty("--card-accent", r.accent);
  a.innerHTML = `
    <small>${String(i + 1).padStart(2, "0")}</small>
    <div class="card__plate">
      <img src="img/${r.closed}" alt="Arepa ${r.name}" />
    </div>
    <h3>${r.name}</h3>
    <p>${r.ingredients.map((g) => g.label).join(" · ")}</p>`;
  menu.appendChild(a);
});
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const idx = [...menu.children].indexOf(e.target);
    setTimeout(() => e.target.classList.add("is-visible"), idx * 120);
    io.unobserve(e.target);
  });
}, { threshold: 0.2 });
[...menu.children].forEach((c) => io.observe(c));



// ---------------------------------------------------------------- scene registry
const root = document.documentElement;
const glow = document.querySelector(".glow");
const bar = document.querySelector(".progress span");
const scenes = [...document.querySelectorAll(".scene")].map((node) => {
  const recipe = node.classList.contains("scene--recipe") ? RECIPES[+node.dataset.index] : null;
  const q = (s) => node.querySelector(s);
  const qa = (s) => [...node.querySelectorAll(s)];
  return {
    node, recipe, p: 0, target: 0, top: 0, len: 0,
    stage: q(".stage"), spin: q(".spin"), base: q(".layer--base"), lid: q(".layer--lid"), closed: q(".layer--closed"), caption: q(".stage__caption"),
    ings: qa(".layer--ing"), crumbs: qa(".crumb"), items: qa(".ing-list li"),
    word: q(".recipe__bgword"), copy: q(".recipe__copy"), nameLine: q(".recipe__name .line > span"),
    anim: Object.fromEntries(qa("[data-anim]").map((n) => [n.dataset.anim, n])),
  };
});

function measure() {
  const vh = window.innerHeight;
  scenes.forEach((s) => {
    s.node.style.height = `${parseFloat(s.node.dataset.length || 3) * 100}vh`;
    s.top = s.node.offsetTop;
    s.len = s.node.offsetHeight - vh;
  });
}
measure();
window.addEventListener("resize", measure);
window.addEventListener("load", measure);

// mouse → subtle tilt + light
const mouse = { x: 0, y: 0, sx: 0, sy: 0, px: window.innerWidth / 2, py: window.innerHeight * 0.45, gx: window.innerWidth / 2, gy: window.innerHeight * 0.45 };
window.addEventListener("pointermove", (e) => {
  mouse.x = e.clientX / window.innerWidth - 0.5;
  mouse.y = e.clientY / window.innerHeight - 0.5;
  mouse.px = e.clientX; mouse.py = e.clientY;
});

// intro timing for hero title (time based, not scroll based)
const t0 = performance.now();

// ---------------------------------------------------------------- renderers
function renderHero(s, p, time) {
  const a = s.anim;
  const intro = ease.outExpo(clamp((time - 150) / 1400));
  const out = ease.inOutCubic(seg(p, 0.22, 0.45));
  a["hero-title"].querySelectorAll(".line > span").forEach((ln, i) => {
    const t = ease.outExpo(clamp((time - 200 - i * 120) / 1300));
    ln.style.transform = `translateY(${(1 - t) * 110 - out * 40}%)`;
  });
  a["hero-title"].style.opacity = 1 - out;
  a["hero-eyebrow"].style.opacity = intro * (1 - out);
  a["hero-text"].style.opacity = intro * (1 - out);
  a["hero-text"].style.transform = `translateY(${(1 - intro) * 20 - out * 30}px)`;
  a["hero-hint"].style.opacity = intro * (1 - seg(p, 0, 0.05));

  // 1 · steam starts rising from the hot arepa
  const open = ease.inOutCubic(seg(p, 0.04, 0.8));
  const steamOn = seg(p, 0.02, 0.12);
  a["hero-steam"].style.opacity = 0.5 + steamOn * 0.5;
  [...a["hero-steam"].children].forEach((puff, i) => {
    const n = a["hero-steam"].children.length;
    const cycle = ((time / 1000) * 0.3 + i / n) % 1;             // each puff loops bottom → top
    const x = ((i * 7) % n) / (n - 1) * 100 - 23 + Math.sin(time / 900 + i * 1.7) * 9;
    puff.style.left = `${x}%`;
    puff.style.opacity = Math.sin(cycle * Math.PI) * (0.65 + open * 0.35);
    puff.style.transform = `translateY(${-cycle * (120 + open * 170)}%) scale(${0.6 + cycle * 1.6})`;
  });

  // 2 · the two halves come apart in the air, steam pouring out of the gap
  const float = Math.sin(time / 1100) * 1.2;
  a["hero-top"].style.transform = `translateY(${-open * 26 + float}%) rotate(${-open * 5}deg) scale(${1 + open * 0.04})`;
  a["hero-bottom"].style.transform = `translateY(${open * 20 + float}%)`;
  a["hero-inside"].style.opacity = clamp(open * 3);

  const enter = ease.outExpo(clamp((time - 100) / 1600));
  const exit = 0;
  s.stage.style.opacity = enter * (1 - exit);
  s.stage.style.transform = `translateY(${(1 - enter) * 60 + exit * -12}px) scale(${lerp(0.9, 1, enter) - exit * 0.1}) rotateX(${mouse.sy * -8}deg) rotateY(${mouse.sx * 10}deg)`;
}

function renderRecipe(s, p, time) {
  const r = s.recipe;
  const n = r.ingredients.length;

  // background word drifts
  s.word.style.transform = `translate(${lerp(35, -75, p)}vw, -50%)`;

  // copy
  const cin = ease.outExpo(seg(p, 0.0, 0.06));
  const cout = seg(p, 0.93, 1);
  s.nameLine.style.transform = `translateY(${(1 - cin) * 110}%)`;
  s.copy.style.opacity = Math.min(1, cin * 1.4) * (1 - cout * 0.7);
  s.copy.style.transform = `translateY(${(1 - cin) * 40 - cout * 30}px)`;

  // stage entrance + slow spin
  const ein = ease.outExpo(seg(p, 0.0, 0.06));
  s.stage.style.opacity = ein * (1 - cout * 0.6);
  s.stage.style.transform = `translateY(${(1 - ein) * 80}px) scale(${lerp(0.6, 1, ein) - cout * 0.08}) rotateX(${mouse.sy * -8}deg) rotateY(${mouse.sx * 10}deg)`;
  const tilt = ease.inOutCubic(seg(p, 0.77, 0.88));
  s.spin.style.transform = `translateY(${tilt * -6}%) rotateX(${tilt * 62}deg) scale(${1 - tilt * 0.12}) rotate(${(1 - ein) * -90 + p * 70 + time * 0.003}deg)`;
  s.spin.style.opacity = 1 - seg(p, 0.8, 0.88);

  // ingredients fall in one by one
  const start = 0.08, end = 0.6, span = (end - start) / n;
  s.ings.forEach((img, i) => {
    const g = r.ingredients[i];
    const a = start + i * span, b = a + span * 0.85;
    const t = seg(p, a, b);
    const e = ease.outBack(t);
    const f = FROM[g.from];
    const sc = lerp(1.75, g.scale, ease.outCubic(t));
    img.style.opacity = clamp(t * 4);
    img.style.filter = `blur(${(1 - ease.outCubic(t)) * 18}px) drop-shadow(0 ${lerp(60, 12, t)}px ${lerp(40, 16, t)}px rgba(0,0,0,${lerp(0.2, 0.45, t)}))`;
    img.style.transform = `translate3d(${(1 - e) * f.x}%, ${(1 - e) * f.y}%, 0) rotate(${g.rot + (1 - e) * f.r}deg) scale(${sc})`;
    s.items[i + 1].classList.toggle("is-in", t > 0.92);
  });

  // crumbs burst when each ingredient lands
  s.crumbs.forEach((c) => {
    const gi = +c.dataset.ing;
    const b = start + gi * span + span * 0.85;
    const t = seg(p, b - 0.03, b + 0.07);
    const d = +c.dataset.d * ease.outCubic(t);
    const ang = +c.dataset.a;
    c.style.opacity = t > 0 && t < 1 ? (1 - t) : 0;
    c.style.transform = `translate(${Math.cos(ang) * d * 100 * 5}%, ${Math.sin(ang) * d * 100 * 5 - t * 60}%) rotate(${+c.dataset.r * t}deg) scale(${1 - t * 0.5})`;
  });

  // lid comes down and closes the arepa completely…
  const lt = seg(p, 0.64, 0.75);
  const le = ease.outCubic(lt);
  s.lid.style.opacity = clamp(lt * 4);
  s.lid.style.transform = `translate3d(${lerp(70, 0, le)}%, ${lerp(-150, 0, le)}%, 0) rotate(${lerp(-60, 0, le)}deg) scale(${lerp(1.35, 1, le) + Math.sin(lt * Math.PI) * 0.04})`;

  // …then the camera tilts and we see it served, filling spilling out the sides
  const ct = seg(p, 0.8, 0.92);
  const ce = ease.outBack(ct);
  s.closed.style.opacity = clamp(ct * 2.5);
  s.closed.style.transform = `translateY(${(1 - ce) * 18}%) scale(${lerp(0.82, 1.08, ce)})`;
  s.caption.style.opacity = seg(p, 0.88, 0.94) * (1 - seg(p, 0.97, 1));
  s.caption.style.transform = `translate(-50%, ${(1 - seg(p, 0.88, 0.94)) * 16}px)`;
}

// ---------------------------------------------------------------- loop
let activeId = null;
function applyTheme(recipe) {
  const id = recipe ? recipe.id : "hero";
  if (id === activeId) return;
  activeId = id;
  root.style.setProperty("--accent", recipe ? recipe.accent : "#ffcc00");
  document.body.style.backgroundColor = recipe ? recipe.bg : "#08133a";
}

function frame(now) {
  const time = now - t0;
  const y = window.scrollY;
  const vh = window.innerHeight;

  mouse.sx = lerp(mouse.sx, mouse.x, 0.06);
  mouse.sy = lerp(mouse.sy, mouse.y, 0.06);
  mouse.gx = lerp(mouse.gx, mouse.px, 0.08);
  mouse.gy = lerp(mouse.gy, mouse.py, 0.08);
  glow.style.transform = `translate3d(${mouse.gx}px, ${mouse.gy}px, 0)`;

  const docMax = document.documentElement.scrollHeight - vh;
  bar.style.transform = `scaleX(${docMax > 0 ? y / docMax : 0})`;

  let current = null;
  scenes.forEach((s) => {
    s.target = clamp((y - s.top) / (s.len || 1));
    s.p = reduceMotion ? s.target : lerp(s.p, s.target, 0.12);
    if (Math.abs(s.p - s.target) < 0.0005) s.p = s.target;
    const visible = y + vh > s.top && y < s.top + s.len + vh;
    if (y + vh * 0.5 >= s.top && y + vh * 0.5 < s.top + s.len + vh) current = s;
    if (!visible) return;
    if (s.recipe) renderRecipe(s, s.p, time);
    else renderHero(s, s.p, time);
  });
  applyTheme(current && current.recipe);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// smooth anchor navigation that lands where the arepa is already full
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    const s = scenes.find((x) => x.node.id === id);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const y = s && s.recipe ? s.top + s.len * 0.9 : target.offsetTop;
    window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
  });
});
