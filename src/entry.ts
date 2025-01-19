import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { SCRIPTS_LOADED_EVENT } from '$utils/scriptLoadEvents';
import './dev/script-source';

// put dayjs library in the global scope
globalThis.dayjs = dayjs;

const LOCALHOST_BASE = 'http://localhost:3000/';
// window.PRODUCTION_BASE = 'https://summit-project.com/'; // TODO: change this to the actual domain

// NOTE: this is a temporary JSDelivr CDN base for the production build
window.PRODUCTION_BASE =
  'https://cdn.jsdelivr.net/gh/parasshah195/summit-project-webflow-site/dist/prod/';

window.JS_SCRIPTS = new Set();

const SCRIPT_LOAD_PROMISES: Array<Promise<unknown>> = [];

// init adding scripts on page load
window.addEventListener('DOMContentLoaded', addJS);
window.addEventListener('DOMContentLoaded', () => {
  dayjs.extend(advancedFormat);
  dayjs.extend(timezone);
  dayjs.extend(utc);
});

/**
 * Adds all the set scripts to the `window.JS_SCRIPTS` Set
 */
function addJS() {
  console.debug(`Current script mode: ${window.SCRIPTS_ENV}`);

  if (window.SCRIPTS_ENV === 'local') {
    console.debug(
      "To run JS scripts from production CDN, execute `window.setScriptSource('cdn')` in the browser console"
    );
    fetchLocalScripts();
  } else {
    console.debug(
      "To run JS scripts from localhost, execute `window.setScriptSource('local')` in the browser console"
    );
    appendScripts();
  }
}

function appendScripts() {
  const BASE = window.SCRIPTS_ENV === 'local' ? LOCALHOST_BASE : window.PRODUCTION_BASE;

  window.JS_SCRIPTS?.forEach((url) => {
    const script = document.createElement('script');
    script.src = BASE + url;
    script.defer = true;

    const promise = new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = () => {
        console.error(`Failed to load script: ${url}`);
        reject;
      };
    });

    SCRIPT_LOAD_PROMISES.push(promise);

    document.body.appendChild(script);
  });

  Promise.allSettled(SCRIPT_LOAD_PROMISES).then(() => {
    console.debug('All scripts loaded');
    // Add a small delay to ensure all scripts have had a chance to execute
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent(SCRIPTS_LOADED_EVENT));
    }, 50);
  });
}

function fetchLocalScripts() {
  const LOCALHOST_CONNECTION_TIMEOUT_IN_MS = 300;
  const localhostFetchController = new AbortController();

  const localhostFetchTimeout = setTimeout(() => {
    localhostFetchController.abort();
  }, LOCALHOST_CONNECTION_TIMEOUT_IN_MS);

  fetch(LOCALHOST_BASE, { signal: localhostFetchController.signal })
    .then((response) => {
      if (!response.ok) {
        console.error({ response });
        throw new Error('localhost response not ok');
      }
    })
    .catch(() => {
      console.error('localhost not resolved. Switching to production');
      window.setScriptSource('cdn');
    })
    .finally(() => {
      clearTimeout(localhostFetchTimeout);
      appendScripts();
    });
}
