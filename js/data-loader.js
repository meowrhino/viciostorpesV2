// data-loader.js — Shared fetch for data.json, cached across callers
// Exposes window.loadSiteData(): returns a Promise resolved with the
// parsed JSON. The first call fetches and caches the promise; subsequent
// calls return the same cached promise instead of re-fetching.

(function () {
  let dataPromise = null;

  window.loadSiteData = function loadSiteData() {
    if (!dataPromise) {
      dataPromise = fetch('data.json').then((res) => {
        if (!res.ok) throw new Error('data.json HTTP ' + res.status);
        return res.json();
      });
    }
    return dataPromise;
  };
})();
