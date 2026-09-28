'use strict';
/* 画面: よむ(読む)
   ・貼り付け欄(textarea)に文章を入れると、読み方プロフィール(screens/profile.js)の形で1行ずつ表示
     (句点「。！？」または改行、英文は「. ! ?」+空白で区切る)。今読む行だけ明るく、他は薄く
   ・つぎ/まえ・行のタップで移動。読み上げ(api.speak → onend で次の行へ自動送り。api.canSpeak() が false なら
     読み上げボタンを出さず「この端末では読み上げできません」)・とめる
   ・休憩の合図: 本人が決めた分数(なし/5/10/15/20)で、読む画面の上に「ひとやすみ」の帯(Sound.tone 1回 + 振動)
   ・貼った文と今の行は api.save('read') で端末内に残す(容量オーバーは通知して取消)
   ・操作は全部 api.Tap.bind(click禁止)。textarea だけネイティブ入力。左寄せ・両端そろえなし。急かさない */
(function(){

  var CSS =
    '#scr-yomu .ym-lines{ border:2px solid var(--line); border-radius:14px; padding:14px 14px; margin:0 0 12px;' +
    ' text-align:start; overflow-wrap:anywhere; }' +
    /* 行はタップ対象(44px以上)。薄い行の色は profile.js の dim 色だけで表す(opacity を重ねると読めないほど薄くなる) */
    '#scr-yomu .ym-line{ display:block; width:100%; min-height:44px; margin:0; padding:6px 8px; border:none; border-radius:8px;' +
    ' background:none; font:inherit; letter-spacing:inherit; line-height:inherit; color:inherit; text-align:start; }' +
    '#scr-yomu .ym-line.cur{ opacity:1; font-weight:700; outline:2px solid currentColor; outline-offset:-2px; }' +
    '#scr-yomu .ym-pos{ color:var(--sub); font-size:.9em; margin:0 0 6px; }' +
    '#scr-yomu .ym-ctrl .btn{ min-width:0; }' +
    '#scr-yomu .ym-band{ position:sticky; top:0; z-index:5; background:var(--brand); color:#fff; border-radius:14px;' +
    ' padding:12px 14px; margin:0 0 12px; text-align:center; }' +
    '#scr-yomu .ym-band .ym-band-h{ font-size:1.3em; font-weight:800; margin:0 0 4px; }' +
    '#scr-yomu .ym-band .btn{ margin-top:8px; background:#fff; color:#1a1a1a; border-color:#fff; }' +
    '#scr-yomu .ym-break{ margin:14px 0 4px; }' +
    '#scr-yomu .ym-break .mk-label{ font-weight:700; margin:0 0 6px; }';
  var injected = false;
  function injectCss(){
    if(injected) return;
    injected = true;
    var s = document.createElement('style');
    s.id = 'css-yomu';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  var BREAK_MINS = [0, 5, 10, 15, 20];   /* 0=なし。並びは i18n の breakOpts と同じ */
  var timer = 0;                          /* 休憩タイマー(画面をまたいで1本だけ) */
  var gen = 0;                            /* 描画の世代。言語切替などで描き直したら、前の描画の読み上げ(onend)は続けない */

  /* 文章を「読む1行」に切る: 改行 / 。！？ / 英文の . ! ? + 空白 */
  function splitLines(text){
    var out = [];
    String(text || '').replace(/([.!?])\s+/g, '$1\n').split(/\r?\n/).forEach(function(p){
      var m = p.match(/[^。！？]+[。！？]*|[。！？]+/g);
      if(!m) return;
      m.forEach(function(s){ s = s.trim(); if(s) out.push(s); });
    });
    return out;
  }

  window.SCREENS.register('yomu', {
    render: function(c, api){
      injectCss();
      var myGen = ++gen;
      api.stopSpeak();   /* 描き直し(言語切替等)の前の読み上げが、見えない行を読み続けないように止める */
      var P = window.YOMU_PROFILE;
      var prof = P.load(api);
      var saved = api.load('read', null) || {};
      var text = (typeof saved.text === 'string') ? saved.text : '';
      var lines = splitLines(text);
      var idx = (typeof saved.idx === 'number' && saved.idx >= 0 && saved.idx < lines.length) ? saved.idx : 0;
      var reading = lines.length > 0 && saved.reading === true;   /* 読む表示か、貼り付け欄か */
      var speaking = false;
      var breakMin = Number(api.getExtra('breakMin', 0)) || 0;
      if(BREAK_MINS.indexOf(breakMin) < 0) breakMin = 0;
      var breakDue = 0;      /* 休憩の合図を出す時刻(ms)。0=止めている */
      var bandShown = false;

      /* いま表示中か(隠れたら読み上げとタイマーを止める) */
      function visible(){ return !c.classList.contains('hidden'); }

      function persist(){
        if(!api.save('read', { text:text, idx:idx, reading:reading })) api.toast(api.T('common.storageFull'));
      }

      c.appendChild(api.el('h1', 'scr-title', api.T('screen.yomu.title')));

      /* ===== 貼り付け欄 ===== */
      var paste = api.el('div', 'ym-paste');
      var field = api.el('div', 'field');
      var lbl = api.el('label', null, api.T('screen.yomu.pasteLabel'));
      lbl.setAttribute('for', 'ym-text');
      field.appendChild(lbl);
      var ta = api.el('textarea');
      ta.id = 'ym-text';
      ta.rows = 8;
      ta.placeholder = api.T('screen.yomu.placeholder');
      ta.value = text;
      field.appendChild(ta);
      paste.appendChild(field);
      paste.appendChild(api.el('p', 'hint', api.T('screen.yomu.pasteHint')));
      var startRow = api.el('div', 'btn-row');
      var startBtn = api.el('button', 'btn primary wide');
      startBtn.type = 'button'; startBtn.id = 'ym-start';
      startBtn.textContent = api.T('screen.yomu.start');
      api.Tap.bind(startBtn, function(){
        var t = String(ta.value || '');
        var ls = splitLines(t);
        if(!ls.length){ api.toast(api.T('screen.yomu.emptyText')); return; }
        text = t; lines = ls; idx = 0; reading = true;
        persist();
        show();
      });
      startRow.appendChild(startBtn);
      paste.appendChild(startRow);
      c.appendChild(paste);

      /* ===== 読む表示 ===== */
      var view = api.el('div', 'ym-view');

      /* ひとやすみの帯(合図が来たときだけ出す) */
      var band = api.el('div', 'ym-band hidden');
      band.id = 'ym-band';
      band.appendChild(api.el('div', 'ym-band-h', api.T('screen.yomu.breakBand')));
      band.appendChild(api.el('div', null, api.T('screen.yomu.breakSub')));
      var goBtn = api.el('button', 'btn');
      goBtn.type = 'button'; goBtn.id = 'ym-break-go';
      goBtn.textContent = api.T('screen.yomu.breakGo');
      api.Tap.bind(goBtn, function(){ hideBand(); startBreak(); });
      band.appendChild(goBtn);
      view.appendChild(band);

      var pos = api.el('p', 'ym-pos');
      pos.id = 'ym-pos';
      view.appendChild(pos);

      var box = api.el('div', 'ym-lines');
      box.id = 'ym-lines';
      view.appendChild(box);
      view.appendChild(api.el('p', 'hint', api.T('screen.yomu.tapLineHint')));

      /* 操作: まえ / つぎ */
      var ctrl = api.el('div', 'btn-row ym-ctrl');
      var prevBtn = api.el('button', 'btn');
      prevBtn.type = 'button'; prevBtn.id = 'ym-prev';
      prevBtn.textContent = api.T('screen.yomu.prev');
      api.Tap.bind(prevBtn, function(){ move(idx - 1); });
      var nextBtn = api.el('button', 'btn primary');
      nextBtn.type = 'button'; nextBtn.id = 'ym-next';
      nextBtn.textContent = api.T('screen.yomu.next');
      api.Tap.bind(nextBtn, function(){ move(idx + 1); });
      ctrl.appendChild(prevBtn);
      ctrl.appendChild(nextBtn);
      view.appendChild(ctrl);

      /* 操作: よみあげ / とめる(読み上げできない端末では出さず、ひとこと添える) */
      var ctrl2 = api.el('div', 'btn-row ym-ctrl');
      var speakBtn = null, stopBtn = null;
      if(api.canSpeak()){
        speakBtn = api.el('button', 'btn');
        speakBtn.type = 'button'; speakBtn.id = 'ym-speak';
        speakBtn.textContent = '🔊 ' + api.T('screen.yomu.speak');
        api.Tap.bind(speakBtn, function(){ speakFrom(idx); });
        stopBtn = api.el('button', 'btn');
        stopBtn.type = 'button'; stopBtn.id = 'ym-stop';
        stopBtn.textContent = api.T('screen.yomu.stop');
        api.Tap.bind(stopBtn, function(){ stopSpeaking(); });
        ctrl2.appendChild(speakBtn);
        ctrl2.appendChild(stopBtn);
      } else {
        var ns = api.el('p', 'hint', api.T('screen.yomu.noSpeak'));
        ns.id = 'ym-nospeak';
        ctrl2.appendChild(ns);
      }
      view.appendChild(ctrl2);

      /* 文を かえる */
      var ctrl3 = api.el('div', 'btn-row');
      var changeBtn = api.el('button', 'btn wide');
      changeBtn.type = 'button'; changeBtn.id = 'ym-change';
      changeBtn.textContent = api.T('screen.yomu.change');
      api.Tap.bind(changeBtn, function(){
        stopSpeaking();
        reading = false;
        persist();
        show();
      });
      ctrl3.appendChild(changeBtn);
      view.appendChild(ctrl3);
      view.appendChild(api.el('p', 'hint', api.T('screen.yomu.profileHint')));
      c.appendChild(view);

      /* ===== ひとやすみの めやす(なし/5/10/15/20分) ===== */
      var brk = api.el('div', 'ym-break');
      brk.appendChild(api.el('div', 'mk-label', api.T('screen.yomu.breakLabel')));
      var chips = api.el('div', 'chips');
      var names = api.T('screen.yomu.breakOpts');
      var chipEls = [];
      for(var i = 0; i < BREAK_MINS.length; i++){
        (function(k){
          var b = api.el('button', 'chip');
          b.type = 'button'; b.id = 'ym-break-' + BREAK_MINS[k];
          b.textContent = names[k];
          api.Tap.bind(b, function(){
            breakMin = BREAK_MINS[k];
            api.setExtra('breakMin', breakMin);
            refreshChips();
            hideBand();
            startBreak();
            api.toast(breakMin ? api.T('screen.yomu.breakSet').replace('{m}', names[k]) : api.T('screen.yomu.breakOff'));
          });
          chipEls.push(b);
          chips.appendChild(b);
        })(i);
      }
      brk.appendChild(chips);
      c.appendChild(brk);
      function refreshChips(){
        for(var n = 0; n < chipEls.length; n++) chipEls[n].classList.toggle('on', BREAK_MINS[n] === breakMin);
      }

      /* ===== 行の描画 ===== */
      function drawLines(){
        box.textContent = '';
        P.apply(box, prof);
        var dim = P.dimColor(prof);
        for(var n = 0; n < lines.length; n++){
          (function(k){
            var b = api.el('button', 'ym-line ' + (k === idx ? 'cur' : 'dim'));
            b.type = 'button';
            b.setAttribute('dir', 'auto');   /* 1行ごとに文の向きに従う */
            b.textContent = lines[k];
            if(k !== idx) b.style.color = dim;
            api.Tap.bind(b, function(){ move(k); }, { silent:true });
            box.appendChild(b);
          })(n);
        }
        pos.textContent = lines.length ? api.T('screen.yomu.lineOf').replace('{a}', String(idx + 1)).replace('{b}', String(lines.length)) : '';
        prevBtn.disabled = idx <= 0;
        nextBtn.disabled = idx >= lines.length - 1;
      }
      function move(k){
        if(k < 0 || k >= lines.length) return;
        var wasSpeaking = speaking;
        if(wasSpeaking) stopSpeaking();
        idx = k;
        drawLines();
        persist();
        try{ var cur = box.querySelector('.ym-line.cur'); if(cur && cur.scrollIntoView) cur.scrollIntoView({ block:'center', behavior:'smooth' }); }catch(_){}
        if(wasSpeaking) speakFrom(idx);
      }

      /* ===== 読み上げ(今の行 → onend で次の行へ) ===== */
      var speakSeq = 0;   /* 止めた直後に古い onend が来ても次へ進めない(行とばし防止) */
      function speakFrom(k){
        if(!api.canSpeak() || k < 0 || k >= lines.length) return;
        speaking = true;
        idx = k;
        drawLines();
        persist();
        var mySeq = ++speakSeq;
        var ok = api.speak(lines[k], { lang:api.lang, onend:function(){
          if(myGen !== gen){ speaking = false; return; }   /* 描き直された後の古い描画=続けない */
          if(!speaking || mySeq !== speakSeq) return;
          if(!visible()){ speaking = false; return; }
          if(idx + 1 < lines.length){ speakFrom(idx + 1); }
          else { speaking = false; }
        } });
        if(!ok) speaking = false;
      }
      function stopSpeaking(){
        speaking = false;
        speakSeq++;
        api.stopSpeak();
      }

      /* ===== 休憩の合図 ===== */
      function startBreak(){
        clearInterval(timer); timer = 0; breakDue = 0;
        if(!breakMin || !reading) return;
        breakDue = Date.now() + breakMin * 60000;
        timer = setInterval(tick, 1000);
      }
      function tick(force){
        if(!visible() || !reading){ clearInterval(timer); timer = 0; breakDue = 0; return; }
        if(!breakDue) return;
        if(force === true || Date.now() >= breakDue){
          clearInterval(timer); timer = 0; breakDue = 0;
          showBand();
        }
      }
      function showBand(){
        bandShown = true;
        band.classList.remove('hidden');
        try{ if(window.Sound && window.Sound.tone) window.Sound.tone(660, 0.35, 0.06); }catch(_){}
        api.vibrate([120, 80, 120]);
        try{ if($ymMain()) $ymMain().scrollTop = 0; }catch(_){}
      }
      function hideBand(){ bandShown = false; band.classList.add('hidden'); }
      function $ymMain(){ return document.getElementById('main'); }
      c._breakTick = tick;   /* 検査用(疑似DOMスモークが強制発火に使う) */

      /* ===== 表示の切り替え(貼り付け欄 ↔ 読む表示) ===== */
      function show(){
        paste.classList.toggle('hidden', reading);
        view.classList.toggle('hidden', !reading);
        if(reading){ drawLines(); startBreak(); }
        else { clearInterval(timer); timer = 0; breakDue = 0; hideBand(); ta.value = text; }
      }

      clearInterval(timer); timer = 0;   /* 前回描画のタイマーを止めてから始める */
      refreshChips();
      show();
    }
  });
})();
