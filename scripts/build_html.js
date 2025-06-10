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

const baseUrl = process.env.APP_URL;

try {
  const [playlistTemplate, langsMetaData, langObjs, htmlTemplate] = await Promise.all([
    util.getPlaylistTemplate(true),
    util.getLangMeta(baseUrl),
    util.getLangObj(params[0]),
    util.getHtmlTemplate(true)
  ]);

  langObjs.forEach(langObj => {
    langObj.playlist = playlistTemplate({ playlistNotice: langObj.playlistNotice });
    langObj.langs    = langsMetaData;
    langObj.baseUrl  = baseUrl;
    langObj.wsPort   = null;

    const htmlString = htmlTemplate(langObj);

    fs.writeFileSync(`./lang/${langObj.meta.lang}.html`, htmlString, 'utf8');


    const date = new Date();
    console.log(`[${date.toLocaleTimeString()}] Rendering ${langObj.meta.lang}.html done`);

    if (langObj.meta.lang === 'en') {
      fs.copyFileSync('./lang/en.html', './index.html');

      const date = new Date();
      console.log(`[${date.toLocaleTimeString()}] Copying ./lang/en.html to ./index.html done`);
    }
  });

} catch (error) {
  console.error(error);
}
