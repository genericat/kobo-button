import fs from 'node:fs/promises';
import { compile } from 'ejs';

const getPlaylistTemplate = async () => {
  const audioData = fs.readFile('./assets/audio.json', 'utf8');
  let pTemplateString = await fs.readFile('./src/ejs/playlist.ejs', 'utf8');

  pTemplateString = pTemplateString.replace(/\n\s*\n/g, '\n');

  const pTemplate = compile(pTemplateString);
  const playlistString = pTemplate({audios: JSON.parse(await audioData)});

  return compile(playlistString, {cache: true, filename: 'playlist'});
}


const getLang = async (lang = null, baseUrl) => {
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
      "href": baseUrl + "lang/" + langFile.replace('json', 'html')
    });
  }

  return [langObjs, langs];
}


const getHtmlTemplate = async () => {
  const templateString = await fs.readFile('./src/index.ejs', 'utf8');

  return compile(templateString, {cache: true, filename: './src/index.ejs'});
}

export default {getPlaylistTemplate, getLang, getHtmlTemplate};
