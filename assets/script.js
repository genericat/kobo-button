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

playlistBtn.onclick = () => {
  const playlistEl = document.getElementById('playlist-window');
  const isExpanded = playlistBtn.getAttribute('aria-expanded');

  if (isExpanded === 'false') {
    playlistEl.classList.remove('hidden');
    playlistBtn.setAttribute('aria-expanded', 'true');
  } else {
    playlistEl.classList.add('hidden');
    playlistBtn.setAttribute('aria-expanded', 'false');
  }
}

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
