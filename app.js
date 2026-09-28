'use strict';
/* 読み書きの作業台・そよぎ 本体シェル(そよぎアプリ・キット v1)
   ・端末内だけに保存(localStorage・キーは「yomu.」で始まる)・完全オフライン・匿名・広告なし
   ・click禁止: 操作は全て Tap.bind(tap.js)。select / file input だけはネイティブイベント
   ・画面は screens/<id>.js が window.SCREENS.register('<id>', { render(container, api) }) で登録する
     (会話補助ノートと同じ取り決め。画面同士・シェルの内部状態は共有しない)
   ・api = { T, el, pref, toast, go, Tap, Photo, load, save, remove, getExtra, setExtra, speak, stopSpeak, canSpeak, voiceInfo, onVoicesChanged, vibrate, lang, rtl, ver, appKey }
   ・🔴 BUILDER: アプリ固有の処理は screens/*.js に書く。このファイルは共通部分なので最小限の変更にとどめ、
     変えたら README の「シェルの変更点」に書く */
(function(){

var VER = '0.3.3';               // 🔴 更新のたびに上げる(build.gradle の versionName / sw.js の CACHE と一緒に)
var APP_KEY = 'yomu_kaku';        // バックアップの識別(別アプリのファイルを読まない)
var LS = 'yomu.';
var LS_PREF = LS + 'pref.v1';
var LANGS = ['ja','en','de','fr','es','it','pt','nl','sv','ko','zh','ar'];
var RTL_LANGS = ['ar'];
var THEMES = ['green','aqua','white','dark'];
var BGMS = ['off','green','blue'];
var DEFAULT_THEME = 'white';
var DEFAULT_BGM = 'off';
var TTS_LANG = { ja:'ja-JP', en:'en-US', de:'de-DE', fr:'fr-FR', es:'es-ES', it:'it-IT', pt:'pt-PT', nl:'nl-NL', sv:'sv-SE', ko:'ko-KR', zh:'zh-CN', ar:'ar-SA' };

var $ = function(id){ return document.getElementById(id); };

/* ---- 保存(端末内のみ) ---- */
function loadJSON(key){ try{ var s = localStorage.getItem(key); return s ? JSON.parse(s) : null; }catch(_){ return null; } }
function saveJSON(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); return true; }catch(_){ return false; } }
function removeKey(key){ try{ localStorage.removeItem(key); }catch(_){} }

function detectLang(){
  try{ var n = String((navigator && navigator.language) || 'ja').slice(0, 2).toLowerCase(); return LANGS.indexOf(n) >= 0 ? n : 'ja'; }
  catch(_){ return 'ja'; }
}
/* prefは常にホワイトリスト経由(バックアップ読み込みでも同じ道) */
function sanitizePref(p){
  p = p || {};
  return {
    lang:  LANGS.indexOf(p.lang) >= 0 ? p.lang : detectLang(),
    fs:    [0,1,2].indexOf(p.fs) >= 0 ? p.fs : 0,
    theme: THEMES.indexOf(p.theme) >= 0 ? p.theme : DEFAULT_THEME,
    bgm:   BGMS.indexOf(p.bgm) >= 0 ? p.bgm : DEFAULT_BGM,
    sound: (p.sound === undefined) ? true : !!p.sound,
    extra: (p.extra && typeof p.extra === 'object' && !Array.isArray(p.extra)) ? p.extra : {}   // 画面側の小さな設定(api.setExtra)
  };
}
var pref = sanitizePref(loadJSON(LS_PREF));
function savePref(){ saveJSON(LS_PREF, pref); }
function next(list, cur){ return list[(list.indexOf(cur) + 1) % list.length]; }

