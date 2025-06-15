"use strict";

const infoBtn = document.getElementById('info-btn');
const infoEl = document.getElementById('notice-info');

const langBtn = document.getElementById('lang-btn');
const langListEl = document.getElementById('lang-list');

const playlistEl = document.getElementById('playlist-window');
const playlistBtn = document.getElementById('playlist-btn');

const menuBtn = document.getElementById('menu-btn');
const menuEl = document.getElementById('menu-window');
const menuIcon = document.getElementById('menu-icon');

const audioTitleEl = document.getElementById('audio-title');
const audioEl1 = document.getElementById('audio-player-1');
const audioEl2 = document.getElementById('audio-player-2');

const songSwitch = document.getElementById('song-switch');
const audioControlSwitch = document.getElementById('audio-control-switch');

const audioPlaylist = document.getElementById('audio-playlist');

const wordsFilterBtn = document.getElementById('words-filter-btn');
const soundFilterBtn = document.getElementById('sound-filter-btn');
const songFilterBtn = document.getElementById('song-filter-btn');

const playBtn = document.getElementById('play-btn');
const replayBtn = document.getElementById('replay-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const baseUrl = document.getElementById('baseUrl').getAttribute('href');


/**
 * Last focused element before opening the playlist window/panel
 * @type {?HTMLElement}
 */
let lastFocusedEl = null;

/**
 * Did the user already click the Kobo button or next button and waiting any audio to be played?
 * @type {boolean}
 */
let isWaitingAudio = false;

/**
 * Timeout id of `setTimeout()` for `togglePlaylistWindow()`
 * @type {?string|number}
 */
let timeoutId = null;

/**
 * Audio database for other than song category
 * @type ?Array<object>
 */
let audiosData;

/**
 * Audio database for song category
 * @type ?Array<object>
 */
let songsData;

/**
 * Fetched random audio
 * @type ?object
 */
let randomAud;

/**
 * Fetched random song audio
 * @type ?object
 */
let randomSong;

/**
 * Currently played random audio
 * @type ?object
 */
let currentAud;

/**
 * Previous random audio played
 * @type ?object
 */
let prevAud;

/**
 * Next chained audio
 * @type ?object
 */
let nextAud;

/**
 * Previous audio played from playlist
 * @type ?object
 */
let prevAudPlaylist;

/**
 * Last filter used for the playlist
 * @type string
 */
let filterUsed = '';

/**
 * Controller to abort a fetch Promise.
 * Used to cancel fetch of audio from playlist
 * @type {?AbortController}
 */
let abortController;


/**
 * Toggle main UI wrappers to be shown or hidden.
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

    const focusedAudio = document.getElementById('focused-audio');

    focusedAudio.focus();

  } else {
    lastFocusedEl.focus();
    lastFocusedEl = null;

    const lastPlayedAudio = audioPlaylist.getElementsByClassName('played-audio')[0];
    lastPlayedAudio?.classList.remove('played-audio');
  }
}


const toggleMenuWindow = () => {
  const ariaExpanded = menuBtn.ariaExpanded === 'true' ? true : false;

  menuEl.classList.toggle('ltr:translate-x-full', ariaExpanded);
  menuEl.classList.toggle('rtl:-translate-x-full', ariaExpanded);
  menuEl.toggleAttribute('inert', ariaExpanded);
  menuEl.setAttribute('aria-hidden', ariaExpanded);

  menuIcon.innerText = ariaExpanded ? '🌂' : '☂️';
  menuIcon.classList.toggle('ltr:md:-translate-x-[8px]', !ariaExpanded);
  menuIcon.classList.toggle('rtl:md:translate-x-[8px]', !ariaExpanded);
  menuIcon.classList.toggle('md:translate-y-[8px]', !ariaExpanded);

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


const filterPlaylist = (el, list) => {
  const isChecked = el.ariaChecked === 'true' ? true : false;

  audioPlaylist.classList.toggle('words-list', isChecked || list === 'words');
  audioPlaylist.classList.toggle('sound-list', isChecked || list === 'sound');
  audioPlaylist.classList.toggle('song-list', isChecked || list === 'song');

  wordsFilterBtn.setAttribute('aria-checked', wordsFilterBtn === el && !isChecked);
  soundFilterBtn.setAttribute('aria-checked', soundFilterBtn === el && !isChecked);
  songFilterBtn.setAttribute('aria-checked', songFilterBtn === el && !isChecked);

  filterUsed = isChecked ? '' : list;


  const focusedAudio = document.getElementById('focused-audio');

  if (focusedAudio.dataset.category !== list) {
    const newFocusedAudio = audioPlaylist.querySelector(`[data-category="${list}"]`);

    focusedAudio.removeAttribute('id');
    focusedAudio.setAttribute('tabindex', '-1');

    newFocusedAudio.setAttribute('id', 'focused-audio');
    newFocusedAudio.setAttribute('tabindex', '0');
  }
}


/**
 * Fetch all of the audio data
 *
 * @returns {Promise<object[]>} audio.json
 */
const fetchAudioData = async () => {
  try {
    const response = await fetch(baseUrl + 'assets/audio.json');

    if (response.status == 429) {
      throw new Error('Rate limited. 429 HTTP status code');
    }

    if (!response.ok) {
      throw new Error('Fetch audio data failed');
    }

    const json = await response.json();

    return json;
  } catch (error) {
    throw error
  }
}


/**
 * Fetch an mp3 audio file and return it as object url
 *
 * @param {string} audioName Valid name of audio file
 * @param {AbortController} signal AbortController object
 * @returns {Promise<string>} object url
 */
const fetchAudio = async (audioName, signal = null) => {
  try {
    const response = await fetch(`${baseUrl}assets/aud/${audioName}.mp3`, { signal });

    if (response.status == 429) {
      throw new Error('Rate limited. 429 HTTP status code');
    }

    if (!response.ok) {
      throw new Error(`Fetch ${audioName}.mp3 audio file failed`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    return objectUrl;
  } catch (error) {
    throw error;
  }
}


/**
 * Get random audio that will be fetched
 *
 * @param {Array<object>} audiosData either `audiosData` or `songsData`
 * @returns {object} random audio data
 */
const getRandomAudio = (audiosData) => {
  let randomAudio = audiosData[Math.floor(Math.random() * audiosData.length)];

  while (!randomAudio.isSeiso ||
          randomAudio.name === currentAud?.name ||
          randomAudio.name === prevAud?.name ||
          randomAudio.name === nextAud?.name) {
    randomAudio = audiosData[Math.floor(Math.random() * audiosData.length)];
  }

  if (!randomAudio.objectUrl) {
    randomAudio.objectUrl = fetchAudio(randomAudio.name);
  }

  return randomAudio;
}


/**
 * Get audio data that has been fetched
 *
 * @returns {Promise<object>} `randomAud` or `randomSong`
 */
const getAudioData = async () => {
  try {
    let objectUrl;

    if (songSwitch.checked && Math.random() > 0.6) {
      objectUrl = await Promise.race([randomSong.objectUrl, 'songPending']);

      if (objectUrl !== 'songPending') {
        randomSong.objectUrl = objectUrl;
        return randomSong;
      }
      // NOTE: If `song.objectUrl` is not settled yet then check `aud.objectUrl` instead of waiting for `song.objectUrl`
    }

    objectUrl = await Promise.race([randomAud.objectUrl, 'audPending']);

    if (objectUrl === 'audPending') {
      audioTitleEl.innerText = 'Loading...'
      audioTitleEl.classList.add('cursor-wait');

      isWaitingAudio = true;

      // NOTE: if `aud.objectUrl` is not settled yet then wait for it
      objectUrl = await randomAud.objectUrl;
    }

    randomAud.objectUrl = objectUrl;
    return randomAud;

  } catch (error) {
    throw error;
  }
}


/**
 * Revoke object urls and set `objectUrl` properties to `null`
 *
 * @param {audioData} audioData audioData that will be cleared, expected `prevAud`
 */
const clearAudioData = (audioData) => {
  if (!audioData) {
    return;
  }

  if (audioData.name !== randomAud.name &&
      audioData.name !== randomSong?.name &&
      audioData.name !== nextAud?.name &&
      audioData.name !== prevAudPlaylist?.name) {
    URL.revokeObjectURL(audioData.objectUrl);
    audioData.objectUrl = null;
  }

  if (!audioData.next ||
    audioData.next === currentAud?.name ||
    audioData.next === randomAud.name ||
    audioData.next === randomSong?.name ||
    audioData.next === prevAudPlaylist?.name) {
    return;
  }


  let nextAudioData = audiosData.filter(ad => {return ad.name === audioData.next});

  if (nextAudioData.length == 0) {
    nextAudioData = songsData.filter(ad => {return ad.name === audioData.next});
  }

  nextAudioData.objectUrl?.then(ou => URL.revokeObjectURL(ou));
  nextAudioData.objectUrl = null;
}


const setPrevAud = () => {
  if (!currentAud) {
    return;
  }

  if (!songSwitch.checked && currentAud.category === 'song') {
    return;
  }

  prevAud = currentAud;

  prevBtn.title = currentAud.title;
  prevBtn.classList.remove('invisible');
}


const setNextAud = (audioNext) => {
  if (!audioNext) {
    nextAud = undefined;

    nextBtn.classList.add('invisible');
    nextBtn.removeAttribute('title');

    return;
  }

  let nextAudioData = audiosData.filter(ad => {return ad.name === audioNext});

  if (nextAudioData.length == 0 && songSwitch.checked) {
    nextAudioData = songsData.filter(ad => {return ad.name === audioNext});
  } else if (nextAudioData.length == 0 && !songSwitch.checked) {
    return;
  }

  nextAud = nextAudioData[0];

  if (!nextAud.objectUrl) {
    nextAud.objectUrl = fetchAudio(audioNext);
  }

  nextBtn.classList.remove('invisible');
  nextBtn.setAttribute('title', nextAud.title);
}


const playRandomAudio = (audioData) => {
  currentAud = audioData;

  audioTitleEl.innerText = audioData.title;
  audioTitleEl.classList.remove('cursor-wait');

  audioEl1.src = audioData.objectUrl;
  audioEl1.play().then(() => {}, () => console.log(audioData.name, audioEl1.src));

  isWaitingAudio = false;
}


const playAudio = async (el) => {
  const audioName = el.getAttribute('data-name');

  if (audioName === prevAudPlaylist?.name) {
    audioEl2.play();
    return;
  }

  // If the `abortController` not null (audio is not done fetched)
  // then abort the current fetch promise, preparing for new fetch promise
  if (abortController) {
    abortController.abort();
  }

  abortController = new AbortController();


  try {
    const fetchOu = fetchAudio(audioName, abortController.signal);

    el.classList.add('cursor-wait');

    if (!el.classList.contains('played-audio')) {
      const prevPlayedAud = audioPlaylist.getElementsByClassName('played-audio')[0];
      prevPlayedAud?.classList.remove('played-audio');

      el.classList.add('played-audio');
    }

    const objectUrl = await fetchOu;

    audioEl2.src = objectUrl;
    audioEl2.play();

    if (prevAudPlaylist?.objectUrl) {
      URL.revokeObjectURL(prevAudPlaylist?.objectUrl);
    }

    prevAudPlaylist = {
      "name": audioName,
      "objectUrl": objectUrl
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`Fetching ${audioName} file aborted`);
    }
    else {
      console.error(error);
      alert('Error');
    }
  } finally {
    el.classList.remove('cursor-wait');

    abortController = null;
  }
}


(async function init() {
  try {
    const data = await fetchAudioData();

    audiosData = data.filter((data) => { return data.category !== 'song' });
    songsData = data.filter((data) => { return data.category === 'song' });

    randomAud = getRandomAudio(audiosData);

    if (songSwitch.checked) {
      randomSong = getRandomAudio(songsData);
    }
  } catch (error) {
    console.error('Initialization failed -', error);
    alert('Error');
  }
})();



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

playlistBtn.onclick = togglePlaylistWindow;
menuBtn.onclick = toggleMenuWindow;
document.getElementById('close-playlist-btn').onclick = togglePlaylistWindow;

// document.getElementById('menu-overflow-container').onkeydown = (e) => {
//   if (e.key === ' ' || e.key === 'Enter') {
//     // Prevent scrolling for this overflow container element
//     e.preventDefault();
//   }
// }

menuEl.querySelectorAll('.switch').forEach(el => {
  el.onkeydown = (e) => {
    if (e.key !== 'Enter') {
      return;
    }

    const switchSelected = e.target.children[1];
    const changeEvent = new Event('change');

    switchSelected.checked = !switchSelected.checked;
    switchSelected.dispatchEvent(changeEvent);
  }
});

songSwitch.onchange = () => {
  const isChecked = songSwitch.checked;

  if (isChecked && songsData !== undefined && randomSong === undefined) {
    randomSong = getRandomAudio(songsData);
  }

  replayBtn.classList.toggle('invisible', !currentAud || currentAud?.category === 'song' && !isChecked);
  prevBtn.classList.toggle('invisible', !prevAud || prevAud?.category === 'song' && !isChecked);
  nextBtn.classList.toggle('invisible', !nextAud || nextAud?.category === 'song' && !isChecked);

  const songList = audioPlaylist.querySelectorAll('[data-category="song"]');

  songList.forEach((el) => {
    el.classList.toggle('opacity-50', !isChecked);
    el.classList.toggle('hover:bg-white', isChecked);
    el.classList.toggle('hover:-translate-x-[2px]', isChecked);
    el.classList.toggle('hover:-translate-y-[2px]', isChecked);
    el.classList.toggle('cursor-pointer', isChecked);
    el.setAttribute('aria-disabled', !isChecked);
  });
}

audioControlSwitch.onchange = () => {
  audioEl1.toggleAttribute('controls', audioControlSwitch.checked);
  audioEl2.toggleAttribute('controls', audioControlSwitch.checked);
}

audioPlaylist.onkeydown = (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    const listFocused = e.target;
    let nextListFocused = e.key === 'ArrowDown' ? listFocused.nextElementSibling : listFocused.previousElementSibling;

    while (filterUsed !== '' && nextListFocused && nextListFocused.dataset.category !== filterUsed) {
      nextListFocused = e.key === 'ArrowDown' ? nextListFocused.nextElementSibling : nextListFocused.previousElementSibling;
    }

    if (nextListFocused === null) {
      return;
    }

    listFocused.removeAttribute('id');
    listFocused.setAttribute('tabindex', '-1');

    nextListFocused.setAttribute('id', 'focused-audio');
    nextListFocused.setAttribute('tabindex', '0');
    nextListFocused.focus();
  }

  if (e.key === 'Enter') {
    // e.preventDefault(); // Prevent scrolling when pressing space key

    playAudio(e.target);
  }
}

audioPlaylist.onclick = (e) => {
  let listSelected;
  const targetEl = e.target;

  if (targetEl.hasAttribute('data-name')) {
    listSelected = targetEl;
  }
  else if (targetEl.parentElement.hasAttribute('data-name')) {
    listSelected = targetEl.parentElement;
  }
  else {
    return;
  }


  if (listSelected.ariaDisabled === 'true') {
    return;
  }

  if (!listSelected.hasAttribute('id')) {
    const prevListSelected = document.getElementById('focused-audio');
    prevListSelected.removeAttribute('id');
    prevListSelected.setAttribute('tabindex', '-1');

    listSelected.setAttribute('id', 'focused-audio');
    listSelected.setAttribute('tabindex', '0');
  }

  if (!listSelected.classList.contains('played-audio')) {
    const prevPlayedAud = document.getElementsByClassName('played-audio')[0];
    prevPlayedAud?.classList.remove('played-audio');

    listSelected.classList.add('played-audio');
  }

  playAudio(listSelected);
}

wordsFilterBtn.onclick = () => {
  filterPlaylist(wordsFilterBtn, 'words');
};

soundFilterBtn.onclick = () => {
  filterPlaylist(soundFilterBtn, 'sound');
}

songFilterBtn.onclick = () => {
  filterPlaylist(songFilterBtn, 'song');
}


playBtn.onmousedown = (e) => {
  timeoutId = setTimeout(openPlaylistWindow, 1000, e);
}

playBtn.ontouchstart = (e) => {
  timeoutId = setTimeout(openPlaylistWindow, 1000, e);
}

playBtn.onmouseup = () => {
  clearTimeout(timeoutId);
}

playBtn.ontouchend = () => {
  clearTimeout(timeoutId);
}


playBtn.onclick = async () => {
  if (isWaitingAudio) {
    return;
  }

  try {
    const audioData = await getAudioData();

    clearAudioData(prevAud);

    setPrevAud();

    playRandomAudio(audioData);

    setNextAud(audioData.next);

    if (audioData.category === 'song') {
      randomSong = getRandomAudio(songsData);
    } else {
      randomAud = getRandomAudio(audiosData);
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`Fetching ${audioName} file aborted`);
    }
    else {
      console.error(error);
      alert('Error');
    }
  }
}

playBtn.addEventListener('click', () => {
  replayBtn.classList.remove('invisible');
});


replayBtn.onclick = () => {
  audioEl1.load();
  audioEl1.play();

  replayBtn.children[0].animate([
    {transform: 'rotate(-360deg)'}
  ],
  {
    duration: 300,
    iterations: 1
  });
}


prevBtn.onclick = () => {
  const temp = prevAud;

  setPrevAud();

  playRandomAudio(temp);

  setNextAud(temp.next);
}

nextBtn.onclick = async () => {
  if (isWaitingAudio) {
    return;
  }

  let objectUrl = await Promise.race([nextAud.objectUrl, 'pending']);

  if (objectUrl === 'pending') {
    audioTitleEl.innerText = 'Loading...'
    audioTitleEl.classList.add('cursor-wait');

    isWaitingAudio = true;

    objectUrl = await nextAud;
  }

  if (objectUrl === '') {
    alert('error');
    return;
  }

  nextAud.objectUrl = objectUrl;

  clearAudioData(prevAud);

  setPrevAud()

  playRandomAudio(nextAud);

  setNextAud(nextAud.next);
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


window.onblur = () => {
  audioEl1.pause();
  audioEl2.pause();
}
