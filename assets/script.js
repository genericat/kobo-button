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


/**
 * Last focused element
 *
 * Store the last focused element before opening the playlist window/panel
 * @type {?HTMLElement}
 */
let lastFocusedEl = null;

/**
 * Did the user already click the Kobo Button and waiting any audio to be played?
 * @type {boolean}
 */
let isWaitingAudio = false;

/**
 * Timeout ID of `setTimeout()` for `togglePlaylistWindow()`
 * @type {?string|number}
 */
let timeoutId = null;

/**
 * Audio database for other than song category
 * @type ?object
 */
let audiosData;

/**
 * Audio database for song category
 * @type ?object
 */
let songsData;

/**
 * Fetched random audio
 * @type ?object
 */
let aud;

/**
 * Fetched random song audio
 * @type ?object
 */
let song;

/**
 * Currently played audio from Kobo Button
 * @type ?object
 */
let currentAud;

/**
 * Previous audio played from Kobo Button or Next Button
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
 * @type object
 */
let prevAudPlaylist = {};

/**
 * Controller to abort fetch promise
 * @type {?AbortController}
 */
let controller;


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

  audioPlaylist.classList.toggle(list, !isChecked);
  el.classList.toggle('border-gray-500', isChecked);
  el.classList.toggle('bg-white', !isChecked);
  el.setAttribute('aria-checked', !isChecked);
}


const fetchAudioData = async () => {
  try {
    const response = await fetch('/assets/audio.json');
    const json = await response.json();

    return json;
  } catch (error) {
    console.error(error);
    // throw error;
  }
}


const fetchAudio = async (audioName, signal = null) => {
  try {
    const response = await fetch(`/assets/aud/${audioName}.mp3`, { signal });
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    return objectUrl;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`Fetching ${audioName} file aborted`);
    }
    else {
      console.error(error);
    }

    return '';
  }
}


const getRandomAudio = (audiosData) => {
  let randomAudio = audiosData[Math.floor(Math.random() * audiosData.length)];

  while (!randomAudio.isSeiso) {
    randomAudio = audiosData[Math.floor(Math.random() * audiosData.length)];
  }

  const result = {...randomAudio};
  result.objectUrl = fetchAudio(randomAudio.name);

  return result;
}


const getNextAudio = (audioName) => {
  let audioData = audiosData.filter(ad => {return ad.name === audioName});

  if (audioData) {
    audioData = songsData.filter(ad => {return ad.name === audioName});
  }

  audioData[0].objectUrl = fetchAudio(audioName);

  return audioData[0];
}


const setPrevAud = () => {
  if (!currentAud) {
    return;
  }

  if (!songSwitch.checked && currentAud.category === 'song') {
    return;
  }

  URL.revokeObjectURL(prevAud?.objectUrl);

  prevAud = currentAud;

  prevBtn.title = currentAud.title;
  prevBtn.classList.remove('invisible');

  // const isSong = audioEl1.getAttribute('data-song') === 'true' ? true : false;

  // if (!songSwitch.checked && isSong) {
  //   return;
  // }


  // if (prevAud) {
    // URL.revokeObjectURL(prevAud?.objectUrl);
  // }

  // prevAud = {
  //   "title": audioTitleEl.innerText,
  //   "isSong": isSong,
  //   "objectUrl": audioEl1.src
  // }
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
  } else {
    return;
  }

  nextAud = nextAudioData[0];
  nextAud.objectUrl = fetchAudio(audioNext);


  nextBtn.classList.remove('invisible');
  nextBtn.setAttribute('title', nextAud.title);
}


const playRandomAudio = (objectUrl, audioData) => {
  if (objectUrl === '') {
    alert('Error');
    return;
  }

  setPrevAud();

  currentAud = audioData;
  currentAud.objectUrl = objectUrl;

  audioTitleEl.innerText = audioData.title;
  audioTitleEl.classList.remove('cursor-wait');

  audioEl1.src = objectUrl;
  // audioEl1.setAttribute('data-song', audioData.category === 'song' ? true : false);
  audioEl1.play();


  isWaitingAudio = false;

  // if (audioData.name !== nextAud?.name) {
  //   nextAud?.objectUrl?.then(ou => URL.revokeObjectURL(ou));
  // }

  setNextAud(audioData.next);

  // TODO: maybe move this part to a function
  if (audioData.category === 'song') {
    song = getRandomAudio(songsData);
  } else {
    aud = getRandomAudio(audiosData);
  }
}