/* ---- i18n ---- */
function walk(obj, key){
  return key.split('.').reduce(function(a, c){ return (a && a[c] !== undefined) ? a[c] : undefined; }, obj);
}
function T(key){
  var tbl = window.YOMU_I18N || {};
  var v = walk(tbl[pref.lang] || tbl.ja || {}, key);
  if(v === undefined) v = walk(tbl.ja || {}, key);
  return (v === undefined) ? key : v;
}
/* 静的要素id → i18nキー(疑似DOMスモークで機械検証できるよう明示マップ方式) */
var I18N_MAP = {
  'hd-title':'app.name',
  'set-h-normal':'set.hNormal', 'set-h-backup':'set.hBackup',
  'lbl-fs':'set.fs', 'lbl-theme':'set.theme', 'lbl-bgm':'set.bgm', 'lbl-sound':'set.sound',
  'bk-hint':'set.bkHint', 'bk-export':'set.bkExport', 'bk-import':'set.bkImport',
  'set-note':'set.note', 'link-privacy':'set.privacy', 'about-credit':'set.credit', 'font-credit':'set.fontCredit'
};
function applyI18n(){
  for(var id in I18N_MAP){ var e = $(id); if(e) e.textContent = T(I18N_MAP[id]); }
  var navs = document.querySelectorAll('.nav-btn');
  for(var i = 0; i < navs.length; i++){
    var scr = navs[i].getAttribute('data-scr');
    if(scr) navs[i].textContent = T('nav.' + scr);
  }
  document.documentElement.lang = pref.lang;
  document.documentElement.dir = (RTL_LANGS.indexOf(pref.lang) >= 0) ? 'rtl' : 'ltr';
  if($('btn-fs'))    $('btn-fs').textContent    = T('set.fsSizes')[pref.fs];
  if($('btn-theme')) $('btn-theme').textContent = T('set.themes')[THEMES.indexOf(pref.theme)];
  if($('btn-bgm'))   $('btn-bgm').textContent   = T('set.bgms')[BGMS.indexOf(pref.bgm)];
  if($('btn-sound')) $('btn-sound').textContent = pref.sound ? T('set.on') : T('set.off');
  if($('about-ver')) $('about-ver').textContent = 'v' + VER;
  document.title = T('app.name');
  fitTitle();
  if(current !== 'set') renderScreen(current);   // 表示中の画面も訳し直す
  applyBarSpace();
}

/* ヘッダーの名前: 正式名(そよぎ付き)が入りきらないときだけ、そよぎを抜いた短い名前にする(ヒロさん指示 2026-09-28) */
function fitTitle(){
  var e = $('hd-title'); if(!e) return;
  var full = T('app.name'), s = T('app.short');
  e.textContent = full;
  /* 1px のはみ出しも見逃さない(+1 の余裕があると en 432px で短い名前に切り替わらず「…」で切れた・2026-09-29) */
  if(s !== 'app.short' && s !== full && e.scrollWidth > e.clientWidth) e.textContent = s;
}
if(typeof window !== 'undefined' && window.addEventListener) window.addEventListener('resize', function(){ fitTitle(); });
/* ---- 見た目/音 ---- */
function applyTheme(){ document.body.setAttribute('data-theme', pref.theme); }
function applyBodyClass(){ document.body.className = 'fs' + pref.fs; }
function applySound(startNow){
  Sound.setEnabled(pref.sound);
  if(pref.bgm !== 'off') Sound.setBgmMode(pref.bgm);
  Sound.setBgmEnabled(pref.bgm !== 'off', startNow);   // 起動時は startNow=false(勝手に鳴らさない)
}
function applyAll(startNow){
  applyBodyClass();
  applyTheme();
  applySound(startNow);
  if($('set-lang')) $('set-lang').value = pref.lang;
  applyI18n();
}

/* ---- 下ナビの実寸をCSS変数へ(セーフエリア対応・トースト位置等に使う) ---- */
function applyBarSpace(){
  var st = document.documentElement && document.documentElement.style;
  if(!st || !st.setProperty) return;
  var bar = $('navbar');
  if(!bar || !bar.getBoundingClientRect) return;
  var h = Math.ceil(bar.getBoundingClientRect().height);
  if(h > 0) st.setProperty('--tabbar-h', h + 'px');
}
function watchBarSpace(){
  var bar = $('navbar');
  if(!bar || typeof ResizeObserver === 'undefined') return false;
  try{ new ResizeObserver(applyBarSpace).observe(bar); return true; }catch(_){ return false; }
}

/* ---- 小さなDOMヘルパー(画面側にも渡す) ---- */
function el(tag, cls, txt){
  var e = document.createElement(tag);
  if(cls) e.className = cls;
  if(txt != null) e.textContent = txt;
  return e;
}

