import chokidar from 'chokidar';
import fs from 'node:fs/promises';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import 'dotenv/config'
import util from "./util.js";
import { createAppServer, createWsServer } from "./server.js";


/**
 * Language code to work with
 *
 * If omitted no translation file will be watched.
 * Default to `en` language code.
 *
 * Need to match any file name in `./src/lang/` without its extension
 *
 * @type Array<string>
 */
const params = process.argv.slice(2);

const HTTP_PORT      = process.env.HTTP_PORT;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT;
const baseUrl        = `${process.env.APP_URL}:${HTTP_PORT}/`;

const playlistTemplate = util.getPlaylistTemplate();
const langsMetaData    = util.getLangMeta(baseUrl);
const langObj          = util.getLangObj(params[0] ?? 'en');
const htmlTemplate     = util.getHtmlTemplate();


//---------------
// Initialization
//---------------
renderEjs();
renderCss();
copyJs();


//---------------
// Set up servers
//---------------
const wsServer = createWsServer(WEBSOCKET_PORT);
createAppServer(HTTP_PORT, `${baseUrl}lang/${params[0] ?? 'en'}.html`);


//----------------
// Set up watchers
//----------------
chokidar.watch('./src', { ignoreInitial: true }).on('all', (event, path) => {
  if (event !== 'add' && event !== 'change') { return; }

  // if (path.includes('prototype.html')) {
  //   renderCss();
  // }

  if (path.endsWith('index.ejs')) {
    renderEjs();
    renderCss();
  }

  if (path.endsWith('style.css')) {
    renderCss();
  }

  if (path.endsWith('script.js')) {
    copyJs();
    renderCss();
  }

  if (path.includes('lang') && path.substring(9) === params[0] + '.json') {
    renderEjs();
  }
});

chokidar.watch('./tailwind.config.js', { ignoreInitial: true }).on('change', () => {
  renderCss();
});

chokidar.watch([
  './index.html',
  './lang',
  './assets/script.js',
  './assets/style.css'
], { ignoreInitial: true }).on('change', () => {
  wsServer.reloadClient();
});


//---------

console.log(params[0] ? `Working on ${params[0]} translation\n` : '\n');

//---------


async function renderEjs() {
  try {
    const [pt, lm, lo, ht] = await Promise.all([
      playlistTemplate,
      langsMetaData,
      langObj,
      htmlTemplate,
    ]);

    lo[0].playlist = pt({ playlistNotice: lo.playlistNotice });
    lo[0].langs    = lm;
    lo[0].baseUrl  = baseUrl;
    lo[0].wsPort   = WEBSOCKET_PORT;

    const htmlString = ht(lo[0]);

    await fs.writeFile(`./lang/${lo[0].meta.lang}.html`, htmlString, 'utf8');

    const date = new Date();

    console.log(`[${date.toLocaleTimeString()}] Rendering ./lang/${lo[0].meta.lang}.html done`);
  } catch (error) {
    console.error(error);
  }
}

async function renderCss() {
  try {
    const cssString = await fs.readFile('./src/style.css');
    const result    = await postcss([tailwindcss, autoprefixer])
      .process(cssString, { from: './src/style.css', to: './assets/style.css' });

    await fs.writeFile('./assets/style.css', result.css, 'utf8');

    // if (result.map) {
    //     fs.writeFile('./assets/style.css.map', result.map.toString());
    // }

    const date = new Date();

    console.log(`[${date.toLocaleTimeString()}] Processing ./assets/style.css done`);
  } catch (error) {
    console.log(error);
  }
}

async function copyJs() {
  try {
    await fs.copyFile('./src/script.js', './assets/script.js');

    const date = new Date();

    console.log(`[${date.toLocaleTimeString()}] Copying script.js from ./src/ to ./assets/ done`);
  } catch (error) {
    console.error(error);
  }
}
