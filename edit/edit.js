// Edit portfolio: before/after colour compare and without/with sound design player.
// Both read their media from data- attributes, so adding a piece is an HTML-only change.

// ---- Colour grade: two synced clips, the "before" one clipped by a draggable line ----
document.querySelectorAll('.compare').forEach((fig) => {
  const { before, after } = fig.dataset;
  const box = document.createElement('div');
  box.className = 'cmp';
  fig.prepend(box);
  if (!before || !after) { box.classList.add('empty'); return; }

  box.innerHTML = `
    <video class="after" muted loop playsinline preload="metadata"></video>
    <video class="before" muted loop playsinline preload="metadata"></video>
    <span class="lab b">Before</span><span class="lab a">After</span>
    <span class="line"></span>
    <input type="range" min="0" max="100" value="50" aria-label="Compare before and after grade for ${fig.dataset.title || 'this clip'}">`;
  const [vAfter, vBefore] = box.querySelectorAll('video');
  vAfter.src = after;
  vBefore.src = before;
  const range = box.querySelector('input');
  range.addEventListener('input', () => box.style.setProperty('--pos', range.value + '%'));

  // Keep the two clips on the same frame.
  vAfter.addEventListener('timeupdate', () => {
    if (Math.abs(vBefore.currentTime - vAfter.currentTime) > 0.08) vBefore.currentTime = vAfter.currentTime;
  });
  vAfter.addEventListener('play', () => vBefore.play().catch(() => {}));
  vAfter.addEventListener('pause', () => vBefore.pause());

  // Play only while on screen (and never for reduced-motion visitors).
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) vAfter.play().catch(() => {}); else vAfter.pause();
    }, { threshold: 0.4 }).observe(box);
  }
});

// ---- Sound design: one silent clip, two synced audio tracks, a toggle between them ----
const soundPlayers = [];
document.querySelectorAll('.sound').forEach((fig) => {
  const { video, raw, designed } = fig.dataset;
  const box = document.createElement('div');
  box.className = 'snd';
  fig.prepend(box);
  if (!video || !raw || !designed) { box.classList.add('empty'); return; }

  box.innerHTML = `
    <video muted playsinline preload="metadata"></video>
    <progress max="1" value="0"></progress>
    <div class="controls">
      <button class="play" type="button">▶ Play</button>
      <button class="mode" type="button" data-mode="raw" aria-pressed="false">Without</button>
      <button class="mode" type="button" data-mode="designed" aria-pressed="true">With sound design</button>
    </div>`;
  const v = box.querySelector('video');
  const bar = box.querySelector('progress');
  const playBtn = box.querySelector('.play');
  const tracks = { raw: new Audio(raw), designed: new Audio(designed) };
  Object.values(tracks).forEach((a) => { a.preload = 'auto'; });
  v.src = video;
  let mode = 'designed';

  const setMode = (m) => {
    mode = m;
    box.querySelectorAll('.mode').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
    tracks.raw.muted = m !== 'raw';
    tracks.designed.muted = m !== 'designed';
  };
  setMode('designed');

  const sync = () => Object.values(tracks).forEach((a) => {
    if (Math.abs(a.currentTime - v.currentTime) > 0.12) a.currentTime = v.currentTime;
  });
  const play = () => {
    soundPlayers.forEach((p) => p !== api && p.pause()); // one at a time
    sync();
    v.play().catch(() => {});
    Object.values(tracks).forEach((a) => a.play().catch(() => {}));
    playBtn.textContent = '❚❚ Pause';
  };
  const pause = () => {
    v.pause();
    Object.values(tracks).forEach((a) => a.pause());
    playBtn.textContent = '▶ Play';
  };
  const api = { pause };
  soundPlayers.push(api);

  playBtn.addEventListener('click', () => (v.paused ? play() : pause()));
  box.querySelectorAll('.mode').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
  v.addEventListener('timeupdate', () => { bar.value = v.duration ? v.currentTime / v.duration : 0; sync(); });
  v.addEventListener('ended', () => { pause(); v.currentTime = 0; sync(); });
});
