import fs from 'node:fs/promises';
import { compile } from 'ejs';


/**
 * Get playlist template function
 * to render playlist html string with word of notice from a language
 *
 * @param {boolean} cache Pass cache option to ejs compiler
 * @returns Promise<TemplateFunction>
 */
const getPlaylistTemplate = async (cache = false) => {
  const audioData = fs.readFile('./assets/audio.json', 'utf8');
  let pTemplateString = await fs.readFile('./src/ejs/playlist.ejs', 'utf8');

  pTemplateString = pTemplateString.replace(/\n\s*\n/g, '\n');

  const pTemplate = compile(pTemplateString);
  const playlistString = pTemplate({ audios: JSON.parse(await audioData) });

  return compile(playlistString, { cache: cache, filename: 'playlist' });
}

/**
 * Get array of all languages meta data
 *
 * @param {string} baseUrl base url to construct a link in language dropdown selection
 * @returns Promise<object[]>
 */
const getLangMeta = async (baseUrl) => {
  let langs = [];

  const langFiles = await fs.readdir('./src/lang/');

  for (const langFile of langFiles) {
    const langString = await fs.readFile('./src/lang/' + langFile, 'utf8');
    let langObj = JSON.parse(langString);

    langs.push({
      "lang": langObj.meta.lang,
      "name": langObj.meta.name,
      "dir": langObj.meta.dir,
      "href": baseUrl + "lang/" + langFile.replace('json', 'html')
    });
  }

  return langs;
}

/**
 * Get language object from language json file in `lang/`
 *
 * @param {?string} lang Language code to get a single language object.
 * `null` or don't pass to get all language object
 *
 * @returns Promise<object[]>
 */
const getLangObj = async (lang = null) => {
  let langObjs = [];

  const langFiles = await fs.readdir('./src/lang/');

  for (const langFile of langFiles) {
    const langString = await fs.readFile('./src/lang/' + langFile, 'utf8');
    let langObj = JSON.parse(langString);

    if (!lang || lang === langObj.meta.lang) {

      if (langFile === 'en.json') {
        langObjs.unshift(langObj);
        continue;
      }

      langObjs.push(langObj);
    }
  }

  return langObjs;
}

/**
 * Get the layout/main page template function
 *
 * @param {boolean} cache Pass cache option to ejs compiler
 * @returns Promise<TemplateFunction>
 */
const getHtmlTemplate = async (cache = false) => {
  const templateString = await fs.readFile('./src/index.ejs', 'utf8');

  return compile(templateString, { cache: cache, filename: './src/index.ejs' });
}

export default { getPlaylistTemplate, getLangMeta, getLangObj, getHtmlTemplate };
