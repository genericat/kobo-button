const infoBtn = document.getElementById('info-btn');

infoBtn.onclick = () => {
  const noticeEl   = document.getElementById('notice-info');
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
  const langList   = document.getElementById('lang-list');
  const isExpanded = langBtn.getAttribute('aria-expanded');

  if (isExpanded === 'false') {
    langList.classList.remove('hidden');
    langBtn.setAttribute('aria-expanded', 'true');
  } else {
    langList.classList.add('hidden');
    langBtn.setAttribute('aria-expanded', 'false');
  }
}

/**
 * Toggle main UI wrappers to be shown or hidden by toggling CSS class.
 * Main UIs are control buttons and played audio title.
 *
 * @param {boolean} force true = show, false = hide
 */
const toggleMainUi = (force) => {
  const mainUiEl = document.getElementsByClassName('main-ui');

  for (const el of mainUiEl) {
    el.classList.toggle('hidden', force);
  }
}


const togglePlaylistWindow = () => {
  const playlistEl  = document.getElementById('playlist-window');
  const playlistBtn = document.getElementById('playlist-btn');

  const isExpanded = playlistBtn.getAttribute('aria-expanded');

  if (isExpanded === 'false') {
    playlistEl.classList.remove('md:-translate-x-full', 'translate-y-full');
    playlistBtn.setAttribute('aria-expanded', 'true');

    toggleMainUi(true);
  } else {
    playlistEl.classList.add('md:-translate-x-full', 'translate-y-full');
    playlistBtn.setAttribute('aria-expanded', 'false');

    toggleMainUi(false);
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

    playlistEl.classList.remove('md:w-3/4');
    playlistEl.classList.add('md:w-1/2');

    toggleMainUi(true);
  } else {
    menuEl.classList.add('translate-x-full');
    menuBtn.setAttribute('aria-expanded', 'false');

    playlistEl.classList.remove('md:w-1/2');
    playlistEl.classList.add('md:w-3/4');

    toggleMainUi(false);
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