const playAudio = async (audioName) => {
  if (audioName === prevAudPlaylist.name) {
    audioEl2.play();
    return;
  }

  // If the `controller` not null (audio is not done fetched)
  // then abort the current fetch promise, preparing for new fetch promise
  if (controller) {
    controller.abort();
  }

  if (prevAudPlaylist.objectUrl) {
    audioEl2.src = '';
    // TODO: Check again if prevAudPlaylist.objectUrl is a Promise
    URL.revokeObjectURL(await prevAudPlaylist.objectUrl);
  }

  prevAudPlaylist.name = audioName;
  controller = new AbortController();

  try {
    const audio = await fetchAudio(audioName, controller.signal);

    audioEl2.src = audio;
    audioEl2.play();

    controller = null;
    prevAudPlaylist.objectUrl = audio;
  } catch (error) {
    alert('Error');
  }
}


(async function init() {
  try {
    audiosData = await fetchAudioData();

    songsData = audiosData.filter((data) => { return data.category === 'song' });
    audiosData = audiosData.filter((data) => { return data.category !== 'song' });

    aud = getRandomAudio(audiosData);

    if (songSwitch.checked) {
      song = getRandomAudio(songsData);
    }
  } catch (error) {
    // console.error('Initialization failed -', error);
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

document.getElementById('menu-overflow-container').onkeydown = (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    // Prevent scrolling for this overflow container element
    e.preventDefault();
  }
}

menuEl.querySelectorAll('.switch').forEach(el => {
  el.onkeydown = (e) => {
    if (e.key !== ' ' && e.key !== 'Enter') {
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

  if (isChecked && songsData !== undefined && song === undefined) {
    song = getRandomAudio(songsData);
  }

  if (audioEl1.getAttribute('data-song') === 'true') {
    replayBtn.classList.toggle('invisible', true && !isChecked);
  }

  if (prevAud) {
    prevBtn.classList.toggle('invisible', prevAud.category !== 'song' || isChecked);
  }

  if (nextAud) {
    nextBtn.classList.toggle('invisible', nextAud.category !== 'song' || isChecked);
  }

  const songList = audioPlaylist.querySelectorAll('[data-category="song"]');

  songList.forEach((el) => {
    el.classList.toggle('opacity-50', !isChecked);
    el.classList.toggle('hover:bg-white', isChecked);
    el.classList.toggle('hover:-translate-x-[2px]', isChecked);
    el.classList.toggle('hover:-translate-y-[2px]', isChecked);
    el.classList.toggle('focus:bg-white', isChecked);
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

    while (nextListFocused?.ariaDisabled === 'true') {
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

  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();

    playAudio(e.target.getAttribute('data-name'));
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

  playAudio(listSelected.getAttribute('data-name'));
}

wordsFilterBtn.onclick = () => {
  filterPlaylist(wordsFilterBtn, 'words-list');
};

soundFilterBtn.onclick = () => {
  filterPlaylist(soundFilterBtn, 'sound-list');
}

songFilterBtn.onclick = () => {
  filterPlaylist(songFilterBtn, 'song-list');
}


// TODO: also take care of keydown and touchstart event
playBtn.onmousedown = (e) => {
  timeoutId = setTimeout(openPlaylistWindow, 1000, e);
}

playBtn.onmouseup = () => {
  clearTimeout(timeoutId);
}

playBtn.onclick = () => {
  if (isWaitingAudio) {
    return;
  }

  (async () => {
    nextAud?.objectUrl?.then(ou => URL.revokeObjectURL(ou));

    let objectUrl;

    if (songSwitch.checked && Math.random() > 0.6) {
      objectUrl = await Promise.race([song.objectUrl, 'songPending']);

      if (objectUrl !== 'songPending') {
        playRandomAudio(objectUrl, song);
        return;
      }
      // NOTE: If `song.objectUrl` is not settled yet then check `aud.objectUrl` instead of waiting for `song.objectUrl`
    }

    objectUrl = await Promise.race([aud.objectUrl, 'audPending']);

    if (objectUrl === 'audPending') {
      audioTitleEl.innerText = 'Loading...'
      audioTitleEl.classList.add('cursor-wait');

      isWaitingAudio = true;

      // NOTE: if `aud.objectUrl` is not settled yet then wait for it
      objectUrl = await aud.objectUrl;
    }

    playRandomAudio(objectUrl, aud);
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


prevBtn.onclick = () => {
  // const temp = {
  //   "title": audioTitleEl.innerText,
  //   "objectUrl": audioEl1.src
  // }

  // prevBtn.setAttribute('title', audioTitleEl.innerText);

  const temp = currentAud;
  currentAud = prevAud;

  audioTitleEl.innerText = prevAud.title;

  audioEl1.src = prevAud.objectUrl;
  audioEl1.play();

  prevAud = temp;
}

nextBtn.onclick = () => {
  if (isWaitingAudio) {
    return;
  }

  (async () => {
    let objectUrl = await Promise.race([nextAud.objectUrl, 'pending']);

    if (objectUrl === 'pending') {
      audioTitleEl.innerText = 'Loading...'
      audioTitleEl.classList.add('cursor-wait');

      isWaitingAudio = true;

      objectUrl = await nextAud.objectUrl;
    }

    playRandomAudio(objectUrl, nextAud);
  })();
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
