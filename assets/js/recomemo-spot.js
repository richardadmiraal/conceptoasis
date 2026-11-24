/*
 * recomemo spot: a rotating coupon-pill ad for any website.
 * Paste where the ad should appear:
 *   <div class="recomemo-spot" data-place="admiraal.ca"></div>
 *   <script src="https://conceptoasis.com/assets/js/recomemo-spot.js" defer></script>
 * Options on the div: data-place (which ads to show), data-seconds (rotation, default 7).
 */
(function () {
  var SRC = (document.currentScript && document.currentScript.src) || 'https://conceptoasis.com/assets/js/recomemo-spot.js';
  var FEED = SRC.replace(/js\/recomemo-spot\.js.*$/, 'ads.json');
  var BASE = SRC.replace(/assets\/js\/recomemo-spot\.js.*$/, '');

  var css = '.rms{font-family:Inter,system-ui,-apple-system,"Segoe UI",Arial,sans-serif;max-width:560px;margin:12px auto;color:#0b0b0d}' +
    '.rms a.rms-p{--c:#16a3a6;display:flex;align-items:center;gap:12px;padding:10px 18px 10px 10px;border:1.5px dashed #0b0b0d;border-radius:999px;text-decoration:none;color:inherit;' +
    'background:linear-gradient(115deg,color-mix(in srgb,var(--c) 20%,#fff),#fff 72%);transition:opacity .35s ease}' +
    '.rms a.rms-p:hover{border-style:solid}' +
    '.rms .rms-d{width:50px;height:50px;border-radius:50%;background:var(--c);color:#fff;display:grid;place-items:center;font-weight:800;font-size:16px;flex:none;overflow:hidden}' +
    '.rms .rms-d img{width:100%;height:100%;object-fit:contain;background:#fff}' +
    '.rms .rms-t{min-width:0;flex:1}' +
    '.rms small{display:block;font:700 10.5px ui-monospace,Menlo,monospace;color:#5b6475;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.rms b{display:block;font-weight:800;font-size:16px;line-height:1.2}' +
    '.rms i{display:block;font-style:normal;font-size:11.5px;color:#5b6475;margin-top:2px}' +
    '.rms .rms-f{display:flex;justify-content:space-between;gap:8px;font:600 10px ui-monospace,Menlo,monospace;color:#8a92a3;padding:4px 14px 0}' +
    '.rms .rms-f a{color:inherit}' +
    '@media(max-width:420px){.rms b{font-size:14px}.rms .rms-d{width:40px;height:40px}}';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ini(s) { return String(s || '?').split(/\s+/).map(function (w) { return w[0] || ''; }).join('').slice(0, 2).toUpperCase(); }
  function safeUrl(u) { return /^https:\/\//i.test(u || '') ? u : ''; }
  function safeCol(c) { return /^#[0-9a-f]{6}$/i.test(c || '') ? c : '#16a3a6'; }

  function pill(a) {
    var href = safeUrl(a.link) || (BASE + 'coupon/?r=' + encodeURIComponent(a.code || ''));
    var logo = safeUrl(a.logo);
    return '<a class="rms-p" href="' + esc(href) + '" target="_blank" rel="noopener" style="--c:' + safeCol(a.col) + '">' +
      '<span class="rms-d">' + (logo ? '<img src="' + esc(logo) + '" alt="">' : esc(ini(a.mer))) + '</span>' +
      '<span class="rms-t"><small>' + esc(a.mer) + '</small><b>' + esc(a.off) + '</b>' + (a.det ? '<i>' + esc(a.det) + '</i>' : '') + '</span></a>';
  }

  function mount(el, ads) {
    var place = el.getAttribute('data-place') || '';
    var list = ads.filter(function (a) { return !place || (a.places || []).indexOf(place) >= 0; });
    if (!list.length) return;
    // paid ads first, the house ad fills in
    list.sort(function (x, y) { return (x.house ? 1 : 0) - (y.house ? 1 : 0); });
    el.classList.add('rms');
    el.innerHTML = '<div class="rms-slot"></div><div class="rms-f"><span>recomemo spot</span><a href="' + esc(BASE + 'coupon/') + '" target="_blank" rel="noopener">your coupon here</a></div>';
    var slot = el.querySelector('.rms-slot'), i = 0, secs = Math.max(3, parseInt(el.getAttribute('data-seconds'), 10) || 7);
    function show() { slot.innerHTML = pill(list[i % list.length]); i++; }
    show();
    if (list.length > 1 && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      var timer = setInterval(function () {
        var p = slot.firstChild; if (p) p.style.opacity = '0';
        setTimeout(show, 350);
      }, secs * 1000);
      el.addEventListener('mouseenter', function () { clearInterval(timer); });
    }
  }

  function start() {
    var spots = document.querySelectorAll('.recomemo-spot');
    if (!spots.length) return;
    if (!document.getElementById('rms-css')) { var st = document.createElement('style'); st.id = 'rms-css'; st.textContent = css; document.head.appendChild(st); }
    fetch(FEED, { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (feed) {
      [].forEach.call(spots, function (el) { mount(el, (feed && feed.ads) || []); });
    }).catch(function () { /* stay quiet on the host site */ });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
