# Kobo Button

Kobo Button is unofficial and fan made website to play audio clip of [Kobo Kanaeru](https://www.youtube.com/@KoboKanaeru).
The types of audio available are words said by Kobo, sounds such as laughing and sneezing, and songs.

⚠️
The audio is taken and presented without any additional context.
This website and its contents should not be used as a judgement to any mentioned or related party.

## Setting up
1. Install packages.
```bash
npm i
```
2. Copy `.env.example` and rename it to `.env`. Modify the environment variables as per your requirement.


## Making change and Contributing

You can do local development by modify `src/index.ejs`, `src/style.css`, or `src/script.js`.

Run the start command to start the server and file watcher
```bash
npm run start
```
The file watcher by default render the ejs file to `lang/en.html` only. So, go to `[APP_URL]:[HTTP_PORT]/lang/en.html` to test the local development.

ℹ️
If you want to do a contribution, you have to **fork this repo**  first and then do the setting up above. Before you commit and make a pull request please don't forget to run `npm run build`.


## Add or Edit Translation

You can add or improve a translation file to make this website more accessible.

1. If you want to add a translation, first, you need to copy any translation file in `lang/` and rename the file.
The file name need to be a valid **language code** for `lang` HTML attribute.
([ref. 1](https://www.arclab.com/en/kb/htmlcss/lang-attribute-2-letter-language-country-codes.html), [ref. 2](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry))
1. Run the start command and pass the **language code** as the argument before editing the translation file.
```bash
npm run start -- {language code}

# Working on Indonesian translation
npm run start -- id
```

2. Translate the object values in the file you have copied before.
1. Open a browser and go to `[APP_URL]:[HTTP_PORT]/lang/[language code].html`.
1. Run `npm run build` after you finished.


## Add Audio Clip

Not all videos are suitable for clipping and the same should goes for audio.
Please follow the [derivative works guideline](https://hololivepro.com/en/terms/) regarding audio clipping.

In addition there are some notes for audio clipping.

- Please **don't** clip from voice pack audio and cover or original song unless its from karaoke.
Also, as in the derivative works guideline, please **don't** clip audio from membership content, concert performance, or any paid content.
- For song clip, it is recommended to clip only a song that has a reference to something such as meme, pop culture, etc. to prevent the song clips being too abundant. Also recommended to clip a song to show off Kobo singing skill.
- Use standard or low preset to minimize the file size. You may use `first_ehe.mp3` for reference.
- Please be mindful about the clip duration to prevent bigger file size.

Steps for add audio clip.

1. Clip the audio and you may need to process it with any audio editor
1. Export it to mp3 file and put it in `assets/aud/`
1. Add the audio data to `assets/audio.json`. Object properties description below
1. Run/rerun `npm run start`
1. Open a browser and go to `[APP_URL]:[HTTP_PORT]/lang/en.html`
1. Open playlist window by press and hold the Kobo button to test it out
1. Run `npm run build` after you finished

Object properties for audio data

| Property | Required | Description
|---|---|---|
| `name` | ✅ | The file name of the audio. File name in snake_case. |
| `title` | ✅ | Title of the audio that will be displayed in main UI. Recommended to write it in their native language, use english if the audio data doesn't have `lang` property. |
| `category` | ✅ | Valid values are `words`, `sound`, and `song`. |
| `lang` | ⏹️ | Recommended to write it in their native language. Only required in `words` and `song` category. |
| `isSeiso` | ✅ | A boolean flag to prevent the audio randomly played from Kobo button but can be played from playlist. Not necessarily about seiso content. |
| `next` | ❌ | File name without its extension of the next chained audio that can be played by pressing the next button. |
