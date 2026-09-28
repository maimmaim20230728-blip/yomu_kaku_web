'use strict';
/* 読み方プロフィール(共通ヘルパー。画面ではない=SCREENS.register しない)
   ・みくらべ(mikurabe)が保存し、よむ(yomu)が使う「文字の形」= { font, spacing, lh, bg, size } の番号の組
   ・保存先は api.setExtra('profile', prof)(pref.extra の中=バックアップにも入る)
   ・書体は 0番だけ同梱(BIZ UDPGothic・OFL・fonts/。@font-face は style.css の "Yomu BIZ UDPGothic")。
     1番・2番は端末に入っている書体の候補を font-family で並べるだけ
   ・🔴 番号(0/1/2)は保存済みの読み方プロフィールの値なので、並びを変えない
   ・左寄せ・両端そろえなし(text-align:start。justify/center にしない。RTL言語では書き出し側に寄る) */
(function(){

  /* 書体候補(順に探す。無ければ最後の総称にたどり着く) */
  var FONTS = [
    '"Yomu BIZ UDPGothic","BIZ UDPGothic","Yu Gothic","Hiragino Sans","Noto Sans JP",system-ui,sans-serif', /* 0: 同梱の BIZ UDPゴシック */
    '"BIZ UDPMincho","Yu Mincho","Hiragino Mincho ProN","Noto Serif JP","Times New Roman",serif',          /* 1: 明朝(端末の書体) */
    '"Hiragino Maru Gothic ProN","Rounded Mplus 1c","Meiryo","Yu Gothic UI","Noto Sans JP",sans-serif'     /* 2: まるい ゴシック(端末しだい。丸く出ない端末が多い) */
  ];
  var SPACINGS = ['0', '0.08em', '0.16em'];       /* 字間 3段階 */
  var LHS = ['1.6', '2.0', '2.4'];                /* 行間 3段階 */
  /* 背景色: 白 / 生成り / 薄い灰 / 黒地(文字色と、薄く見せる行の色も組にする)。
     薄く見せる行(今の行以外)は約 3:1(yomu-17・2026-09-29。前は 1.75〜2.74:1 で前後の文が読みにくかった)。
     今の行との差は太字と枠(yomu.js の .ym-line.cur)で残す */
  var BGS = [
    { bg:'#ffffff', ink:'#1a1a1a', dim:'#949494', line:'#dddddd' },
    { bg:'#fbf6e9', ink:'#2a2620', dim:'#938c7c', line:'#e6dfcf' },
    { bg:'#ececec', ink:'#1a1a1a', dim:'#878787', line:'#d4d4d4' },
    { bg:'#111111', ink:'#f0f0f0', dim:'#7a7a7a', line:'#333333' }
  ];
  var SIZES = ['1em', '1.25em', '1.5em'];          /* 文字の大きさ 3段階(せっていの「もじの大きさ」に重ねて掛かる) */

  /* 初期値 = ルビ付きPDFの型(行間2.0・生成り背景・左寄せ・ゴシック) */
  var DEFAULT = { font:0, spacing:0, lh:1, bg:1, size:0 };
  var RANGE = { font:FONTS.length, spacing:SPACINGS.length, lh:LHS.length, bg:BGS.length, size:SIZES.length };

  /* 保存値は必ずここを通す(範囲外・壊れた値は初期値に) */
  function sanitize(p){
    p = (p && typeof p === 'object') ? p : {};
    var out = {};
    for(var k in DEFAULT){
      var v = Number(p[k]);
      out[k] = (isFinite(v) && v >= 0 && v < RANGE[k] && Math.floor(v) === v) ? v : DEFAULT[k];
    }
    return out;
  }
  function load(api){ return sanitize(api.getExtra('profile', null)); }
  function save(api, p){ var s = sanitize(p); api.setExtra('profile', s); return s; }

  /* 要素に形を当てる(inline style。プレビューにも読む画面にも同じ関数を使う) */
  function apply(elm, p){
    p = sanitize(p);
    var c = BGS[p.bg];
    elm.style.fontFamily = FONTS[p.font];
    elm.style.letterSpacing = SPACINGS[p.spacing];
    elm.style.lineHeight = LHS[p.lh];
    elm.style.background = c.bg;
    elm.style.color = c.ink;
    elm.style.fontSize = SIZES[p.size];
    elm.style.textAlign = 'start';        /* 左寄せ(両端そろえ・中央そろえにしない)。書き出し側に寄せる */
    elm.style.textAlignLast = 'start';
    elm.setAttribute('dir', 'auto');      /* 文字の向きは UI の言語(ar=RTL)でなく、貼った文そのものの向きに従う(日本語の文を ar で開いても左から) */
    elm.setAttribute('data-prof-bg', String(p.bg));
    return c;
  }
  /* 薄く見せる行の色(今読む行以外) */
  function dimColor(p){ return BGS[sanitize(p).bg].dim; }
  function lineColor(p){ return BGS[sanitize(p).bg].line; }

  window.YOMU_PROFILE = {
    DEFAULT: DEFAULT, RANGE: RANGE,
    sanitize: sanitize, load: load, save: save, apply: apply, dimColor: dimColor, lineColor: lineColor
  };
})();