/* ---- 読み上げ(任意。Play版のWebViewはWeb Speech API非対応なのでネイティブへ橋渡し) ----
   ・Play版: @capacitor-community/text-to-speech(package.json に入れて cap sync)。バンドラ無しなので
     Capacitor.registerPlugin(@capacitor/core の関数)は WebView に無い。ネイティブ側が入れる Capacitor.Plugins.TextToSpeech を使う
   ・プラグインが入っていない版では canSpeak()=false(押しても鳴らないボタンを出さない)
   ・ネイティブの speak() は読み終わりで resolve する Promise → opts.onend / 失敗(言語の声が無い等)は opts.onerror */
var ttsCache = { cap:undefined, plugin:null };
function nativeTts(){
  var c = null;
  try{ c = (typeof window !== 'undefined' && window.Capacitor) || null; }catch(_){}
  if(c === ttsCache.cap) return ttsCache.plugin;
  ttsCache.cap = c; ttsCache.plugin = null;
  try{
    if(c && typeof c.isNativePlatform === 'function' && c.isNativePlatform() &&
       typeof c.isPluginAvailable === 'function' && c.isPluginAvailable('TextToSpeech')){
      var p = c.Plugins && c.Plugins.TextToSpeech;
      if(p && typeof p.speak === 'function') ttsCache.plugin = p;
      else if(typeof c.registerPlugin === 'function') ttsCache.plugin = c.registerPlugin('TextToSpeech');
    }
  }catch(_){ ttsCache.plugin = null; }
  return ttsCache.plugin;
}
function webSynth(){ try{ return (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) || null; }catch(_){ return null; } }
/* Web: 端末内の声を優先して選ぶ(無ければ同じ言語のネットの声) */
function pickVoice(synth, tag){
  try{
    var vs = synth.getVoices() || [];
    var t = String(tag).toLowerCase(), pre = t.split('-')[0];
    return vs.filter(function(x){ return x.lang && x.lang.toLowerCase() === t && x.localService; })[0]
        || vs.filter(function(x){ return x.lang && x.lang.toLowerCase() === t; })[0]
        || vs.filter(function(x){ return x.lang && x.lang.toLowerCase().indexOf(pre) === 0; })[0]
        || null;
  }catch(_){ return null; }
}
function speak(text, opts){
  if(!text) return false;
  var o = opts || {};
  var tag = TTS_LANG[o.lang || pref.lang] || 'ja-JP';
  var rate = o.rate || 1;
  var nt = nativeTts();
  if(nt){
    try{
      nt.stop().catch(function(){}).then(function(){
        return nt.speak({ text:String(text), lang:String(tag), rate:rate, pitch:1.0, volume:1.0 });
      }).then(function(){ if(o.onend) o.onend(); }, function(){ if(o.onerror) o.onerror(); });
    }catch(_){ return false; }
    return true;
  }
  var synth = webSynth();
  if(!synth) return false;
  try{
    synth.cancel();
    var u = new SpeechSynthesisUtterance(String(text));
    u.lang = tag; u.rate = rate;
    var v = pickVoice(synth, tag);
    if(v) u.voice = v;
    if(o.onend) u.onend = o.onend;
    /* cancel() で止めたときの interrupted/canceled は失敗ではない */
    if(o.onerror) u.onerror = function(e){ var er = e && e.error; if(er === 'interrupted' || er === 'canceled') return; o.onerror(); };
    synth.speak(u);
    return true;
  }catch(_){ return false; }
}
function stopSpeak(){
  try{ var nt = nativeTts(); if(nt) nt.stop().catch(function(){}); }catch(_){}
  try{ var s = webSynth(); if(s) s.cancel(); }catch(_){}
}
function canSpeak(){ return !!(nativeTts() || webSynth()); }
/* 読み上げに使う声が端末内か(ネットの声=雲マーク用・AACと同じ考え方)。
   { local:true|false } / 声の一覧がまだ無いときは null(分からない)。ネイティブは端末のTTSエンジン=常に端末内 */
