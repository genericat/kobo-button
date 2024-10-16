const infoBtn = document.getElementById('info-btn');

infoBtn.onclick = () => {
  const noticeEl = document.getElementById('notice-info');
  const isExpanded = infoBtn.getAttribute('aria-expanded');

  if (isExpanded === 'false') {
    noticeEl.classList.remove('hidden');
    infoBtn.setAttribute('aria-expanded', 'true');
  } else {
    noticeEl.classList.add('hidden');
    infoBtn.setAttribute('aria-expanded', 'false');
  }
}

const playlistBtn = document.getElementById('playlist-btn');
const closePlaylistBtn = document.getElementById('close-playlist-btn');

const togglePlaylistWindow = () => {
  const playlistEl = document.getElementById('playlist-window');
  const playlistBtn = document.getElementById('playlist-btn');

  const isExpanded = playlistBtn.getAttribute('aria-expanded');

  if (isExpanded === 'false') {
    playlistEl.classList.remove('-translate-x-full');
    playlistBtn.setAttribute('aria-expanded', 'true');
  } else {
    playlistEl.classList.add('-translate-x-full');
    playlistBtn.setAttribute('aria-expanded', 'false');
  }
}

playlistBtn.onclick = togglePlaylistWindow;
closePlaylistBtn.onclick = togglePlaylistWindow;

document.onclick = (e) => {
  const isExpanded = infoBtn.getAttribute('aria-expanded');

  if (isExpanded === 'false') {
    return;
  }

  const noticeEl = document.getElementById('notice-info');

  if (noticeEl.contains(e.target) || infoBtn.contains(e.target)) {
    return;
  }

  noticeEl.classList.add('hidden');
  infoBtn.setAttribute('aria-expanded', 'false');
}
