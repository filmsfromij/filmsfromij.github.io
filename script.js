const player = document.getElementById('player');
const video = player.querySelector('video');
const reel = document.querySelector('.reel video, .hero video') || document.createElement('video');

const still = player.querySelector('.still');

document.querySelectorAll('[data-src]').forEach((tile) => {
  tile.addEventListener('click', () => {
    reel.pause();
    player.classList.remove('photo-mode');
    video.src = tile.dataset.src;
    video.setAttribute('aria-label', tile.dataset.title);
    player.showModal();
    video.play().catch(() => {});
  });
});

player.querySelector('.close').addEventListener('click', () => player.close());

// Click on the black area around the video closes it.
player.addEventListener('click', (e) => {
  if (e.target === player) player.close();
});

// Runs for Esc as well as the Close button.
player.addEventListener('close', () => {
  video.pause();
  video.removeAttribute('src');
  video.load();
  still.removeAttribute('src');
  player.classList.remove('photo-mode');
});

// Photo gallery: filters, and the viewer with previous / next.
const photos = [...document.querySelectorAll('.ph')];
let shown = photos, current = 0;

document.querySelectorAll('.filters button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filters button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const f = btn.dataset.filter;
    photos.forEach((ph) => { ph.hidden = f !== 'all' && ph.dataset.cat !== f; });
    shown = photos.filter((ph) => !ph.hidden);
  });
});

const showPhoto = (i) => {
  current = (i + shown.length) % shown.length;
  const ph = shown[current];
  still.src = ph.dataset.full;
  still.alt = ph.querySelector('img').alt;
};

photos.forEach((ph) => {
  ph.addEventListener('click', () => {
    reel.pause();
    player.classList.add('photo-mode');
    showPhoto(shown.indexOf(ph));
    player.showModal();
  });
});

player.querySelector('.prev').addEventListener('click', () => showPhoto(current - 1));
player.querySelector('.next').addEventListener('click', () => showPhoto(current + 1));
player.addEventListener('keydown', (e) => {
  if (!player.classList.contains('photo-mode')) return;
  if (e.key === 'ArrowLeft') showPhoto(current - 1);
  if (e.key === 'ArrowRight') showPhoto(current + 1);
});

// Resume a background hero loop after the popup closes.
player.addEventListener('close', () => { const h = document.querySelector('.hero video'); if (h) h.play().catch(() => {}); });

// Background loop skips the showreel's title card (0-4s) and the black tail.
// The video stays hidden (poster image shows) until it is past the title card.
const hero = document.querySelector('.hero video');
if (hero && matchMedia('(prefers-reduced-motion: reduce)').matches) {
  hero.removeAttribute('autoplay');
  hero.pause(); // the still poster image stays instead
} else if (hero) {
  const START = 4, END = 86.5;
  const toStart = () => { if (hero.currentTime < START) hero.currentTime = START; };
  hero.addEventListener('loadedmetadata', toStart);
  if (hero.readyState >= 1) toStart();
  hero.addEventListener('timeupdate', () => {
    if (hero.currentTime >= END) { hero.currentTime = START; return; }
    if (hero.currentTime >= START - 0.05) hero.classList.add('ready'); else toStart();
  });
  hero.addEventListener('ended', () => { hero.currentTime = START; hero.play().catch(() => {}); });
}

// Header gets a solid background once the hero has scrolled away.
const header = document.querySelector('.top');
const heroEl = document.querySelector('.hero');
if (header && heroEl) {
  const update = () => header.classList.toggle('solid', heroEl.getBoundingClientRect().bottom < header.offsetHeight + 40);
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}