function voiceInfo(lang){
  if(nativeTts()) return { local:true };
  var synth = webSynth();
  if(!synth) return null;
  var v = pickVoice(synth, TTS_LANG[lang || pref.lang] || 'ja-JP');
  if(!v) return null;
  return { local: v.localService !== false, name: String(v.name || '') };
}
/* 声の一覧が後から届いたとき(voiceschanged)に、表示中の画面へ知らせる(1画面分だけ・描き直しで外れる) */
var voicesCb = null;
function onVoicesChanged(fn){ voicesCb = (typeof fn === 'function') ? fn : null; }
function watchVoices(){
  var s = webSynth();
  if(!s || typeof s.addEventListener !== 'function') return;
  try{ s.addEventListener('voiceschanged', function(){ if(voicesCb){ try{ voicesCb(); }catch(_){} } }); }catch(_){}
}
/* 無音の振動(Android。iOS Safariでは動かない) */
function vibrate(pattern){
  try{ if(navigator && typeof navigator.vibrate === 'function') return !!navigator.vibrate(pattern || 60); }catch(_){}
  return false;
}

/* ---- 画面(screens/*.js が登録) ---- */
var current = 'home';
function screenApi(){
  return {
    T: T,
    el: el,
    pref: Object.assign({}, pref),      // 読み取り専用スナップショット
    toast: toast,
    go: showScreen,
    Tap: window.Tap,
    Photo: window.Photo || null,
    load: function(k, d){ var v = loadJSON(LS + k); return (v === null) ? ((d === undefined) ? null : d) : v; },
    save: function(k, v){ return saveJSON(LS + k, v); },   // false=容量オーバー等(呼び出し側で通知して取消)
    remove: function(k){ removeKey(LS + k); },
    getExtra: function(k, d){ return (pref.extra[k] === undefined) ? d : pref.extra[k]; },
    setExtra: function(k, v){ pref.extra[k] = v; savePref(); },
    speak: speak, stopSpeak: stopSpeak, canSpeak: canSpeak, voiceInfo: voiceInfo, onVoicesChanged: onVoicesChanged, vibrate: vibrate,
    lang: pref.lang,
    rtl: RTL_LANGS.indexOf(pref.lang) >= 0,
    ver: VER,
    appKey: APP_KEY
  };
}
function renderScreen(id){
  if(id === 'set') return;
  var c = $('scr-' + id);
  if(!c) return;
  c.textContent = '';
  voicesCb = null;   /* 前の描画への知らせを外す */
  var mod = window.SCREENS && window.SCREENS.get(id);
  if(mod){
    try{ mod.render(c, screenApi()); }
    catch(err){ console.error('screen render error:', id, err); c.appendChild(el('p', 'hint', '(screen error: ' + id + ')')); }
  } else {
    c.appendChild(el('p', 'hint', '(未登録の画面: ' + id + ')'));
  }
}
function showScreen(id){
  current = id;
  var secs = document.querySelectorAll('.screen');
  for(var i = 0; i < secs.length; i++){
    secs[i].classList.toggle('hidden', secs[i].getAttribute('data-scr') !== id);
  }
  var navs = document.querySelectorAll('.nav-btn');
  for(var j = 0; j < navs.length; j++){
    navs[j].classList.toggle('active', navs[j].getAttribute('data-scr') === id);
  }
  if(id !== 'set') renderScreen(id);
  try{ if($('main')) $('main').scrollTop = 0; }catch(_){}
}

/* ---- Play版のファイル保存(2026-09-29) ----
   Capacitor 8 の BridgeActivity には DownloadListener が無く、<a download> では何も保存されない(なのに「かきだしました」が出ていた)。
   Play版(isNativePlatform)だけ、端末の一時フォルダ(CACHE)に書いてから Android の共有の画面を出し、保存先は利用者が選ぶ。Web版は今までどおり <a download>。
   🔴 プラグインはネイティブが注入する Capacitor.Plugins.Filesystem / Share を使う(registerPlugin は @capacitor/core の関数で WebView には無い)。
   ・then は受け取った物にそのままつなぐ(Promise で包まない。_smoke_app.js の同期の偽物で確かめられるように) */
