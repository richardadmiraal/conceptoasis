/*
 * Kai-C live blocks for admiraal.ca
 * Paste once into a RealtyNinja Custom Code widget:
 *   <div data-kaic="market-snapshot"></div>
 *   <script src="https://conceptoasis.com/admiraal/kaic.js" defer></script>
 * After that, Kai-C updates the block by changing admiraal/blocks/<name>.html in the
 * conceptoasis repo. Each change goes live only after Richard says "merge".
 * Anything already inside the div stays as the fallback if the block can't load.
 */
(function () {
  var SRC = (document.currentScript && document.currentScript.src) || 'https://conceptoasis.com/admiraal/kaic.js';
  var BASE = SRC.replace(/kaic\.js.*$/, 'blocks/');
  function load(el) {
    var name = (el.getAttribute('data-kaic') || '').replace(/[^a-z0-9-]/gi, '');
    if (!name || el.getAttribute('data-kaic-done')) return;
    el.setAttribute('data-kaic-done', '1');
    fetch(BASE + name + '.html', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(r.status); return r.text();
    }).then(function (html) {
      el.innerHTML = html;
      // run any scripts the block carries
      [].forEach.call(el.querySelectorAll('script'), function (old) {
        var s = document.createElement('script');
        [].forEach.call(old.attributes, function (a) { s.setAttribute(a.name, a.value); });
        s.textContent = old.textContent; old.parentNode.replaceChild(s, old);
      });
    }).catch(function () { /* keep the fallback, stay quiet on the host site */ });
  }
  function start() { [].forEach.call(document.querySelectorAll('[data-kaic]'), load); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
