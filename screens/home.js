'use strict';
/* 画面: ホーム
   ・大ボタン2つ(みくらべる / よむ)で各画面へ(api.go)。文言は api.T('screen.home.*')。操作は api.Tap.bind(click禁止)
   ・端末内だけに残ることを1行で伝える。「読む力が上がる」等は書かない */
(function(){
  window.SCREENS.register('home', {
    render: function(c, api){
      c.appendChild(api.el('h1', 'scr-title', api.T('screen.home.title')));
      c.appendChild(api.el('p', 'tagline', api.T('app.tagline')));

      function bigBtn(id, ico, labelKey, subKey, target, primary){
        var b = api.el('button', 'big-btn' + (primary ? ' primary' : ''));
        b.type = 'button'; b.id = id;
        var i = api.el('span', 'ico', ico);
        i.setAttribute('aria-hidden', 'true');
        b.appendChild(i);
        var wrap = api.el('span');
        wrap.appendChild(api.el('span', 'lbl', api.T(labelKey)));
        var sub = api.el('span', 'hint', api.T(subKey));
        sub.style.display = 'block';
        if(primary) sub.style.color = '#fff';
        wrap.appendChild(sub);
        b.appendChild(wrap);
        api.Tap.bind(b, function(){ api.go(target); });
        return b;
      }
      c.appendChild(bigBtn('home-mikurabe', '👀', 'screen.home.mikurabe', 'screen.home.mikurabeSub', 'mikurabe', false));
      c.appendChild(bigBtn('home-yomu', '📖', 'screen.home.yomu', 'screen.home.yomuSub', 'yomu', true));
      c.appendChild(api.el('p', 'note', api.T('screen.home.note')));
    }
  });
})();
