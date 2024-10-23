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


const langBtn = document.getElementById('lang-btn');

langBtn.onclick = () => {
  const langList = document.getElementById('lang-list');
  const isExpanded = langBtn.getAttribute('aria-expanded');

  if (isExpanded === 'false') {
    langList.classList.remove('hidden');
    langBtn.setAttribute('aria-expanded', 'true');
  } else {
    langList.classList.add('hidden');
    langBtn.setAttribute('aria-expanded', 'false');
  }
}


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

const playlistBtn = document.getElementById('playlist-btn');
const closePlaylistBtn = document.getElementById('close-playlist-btn');

playlistBtn.onclick = togglePlaylistWindow;
closePlaylistBtn.onclick = togglePlaylistWindow;


const menuBtn = document.getElementById('menu-btn');

menuBtn.onclick = () => {
  const menuEl     = document.getElementById('menu-window');
  const playlistEl = document.getElementById('playlist-window');
  const menuBtn    = document.getElementById('menu-btn');

  const isExpanded = menuBtn.getAttribute('aria-expanded');

  if (isExpanded === 'false') {
    menuEl.classList.remove('translate-x-full');
    menuBtn.setAttribute('aria-expanded', 'true');

    playlistEl.classList.remove('md:w-[75%]');
    playlistEl.classList.add('md:w-[50%]');
  } else {
    menuEl.classList.add('translate-x-full');
    menuBtn.setAttribute('aria-expanded', 'false');

    playlistEl.classList.remove('md:w-[50%]');
    playlistEl.classList.add('md:w-[75%]');
  }
}


let timeoutId = undefined;
const playBtn = document.getElementById('play-btn');

playBtn.onmousedown = () => {
  timeoutId = setTimeout(togglePlaylistWindow, 1000);
}

playBtn.onmouseup = () => {
  clearTimeout(timeoutId);
}

const openPlaylistWindow = () => {
  // TODO: prevent click event of Play Button (maybe using boolean check) and call togglePlaylistWindow
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
