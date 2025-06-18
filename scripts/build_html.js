import util from './util.js';
import fs from 'node:fs';

/**
 * Language code to work with
 *
 * In case we only need to build one translation.
 * Can be omitted to build all the language.
 *
 * Need to match any file name in `./src/lang/` without its extension
 *
 * @type Array<string>
 */
const params = process.argv.slice(2);

/**
 * Language object used as a fallback when another language object lacks a property.
 *
 * Fallback to English language object.
 *
 * @type object
 */
let fallbackLangObj = {};

const baseUrl = process.env.APP_URL;

try {
  const [playlistTemplate, langsMetaData, langObjs, htmlTemplate] = await Promise.all([
    util.getPlaylistTemplate(true),
    util.getLangMeta(baseUrl),
    util.getLangObj(params[0]),
    util.getHtmlTemplate(true)
  ]);

  fallbackLangObj = langObjs[0];

  langObjs.forEach(langObj => {

    const uniformedLangObj = {...fallbackLangObj, ...langObj}

    uniformedLangObj.playlist = playlistTemplate({ playlistNotice: uniformedLangObj.playlistNotice });
    uniformedLangObj.langs    = langsMetaData;
    uniformedLangObj.baseUrl  = baseUrl;
    uniformedLangObj.wsPort   = null;

    const htmlString = htmlTemplate(uniformedLangObj);

    fs.writeFileSync(`./lang/${uniformedLangObj.meta.lang}.html`, htmlString, 'utf8');


    const date = new Date();
    console.log(`[${date.toLocaleTimeString()}] Rendering ${uniformedLangObj.meta.lang}.html done`);

    if (uniformedLangObj.meta.lang === 'en') {
      fs.copyFileSync('./lang/en.html', './index.html');

      const date = new Date();
      console.log(`[${date.toLocaleTimeString()}] Copying ./lang/en.html to ./index.html done`);
    }
  });

} catch (error) {
  console.error(error);
}
