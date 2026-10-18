/* Untere Leiste für alle Seiten */
(function () {
  var cur = document.body.dataset.page || 'home';
  var ic = {
    home: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    plan: '<path d="M5 4h10l4 4v12H5z"/><path d="M14 4v5h5M8 13h8M8 17h6"/>',
    mcdu: '<rect x="6" y="3" width="12" height="18" rx="2"/><rect x="8.5" y="5.5" width="7" height="5" rx=".6"/><path d="M9 14h1.5M13.5 14H15M9 17h1.5M13.5 17H15"/>',
    panel: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M13 9h5M13 12h5M13 15h5"/>',
    upd: '<path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14"/>'
  };
  function item(id, label, href) { var on = id === cur ? ' on' : ''; var svg = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ic[id] + '</svg>'; return href ? '<a class="' + on + '" href="' + href + '">' + svg + label + '</a>' : '<button type="button" class="upd" id="navupd">' + svg + label + '</button>'; }
  var bar = document.createElement('nav'); bar.className = 'tabbar'; bar.setAttribute('aria-label', 'Hauptnavigation');
  bar.innerHTML = item('home', 'Start', 'index.html') + item('plan', 'Planer', 'plan.html') + item('mcdu', 'MCDU', 'mcdu.html') + item('panel', 'Panel', 'panel.html') + item('upd', 'Update');
  document.querySelector('.app').appendChild(bar);
  document.getElementById('navupd').addEventListener('click', function () { if (window.App && App.postMessage) App.postMessage('update'); else alert('Das Update gibt es nur in der installierten App.'); });
})();
