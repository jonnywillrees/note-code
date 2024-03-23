import './style.css'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

//! global variables
const editorContainer = document.getElementById('editor-container') as HTMLDivElement;
const themeSelectEl = document.getElementById('theme-select') as HTMLSelectElement;
const languageSelectEl = document.getElementById('language-select') as HTMLSelectElement;
const buttonEl = document.getElementById('share-button') as HTMLButtonElement;
const copyToClipboardLinkEl = document.getElementById('copy-to-clipboard') as HTMLAnchorElement;
let currentEditorLanguage = '';
let currentEditorValue = '';
// const apiUri = 'https://note-code-k4vytpjvrq-uc.a.run.app';
const apiUri = 'http://localhost:5000';

onLoadApp();

function onLoadApp(): void {
  const pathName = window.location.pathname;
  const snippetId = pathName.split('/')[1];

  if (snippetId) {
    fetch(`${apiUri}/api/snippets/` + snippetId, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(async (res) => {
        if (res.ok && res.status === 200) {
          const data = await res.json();
          initEditor(data.code, data.language);
          setSnippetHasBeenSharedState();
        } else {
          console.error(`${res.status} ${res.statusText}`);
          initEditor();
          window.location.assign(window.location.origin);
        }
      })
      .catch(err => {
        console.error(err);
        initEditor();
        window.location.assign(window.location.origin);
      });
  } else {
    initEditor();
  }

  // event listener for when location.history changes
  addEventListener('popstate', (_) => {
    if (window.location.pathname.split('/')[1]) {
      // get snippet and set state

    } else {
      // reset to default state

    }
  });
}

function initEditor(code?: string, language?: string): void {
  const DEFAULT_CODE: string = `<html>
  <head>
    <title>HTML Sample</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <style type="text/css">
      h1 {
        color: #CCA3A3;
      }
    </style>
    <script type="text/javascript">
      alert("I am a sample... visit devChallengs.io for more projects");
    </script>
  </head>
  <body>
    <h1>Heading No.1</h1>
    <input disabled type="button" value="Click me" />
  </body>
</html>`;
  const DEFAULT_LANGUAGE = 'html';

  const editor = monaco.editor.create(editorContainer, {
    value: code ?? DEFAULT_CODE,
    language: language ?? DEFAULT_LANGUAGE,
    theme: 'vs'
  });
  
  currentEditorLanguage = language ?? DEFAULT_LANGUAGE;
  currentEditorValue = code ?? DEFAULT_CODE;
  languageSelectEl.value = language ?? DEFAULT_LANGUAGE;

  addEventListeners(editor);
}

function addEventListeners(editor: monaco.editor.IStandaloneCodeEditor): void {
  themeSelectEl.addEventListener('change', changeTheme);
  languageSelectEl.addEventListener('change', (_) => changeLanguage(editor));
  buttonEl.addEventListener('click', (_) => shareCode(editor));
  copyToClipboardLinkEl.addEventListener('click', (e) => copyToClipboard(e));
  editor.getModel()?.onDidChangeContent((_) => onEditorChange(editor));
  editor.getModel()?.onDidChangeLanguage((_) => onEditorChange(editor));
}

function changeTheme(): void {
  if (themeSelectEl.value === 'dark') {
    monaco.editor.setTheme('vs-dark');
  } else if (themeSelectEl.value === 'light') {
    monaco.editor.setTheme('vs');
  }
}

function changeLanguage(editor: monaco.editor.IStandaloneCodeEditor): void {
  const model = editor.getModel();
  if (!model) return;

  switch (languageSelectEl.value) {
    case 'html':
      monaco.editor.setModelLanguage(model, 'html');
      break;
    case 'javascript':
      monaco.editor.setModelLanguage(model, 'javascript');
      break;
  }
}

function shareCode(editor: monaco.editor.IStandaloneCodeEditor): void {
  const ID = generateUniqueId();

  fetch(`${apiUri}/api/snippets/` + ID, {
    method: 'post',
    body: JSON.stringify({code: editor.getValue(), language: languageSelectEl.value}),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(async (res) => {
      if (res.ok && res.status === 200) {
        // only change URL if the API call succeeds
        window.history.pushState({id: ID}, 'unique code snippet', ID);
        setSnippetHasBeenSharedState();
        currentEditorValue = editor.getValue();
        currentEditorLanguage = languageSelectEl.value;
      } else {
        // TODO: add some kind of user friendly error alert instead of console.error the error message
        console.error(`${res.status} ${res.statusText}`);
      }
    })
    .catch(err => {
      // TODO: add some kind of user friendly error alert instead of console.error the error message
      console.error(err);
    });
}

function setSnippetHasBeenSharedState(): void {
  // disable share button
  buttonEl.setAttribute('disabled', 'true');

  // enable/show the copy to clipboard link
  copyToClipboardLinkEl.classList.remove('d-none');
  copyToClipboardLinkEl.href = window.location.href;
  copyToClipboardLinkEl.innerText = window.location.href;
}

async function copyToClipboard(e: MouseEvent): Promise<void> {
  e.preventDefault();
  
  const copyText = (e.target as HTMLAnchorElement).href;
  await navigator.clipboard.writeText(copyText);
  // TODO: add some kind of user friendly success alert instead of alert()
  alert('your link has been copied to clipboard!');
}

function onEditorChange(editor: monaco.editor.IStandaloneCodeEditor): void {
  if (!window.location.pathname.split('/')[1]) return;

  if (currentEditorValue === editor.getValue() && currentEditorLanguage === languageSelectEl.value) {
    // value of editor has remained the same since last share
    buttonEl.setAttribute('disabled', 'true');
    copyToClipboardLinkEl.classList.remove('d-none');
  } else {
    // value of editor has changed since last share
    buttonEl.removeAttribute('disabled');
    copyToClipboardLinkEl.classList.add('d-none');
  }
}

function generateUniqueId(): string {
  // Generate a random number and convert it to base 36 (which uses letters and digits)
  // Use current timestamp to ensure uniqueness
  return Math.random().toString(36).substring(2, 9) + '_' + new Date().getTime().toString(36);
}
