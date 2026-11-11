const player = document.getElementById('player');
const video = player.querySelector('video');
const reel = document.querySelector('.reel video');

document.querySelectorAll('.tile').forEach((tile) => {
  tile.addEventListener('click', () => {
    reel.pause();
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
});
