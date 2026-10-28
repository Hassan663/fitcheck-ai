/* ------------------------------------------------------------------
   FitCheck AI - app logic (vanilla JS, no dependencies)
------------------------------------------------------------------- */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (n) => "PKR " + n.toLocaleString("en-PK");

  /* ---------------- state ---------------- */
  const state = {
    page: "home",
    model: MODELS[0],
    photo: null, // dataURL when user uploads
    garment: null,
    prevGarment: null,
    history: [],
    view: "result",
    compare: [], // garment ids
    category: "All",
    looks: JSON.parse(localStorage.getItem("fitcheck.looks") || "[]"),
    fit: { x: 0.22, y: 0.18, s: 1 },
    processing: false,
  };

  /* ---------------- theme ---------------- */
  const root = document.documentElement;
  root.dataset.theme = localStorage.getItem("fitcheck.theme") || "dark";
  $("#themeToggle").onclick = () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("fitcheck.theme", root.dataset.theme);
  };

  /* ---------------- routing ---------------- */
  function go(page) {
    state.page = page;
    $$(".page").forEach((p) => p.classList.toggle("active", p.id === "page-" + page));
    $$("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === page && a.closest(".nav-links")));
    history.replaceState(null, "", "#" + page);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (page === "looks") renderLooks();
  }
  $$("[data-nav]").forEach((el) => el.addEventListener("click", (e) => { e.preventDefault(); go(el.dataset.nav); }));
  const initial = location.hash.replace("#", "");
  if (["home", "studio", "looks", "how"].includes(initial)) go(initial);

  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input,textarea")) return;
    if (e.key === "s") go("studio");
    if (e.key === "h") go("home");
    if (e.key === "r") { go("studio"); shuffle(); }
    if (e.key === "Escape") closeShare();
  });

  /* ---------------- toast ---------------- */
  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------------- hero ---------------- */
  const heroG = [GARMENTS.find((g) => g.id === "g7"), GARMENTS.find((g) => g.id === "g10"), GARMENTS.find((g) => g.id === "g4")];
  let heroIdx = 0;
  function renderHero() {
    $("#heroModel").innerHTML = modelSVG(MODELS[0], heroG[heroIdx % heroG.length], { bgTop: "#2a2d45", bgBottom: "#15172a" });
  }
  renderHero();
  setInterval(() => { if (state.page === "home") { heroIdx++; renderHero(); } }, 3200);
  $("#heroG1").innerHTML = garmentSVG(heroG[0]);
  $("#heroG2").innerHTML = garmentSVG(heroG[1]);

  /* ---------------- models ---------------- */
  function renderModels() {
    const list = $("#modelList");
    list.innerHTML = MODELS.map((m) => `
      <button class="model-card ${!state.photo && state.model.id === m.id ? "active" : ""}" data-model="${m.id}">
        <div class="model-thumb">${modelSVG(m, null, { bgTop: "#2a2d45", bgBottom: "#15172a" })}</div>
        <div><b>${m.name}</b><span>${m.meta}</span></div>
        <span class="check"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg></span>
      </button>`).join("") +
      (state.photo ? `
      <button class="model-card active" data-model="photo">
        <div class="model-thumb"><img src="${state.photo}" alt="Your photo"/></div>
        <div><b>You</b><span>Uploaded photo</span></div>
        <span class="check"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg></span>
      </button>` : "");
    $$(".model-card", list).forEach((b) => b.onclick = () => {
      if (b.dataset.model === "photo") { state.model = null; }
      else { state.model = MODELS.find((m) => m.id === b.dataset.model); state.photo = state.photo && b.dataset.model === "photo" ? state.photo : null; }
      renderModels();
      if (state.garment) runTryOn(state.garment, true); else renderStage();
    });
  }
  renderModels();

  /* upload */
  const upload = $("#uploadBox"), input = $("#photoInput");
  upload.onclick = () => input.click();
  ["dragenter", "dragover"].forEach((ev) => upload.addEventListener(ev, (e) => { e.preventDefault(); upload.classList.add("drag"); }));
  ["dragleave", "drop"].forEach((ev) => upload.addEventListener(ev, (e) => { e.preventDefault(); upload.classList.remove("drag"); }));
  upload.addEventListener("drop", (e) => { const f = e.dataTransfer.files[0]; if (f) loadPhoto(f); });
  input.onchange = () => { if (input.files[0]) loadPhoto(input.files[0]); input.value = ""; };
  function loadPhoto(file) {
    if (!file.type.startsWith("image/")) return toast("Please choose an image");
    const r = new FileReader();
    r.onload = () => {
      state.photo = r.result; state.model = null;
      state.fit = { x: 0.22, y: 0.18, s: 1 };
      renderModels();
      toast("Photo loaded. Pick a garment to try it on.");
      if (state.garment) runTryOn(state.garment, true); else renderStage();
    };
    r.readAsDataURL(file);
  }

  /* ---------------- catalog ---------------- */
  const cats = ["All", ...new Set(GARMENTS.map((g) => g.category))];
  function renderChips() {
    $("#catChips").innerHTML = cats.map((c) => `<button class="${state.category === c ? "active" : ""}" data-cat="${c}">${c}</button>`).join("");
    $$("#catChips button").forEach((b) => b.onclick = () => { state.category = b.dataset.cat; renderChips(); renderCatalog(); });
  }
  function renderCatalog() {
    const items = GARMENTS.filter((g) => state.category === "All" || g.category === state.category);
    $("#catCount").textContent = items.length + " items";
    $("#garmentGrid").innerHTML = items.map((g) => `
      <div class="garment-card ${state.garment?.id === g.id ? "active" : ""}" data-g="${g.id}" role="button" tabindex="0">
        <span class="cmp ${state.compare.includes(g.id) ? "on" : ""}" title="Add to compare" data-cmp="${g.id}">${state.compare.includes(g.id) ? "✓" : "+"}</span>
        <div class="g-thumb">${garmentSVG(g)}</div>
        <b>${g.name}</b><span>${g.brand}</span>
        <span class="g-price">${fmt(g.price)}</span>
      </div>`).join("");
    $$(".garment-card").forEach((c) => {
      c.onclick = (e) => {
        if (e.target.dataset.cmp) { toggleCompare(e.target.dataset.cmp); return; }
        runTryOn(GARMENTS.find((g) => g.id === c.dataset.g));
      };
      c.onkeydown = (e) => { if (e.key === "Enter") c.click(); };
    });
  }
  renderChips(); renderCatalog();

  function toggleCompare(id) {
    const i = state.compare.indexOf(id);
    if (i >= 0) state.compare.splice(i, 1);
    else { if (state.compare.length >= 3) { toast("Compare up to 3 looks"); return; } state.compare.push(id); }
    renderCatalog();
    if (state.compare.length >= 2 && state.view !== "grid") { toast(`${state.compare.length} looks in compare`); }
    if (state.view === "grid") renderStage();
  }

  /* ---------------- try-on (simulated pipeline) ---------------- */
  let procTimer;
  function runTryOn(g, quick = false) {
    if (state.processing) return;
    if (state.garment && state.garment.id !== g.id) { state.prevGarment = state.garment; }
    state.garment = g;
    renderCatalog();
    setStep(3);
    if (quick) { renderStage(); updateFooter(); updateInsights(); return; }

    state.processing = true;
    const ov = $("#processing"); ov.hidden = false;
    $("#canvasEmpty").hidden = true;
    $("#procSub").textContent = `${g.name} · ${state.photo ? "your photo" : state.model.name}`;
    const steps = $("#procSteps");
    steps.innerHTML = PIPELINE_STEPS.map((s, i) => `<li data-i="${i}"><i>${i + 1}</i>${s.label}<small>${s.detail}</small></li>`).join("");
    const total = 2600 + Math.random() * 600;
    const t0 = performance.now();
    clearInterval(procTimer);
    procTimer = setInterval(() => {
      const el = performance.now() - t0, p = Math.min(1, el / total);
      $("#procBar").style.width = (p * 100).toFixed(1) + "%";
      $("#procTime").textContent = (el / 1000).toFixed(1) + "s";
      const idx = Math.min(PIPELINE_STEPS.length - 1, Math.floor(p * PIPELINE_STEPS.length));
      $$("li", steps).forEach((li, i) => { li.classList.toggle("done", i < idx); li.classList.toggle("active", i === idx); li.querySelector("i").textContent = i < idx ? "✓" : i + 1; });
      if (p >= 1) {
        clearInterval(procTimer);
        $$("li", steps).forEach((li) => { li.classList.add("done"); li.classList.remove("active"); li.querySelector("i").textContent = "✓"; });
        setTimeout(() => {
          ov.hidden = true; state.processing = false;
          renderStage(); updateFooter(); updateInsights();
        }, 250);
      }
    }, 50);
  }

  function setStep(n) {
    $$(".stepper li").forEach((li) => {
      const s = +li.dataset.step;
      li.classList.toggle("done", s < n); li.classList.toggle("current", s === n);
    });
  }

  function shuffle() {
    const pool = GARMENTS.filter((g) => g.id !== state.garment?.id);
    runTryOn(pool[Math.floor(Math.random() * pool.length)]);
  }
  $("#btnShuffle").onclick = shuffle;
  $("#btnUndo").onclick = () => { if (state.prevGarment) runTryOn(state.prevGarment, true); else toast("No previous garment yet"); };

  /* view segment */
  $$("#viewSeg button").forEach((b) => b.onclick = () => {
    state.view = b.dataset.view;
    $$("#viewSeg button").forEach((x) => x.classList.toggle("active", x === b));
    renderStage();
  });

  /* ---------------- stage rendering ---------------- */
  function frameHTML(garment, opts = {}) {
    if (state.photo) {
      return `<div class="stage-frame"><img class="photo" src="${state.photo}" alt=""/>${garment ? overlayHTML(garment) : ""}${opts.label ? `<span class="stage-label ${opts.right ? "right" : ""}">${opts.label}</span>` : ""}</div>`;
    }
    return `<div class="stage-frame">${modelSVG(state.model, garment, { bgTop: getCSS("--stage-top"), bgBottom: getCSS("--stage-bottom") })}${opts.label ? `<span class="stage-label ${opts.right ? "right" : ""}">${opts.label}</span>` : ""}</div>`;
  }
  function overlayHTML(g) {
    return `<div class="overlay-garment" id="overlayGarment">${garmentSVG(g)}</div>`;
  }
  const getCSS = (v) => getComputedStyle(root).getPropertyValue(v).trim();

  function renderStage() {
    const stage = $("#stage");
    const g = state.garment;
    $("#canvasEmpty").hidden = !!g || state.view === "grid";
    $("#fitControls").hidden = true;

    if (state.view === "grid") {
      const ids = state.compare.length ? state.compare : (g ? [g.id] : []);
      const gs = ids.map((id) => GARMENTS.find((x) => x.id === id));
      const scores = gs.map((x) => score(x).fit);
      const best = scores.indexOf(Math.max(...scores));
      stage.innerHTML = `<div class="compare-grid">${gs.map((x, i) => `
        <div class="compare-cell ${gs.length > 1 && i === best ? "best" : ""}">
          ${state.photo ? `<div class="stage-frame" style="height:auto;aspect-ratio:400/520;border-radius:0;box-shadow:none"><img class="photo" src="${state.photo}"/>${overlayStatic(x)}</div>` : modelSVG(state.model, x, { bgTop: getCSS("--stage-top"), bgBottom: getCSS("--stage-bottom"), slice: true })}
          <button class="rm" data-rm="${x.id}">✕</button>
          <div class="cap"><div><b>${x.name}</b><span>${fmt(x.price)}</span></div><span>Fit ${scores[i]}%</span></div>
        </div>`).join("")}
        ${gs.length < 3 ? `<div class="compare-empty">Tap <b>&nbsp;+&nbsp;</b> on any garment in the catalog to add it here<br/>(up to 3 looks)</div>` : ""}
      </div>`;
      $$("[data-rm]", stage).forEach((b) => b.onclick = () => { state.compare = state.compare.filter((id) => id !== b.dataset.rm); renderCatalog(); renderStage(); });
      return;
    }

    if (!g) { stage.innerHTML = frameHTML(null); return; }

    if (state.view === "compare") {
      stage.innerHTML = `<div class="stage-frame ba" id="ba">
        <div class="before">${state.photo ? `<img class="photo" src="${state.photo}"/>` : modelSVG(state.model, null, { bgTop: getCSS("--stage-top"), bgBottom: getCSS("--stage-bottom") })}</div>
        <div class="after">${state.photo ? `<img class="photo" src="${state.photo}"/>${overlayStatic(g)}` : modelSVG(state.model, g, { bgTop: getCSS("--stage-top"), bgBottom: getCSS("--stage-bottom") })}</div>
        <span class="stage-label">Before</span><span class="stage-label right">After</span>
        <div class="handle" id="baHandle"></div>
        <input type="range" min="0" max="100" value="50" id="baRange"/>
      </div>`;
      const r = $("#baRange");
      r.oninput = () => { $(".after", stage).style.clipPath = `inset(0 0 0 ${r.value}%)`; $("#baHandle").style.left = r.value + "%"; };
      return;
    }

    stage.innerHTML = frameHTML(g, { label: state.photo ? "Your photo" : state.model.name + " · " + g.name });
    if (state.photo) initOverlay();
  }

  /* static overlay for compare views (uses the same fit params) */
  function overlayStatic(g) {
    const { x, y, s } = state.fit;
    return `<div class="overlay-garment" style="transform:translate(${x * 100}%, ${y * 100}%) scale(${s}); transform-origin: 0 0; width:55%; pointer-events:none">${garmentSVG(g)}</div>`;
  }

  /* draggable / scalable overlay in photo mode */
  function initOverlay() {
    const ov = $("#overlayGarment"), frame = ov.parentElement;
    const fc = $("#fitControls"); fc.hidden = false;
    const scale = $("#fitScale"); scale.value = state.fit.s;
    const apply = () => {
      const W = frame.clientWidth, H = frame.clientHeight;
      ov.style.transformOrigin = "0 0";
      ov.style.transform = `translate(${state.fit.x * W}px, ${state.fit.y * H}px) scale(${state.fit.s})`;
    };
    apply();
    let drag = null;
    ov.onpointerdown = (e) => { ov.setPointerCapture(e.pointerId); drag = { px: e.clientX, py: e.clientY, x: state.fit.x, y: state.fit.y }; ov.classList.remove("fitting"); };
    ov.onpointermove = (e) => { if (!drag) return; state.fit.x = drag.x + (e.clientX - drag.px) / frame.clientWidth; state.fit.y = drag.y + (e.clientY - drag.py) / frame.clientHeight; apply(); };
    ov.onpointerup = ov.onpointercancel = () => { drag = null; };
    frame.onwheel = (e) => { e.preventDefault(); state.fit.s = Math.max(0.4, Math.min(2.2, state.fit.s * (e.deltaY > 0 ? 0.95 : 1.05))); scale.value = state.fit.s; apply(); };
    scale.oninput = () => { state.fit.s = +scale.value; apply(); };
    $("#btnAutoFit").onclick = () => {
      ov.classList.add("fitting");
      state.fit = { x: 0.22, y: 0.18, s: 1 }; scale.value = 1; apply();
      toast("Auto-fit applied. In production this is done by pose detection.");
    };
    window.addEventListener("resize", apply, { once: true });
  }

  /* ---------------- footer / insights ---------------- */
  function updateFooter() {
    const g = state.garment; const f = $("#canvasFooter");
    if (!g) { f.hidden = true; return; }
    f.hidden = false;
    $("#footGarment").innerHTML = garmentSVG(g);
    $("#footName").textContent = g.name; $("#footBrand").textContent = g.brand + " · " + g.category;
    $("#footPrice").textContent = fmt(g.price);
    const saved = state.looks.some((l) => l.g === g.id && l.m === (state.photo ? "photo" : state.model.id));
    $("#btnSave").classList.toggle("saved", saved);
    $("#btnSave").textContent = saved ? "♥ Saved" : "♡ Save look";
  }

  /* deterministic pseudo-scores so the demo is stable per model+garment */
  function score(g) {
    const seed = [...(g.id + (state.model?.id || "photo"))].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
    const r = (n) => ((seed >> (n * 5)) % 23);
    return { fit: 78 + r(0), color: 72 + r(1), occ: 70 + r(2) };
  }
  function updateInsights() {
    const g = state.garment; const box = $("#insights");
    if (!g) { box.hidden = true; return; }
    box.hidden = false;
    const s = score(g);
    requestAnimationFrame(() => {
      $("#insFit").style.width = s.fit + "%"; $("#insFitV").textContent = s.fit + "%";
      $("#insColor").style.width = s.color + "%"; $("#insColorV").textContent = s.color + "%";
      $("#insOcc").style.width = s.occ + "%"; $("#insOccV").textContent = s.occ + "%";
    });
    const sizes = ["S", "M", "L", "XL"];
    const rec = state.photo ? "M" : state.model.build > 1.05 ? "L" : state.model.build < 0.95 ? "S" : "M";
    $("#sizeRec").innerHTML = sizes.map((z) => `<span class="${z === rec ? "rec" : ""}">${z}</span>`).join("");
    const pairs = GARMENTS.filter((x) => x.id !== g.id && x.tags.some((t) => g.tags.includes(t))).slice(0, 4);
    $("#pairsWith").innerHTML = pairs.map((x) => `<div class="mini-garment" title="${x.name}" data-p="${x.id}">${garmentSVG(x)}</div>`).join("");
    $$("[data-p]").forEach((d) => d.onclick = () => runTryOn(GARMENTS.find((x) => x.id === d.dataset.p)));
  }

  /* ---------------- actions ---------------- */
  $("#btnSave").onclick = () => {
    const g = state.garment; if (!g) return;
    const m = state.photo ? "photo" : state.model.id;
    const i = state.looks.findIndex((l) => l.g === g.id && l.m === m);
    if (i >= 0) { state.looks.splice(i, 1); toast("Removed from My Looks"); }
    else { state.looks.unshift({ g: g.id, m, photo: state.photo, fit: { ...state.fit }, at: Date.now() }); toast("Saved to My Looks"); }
    try { localStorage.setItem("fitcheck.looks", JSON.stringify(state.looks.map((l) => ({ ...l, photo: l.photo && l.photo.length > 400000 ? null : l.photo })))); } catch (e) {}
    $("#looksCount").textContent = state.looks.length;
    updateFooter();
  };
  $("#looksCount").textContent = state.looks.length;
  $("#btnCart").onclick = () => toast(`Added ${state.garment.name} (${$(".sizes .rec")?.textContent || "M"}) to bag`);

  /* share */
  $("#btnShare").onclick = () => {
    const g = state.garment; if (!g) return;
    $("#sharePreview").innerHTML = state.photo ? `<div class="stage-frame" style="height:100%"><img class="photo" src="${state.photo}"/>${overlayStatic(g)}</div>` : modelSVG(state.model, g, { bgTop: getCSS("--stage-top"), bgBottom: getCSS("--stage-bottom") });
    $("#shareUrl").value = "https://fitcheck.pk/l/" + Math.random().toString(36).slice(2, 8);
    $("#shareModal").hidden = false;
  };
  const closeShare = () => { $("#shareModal").hidden = true; };
  $("#shareClose").onclick = closeShare;
  $("#shareModal").onclick = (e) => { if (e.target.id === "shareModal") closeShare(); };
  $("#shareCopy").onclick = () => { navigator.clipboard?.writeText($("#shareUrl").value); toast("Link copied"); };

  /* ---------------- looks page ---------------- */
  function renderLooks() {
    const grid = $("#looksGrid");
    $("#looksCount").textContent = state.looks.length;
    if (!state.looks.length) { grid.innerHTML = `<div class="looks-empty"><div style="font-size:40px;margin-bottom:10px">🧥</div><b>No saved looks yet</b><br/>Try something on in the Studio and tap “Save look”.</div>`; return; }
    grid.innerHTML = state.looks.map((l, i) => {
      const g = GARMENTS.find((x) => x.id === l.g); const m = MODELS.find((x) => x.id === l.m);
      const img = l.m === "photo"
        ? (l.photo ? `<div class="stage-frame" style="height:100%;border-radius:0;box-shadow:none"><img class="photo" src="${l.photo}"/><div class="overlay-garment" style="transform:translate(${l.fit.x * 100}%, ${l.fit.y * 100}%) scale(${l.fit.s});transform-origin:0 0;width:55%;pointer-events:none">${garmentSVG(g)}</div></div>` : `<div style="display:grid;place-items:center;height:100%">${garmentSVG(g)}</div>`)
        : modelSVG(m, g, { bgTop: getCSS("--stage-top"), bgBottom: getCSS("--stage-bottom"), slice: true });
      return `<div class="look-card">
        <div class="lk-img">${img}</div>
        <div class="lk-body">
          <b>${g.name}</b><span>${g.brand} · on ${m ? m.name : "you"} · ${fmt(g.price)}</span>
          <div class="lk-row">
            <button class="btn btn-ghost btn-sm" data-open="${i}">Open</button>
            <button class="btn btn-primary btn-sm" data-buy="${i}">Buy</button>
          </div>
        </div></div>`;
    }).join("");
    $$("[data-open]").forEach((b) => b.onclick = () => {
      const l = state.looks[+b.dataset.open];
      if (l.m === "photo" && l.photo) { state.photo = l.photo; state.model = null; state.fit = { ...l.fit }; }
      else { state.photo = null; state.model = MODELS.find((x) => x.id === l.m) || MODELS[0]; }
      renderModels(); go("studio"); runTryOn(GARMENTS.find((x) => x.id === l.g), true);
    });
    $$("[data-buy]").forEach((b) => b.onclick = () => toast("Added to bag"));
  }
  $("#btnClearLooks").onclick = () => { state.looks = []; localStorage.removeItem("fitcheck.looks"); renderLooks(); };

  /* re-render stage when theme changes (stage gradient colours) */
  new MutationObserver(() => { if (state.page === "studio") renderStage(); }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  /* initial stage */
  renderStage();
})();
