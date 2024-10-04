import { argv } from 'node:process';
import chokidar from 'chokidar';
import fs from 'node:fs/promises';
import { compile } from 'ejs';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';


const params = argv.slice(2);


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


async function renderEjs(lang) {
  try {
    const langString     = await fs.readFile('./src/lang/' + lang, 'utf-8');
    const templateString = await fs.readFile('./src/index.ejs', 'ascii');

    const template   = compile(templateString, { async: false })
    const htmlString = template(JSON.parse(langString));

    await fs.writeFile('./lang/' + lang.replace('json', 'html'), htmlString);

    console.log('Rendering ./lang/' + lang.replace('json', 'html') + ' done');
  } catch (error) {
    console.error(error);
  }
}

async function renderCss() {
  try {
    const cssString = await fs.readFile('./src/style.css');
    const result = await postcss([autoprefixer, tailwindcss])
      .process(cssString, { from: './src/style.css', to: './assets/style.css' });

    await fs.writeFile('./assets/style.css', result.css);

    console.log('Processing ./assets/style.css done');

    // if (result.map) {
    //     fs.writeFile('./assets/style.css.map', result.map.toString());
    // }
  } catch (error) {
    console.log(error);
  }
}

async function copyJs() {
  try {
    await fs.copyFile('./src/script.js', './assets/script.js');

    console.log('Copying script.js from src/ to assets/ done');
  } catch (error) {
    console.error(error);
  }
}
