import { argv } from 'node:process';
import fs from 'node:fs/promises';
import { compile } from 'ejs';

/**
 * Language code to work with
 *
 * Need to match to any file name in `./src/lang/` without its extension
 */
const params = argv.slice(2);

try {
  const audioData = await fs.readFile('./assets/audio.json', 'utf-8');
  let pTemplateString = await fs.readFile('./src/ejs/playlist_tmp.ejs', 'utf-8');

  pTemplateString = pTemplateString.replace(/\n\s*\n/g, '\n');

  const pTemplate = compile(pTemplateString, { async: false });
  const playlistString = pTemplate({audios: JSON.parse(audioData)});


  await fs.writeFile('./src/ejs/playlist.ejs', playlistString, 'utf-8');

  const templateString = await fs.readFile('./src/index.ejs', 'utf-8');
  const template = compile(templateString, { async: false, filename: './src/index.ejs' });

  let langFiles = [];

  if (params.length > 0) {
    langFiles = [params[0] + '.json'];
  } else {
    langFiles = await fs.readdir('./src/lang/');
  }

  langFiles.forEach(async langFile => {
    const langString = await fs.readFile('./src/lang/' + langFile, 'utf-8');
    const htmlString = template(JSON.parse(langString));

    await fs.writeFile('./lang/' + langFile.replace('json', 'html'), htmlString, 'utf-8');

    const date = new Date();
    console.log(`[${date.toLocaleTimeString()}] Rendering ${langFile.replace('json', 'html')} done`);

  });
} catch (error) {
  console.error(error)
}
