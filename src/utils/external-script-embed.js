// Script to be embedded in the head area of the site to ensure the external JS files load as intended

/**
 * Helper function to load external scripts only once on a page
 *
 * @param url URL of the script to load
 * @param placement 'head' or 'body'
 * @param defer boolean to indicate if the script should be deferred
 */
function loadExternalScript(url, placement = 'body', defer = true) {
  if (!document.querySelector(`script[src="${url}"]`)) {
    const script = document.createElement('script');
    script.src = url;
    if (defer) script.defer = true;

    if (placement === 'head') {
      document.head.appendChild(script);
    } else if (placement === 'body') {
      document.body.appendChild(script);
    } else {
      console.error('Invalid placement. Use "head" or "body".');
      return;
    }
  }
}

// window.loadExternalScript = loadExternalScript;
