import { argv } from 'node:process';
import util from './util.js';
import fs from 'node:fs/promises';

/**
 * Language code to work with
 *
 * In case we only need to build one translation.
 * Can be omitted to build all the language.
 *
 * Need to match any file name in `./src/lang/` without its extension
 */
const params = argv.slice(2);

const baseUrl = 'https://genericat.github.io/kobo-button/';

try {
  const [playlistTemplate, lang, htmlTemplate] = await Promise.all([
    util.getPlaylistTemplate(),
    util.getLang(params[0], baseUrl),
    util.getHtmlTemplate()]);
  const [langObjs, langs] = lang;

  langObjs.forEach(async langObj => {
    langObj.playlist = playlistTemplate({playlistNotice: langObj.playlistNotice});
    langObj.langs = langs;
    langObj.baseUrl = baseUrl;

    const htmlString = htmlTemplate(langObj);

    await fs.writeFile(`./lang/${langObj.meta.lang}.html`, htmlString, 'utf8');


    const date = new Date();
    console.log(`[${date.toLocaleTimeString()}] Rendering ${langObj.meta.lang}.json done`);

    if (langObj.meta.lang === 'en') {
      await fs.copyFile('./lang/en.html', './index.html');

      const date = new Date();
      console.log(`[${date.toLocaleTimeString()}] Copying ./lang/en.html to ./index.html done`);
    }
  });

} catch (error) {
  console.error(error)
}
