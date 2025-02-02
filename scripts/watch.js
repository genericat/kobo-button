import { argv, env } from 'node:process';
import chokidar from 'chokidar';
import fs from 'node:fs/promises';
import { compile } from 'ejs';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import 'dotenv/config'
import util from "./util.js";

/**
 * Language code to work with
 *
 * In case we only need to watch one translation file.
 * If omitted no translation file will be watched.
 *
 * Need to match any file name in `./src/lang/` without its extension
 */
const params = argv.slice(2);

const baseUrl = env.APP_URL ?? 'http://localhost:3000/';

let playlistTemplate;
let langs;

try {
  let lang, langObjs;

  [playlistTemplate, lang] = await Promise.all([
      util.getPlaylistTemplate(),
      util.getLang('en', baseUrl)]);
  [langObjs, langs] = lang;
} catch (error) {
  console.error(error);
}

chokidar.watch('./src').on('all', (event, path) => {
  if (event !== 'add' && event !== 'change') { return; }

  if (path.includes('prototype.html')) {
    renderCss();
  }

  if (path.includes('index.ejs')) {
    renderEjs(params[0] ? params[0] + '.json' : 'en.json');
    renderCss();
  }

  if (path.includes('style.css')) {
    renderCss();
  }

  if (path.includes('script.js')) {
    copyJs();
    renderCss();
  }

  if (path.includes('lang') && path.substring(9) === params[0] + '.json') {
    renderEjs(path.substring(9));
  }
});

chokidar.watch('./tailwind.config.js').on('all', (event, path) => {
  if (event !== 'add' && event !== 'change') { return; }

  renderCss();
});


async function renderEjs(lang) {
  try {
    const langString     = fs.readFile('./src/lang/' + lang, 'utf8');
    const templateString = await fs.readFile('./src/index.ejs', 'utf8');

    const template  = compile(templateString, { async: false, filename: './src/index.ejs' })

    let langObj = JSON.parse(await langString);

    langObj.playlist = playlistTemplate({playlistNotice: langObj.playlistNotice});
    langObj.langs = langs;
    langObj.baseUrl = baseUrl;

    const htmlString = template(langObj);

    await fs.writeFile('./lang/' + lang.replace('json', 'html'), htmlString, 'utf8');

    const date = new Date();

    console.log(`[${date.toLocaleTimeString()}] Rendering ./lang/${lang.replace('json', 'html')} done`);
  } catch (error) {
    console.error(error);
  }
}

async function renderCss() {
  try {
    const cssString = await fs.readFile('./src/style.css');
    const result = await postcss([autoprefixer, tailwindcss])
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