function isNativeApp(){
  try{ var c = window.Capacitor; return !!(c && typeof c.isNativePlatform === 'function' && c.isNativePlatform()); }catch(_){ return false; }
}
function nativePlugin(name, fn){
  try{
    var c = window.Capacitor;
    if(typeof c.isPluginAvailable === 'function' && !c.isPluginAvailable(name)) return null;
    var p = c.Plugins && c.Plugins[name];
    return (p && typeof p[fn] === 'function') ? p : null;
  }catch(_){ return null; }
}
/* 利用者が共有の画面を閉じた("Share canceled")・もう出ている("...in progress")ときは何も出さない */
function shareQuiet(err){
  var m = String((err && (err.message || err.errorMessage)) || err || '');
  return !!err && (err.name === 'AbortError' || /cancel|in progress/i.test(m));
}
/* name=ファイル名 / data=中身(utf8=true なら文字・false なら base64) / label=共有の画面の題
   done('ok')=送り先を選べた / done('quiet')=閉じた / done('fail')=書けない・共有できない・プラグインが無い */
function nativeSaveFile(name, data, utf8, label, done){
  var fsp = nativePlugin('Filesystem', 'writeFile'), shp = nativePlugin('Share', 'share');
  if(!fsp || !shp){ done('fail'); return; }
  var opt = { path:name, data:data, directory:'CACHE' };
  if(utf8) opt.encoding = 'utf8';
  var w;
  try{ w = fsp.writeFile(opt); }catch(_){ done('fail'); return; }
  if(!w || typeof w.then !== 'function'){ done('fail'); return; }
  w.then(function(r){
    if(!r || !r.uri){ done('fail'); return; }
    var s;
    try{ s = shp.share({ title:name, files:[r.uri], dialogTitle:label }); }catch(err){ done(shareQuiet(err) ? 'quiet' : 'fail'); return; }
    if(s && typeof s.then === 'function') s.then(function(){ done('ok'); }, function(err){ done(shareQuiet(err) ? 'quiet' : 'fail'); });
    else done('ok');
  }, function(){ done('fail'); });
}

