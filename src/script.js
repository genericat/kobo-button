"use strict";

const infoBtn = document.getElementById('info-btn');
const infoEl = document.getElementById('notice-info');

const langBtn = document.getElementById('lang-btn');
const langListEl = document.getElementById('lang-list');

const playlistEl = document.getElementById('playlist-window');
const playlistBtn = document.getElementById('playlist-btn');

const menuBtn = document.getElementById('menu-btn');
const menuEl = document.getElementById('menu-window');

const audioTitleEl = document.getElementById('audio-title');
const audioEl1 = document.getElementById('audio-player-1');
const audioEl2 = document.getElementById('audio-player-2');

const playBtn = document.getElementById('play-btn');
const replayBtn = document.getElementById('replay-btn');

const nsfwSwitch = document.getElementById('nsfw-switch');
const songSwitch = document.getElementById('song-switch');
const audioControlSwitch = document.getElementById('audio-control-switch');

/**
 * Last focused element
 *
 * Store the last focused element before opening the playlist window/panel
 * @type {?HTMLElement}
 */
let lastFocusedEl = null;

/**
 * Did the user already click the Kobo Button?
 * @type {boolean}
 */
let isWaitingAudio = false;

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
 * Audio database
 * @type object
 */
let audioData;

/**
 * Song audio data
 * @type object
 */
let songData;

/**
 * Fetched random audio in object url form
 * @type
 */
let aud;

/**
 * Fetched random audio song in object url form
 * @type
 */
let song;


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


const fetchAudioData = async () => {
  try {
    const response = await fetch('/assets/audio.json');
    const json = await response.json();

    return json;
  } catch (error) {
    throw new Error('Error fetching the audio data');
  }
}


const fetchAudio = async (audioName) => {
  try {
    const response = await fetch(`/assets/aud/${audioName}.mp3`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    return objectUrl;
  } catch (error) {
    console.error('Error fetching the audio file:', error);

    return '';
  }
}


const getRandomAudio = (audioData) => {
  let randomAudio = audioData[Math.floor(Math.random() * audioData.length)];

  while (randomAudio.isNsfw === true && nsfwSwitch.checked === false) {
    randomAudio = audioData[Math.floor(Math.random() * audioData.length)];
  }

  return {
    "title": randomAudio.title,
    "objectUrl": fetchAudio(randomAudio.name)
  }
}


const playAudio = (objectUrl, title, isSong) => {
  if (objectUrl !== '') {
    audioTitleEl.innerText = title;
    audioTitleEl.classList.remove('cursor-wait');

    audioEl1.src = objectUrl;
    audioEl1.play();

    isWaitingAudio = false;

    if (isSong) {
      song = getRandomAudio(songData);
    } else {
      aud = getRandomAudio(audioData);
    }

    // console.log('Played random audio');
  }
  else {
    console.error('Audio fetch failed');

    // TODO: refetch?
  }
}


(async () => {
  try {
    audioData = await fetchAudioData();

    songData = audioData.filter((data) => { return data.isSong });
    audioData = audioData.filter((data) => { return !data.isSong });

    aud = getRandomAudio(audioData);

    if (songSwitch.checked) {
      song = getRandomAudio(songData);
    }
  } catch (error) {
    console.error(error);

    alert('Error');
  }
})();


playlistBtn.onclick = togglePlaylistWindow;
menuBtn.onclick = toggleMenuWindow;
document.getElementById('close-playlist-btn').onclick = togglePlaylistWindow;

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

songSwitch.onchange = () => {
  if (songSwitch.checked && songData !== undefined) {
    song = getRandomAudio(songData);
  }
}

audioControlSwitch.onchange = () => {
  audioEl1.toggleAttribute('controls', audioControlSwitch.checked);
  audioEl2.toggleAttribute('controls', audioControlSwitch.checked);
}


playBtn.onmousedown = (e) => {
  timeoutId = setTimeout(openPlaylistWindow, 1000, e);
}

playBtn.onmouseup = () => {
  clearTimeout(timeoutId);
}

// TODO: also take care of keydown and touchstart event
playBtn.onclick = () => {
  if (isWaitingAudio) {
    return;
  }

  (async () => {
      let nextAud;

      if (songSwitch.checked && Math.random() > 0.6) {
        nextAud = await Promise.race([song.objectUrl, 'songPending']);

        if (nextAud !== 'songPending') {
          playAudio(nextAud, song.title, true);
          return;
        }
        // NOTE: If `song` is not settled yet then check `aud` instead of waiting for `song`
      }

      nextAud = await Promise.race([aud.objectUrl, 'audPending']);

      if (nextAud === 'audPending') {
        audioTitleEl.innerText = 'Loading...'
        audioTitleEl.classList.add('cursor-wait');

        isWaitingAudio = true;
        // console.log('Fetching audio...');

        // NOTE: if `aud` is not settled yet then wait for it
        nextAud = await aud.objectUrl;
      }

      playAudio(nextAud, aud.title, false);
  })();
}

playBtn.addEventListener('click', () => {
  replayBtn.classList.remove('invisible');
}, {once: true});


replayBtn.onclick = () => {
  audioEl1.play();

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
