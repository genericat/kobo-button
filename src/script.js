const infoBtn = document.getElementById('info-btn');

infoBtn.onclick = () => {
  const noticeEl   = document.getElementById('notice-info');
  const isExpanded = infoBtn.ariaExpanded === 'true' ? true : false;

  noticeEl.classList.toggle('hidden', isExpanded);
  infoBtn.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
}


const langBtn = document.getElementById('lang-btn');

langBtn.onclick = () => {
  const langList   = document.getElementById('lang-list');
  const isExpanded = langBtn.ariaExpanded === 'true' ? true : false;

  langList.classList.toggle('hidden', isExpanded);
  langBtn.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
}


let isPlaylistExpanded = false;
let isMenuExpanded     = false;

/**
 * Toggle main UI wrappers to be shown or hidden by toggling CSS classes.
 * Main UIs are control buttons and played audio title.
 */
const toggleMainUi = () => {
  const mainUiEl = document.getElementsByClassName('main-ui');

  for (const el of mainUiEl) {
    el.classList.toggle('opacity-0', isPlaylistExpanded || isMenuExpanded);
    el.classList.toggle('invisible', isPlaylistExpanded || isMenuExpanded);
  }
}


const togglePlaylistWindow = () => {
  const playlistEl  = document.getElementById('playlist-window');
  const playlistBtn = document.getElementById('playlist-btn');

  const isExpanded = playlistBtn.ariaExpanded === 'true' ? true : false;

  playlistEl.classList.toggle('md:-translate-x-full', isExpanded);
  playlistEl.classList.toggle('translate-y-full', isExpanded);
  playlistBtn.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false' );

  isPlaylistExpanded = !isExpanded;

  toggleMainUi();
}

const playlistBtn      = document.getElementById('playlist-btn');
const closePlaylistBtn = document.getElementById('close-playlist-btn');

playlistBtn.onclick      = togglePlaylistWindow;
closePlaylistBtn.onclick = togglePlaylistWindow;


const menuBtn = document.getElementById('menu-btn');

menuBtn.onclick = () => {
  const menuEl     = document.getElementById('menu-window');
  const playlistEl = document.getElementById('playlist-window');

  const isExpanded = menuBtn.ariaExpanded === 'true' ? true : false;

  menuEl.classList.toggle('translate-x-full', isExpanded);
  menuBtn.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');

  playlistEl.classList.toggle('md:w-3/4', isExpanded);
  playlistEl.classList.toggle('md:w-1/2', !isExpanded);

  isMenuExpanded = !isExpanded;

  toggleMainUi();
}


let timeoutId = undefined;
const playBtn = document.getElementById('play-btn');

playBtn.onmousedown = () => {
  timeoutId = setTimeout(togglePlaylistWindow, 1000);
}

playBtn.onmouseup = () => {
  clearTimeout(timeoutId);
}

// TODO: also take care of keydown and touchstart event

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
