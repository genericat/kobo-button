import { argv } from 'node:process';
import fs from 'node:fs/promises';
import { compile } from 'ejs';


const params = argv.slice(2);

try {
  const templateString = await fs.readFile('./src/index.ejs', 'ascii');
  const template = compile(templateString, { async: false });

  let langFiles = [];

  if (params.length > 0) {
    langFiles = [params[0] + '.json'];
  } else {
    langFiles = await fs.readdir('./src/lang/');
  }

  langFiles.forEach(async langFile => {
    const langString = await fs.readFile('./src/lang/' + langFile, 'utf-8');
    const htmlString = template(JSON.parse(langString));

    await fs.writeFile('./lang/' + langFile.replace('json', 'html'), htmlString);
  });
} catch (error) {
  console.error(error)
}
