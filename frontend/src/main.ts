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

// check url

onLoadApp();
initEditor();

function onLoadApp(): void {
  const pathName = window.location.pathname;
  const snippetId = pathName.split('/')[1];

  if (snippetId) {
    fetch('http://localhost:5000/api/snippets/' + snippetId, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
      
    })
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.error(err);
      });
  }
  
}

function initEditor(): void {
  const editor = monaco.editor.create(editorContainer, {
    value: `<html>
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
</html>`,
    language: 'html',
    theme: 'vs'
  });

  addEventListeners(editor);
}

function addEventListeners(editor: monaco.editor.IStandaloneCodeEditor): void {
  themeSelectEl.addEventListener('change', changeTheme);
  languageSelectEl.addEventListener('change', (_) => changeLanguage(editor));
  buttonEl.addEventListener('click', shareCode);
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

function shareCode(): void {
  const id = generateUniqueId();
  window.history.pushState({id}, 'unique code snippet', id);

  fetch('http://localhost:5000/api/snippets/' + id, {
    method: 'post',
    body: JSON.stringify({name: 'this is my name', description: 'adfasfas', code: 'helooasdfsa'}),
    headers: {
      'Content-Type': 'application/json'
    },
    
  })
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.error(err);
    });
}

function generateUniqueId(): string {
  // Generate a random number and convert it to base 36 (which uses letters and digits)
  // Use current timestamp to ensure uniqueness
  return Math.random().toString(36).substring(2, 9) + '_' + new Date().getTime().toString(36);
}
