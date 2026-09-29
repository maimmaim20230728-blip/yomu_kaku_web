'use strict';
/* 画面: よむ(読む)
   ・貼り付け欄(textarea)に文章を入れると、読み方プロフィール(screens/profile.js)の形で1行ずつ表示
     (句点「。！？؟」または改行、英文は「. ! ? ؟」+空白で区切る。splitLines)。今読む行だけ明るく、他は薄く
   ・つぎ/まえ・行のタップで移動。読み上げ(api.speak → onend で次の行へ自動送り・今の行を画面の中ほどへ。
     声の言語は貼った文から決める=textLang。api.canSpeak() が false なら読み上げボタンを出さず
     「この端末では読み上げできません」。ネットの声のときは ☁ と一言)・とめる。操作ボタンは下に固定(sticky)
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
    /* 折り返すときは語の途中(よみあ/げ)でなく空白で折る。入りきらない語だけは途中で折る */
    '#scr-yomu .ym-ctrl .btn{ min-width:0; word-break:keep-all; overflow-wrap:anywhere; }' +
    /* まえ/つぎ・よみあげ/とめる は読む画面の下に固定(長い文で「つぎ」を押しても、ボタンが画面から逃げない)。
       #main の下の余白(24px・style.css)の分だけ下げて、ボタンの下から行がのぞかないようにする */
    '#scr-yomu .ym-ctrl-bar{ position:sticky; bottom:-24px; z-index:4; background:var(--bg); padding-block:6px; }' +
    '#scr-yomu .ym-ctrl-bar .btn-row{ margin:4px 0; }' +
    '#scr-yomu .ym-band{ position:sticky; top:0; z-index:5; background:var(--brand-ink); color:var(--on-brand); border-radius:14px;' +
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
  var live = null;                        /* いまの描画の 戻るボタン(Play版)の受け口 { gen, back() } */

  /* 文章を「読む1行」に切る: 改行 / 。！？؟ / 英文の . ! ? ؟ + 空白
     ・区切りのすぐ後の閉じかっこ・引用符(」』）)】〕]"'”’)は同じ行に入れる(」や ）だけで始まる行を作らない)
     ・英文の「. 」は、行頭の番号(1. 2.)と略語(Mr. Dr. e.g. など)の後では切らない。
       略語は大文字小文字を区別する(文末の「no.」「dr.」で切れなくならないように)。「No.」は後ろが数字のときだけ(No. 5) */
  var ABBR = /(?:^|[\s(（「『"'“‘])(?:Mr|Mrs|Ms|Dr|St|vs|etc|e\.g|i\.e|E\.g|I\.e)$/;
  var NO_NUM = /(?:^|[\s(（「『"'“‘])No$/;
  var NUM_HEAD = /(?:^|\n)[ \t]*\d+$/;
  function splitLines(text){
    var out = [];
    String(text || '').replace(/([.!?؟])([」』）)】〕\]"'”’]*)\s+/g, function(all, p, close, off, str){
      if(p === '.' && !close){
        var before = str.slice(Math.max(0, off - 12), off);
        if(ABBR.test(before) || NUM_HEAD.test(before)) return all;
        if(NO_NUM.test(before) && /\d/.test(str.charAt(off + all.length))) return all;
      }
      return p + close + '\n';
    }).split(/\r?\n/).forEach(function(p){
      var m = p.match(/[^。！？؟]+[。！？؟]*[」』）)】〕\]"'”’]*|[。！？؟]+[」』）)】〕\]"'”’]*/g);
      if(!m) return;
      m.forEach(function(s){ s = s.trim(); if(s) out.push(s); });
    });
    return out;
  }
  /* 読み上げの声の言語 = 画面の言語ではなく、貼った文全体から1回だけ決める
     (英語設定のスマホで日本語の文を読むと英語の声になる、を防ぐ)。
     かな→ja / ハングル→ko / アラビア文字→ar / 漢字だけ→画面が ja なら ja・ほかは zh /
     ラテン文字→画面が ja・ko・zh・ar なら en・ほかは画面の言語 */
  function textLang(t, ui){
    var s = String(t || '');
    if(/[぀-ヿㇰ-ㇿｦ-ﾟ]/.test(s)) return 'ja';
    if(/[ᄀ-ᇿ㄰-㆏가-힯]/.test(s)) return 'ko';
    if(/[؀-ۿݐ-ݿ]/.test(s)) return 'ar';
    if(/[㐀-鿿]/.test(s)) return ui === 'ja' ? 'ja' : 'zh';
    if(/[A-Za-zÀ-ɏ]/.test(s)) return (['ja','ko','zh','ar'].indexOf(ui) >= 0) ? 'en' : ui;
    return ui;
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
      var voiceLang = textLang(text, api.lang);   /* 読み上げの声の言語(文から決める) */
      var idx = (typeof saved.idx === 'number' && saved.idx >= 0 && saved.idx < lines.length) ? saved.idx : 0;
      var reading = lines.length > 0 && saved.reading === true;   /* 読む表示か、貼り付け欄か */
      var speaking = false;
      var breakMin = Number(api.getExtra('breakMin', 0)) || 0;
      if(BREAK_MINS.indexOf(breakMin) < 0) breakMin = 0;
      var breakDue = 0;      /* 休憩の合図を出す時刻(ms)。0=止めている */
      var bandShown = false;
      var fromPaste = false; /* この描画で 貼り付け欄→「この文で よむ」で読む表示に来た(戻るボタンで貼り付け欄へもどる) */

      /* いま表示中か(隠れたら読み上げとタイマーを止める) */
      function visible(){ return !c.classList.contains('hidden'); }

      function persist(){
        if(api.save('read', { text:text, idx:idx, reading:reading })) return true;
        api.toast(api.T('common.storageFull'));
        return false;
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
      ta.setAttribute('dir', 'auto');   /* 貼り付け欄も UI の言語(ar=RTL)でなく文の向きに従う(日本語の「。」が先頭に回らない) */
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
        text = t; lines = ls; idx = 0; reading = true; fromPaste = true;
        voiceLang = textLang(text, api.lang);
        if(persist() && api.markSaved) api.markSaved();   /* 保存できた=戻るボタンで「まだ ほぞんしていません」を出さない */
        show();
        refreshVoiceMark();
        showCur(false);   /* 貼り付け欄が長い表示に入れ替わったとき、ブラウザのスクロール位置の補正で文の終わりへ飛ばないよう、1行目を画面に入れる */
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
      var bar = api.el('div', 'ym-ctrl-bar');   /* 下に固定する操作の入れ物 */
      bar.id = 'ym-ctrl-bar';
      bar.appendChild(ctrl);

      /* 操作: よみあげ / とめる(読み上げできない端末では出さず、ひとこと添える) */
      var ctrl2 = api.el('div', 'btn-row ym-ctrl');
      var speakBtn = null, stopBtn = null, cloudNote = null;
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
        /* ネットの声を使うときだけ ☁ と一言(端末内の声が無い言語など。AACと同じ考え方) */
        cloudNote = api.el('p', 'hint hidden', api.T('screen.yomu.cloudNote'));
        cloudNote.id = 'ym-cloud';
      } else {
        var ns = api.el('p', 'hint', api.T('screen.yomu.noSpeak'));
        ns.id = 'ym-nospeak';
        ctrl2.appendChild(ns);
      }
      bar.appendChild(ctrl2);
      view.appendChild(bar);
      if(cloudNote) view.appendChild(cloudNote);

      /* 文を かえる */
      var ctrl3 = api.el('div', 'btn-row');
      var changeBtn = api.el('button', 'btn wide');
      changeBtn.type = 'button'; changeBtn.id = 'ym-change';
      changeBtn.textContent = api.T('screen.yomu.change');
      api.Tap.bind(changeBtn, function(){
        stopSpeaking();
        reading = false; fromPaste = false;
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
        if(wasSpeaking) speakFrom(idx);
        else showCur(true);
      }
      /* 今の行を画面の中ほどに入れる(つぎ/まえ・行タップ・読み上げの自動送りで同じ道)。
         自動送りは速いことがあるので smooth にしない。
         下に固定したボタン(bar)の高さを scroll-margin で空けて、行の下がボタンに隠れないようにする。
         ボタンの上に入りきらない長い行は、行の頭を上にそろえる(読みはじめが上に切れない) */
      function showCur(smooth){
        try{
          var cur = box.querySelector('.ym-line.cur');
          if(!cur || !cur.scrollIntoView) return;
          var main = document.getElementById('main');
          var bh = bar.offsetHeight || 0;
          var room = (main && main.clientHeight) ? main.clientHeight - bh : 0;
          var tall = room > 0 && cur.offsetHeight > room;
          cur.style.scrollMarginBottom = tall ? '' : (bh + 'px');
          var o = { block: tall ? 'start' : 'center' };
          if(smooth) o.behavior = 'smooth';
          cur.scrollIntoView(o);
        }catch(_){}
      }

      /* ===== 読み上げ(今の行 → onend で次の行へ) ===== */
      var speakSeq = 0;   /* 止めた直後に古い onend が来ても次へ進めない(行とばし防止) */
      function speakFrom(k){
        if(!api.canSpeak() || k < 0 || k >= lines.length) return;
        speaking = true;
        idx = k;
        drawLines();
        persist();
        showCur(false);
        refreshVoiceMark();
        var mySeq = ++speakSeq;
        var ok = api.speak(lines[k], { lang:voiceLang, onend:function(){
          if(myGen !== gen){ speaking = false; return; }   /* 描き直された後の古い描画=続けない */
          if(!speaking || mySeq !== speakSeq) return;
          if(!visible()){ speaking = false; return; }
          if(idx + 1 < lines.length){ speakFrom(idx + 1); }
          else { speaking = false; }
        }, onerror:function(){
          /* 声が無い・エンジンの失敗など。止めた後や古い描画の失敗は知らせない */
          if(myGen !== gen || !speaking || mySeq !== speakSeq) return;
          speaking = false;
          api.toast(api.T('screen.yomu.speakFail'));
        } });
        if(!ok){ speaking = false; api.toast(api.T('screen.yomu.speakFail')); }
      }
      /* よみあげ ボタンの ☁(ネットの声のときだけ)と一言 */
      function refreshVoiceMark(){
        if(!speakBtn) return;
        var vi = api.voiceInfo ? api.voiceInfo(voiceLang) : null;
        var cloud = !!(vi && vi.local === false);
        speakBtn.textContent = '🔊 ' + api.T('screen.yomu.speak') + (cloud ? ' ☁' : '');
        if(cloudNote) cloudNote.classList.toggle('hidden', !cloud);
      }
      if(api.onVoicesChanged) api.onVoicesChanged(refreshVoiceMark);   /* 声の一覧が後から届いたとき */
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

      /* ===== 戻るボタン(Play版・2026-09-29) =====
         ①ひとやすみの帯が出ていたら「つづける」と同じ(帯を消して、休憩の合図を はじめから)
         ②貼り付け欄から読む表示に来たなら「文を かえる」と同じ(読み上げを止めて 貼り付け欄へ)
         ③それ以外は画面を離れる(false=共通の動き)。その前に 読み上げと休憩の合図を止める */
      live = { gen:myGen, back:function(){
        if(reading && bandShown){ hideBand(); startBreak(); return true; }
        if(reading && fromPaste){ stopSpeaking(); reading = false; fromPaste = false; persist(); show(); return true; }
        stopSpeaking();
        clearInterval(timer); timer = 0; breakDue = 0;
        return false;
      } };

      clearInterval(timer); timer = 0;   /* 前回描画のタイマーを止めてから始める */
      refreshChips();
      show();
      refreshVoiceMark();
    },
    back: function(){ return (live && live.gen === gen) ? live.back() : false; }
  });
})();
