"use strict";

const infoBtn = document.getElementById('info-btn');
const infoEl = document.getElementById('notice-info');

const langBtn = document.getElementById('lang-btn');
const langListEl = document.getElementById('lang-list');

const playlistEl = document.getElementById('playlist-window');
const playlistBtn = document.getElementById('playlist-btn');

const menuBtn = document.getElementById('menu-btn');
const menuEl = document.getElementById('menu-window');

const audioEl = document.getElementById('audio-player-1');

const playBtn = document.getElementById('play-btn');
const replayBtn = document.getElementById('replay-btn');

/**
 * Last focused element
 *
 * Store the last focused element before opening the playlist window/panel
 * @type {?HTMLElement}
 */
let lastFocusedEl = null;

/**
 * `true` if the audio is being fetched and prosesed
 * @type {boolean}
 */
let isLoadingAudio = false;

/**
 * Tell if the audio should immediately play after being loaded to `<audio>` element
 * @type {boolean}
 * @deprecated
 */
let isImmediatePlay = false;

/**
 * Timeout ID of `setTimeout()` for `togglePlaylistWindow()`
 * @type {?string|number}
 */
let timeoutId = null;

/**
 * Fetched random audio in object url form
 * @type {Promise<string>}
 */
let aud;

const audioData = [
  {
      "title": "sample",
  },
  {
      "title": "sample2",
  }
];


infoBtn.onclick = () => {
  const ariaExpanded = infoBtn.ariaExpanded === 'true' ? true : false;

  infoEl.classList.toggle('hidden', ariaExpanded);
  infoBtn.setAttribute('aria-expanded', !ariaExpanded);
}

langBtn.onclick = () => {
  const ariaExpanded = langBtn.ariaExpanded === 'true' ? true : false;

  langListEl.classList.toggle('hidden', ariaExpanded);
  langBtn.setAttribute('aria-expanded', !ariaExpanded);
}


/**
 * Toggle main UI wrappers to be shown or hidden.
 *
 * Main UIs are Kobo Button (+ other control buttons) and played audio title above it.
 */
const toggleMainUi = () => {
  const mainUiEl = document.getElementsByClassName('main-ui');

  const isPlaylistExpanded = playlistBtn.ariaExpanded === 'true' ? true : false;
  const isMenuExpanded = menuBtn.ariaExpanded === 'true' ? true : false;

  for (const el of mainUiEl) {
    el.toggleAttribute('inert', isPlaylistExpanded || isMenuExpanded);
    el.setAttribute('aria-hidden', isPlaylistExpanded || isMenuExpanded);
    el.classList.toggle('opacity-0', isPlaylistExpanded || isMenuExpanded);
  }
}


const togglePlaylistWindow = () => {
  const ariaExpanded = playlistBtn.ariaExpanded === 'true' ? true : false;

  playlistEl.classList.toggle('ltr:md:-translate-x-full', ariaExpanded);
  playlistEl.classList.toggle('rtl:md:translate-x-full', ariaExpanded);
  playlistEl.classList.toggle('translate-y-full', ariaExpanded);
  playlistEl.toggleAttribute('inert', ariaExpanded);
  playlistEl.setAttribute('aria-hidden', ariaExpanded);
  playlistBtn.setAttribute('aria-expanded', !ariaExpanded);

  toggleMainUi();

  if (!ariaExpanded) {
    lastFocusedEl = document.activeElement;

    document.getElementById('focused-audio').focus();
  } else {
    lastFocusedEl.focus();
    lastFocusedEl = null;
  }
}


const toggleMenuWindow = () => {
  const ariaExpanded = menuBtn.ariaExpanded === 'true' ? true : false;

  menuEl.classList.toggle('ltr:translate-x-full', ariaExpanded);
  menuEl.classList.toggle('rtl:-translate-x-full', ariaExpanded);
  menuEl.toggleAttribute('inert', ariaExpanded);
  menuEl.setAttribute('aria-hidden', ariaExpanded);
  menuBtn.setAttribute('aria-expanded', !ariaExpanded);

  playlistEl.classList.toggle('md:w-3/4', ariaExpanded);
  playlistEl.classList.toggle('md:w-1/2', !ariaExpanded);

  if (ariaExpanded) {
    menuBtn.focus();
  }

  toggleMainUi();
}


const openPlaylistWindow = (e) => {
  e.preventDefault();
  togglePlaylistWindow();
}


const fetchAudio = async (audioTitle) => {
  try {
    const response = await fetch(`/assets/aud/${audioTitle}.mp3`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    return objectUrl;

  } catch (error) {
    console.error('Error fetching the audio file:', error);

    return ''
  }
}

// TODO: Delete later
const pendingTest = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('sample2');
    }, 3000);
  })
}


aud = fetchAudio(audioData[Math.floor(Math.random() * audioData.length)].title);

playlistBtn.onclick = togglePlaylistWindow;
menuBtn.onclick = toggleMenuWindow;
document.getElementById('close-playlist-btn').onclick = togglePlaylistWindow;


playBtn.onmousedown = (e) => {
  timeoutId = setTimeout(openPlaylistWindow, 1000, e);
}

playBtn.onmouseup = () => {
  clearTimeout(timeoutId);
}

// TODO: also take care of keydown and touchstart event
playBtn.onclick = () => {
  if (isLoadingAudio) {
    return;
  }

  Promise.race([aud, 'check']).then((value) => {
    if (value === 'check') {
      // TODO: set loading ui
      isLoadingAudio = true;
      console.log('Fetching audio...');
    }
  });

  (async () => {
      const objectUrl = await aud;

      if (objectUrl !== '') {
        // TODO: unset loading ui/display played audio title

        audioEl.src = objectUrl;
        audioEl.play();

        isLoadingAudio = false;
        aud = fetchAudio(audioData[Math.floor(Math.random() * audioData.length)].title);

        console.log('Played random audio');
      }
      else {
        console.info('Audio fetch failed');

        // TODO: refetch?
      }
  })();
}

playBtn.addEventListener('click', () => {
  replayBtn.classList.remove('invisible');
}, {once: true});


replayBtn.onclick = () => {
  audioEl.play();

  replayBtn.children[0].animate([
    {transform: 'rotate(-360deg)'}
  ],
  {
    duration: 300,
    iterations: 1
  });
}


document.onclick = (e) => {
  const isInfoExpanded = infoBtn.ariaExpanded === 'true' ? true : false;
  const isLangListExpanded = langBtn.ariaExpanded === 'true' ? true : false;
  const isMenuExpanded = menuBtn.ariaExpanded === 'true' ? true : false;

  if (isInfoExpanded && !infoEl.contains(e.target) && !infoBtn.contains(e.target)) {
    infoEl.classList.add('hidden');
    infoBtn.setAttribute('aria-expanded', false);
  }

  if (isLangListExpanded && !langListEl.contains(e.target) && !langBtn.contains(e.target)) {
    langListEl.classList.add('hidden');
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
  const isPlaylistExpanded = playlistBtn.ariaExpanded === 'true' ? true : false;
  const isMenuExpanded = menuBtn.ariaExpanded === 'true' ? true : false;


  if (isInfoExpanded) {
    infoEl.classList.add('hidden');
    infoBtn.setAttribute('aria-expanded', false);
  }

  if (isLangListExpanded) {
    langListEl.classList.add('hidden');
    langBtn.setAttribute('aria-expanded', false);
  }

  if (isPlaylistExpanded) {
    togglePlaylistWindow();
  }

  if (isMenuExpanded) {
    toggleMenuWindow();
  }
}
