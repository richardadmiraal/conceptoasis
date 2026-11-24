/* co|co talk to text
   Adds a mic button to any input or textarea marked data-mic.
   Click the mic, start talking, the box fills up. Click again to stop.
   data-mic-submit="buttonId"  presses that button after each finished phrase
                               (the ledger fills up line by line).
   Uses the browser's own speech recognition (Chrome, Edge, Safari).
   Where it isn't available, no mic is shown; phone keyboards still have one. */
(function () {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;

  var css = document.createElement('style');
  css.textContent =
    '.cmic-wrap{position:relative;display:block}' +
    '.cmic-wrap>input,.cmic-wrap>textarea{padding-right:44px!important;width:100%;box-sizing:border-box}' +
    '.cmic{position:absolute;right:6px;top:6px;width:32px;height:32px;border-radius:50%;border:1.5px solid #0b0b0d;background:#fff;color:#0b0b0d;display:grid;place-items:center;cursor:pointer;padding:0;z-index:2}' +
    '.cmic svg{width:16px;height:16px}' +
    '.cmic-wrap>input~.cmic{top:50%;transform:translateY(-50%)}' +
    '.cmic:focus-visible{outline:3px solid #16a3a6;outline-offset:2px}' +
    '.cmic.on{background:#e0458f;border-color:#e0458f;color:#fff;animation:cmicp 1.2s ease-in-out infinite}' +
    '@keyframes cmicp{0%,100%{box-shadow:0 0 0 0 rgba(224,69,143,.45)}50%{box-shadow:0 0 0 7px rgba(224,69,143,0)}}' +
    '@media (prefers-reduced-motion:reduce){.cmic.on{animation:none}}' +
    '.cmic-tip{position:absolute;right:0;top:calc(100% + 4px);font:600 11px Inter,system-ui,sans-serif;color:#525b6b;background:#fff;border:1px solid #dfe3ea;border-radius:8px;padding:3px 8px;white-space:nowrap;z-index:3}';
  document.head.appendChild(css);

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  var active = null; // only one mic at a time

  function attach(el) {
    if (el.__cmic) return; el.__cmic = true;
    var wrap = document.createElement('span');
    wrap.className = 'cmic-wrap';
    var cs = getComputedStyle(el);
    if (cs.flexGrow && cs.flexGrow !== '0') { wrap.style.flex = cs.flex; wrap.style.minWidth = '0'; }
    if (el.style.maxWidth) { wrap.style.maxWidth = el.style.maxWidth; }
    el.parentNode.insertBefore(wrap, el); wrap.appendChild(el);
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'cmic'; b.innerHTML = ICON;
    b.setAttribute('aria-label', 'Talk to text'); b.title = 'Talk to text';
    wrap.appendChild(b);
    var tip = null, rec = null, base = '', submitId = el.getAttribute('data-mic-submit');

    function setTip(t) { if (!tip) { tip = document.createElement('span'); tip.className = 'cmic-tip'; wrap.appendChild(tip); } tip.textContent = t; tip.hidden = !t; }
    function put(v) {
      if (el.isContentEditable) el.textContent = v; else el.value = v;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    function stop() { if (rec) { try { rec.stop(); } catch (x) {} } }
    function start() {
      if (active && active !== stop) active();
      rec = new SR();
      rec.lang = el.getAttribute('data-mic-lang') || document.documentElement.lang || 'en-CA';
      rec.continuous = true; rec.interimResults = true;
      base = el.value ? el.value.replace(/\s+$/, '') + ' ' : '';
      rec.onresult = function (e) {
        var fin = '', mid = '';
        for (var i = e.resultIndex; i < e.results.length; i++) {
          var t = e.results[i][0].transcript;
          if (e.results[i].isFinal) fin += t; else mid += t;
        }
        if (fin) {
          fin = fin.trim(); fin = fin.charAt(0).toUpperCase() + fin.slice(1);
          if (!/[.?!]$/.test(fin)) fin += '.';
          if (submitId && document.getElementById(submitId)) {
            put(fin); document.getElementById(submitId).click(); base = el.value ? el.value + ' ' : '';
          } else { base = base + fin + ' '; put(base); }
        }
        if (mid) put(base + mid);
      };
      rec.onstart = function () { b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); setTip('Listening… click to stop'); };
      rec.onerror = function (e) {
        setTip(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'Microphone is blocked. Allow it in the browser to talk.' : e.error === 'no-speech' ? 'Didn’t hear anything.' : 'Talk to text stopped.');
      };
      rec.onend = function () { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); put(el.value.replace(/\s+$/, '')); if (tip && /Listening/.test(tip.textContent)) setTip(''); rec = null; if (active === stop) active = null; };
      try { rec.start(); active = stop; } catch (x) { setTip('Talk to text could not start.'); }
    }
    b.addEventListener('click', function () { if (rec) stop(); else start(); el.focus(); });
  }

  function scan(root) { [].forEach.call((root || document).querySelectorAll('[data-mic]'), attach); }
  window.cocoMic = { scan: scan, attach: attach };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { scan(); }); else scan();
})();
