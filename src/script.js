const infoBtn  = document.getElementById('info-btn');
const noticeEl = document.getElementById('notice-info');

infoBtn.onclick = () => {
  const ariaExpanded = infoBtn.ariaExpanded === 'true' ? true : false;

  noticeEl.classList.toggle('hidden', ariaExpanded);
  infoBtn.setAttribute('aria-expanded', !ariaExpanded);
}


const langBtn  = document.getElementById('lang-btn');
const langList = document.getElementById('lang-list');

langBtn.onclick = () => {
  const ariaExpanded = langBtn.ariaExpanded === 'true' ? true : false;

  langList.classList.toggle('hidden', ariaExpanded);
  langBtn.setAttribute('aria-expanded', !ariaExpanded);
}


let isPlaylistExpanded = false;
let isMenuExpanded     = false;
let lastFocusedEl      = undefined;

/**
 * Toggle main UI wrappers to be shown or hidden.
 *
 * Main UIs are Kobo Button (+ other control buttons) and played audio title above it.
 */
const toggleMainUi = () => {
  const mainUiEl = document.getElementsByClassName('main-ui');

  for (const el of mainUiEl) {
    el.toggleAttribute('inert', isPlaylistExpanded || isMenuExpanded);
    el.setAttribute('aria-hidden', isPlaylistExpanded || isMenuExpanded);
    el.classList.toggle('opacity-0', isPlaylistExpanded || isMenuExpanded);
  }
}


const togglePlaylistWindow = () => {
  const ariaExpanded = playlistBtn.ariaExpanded === 'true' ? true : false;

  playlistEl.classList.toggle('md:-translate-x-full', ariaExpanded);
  playlistEl.classList.toggle('translate-y-full', ariaExpanded);
  playlistEl.toggleAttribute('inert', ariaExpanded);
  playlistEl.setAttribute('aria-hidden', ariaExpanded);
  playlistBtn.setAttribute('aria-expanded', !ariaExpanded);

  isPlaylistExpanded = !ariaExpanded;

  toggleMainUi();

  if (isPlaylistExpanded) {
    lastFocusedEl = document.activeElement;

    document.getElementById('focused-audio').focus();
  } else {
    lastFocusedEl.focus();
    lastFocusedEl = undefined;
  }
}

const playlistEl  = document.getElementById('playlist-window');
const playlistBtn = document.getElementById('playlist-btn');
const closePlaylistBtn = document.getElementById('close-playlist-btn');

playlistBtn.onclick      = togglePlaylistWindow;
closePlaylistBtn.onclick = togglePlaylistWindow;


const toggleMenuWindow = () => {
  const ariaExpanded = menuBtn.ariaExpanded === 'true' ? true : false;

  menuEl.classList.toggle('translate-x-full', ariaExpanded);
  menuEl.toggleAttribute('inert', ariaExpanded);
  menuEl.setAttribute('aria-hidden', ariaExpanded);
  menuBtn.setAttribute('aria-expanded', !ariaExpanded);

  playlistEl.classList.toggle('md:w-3/4', ariaExpanded);
  playlistEl.classList.toggle('md:w-1/2', !ariaExpanded);

  if (ariaExpanded) {
    menuBtn.focus();
  }

  isMenuExpanded = !ariaExpanded;

  toggleMainUi();
}

const menuBtn = document.getElementById('menu-btn');
const menuEl  = document.getElementById('menu-window');

menuBtn.onclick = toggleMenuWindow;


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


const collapseEl = (el, btn, clickTarget) => {
  if (!el.contains(clickTarget) && !btn.contains(clickTarget)) {
    el.classList.add('hidden');
    btn.setAttribute('aria-expanded', false);
  }
}


document.onclick = (e) => {
  const isInfoExpanded = infoBtn.ariaExpanded === 'true' ? true : false;
  const isLangListExpanded = langBtn.ariaExpanded === 'true' ? true : false;

  if (isInfoExpanded && !noticeEl.contains(e.target) && !infoBtn.contains(e.target)) {
    noticeEl.classList.add('hidden');
    infoBtn.setAttribute('aria-expanded', false);
  }

  if (isLangListExpanded && !langList.contains(e.target) && !langBtn.contains(e.target)) {
    langList.classList.add('hidden');
    langBtn.setAttribute('aria-expanded', false);
  }

  if (isMenuExpanded && !menuEl.contains(e.target) && !menuBtn.contains(e.target) && !playlistEl.contains(e.target)) {
    toggleMenuWindow();
  }
}


document.onkeydown = (e) => {
  if (e.key !== 'Escape') {
    return;
  }

  const isInfoExpanded = infoBtn.ariaExpanded === 'true' ? true : false;
  const isLangListExpanded = langBtn.ariaExpanded === 'true' ? true : false;


  if (isInfoExpanded) {
    noticeEl.classList.add('hidden');
    infoBtn.setAttribute('aria-expanded', false);
  }

  if (isLangListExpanded) {
    langList.classList.add('hidden');
    langBtn.setAttribute('aria-expanded', false);
  }

  if (isPlaylistExpanded) {
    togglePlaylistWindow();
  }

  if (isMenuExpanded) {
    toggleMenuWindow();
  }
}
