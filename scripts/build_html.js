import { argv } from 'node:process';
import fs from 'node:fs/promises';
import { compile } from 'ejs';

/**
 * Language code to work with
 *
 * In case we only need to build one translation.
 * Can be omitted to build all the language.
 *
 * Need to match any file name in `./src/lang/` without its extension
 */
const params = argv.slice(2);


const getPlaylistTemplate = async () => {
  const audioData = fs.readFile('./assets/audio.json', 'utf8');
  let pTemplateString = await fs.readFile('./src/ejs/playlist.ejs', 'utf8');

  pTemplateString = pTemplateString.replace(/\n\s*\n/g, '\n');

  const pTemplate = compile(pTemplateString);
  const playlistString = pTemplate({audios: JSON.parse(await audioData)});

  return compile(playlistString, {cache: true, filename: 'playlist'});
}


const getLang = async (lang = null) => {
  let langObjs = [];
  let langs = [];

  const langFiles = await fs.readdir('./src/lang/');

  for (const langFile of langFiles) {
    const langString = await fs.readFile('./src/lang/' + langFile, 'utf8');
    let langObj = JSON.parse(langString);

    if (!lang || lang === langObj.meta.lang) {
      langObjs.push(langObj);
    }

    langs.push({
      "lang": langObj.meta.lang,
      "name": langObj.meta.name,
      "dir": langObj.meta.dir,
      "href": "http://localhost:8000/lang/" + langFile.replace('json', 'html')
    });
  }

  return [langObjs, langs];
}


const getHtmlTemplate = async () => {
  const templateString = await fs.readFile('./src/index.ejs', 'utf8');

  return compile(templateString, {cache: true, filename: './src/index.ejs'});
}


try {
  const [playlistTemplate, lang, htmlTemplate] = await Promise.all([getPlaylistTemplate(), getLang(params[0]), getHtmlTemplate()]);
  const [langObjs, langs] = lang;

  langObjs.forEach(async langObj => {
    langObj.playlist = playlistTemplate({playlistNotice: langObj.playlistNotice});
    langObj.langs = langs;

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