/* ---- 機種変更(バックアップ): このアプリの保存キー全部を1ファイルに ---- */
function exportBackup(){
  var data = { app: APP_KEY, ver: 1, exported: Date.now(), pref: pref, data: {} };
  try{
    for(var i = 0; i < localStorage.length; i++){
      var k = localStorage.key(i);
      if(k && k.indexOf(LS) === 0 && k !== LS_PREF) data.data[k.slice(LS.length)] = loadJSON(k);
    }
  }catch(_){}
  var d = new Date();
  var fname = APP_KEY + '-backup-' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '.json';
  /* Play版(2026-09-29): 一時フォルダに書いて共有の画面へ。選べたら「かきだしました」・閉じたら何も出さない・書けなければ「ほぞんできませんでした」 */
  if(isNativeApp()){
    nativeSaveFile(fname, JSON.stringify(data), true, T('set.bkExport'), function(r){
      if(r === 'ok') toast(T('set.exported'));
      else if(r === 'fail') toast(T('common.saveFail'));
    });
    return;
  }
  var blob = new Blob([JSON.stringify(data)], { type:'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fname;
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 3000);
  toast(T('set.exported'));
}
/* 置き換える前の確かめ(Play版の WebView もネイティブのダイアログで出す)。出せない環境では置き換えない */
function askConfirm(msg){
  try{ return typeof window.confirm === 'function' && window.confirm(msg) === true; }catch(_){ return false; }
}
/* このアプリの保存キー(yomu.)を全部 { キー: 生の文字列 } で控える(失敗したときに戻す用) */
function snapshotOwn(){
  var s = {};
  for(var i = 0; i < localStorage.length; i++){ var k = localStorage.key(i); if(k && k.indexOf(LS) === 0) s[k] = localStorage.getItem(k); }
  return s;
}
function removeOwnExcept(keep){
  var ks = Object.keys(snapshotOwn());
  for(var i = 0; i < ks.length; i++){ if(!keep || !Object.prototype.hasOwnProperty.call(keep, ks[i])) removeKey(ks[i]); }
}
function importBackup(e){
  var f = e.target.files && e.target.files[0];
  if(!f) return;
  var r = new FileReader();
  r.onload = function(){
    /* 1. 形の確かめ(このアプリのファイルか)。違えば確かめを出さずに「よみこめませんでした」 */
    var d = null;
    try{
      d = JSON.parse(r.result);
      if(!d || d.app !== APP_KEY) throw new Error('different app');
    }catch(err){ toast(T('set.importFail')); return; }
    /* 2. 置き換える前に確かめる。やめたら何も変えない */
    if(!askConfirm(T('set.importConfirm'))) return;
    /* 3. 丸ごと入れ替え: ファイルに無い このアプリの保存キー(yomu.)は消してから、ファイルの中身を書く。
          ほかのアプリのキーには触らない。途中で書けなかったら(容量など)元に戻す */
    var before = null;
    try{
      before = snapshotOwn();
      var data = (d.data && typeof d.data === 'object' && !Array.isArray(d.data)) ? d.data : {};
      var keep = {}; keep[LS_PREF] = true;
      for(var k in data){ if(Object.prototype.hasOwnProperty.call(data, k)) keep[LS + k] = true; }
      removeOwnExcept(keep);
      for(var k2 in data){ if(Object.prototype.hasOwnProperty.call(data, k2) && !saveJSON(LS + k2, data[k2])) throw new Error('save failed'); }
      pref = sanitizePref(d.pref);
      if(!saveJSON(LS_PREF, pref)) throw new Error('save failed');
      applyAll(true);
      toast(T('set.imported'));
    }catch(err){
      if(before){
        try{ removeOwnExcept(null); for(var b in before){ localStorage.setItem(b, before[b]); } }catch(_){}
        pref = sanitizePref(loadJSON(LS_PREF));
        try{ applyAll(false); }catch(_){}
      }
      toast(T('set.importFail'));
    }
  };
  r.readAsText(f);
  e.target.value = '';
}

/* ---- トースト ---- */
var toastTimer = 0;
function toast(msg){
  var t = $('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 1800);
}

/* ---- 初期化 ---- */
function init(){
  var navs = document.querySelectorAll('.nav-btn');
  for(var i = 0; i < navs.length; i++){
    (function(b){ Tap.bind(b, function(){ showScreen(b.getAttribute('data-scr')); }); })(navs[i]);
  }
  Tap.bind($('hd-title'), function(){ showScreen('home'); });   // 名前タップ=いつでもホームへ

  Tap.bind($('btn-fs'), function(){ pref.fs = (pref.fs + 1) % 3; applyBodyClass(); savePref(); applyI18n(); });
  Tap.bind($('btn-theme'), function(){ pref.theme = next(THEMES, pref.theme); applyTheme(); savePref(); applyI18n(); });
  Tap.bind($('btn-bgm'), function(){ pref.bgm = next(BGMS, pref.bgm); applySound(true); savePref(); applyI18n(); });
  Tap.bind($('btn-sound'), function(){ pref.sound = !pref.sound; Sound.setEnabled(pref.sound); savePref(); applyI18n(); });
  if($('set-lang')) $('set-lang').addEventListener('change', function(){ pref.lang = $('set-lang').value; savePref(); applyI18n(); });
  Tap.bind($('bk-export'), exportBackup);
  Tap.bind($('bk-import'), function(){ $('bk-file').click(); });
  if($('bk-file')) $('bk-file').addEventListener('change', importBackup);

  applyAll(false);
  watchVoices();
  showScreen('home');

  applyBarSpace();
  watchBarSpace();
  if(typeof window !== 'undefined' && window.addEventListener){
    window.addEventListener('load', applyBarSpace);
    window.addEventListener('resize', applyBarSpace);
    window.addEventListener('orientationchange', applyBarSpace);
  }

  /* Service Worker: 本番httpsのみ登録。localhost(開発プレビュー/Capacitor WebView)は登録せず既存も消す
     =「更新しても前の版が出る」事故の恒久対策 */
  if(typeof navigator !== 'undefined' && 'serviceWorker' in navigator){
    var isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    if(/^https:/.test(location.protocol) && !isLocal){
      try{ navigator.serviceWorker.register('sw.js'); }catch(_){}
    } else {
      try{ navigator.serviceWorker.getRegistrations().then(function(rs){ rs.forEach(function(r){ r.unregister(); }); }).catch(function(){}); }catch(_){}
      try{ if(window.caches && caches.keys) caches.keys().then(function(ks){ ks.forEach(function(k){ caches.delete(k); }); }).catch(function(){}); }catch(_){}
    }
  }
}

/* デバッグ・スクショ用の最小の窓口 */
window.App = { VER: VER, T: T, go: showScreen, toast: toast, pref: function(){ return Object.assign({}, pref); }, api: screenApi };

init();

})();
