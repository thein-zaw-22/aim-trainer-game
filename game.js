// Aim Trainer — Vanilla JS + Canvas
// Clean structure, high-DPI rendering, accessibility & localStorage best score.

(() => {
  // ========= DOM =========
  const $ = sel => document.querySelector(sel);
  const canvas = $('#gameCanvas');
  const wrap = $('#canvasWrap');
  const overlay = $('#overlay');
  const overlayStart = $('#overlayStart');
  const startBtn = $('#startBtn');
  const pauseBtn = $('#pauseBtn');
  const diffSel = $('#difficulty');
  const muteToggle = $('#muteToggle');

  const ui = {
    score: $('#score'),
    hits: $('#hits'),
    shots: $('#shots'),
    acc: $('#accuracy'),
    escaped: $('#escaped'),
    combo: $('#combo'),
    time: $('#time'),
    best: $('#best'),
    aria: $('#ariaLive'),
  };

  // ========= Canvas / DPI =========
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: false });

  const state = {
    width: 1280,
    height: 720,
    playing: false,
    paused: false,
    timeLeft: 45,
    score: 0,
    hits: 0,
    shots: 0,
    escaped: 0,
    combo: 0,
    best: Number(localStorage.getItem('aim_best_score') || 0),

    targets: [],
    splashes: [],
    floaters: [],

    spawnEvery: 0.9,
    targetMinR: 18,
    targetMaxR: 42,
    targetLifespan: 2.5,
    maxConcurrent: 5,

    spawnAcc: 0,
    lastTs: 0,

    mouse: { x: 0, y: 0, inside: false },

    audio: {
      ctx: null,
      muted: false,
      enabled: false,
    },
  };

  ui.best.textContent = state.best.toString();

  function setDifficulty(level) {
    // Difficulty tuning is independent of canvas size
    const presets = {
      easy:   { spawnEvery: 1.1, minR: 24, maxR: 54, lifespan: 3.0, max: 4 },
      normal: { spawnEvery: 0.9, minR: 18, maxR: 42, lifespan: 2.5, max: 5 },
      hard:   { spawnEvery: 0.75, minR: 16, maxR: 36, lifespan: 2.0, max: 6 },
      insane: { spawnEvery: 0.62, minR: 12, maxR: 28, lifespan: 1.7, max: 7 },
    };
    const p = presets[level] || presets.normal;
    state.spawnEvery = p.spawnEvery;
    state.targetMinR = p.minR;
    state.targetMaxR = p.maxR;
    state.targetLifespan = p.lifespan;
    state.maxConcurrent = p.max;
  }

  setDifficulty(diffSel.value);

  // ========= Resize / DPI scale =========
  function resizeCanvas() {
    const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
    const { clientWidth, clientHeight } = wrap;
    canvas.width = Math.floor(clientWidth * dpr);
    canvas.height = Math.floor(clientHeight * dpr);
    state.width = canvas.width;
    state.height = canvas.height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
    // Clear to base color
    ctx.fillStyle = '#0b0f22';
    ctx.fillRect(0, 0, clientWidth, clientHeight);
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  // ========= Audio (WebAudio minimal beeps) =========
  function initAudio() {
    if (state.audio.enabled || state.audio.muted) return;
    try {
      state.audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
      state.audio.enabled = true;
    } catch {}
  }

  function beep({ freq = 600, dur = 0.06, type = 'square', gain = 0.08 } = {}) {
    if (!state.audio.enabled || state.audio.muted) return;
    const ctxA = state.audio.ctx;
    if (!ctxA) return;
    const now = ctxA.currentTime;
    const o = ctxA.createOscillator();
    const g = ctxA.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g).connect(ctxA.destination);
    o.start(now);
    o.stop(now + dur);
  }

  // ========= Game Objects =========
  class Target {
    constructor(x, y, r) {
      this.x = x; this.y = y; this.r = r;
      this.spawn = performance.now() / 1000;
      this.dead = false;
    }
    get age() {
      return performance.now() / 1000 - this.spawn;
    }
    get life() { return Math.max(0, 1 - (this.age / state.targetLifespan)); }
    contains(px, py) {
      const dx = px - this.x, dy = py - this.y;
      return (dx*dx + dy*dy) <= this.r*this.r;
    }
    draw(ctx) {
      const t = this.life; // 1 -> 0
      const alpha = 0.2 + 0.8 * t;
      const ringW = Math.max(2, Math.min(8, this.r * 0.15));

      // subtle growth/shrink pulse
      const pulse = 1 + Math.sin((performance.now()/1000)*6) * 0.02;

      ctx.save();
      ctx.translate(this.x, this.y);

      // outer glow
      ctx.beginPath();
      ctx.arc(0, 0, this.r * 1.15 * pulse, 0, Math.PI*2);
      const grad = ctx.createRadialGradient(0,0, this.r*0.2, 0,0, this.r*1.15);
      grad.addColorStop(0, `rgba(124,152,255,${0.25*alpha})`);
      grad.addColorStop(1, `rgba(75,227,194,0)`);
      ctx.fillStyle = grad;
      ctx.fill();

      // target body
      ctx.beginPath();
      ctx.arc(0, 0, this.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(124,152,255,${0.18 + 0.1*alpha})`;
      ctx.fill();

      // ring
      ctx.beginPath();
      ctx.lineWidth = ringW;
      ctx.strokeStyle = `rgba(124,152,255,${0.9*alpha})`;
      ctx.arc(0, 0, this.r - ringW*0.5, 0, Math.PI*2);
      ctx.stroke();

      // inner dot
      ctx.beginPath();
      ctx.fillStyle = `rgba(75,227,194,${0.85*alpha})`;
      ctx.arc(0, 0, Math.max(2, this.r*0.15), 0, Math.PI*2);
      ctx.fill();

      // life arc
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = `rgba(255,255,255,${0.7})`;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = (performance.now()/100) % 8;
      ctx.arc(0, 0, this.r + 8, -Math.PI/2, -Math.PI/2 + (Math.PI*2)*t);
      ctx.stroke();

      ctx.restore();
    }
  }

  class Floater {
    // floating text feedback
    constructor(x,y,text,color="#7dff9e") {
      this.x=x; this.y=y; this.text=text; this.color=color; this.age=0; this.life=0.7;
    }
    update(dt){ this.age+=dt; this.y-=40*dt }
    get dead(){ return this.age>=this.life }
    draw(ctx){
      const a = 1 - (this.age/this.life);
      ctx.save();
      ctx.globalAlpha = Math.max(0, a);
      ctx.font = '600 16px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillStyle = this.color;
      ctx.textAlign = 'center';
      ctx.fillText(this.text, this.x, this.y);
      ctx.restore();
    }
  }

  class Splash {
    // ripple on miss/click
    constructor(x,y,good){
      this.x=x; this.y=y; this.good=good; this.age=0; this.life=0.35;
    }
    update(dt){ this.age+=dt }
    get dead(){ return this.age>=this.life }
    draw(ctx){
      const t = this.age/this.life;
      const r = 12 + 60*t;
      ctx.save();
      ctx.globalAlpha = (1-t) * 0.9;
      ctx.lineWidth = 2;
      ctx.strokeStyle = this.good ? '#4be3c2' : '#ff6b6b';
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ========= Helpers =========
  function rng(min, max) { return Math.random()*(max-min)+min; }
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function inBounds(x,y, r=0){
    return x>=r && y>=r && x<=wrap.clientWidth-r && y<=wrap.clientHeight-r;
  }

  function spawnTarget() {
    if (state.targets.length >= state.maxConcurrent) return;
    let r = rng(state.targetMinR, state.targetMaxR);
    let x = rng(r, wrap.clientWidth - r);
    let y = rng(r, wrap.clientHeight - r);
    state.targets.push(new Target(x, y, r));
  }

  function reset() {
    state.timeLeft = 45;
    state.score = 0; state.hits=0; state.shots=0; state.escaped=0; state.combo=0;
    state.targets.length = 0;
    state.splashes.length = 0;
    state.floaters.length = 0;
    state.spawnAcc = 0;
    updateHUD();
  }

  function updateHUD() {
    ui.score.textContent = state.score.toString();
    ui.hits.textContent = state.hits.toString();
    ui.shots.textContent = state.shots.toString();
    const acc = state.shots ? Math.round((state.hits/state.shots)*100) : 0;
    ui.acc.textContent = `${acc}%`;
    ui.escaped.textContent = state.escaped.toString();
    ui.combo.textContent = `${state.combo}x`;
    ui.time.textContent = state.timeLeft.toFixed(1);
  }

  // ========= Input =========
  wrap.addEventListener('pointerenter', () => state.mouse.inside = true);
  wrap.addEventListener('pointerleave', () => state.mouse.inside = false);
  wrap.addEventListener('pointermove', (e) => {
    const rect = wrap.getBoundingClientRect();
    state.mouse.x = e.clientX - rect.left;
    state.mouse.y = e.clientY - rect.top;
  }, { passive: true });

  function handleClick(e) {
    if (!state.playing || state.paused) return;
    initAudio(); // first interaction can enable audio
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let hitIndex = -1;
    // check topmost first
    for (let i = state.targets.length - 1; i >= 0; i--) {
      if (state.targets[i].contains(x, y)) { hitIndex = i; break; }
    }

    state.shots++;
    if (hitIndex >= 0) {
      const t = state.targets.splice(hitIndex, 1)[0];
      // points: base 100, + size bonus + combo bonus
      const sizeFactor = clamp((state.targetMaxR - t.r) / (state.targetMaxR - state.targetMinR + 1e-6), 0, 1);
      const points = Math.round(80 + 120*sizeFactor + Math.min(10, state.combo)*8);
      state.score += points;
      state.hits++;
      state.combo++;
      state.floaters.push(new Floater(x, y - 8, `+${points}`, '#7dff9e'));
      state.splashes.push(new Splash(x, y, true));
      beep({ freq: 720 + 200*sizeFactor, dur: 0.05, type: 'square', gain: 0.06 });
      ui.aria.textContent = `Hit! ${points} points. Combo ${state.combo}.`;
    } else {
      // miss
      state.combo = 0;
      state.floaters.push(new Floater(x, y - 8, `miss`, '#ff6b6b'));
      state.splashes.push(new Splash(x, y, false));
      beep({ freq: 200, dur: 0.07, type: 'sawtooth', gain: 0.05 });
      ui.aria.textContent = `Miss. Combo lost.`;
    }
    updateHUD();
  }

  wrap.addEventListener('click', handleClick);

  // Pause/Resume via keyboard
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (!state.playing) return;
      togglePause();
    }
  });

  // ========= Overlay / Buttons =========
  function showOverlay(show) {
    overlay.style.display = show ? 'flex' : 'none';
  }

  function startGame() {
    setDifficulty(diffSel.value);
    reset();
    showOverlay(false);
    state.playing = true;
    state.paused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    state.lastTs = performance.now();
    requestAnimationFrame(loop);
  }

  function togglePause() {
    if (!state.playing) return;
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? 'Resume' : 'Pause';
    showOverlay(state.paused);
    if (!state.paused) {
      state.lastTs = performance.now();
      requestAnimationFrame(loop);
    }
  }

  function endGame() {
    state.playing = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';

    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem('aim_best_score', String(state.best));
    }
    ui.best.textContent = state.best.toString();

    // Overlay summary
    overlay.querySelector('.card').innerHTML = `
      <h2>Time!</h2>
      <p>Your score: <strong>${state.score}</strong></p>
      <p>Accuracy: <strong>${ state.shots ? Math.round(100*state.hits/state.shots) : 0 }%</strong>,
         Combo Max: <strong>${state.combo}</strong> (final)</p>
      <p>Escaped targets: <strong>${state.escaped}</strong></p>
      <button id="overlayStart" class="primary">Play Again</button>
    `;
    overlay.querySelector('#overlayStart').addEventListener('click', startGame);
    showOverlay(true);
  }

  startBtn.addEventListener('click', startGame);
  pauseBtn.addEventListener('click', togglePause);
  overlayStart.addEventListener('click', startGame);
  diffSel.addEventListener('change', () => setDifficulty(diffSel.value));
  muteToggle.addEventListener('change', () => {
    state.audio.muted = muteToggle.checked;
    if (!muteToggle.checked) initAudio();
  });

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.playing && !state.paused) togglePause();
  });

  // ========= Main Loop =========
  function loop(ts) {
    if (!state.playing || state.paused) return;
    const dt = Math.min(0.05, (ts - state.lastTs)/1000 || 0);
    state.lastTs = ts;

    // Time
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      updateHUD();
      return endGame();
    }

    // Spawn
    state.spawnAcc += dt;
    while (state.spawnAcc >= state.spawnEvery) {
      spawnTarget();
      state.spawnAcc -= state.spawnEvery;
    }

    // Update targets (lifetimes)
    for (let i = state.targets.length - 1; i >= 0; i--) {
      const t = state.targets[i];
      if (t.age >= state.targetLifespan) {
        state.targets.splice(i, 1);
        state.escaped++;
      }
    }

    // Update FX
    state.floaters.forEach(f => f.update(dt));
    state.splashes.forEach(s => s.update(dt));
    state.floaters = state.floaters.filter(f => !f.dead);
    state.splashes = state.splashes.filter(s => !s.dead);

    // Draw
    render();

    // HUD
    updateHUD();

    requestAnimationFrame(loop);
  }

  function render() {
    const w = wrap.clientWidth, h = wrap.clientHeight;

    // background
    ctx.clearRect(0, 0, w, h);
    // subtle grid
    ctx.save();
    ctx.globalAlpha = 0.14;
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.strokeStyle = '#121633'; ctx.stroke();
    }
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.strokeStyle = '#121633'; ctx.stroke();
    }
    ctx.restore();

    // targets
    for (const t of state.targets) t.draw(ctx);
    // fx
    for (const s of state.splashes) s.draw(ctx);
    for (const f of state.floaters) f.draw(ctx);

    // crosshair
    if (state.mouse.inside) drawCrosshair(state.mouse.x, state.mouse.y);
  }

  function drawCrosshair(x, y) {
    const ctx2 = ctx; ctx2.save();
    ctx2.translate(x, y);
    ctx2.globalAlpha = 0.9;
    ctx2.lineWidth = 1.5;
    ctx2.strokeStyle = '#c9d0ff';
    ctx2.beginPath();
    ctx2.arc(0, 0, 12, 0, Math.PI*2); ctx2.stroke();
    ctx2.beginPath();
    ctx2.moveTo(-20, 0); ctx2.lineTo(-8, 0);
    ctx2.moveTo(8, 0); ctx2.lineTo(20, 0);
    ctx2.moveTo(0, -20); ctx2.lineTo(0, -8);
    ctx2.moveTo(0, 8); ctx2.lineTo(0, 20);
    ctx2.stroke();
    ctx2.restore();
  }

  // initial overlay visible
  showOverlay(true);
})();