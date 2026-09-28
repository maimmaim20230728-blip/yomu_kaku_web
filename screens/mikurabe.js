'use strict';
/* 画面: みくらべ(見比べ)
   ・同じ見本文(そよぎの文・3行)を、書体(端末の書体3候補)・字間(3段階)・行間(1.6/2.0/2.4)・背景色(白/生成り/薄い灰/黒地)・
     文字の大きさ(3段階)で切り替えて見比べ、「読み方プロフィール」として保存(api.setExtra 経由=screens/profile.js)
   ・操作は全部 api.Tap.bind(click禁止)。点数化・おすすめ・「読む力が上がる」等は書かない
   ・左寄せ・両端そろえなし */
(function(){

  var CSS =
    '#scr-mikurabe .mk-preview{ border:2px solid var(--line); border-radius:14px; padding:16px 14px; margin:0 0 14px;' +
    ' overflow-wrap:anywhere; text-align:start; }' +
    '#scr-mikurabe .mk-preview p{ margin:0; }' +
    '#scr-mikurabe .mk-row{ margin:0 0 14px; }' +
    '#scr-mikurabe .mk-label{ font-weight:700; margin:0 0 6px; }' +
    '#scr-mikurabe .mk-chips{ display:flex; flex-wrap:wrap; gap:8px; }' +
    '#scr-mikurabe .mk-chips .chip{ flex:1 1 auto; min-width:5.5em; text-align:center; }' +
    '#scr-mikurabe .mk-swatch{ display:inline-block; width:.9em; height:.9em; border-radius:50%; border:1px solid #888; vertical-align:middle; margin-right:.35em; }';
  var injected = false;
  function injectCss(){
    if(injected) return;
    injected = true;
    var s = document.createElement('style');
    s.id = 'css-mikurabe';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* 見本の色見本(背景チップに丸を添える。数値は profile.js と同じ並び) */
  var SWATCH = ['#ffffff', '#fbf6e9', '#ececec', '#111111'];

  window.SCREENS.register('mikurabe', {
    render: function(c, api){
      injectCss();
      var P = window.YOMU_PROFILE;
      var draft = P.load(api);        /* いま画面で選んでいる形(保存するまで下書き) */

      c.appendChild(api.el('h1', 'scr-title', api.T('screen.mikurabe.title')));
      c.appendChild(api.el('p', 'hint', api.T('screen.mikurabe.hint')));

      /* ---- 見本文(3行) ---- */
      var preview = api.el('div', 'mk-preview');
      preview.id = 'mk-preview';
      var lines = api.T('screen.mikurabe.sample');
      for(var i = 0; i < lines.length; i++) preview.appendChild(api.el('p', null, lines[i]));
      c.appendChild(preview);

      /* ---- 切り替え行(項目名 + チップ) ---- */
      var chipRefs = {};   /* key → [chip要素…] */
      function makeRow(key, labelKey, optsKey){
        var row = api.el('div', 'mk-row');
        row.appendChild(api.el('div', 'mk-label', api.T('screen.mikurabe.' + labelKey)));
        var chips = api.el('div', 'mk-chips');
        var names = api.T('screen.mikurabe.' + optsKey);
        chipRefs[key] = [];
        for(var j = 0; j < names.length; j++){
          (function(idx){
            var b = api.el('button', 'chip');
            b.type = 'button';
            b.id = 'mk-' + key + '-' + idx;
            if(key === 'bg'){
              var sw = api.el('span', 'mk-swatch');
              sw.style.background = SWATCH[idx];
              sw.setAttribute('aria-hidden', 'true');
              b.appendChild(sw);
            }
            b.appendChild(api.el('span', null, names[idx]));
            api.Tap.bind(b, function(){ draft[key] = idx; refresh(); });
            chipRefs[key].push(b);
            chips.appendChild(b);
          })(j);
        }
        row.appendChild(chips);
        c.appendChild(row);
      }
      makeRow('font', 'font', 'fonts');
      makeRow('size', 'size', 'sizes');
      makeRow('spacing', 'spacing', 'spacings');
      makeRow('lh', 'lh', 'lhs');
      makeRow('bg', 'bg', 'bgs');

      /* ---- ほぞん / もどす ---- */
      var btns = api.el('div', 'btn-row');
      var saveBtn = api.el('button', 'btn primary wide');
      saveBtn.type = 'button'; saveBtn.id = 'mk-save';
      saveBtn.textContent = api.T('screen.mikurabe.save');
      api.Tap.bind(saveBtn, function(){
        P.save(api, draft);
        api.toast(api.T('screen.mikurabe.saved'));
      });
      btns.appendChild(saveBtn);
      c.appendChild(btns);

      var btns2 = api.el('div', 'btn-row');
      var resetBtn = api.el('button', 'btn wide');
      resetBtn.type = 'button'; resetBtn.id = 'mk-reset';
      resetBtn.textContent = api.T('screen.mikurabe.reset');
      api.Tap.bind(resetBtn, function(){
        draft = P.sanitize(P.DEFAULT);
        P.save(api, draft);
        refresh();
        api.toast(api.T('screen.mikurabe.resetDone'));
      });
      btns2.appendChild(resetBtn);
      c.appendChild(btns2);

      /* 見本とチップの選択状態を今の下書きに合わせる */
      function refresh(){
        P.apply(preview, draft);
        for(var k in chipRefs){
          for(var n = 0; n < chipRefs[k].length; n++) chipRefs[k][n].classList.toggle('on', draft[k] === n);
        }
      }
      refresh();
    }
  });
})();
