/* 読み書きの作業台・そよぎ 多言語テーブル(そよぎアプリ・キット v1・12言語)
   ・window.YOMU_I18N = { ja, en, de, fr, es, it, pt, nl, sv, ko, zh, ar }
   ・キー構造は全言語で完全一致(_check.js が ja を正として構造・配列要素数を機械照合)
   ・🔴 BUILDER: 文言は ja と en の両方に同じキーで足す。画面固有は screen.<画面id>.* に置く。
     de〜ar の10言語は、翻訳Workflowで差し替えるまで en を自動で流用する(末尾の仮置き)
   ・{n} などのプレースホルダは app.js/screens が実値に差し替える(訳文でも記号のまま残す)
   ・set.lang は言語切替ラベルなので全言語 'ことば / Language' 固定
   ・ar は RTL。app.js が document.dir='rtl' にする
   ・ひらがな: 本人が読む操作文言はひらがな主体。相手に見せる文(みせる画面等)は漢字で曖昧さを消す */
(function(){
'use strict';

/* ============ ja(正) ============ */
var ja = {
  app: { name:'読み書きの作業台・そよぎ', short:'読み書きの作業台', tagline:'読みやすい形を自分で決めて、1行ずつ読む。' },
  nav: { home:'ホーム', mikurabe:'みくらべ', yomu:'よむ', set:'せってい' },
  common: {
    ok:'OK', cancel:'やめる', save:'ほぞんする', del:'けす', back:'もどる', close:'とじる',
    yes:'はい', no:'いいえ', add:'ついか', edit:'なおす', next:'つぎ', prev:'まえ', done:'できた',
    saved:'ほぞんしました ✓', saveFail:'ほぞんできませんでした', storageFull:'いっぱいで ほぞんできません',
    deleted:'けしました', delConfirm:'ほんとうに けしますか?', empty:'まだ なにも ありません',
    optional:'ぜんぶ 書かなくても だいじょうぶです。', today:'きょう',
    photo: {
      camera:'カメラで とる', roll:'しゃしんから えらぶ',
      cropTitle:'しゃしんを 切りとる', cropHint:'ゆびで うごかすか、やじるしで あわせて、スライダーで 大きさを かえます。',
      zoom:'大きさ', panUp:'うえへ', panDown:'したへ', panLeft:'ひだりへ', panRight:'みぎへ',
      make:'これで きめる', fail:'しゃしんを よみこめませんでした'
    }
  },
  set: {
    hNormal:'ふだんの せってい',
    hBackup:'きしゅへんこう(バックアップ)',
    fs:'もじの大きさ', fsSizes:['ふつう','大きい','とても大きい'],
    lang:'ことば / Language',
    theme:'いろ', themes:['みどり','みずいろ','しろ','くろ'],
    bgm:'BGM', bgms:['なし','みどりの音','あおの音'],
    sound:'タップ音', on:'ON', off:'OFF',
    bkHint:'あたらしい スマホに うつるときは、「かきだす」で ファイルを ほぞんして、あたらしい スマホで「よみこむ」を おしてください。',
    bkExport:'かきだす', bkImport:'よみこむ',
    exported:'かきだしました ✓', imported:'よみこみました ✓', importFail:'よみこめませんでした',
    importConfirm:'いまの ないようは、ファイルの ないように おきかわります。よみこみますか?',
    note:'書いたことは すべて この端末の中だけに ほぞんされます。どこにも 送られません。',
    privacy:'プライバシーポリシー',
    credit:'アプリ開発：介護と支援の相談どころ そよぎ',
    fontCredit:'書体：BIZ UDPゴシック(Copyright 2022 The BIZ UDGothic Project Authors)。SIL Open Font License 1.1。ライセンスの全文は アプリの中の fonts/OFL.txt にあります。'
  },
  screen: {
    home: {
      title:'読み書きの作業台',
      mikurabe:'みくらべる',
      mikurabeSub:'もじの 形・あいだ・いろ・大きさを えらんで、読み方プロフィールに ほぞん',
      yomu:'よむ',
      yomuSub:'はりつけた 文章を、1行ずつ 明るくして よむ',
      note:'はりつけた文も、えらんだ形も、この端末の中だけに のこります。どこにも 送られません。'
    },
    /* 見比べ=同じ見本文を書体・字間・行間・背景色・大きさで切り替えて見比べ、読み方プロフィールとして保存 */
    mikurabe: {
      title:'みくらべる',
      hint:'「この形で ほぞんする」を おすと、「よむ」の画面で この形に なります。',
      sample:['読みやすい形は、人によって違います。','書体や行間を変えて、自分に合うものを選べます。','選んだ形は、この端末の中だけに残ります。'],
      font:'しょたい(書体)', fonts:['BIZ UDPゴシック','明朝','まるい ゴシック(端末による)'],
      spacing:'じかん(字と字の あいだ)', spacings:['ふつう','すこし ひろい','ひろい'],
      lh:'ぎょうかん(行と行の あいだ)', lhs:['1.6','2.0','2.4'],
      bg:'はいけいの いろ', bgs:['しろ','きなり(クリームいろ)','うすい はいいろ','くろ'],
      size:'もじの大きさ', sizes:['ふつう','大きい','とても大きい'],
      save:'この形で ほぞんする',
      unsaved:'まだ ほぞんしていません',
      reset:'はじめの形に もどす',
      saved:'読み方プロフィールを ほぞんしました ✓',
      resetDone:'はじめの形に もどしました',
      profile:'読み方プロフィール'
    },
    /* 読む=貼り付けた文章を読み方プロフィールで1行ずつ表示。今読む行だけ明るく。読み上げ・休憩の合図 */
    yomu: {
      title:'よむ',
      pasteLabel:'よみたい 文章',
      placeholder:'ここに 文章を はりつけてください',
      pasteHint:'はりつけた文は この端末の中だけに のこります。じぶんで 書いた文を はりつけて、聞いて たしかめることも できます。',
      start:'この文で よむ',
      emptyText:'文が まだ ありません',
      change:'文を かえる',
      prev:'まえ', next:'つぎ',
      speak:'よみあげ', stop:'とめる',
      noSpeak:'この端末では 読み上げできません',
      speakFail:'よみあげ できませんでした',
      cloudNote:'☁ は ネットの 声です。よむ文が 声の会社に 送られる ことが あります。',
      lineOf:'{a} 行目 / ぜんぶで {b} 行',
      tapLineHint:'行を タップすると、そこから よめます。',
      breakLabel:'ひとやすみの めやす',
      breakOpts:['なし','5分','10分','15分','20分'],
      breakBand:'ひとやすみ',
      breakSub:'きめた 時間に なりました。いそがなくて だいじょうぶです。',
      breakGo:'つづける',
      breakSet:'ひとやすみの めやすを {m} に しました',
      breakOff:'ひとやすみの めやすを なしに しました',
      profileHint:'形は「みくらべ」で かえられます。'
    }
  }
};

/* ============ en ============ */
var en = {
  app: { name:'Text Workbench - SOYOGI', short:'Text Workbench', tagline:'Choose the shape that reads best for you, then read one line at a time.' },
  nav: { home:'Home', mikurabe:'Compare', yomu:'Read', set:'Settings' },
  common: {
    ok:'OK', cancel:'Cancel', save:'Save', del:'Delete', back:'Back', close:'Close',
    yes:'Yes', no:'No', add:'Add', edit:'Edit', next:'Next', prev:'Previous', done:'Done',
    saved:'Saved ✓', saveFail:'Could not save', storageFull:'Storage is full, could not save',
    deleted:'Deleted', delConfirm:'Really delete this?', empty:'Nothing here yet',
    optional:'You do not have to fill in everything.', today:'Today',
    photo: {
      camera:'Take a photo', roll:'Choose from photos',
      cropTitle:'Crop the photo', cropHint:'Drag with a finger or use the arrows, then change the size with the slider.',
      zoom:'Size', panUp:'Up', panDown:'Down', panLeft:'Left', panRight:'Right',
      make:'Use this', fail:'Could not load the photo'
    }
  },
  set: {
    hNormal:'Everyday settings',
    hBackup:'Changing phones (backup)',
    fs:'Text size', fsSizes:['Normal','Large','Very large'],
    lang:'ことば / Language',
    theme:'Color', themes:['Green','Light blue','White','Black'],
    bgm:'Music', bgms:['None','Green tone','Blue tone'],
    sound:'Tap sound', on:'ON', off:'OFF',
    bkHint:'When you move to a new phone, tap "Export" to save a file, then tap "Import" on the new phone.',
    bkExport:'Export', bkImport:'Import',
    exported:'Exported ✓', imported:'Imported ✓', importFail:'Could not import',
    importConfirm:'Your current entries will be replaced with the file\'s contents. Import it?',
    note:'Everything you write is stored only on this device. Nothing is sent anywhere.',
    privacy:'Privacy policy',
    credit:'Developed by SOYOGI, a care and support consultation service',
    fontCredit:'Typeface: BIZ UDPGothic (Copyright 2022 The BIZ UDGothic Project Authors), SIL Open Font License 1.1. The full license is in fonts/OFL.txt inside the app.'
  },
  screen: {
    home: {
      title:'Text Workbench',
      mikurabe:'Compare',
      mikurabeSub:'Choose typeface, letter spacing, line spacing, background and size, and save them as your reading profile',
      yomu:'Read',
      yomuSub:'Paste a text and read it one line at a time, with the current line highlighted',
      note:'The text you paste and the shape you choose stay only on this device. Nothing is sent anywhere.'
    },
    mikurabe: {
      title:'Compare',
      hint:'Tap "Save this shape" and the Read screen will use this shape.',
      sample:['What is easy to read differs from person to person.','Change the typeface and spacing to find what suits you.','The shape you choose stays only on this device.'],
      font:'Typeface', fonts:['BIZ UDPGothic','Serif','Rounded (depends on device)'],
      spacing:'Letter spacing', spacings:['Normal','A little wide','Wide'],
      lh:'Line spacing', lhs:['1.6','2.0','2.4'],
      bg:'Background', bgs:['White','Cream','Light gray','Black'],
      size:'Text size', sizes:['Normal','Large','Very large'],
      save:'Save this shape',
      unsaved:'Not saved yet',
      reset:'Back to the first shape',
      saved:'Reading profile saved ✓',
      resetDone:'Back to the first shape',
      profile:'Reading profile'
    },
    yomu: {
      title:'Read',
      pasteLabel:'Text to read',
      placeholder:'Paste your text here',
      pasteHint:'The pasted text stays only on this device. You can also paste something you wrote and listen to check it.',
      start:'Read this text',
      emptyText:'There is no text yet',
      change:'Change the text',
      prev:'Previous', next:'Next',
      speak:'Read aloud', stop:'Stop',
      noSpeak:'Reading aloud is not available on this device',
      speakFail:'Could not read aloud',
      cloudNote:'☁ means an online voice. The text being read may be sent to the company that provides the voice.',
      lineOf:'Line {a} of {b}',
      tapLineHint:'Tap a line to read from there.',
      breakLabel:'Break reminder',
      breakOpts:['None','5 min','10 min','15 min','20 min'],
      breakBand:'Take a break',
      breakSub:'The time you chose has passed. There is no hurry.',
      breakGo:'Continue',
      breakSet:'Break reminder set to {m}',
      breakOff:'Break reminder turned off',
      profileHint:'You can change the shape on the Compare screen.'
    }
  }
};

var TBL = { ja: ja, en: en };
/* 翻訳の差し込み用: en の複製に訳を重ねる(足りないキーは en のまま) */
function mergeDeep(t, s){ for(var k in s){ if(s[k] && typeof s[k] === 'object' && !Array.isArray(s[k])){ if(!t[k] || typeof t[k] !== 'object') t[k] = {}; mergeDeep(t[k], s[k]); } else t[k] = s[k]; } return t; }
/* ---- de: 翻訳 ---- */
TBL.de = mergeDeep(JSON.parse(JSON.stringify(en)), {
  "app": {
    "name": "Textwerkbank - SOYOGI",
    "short": "Textwerkbank",
    "tagline": "Wählen Sie selbst, wie sich Text für Sie gut lesen lässt, und lesen Sie Zeile für Zeile."
  },
  "nav": {
    "home": "Start",
    "mikurabe": "Vergleichen",
    "yomu": "Lesen",
    "set": "Einstellungen"
  },
  "common": {
    "ok": "OK",
    "cancel": "Abbrechen",
    "save": "Speichern",
    "del": "Löschen",
    "back": "Zurück",
    "close": "Schließen",
    "yes": "Ja",
    "no": "Nein",
    "add": "Hinzufügen",
    "edit": "Bearbeiten",
    "next": "Weiter",
    "prev": "Vorherige",
    "done": "Fertig",
    "saved": "Gespeichert ✓",
    "saveFail": "Speichern war nicht möglich",
    "storageFull": "Der Speicher ist voll. Speichern ist nicht möglich",
    "deleted": "Gelöscht",
    "delConfirm": "Wirklich löschen?",
    "empty": "Noch nichts vorhanden",
    "optional": "Sie müssen nicht alles ausfüllen.",
    "today": "Heute",
    "photo": {
      "camera": "Foto aufnehmen",
      "roll": "Aus Fotos auswählen",
      "cropTitle": "Foto zuschneiden",
      "cropHint": "Verschieben Sie das Foto mit dem Finger oder mit den Pfeilen und ändern Sie die Größe mit dem Schieberegler.",
      "zoom": "Größe",
      "panUp": "Nach oben",
      "panDown": "Nach unten",
      "panLeft": "Nach links",
      "panRight": "Nach rechts",
      "make": "Übernehmen",
      "fail": "Das Foto konnte nicht geladen werden"
    }
  },
  "set": {
    "hNormal": "Allgemeine Einstellungen",
    "hBackup": "Gerätewechsel (Sicherung)",
    "fs": "Schriftgröße",
    "fsSizes": [
      "Normal",
      "Groß",
      "Sehr groß"
    ],
    "lang": "ことば / Language",
    "theme": "Farbe",
    "themes": [
      "Grün",
      "Hellblau",
      "Weiß",
      "Schwarz"
    ],
    "bgm": "Musik",
    "bgms": [
      "Keine",
      "Grüner Klang",
      "Blauer Klang"
    ],
    "sound": "Tippton",
    "on": "EIN",
    "off": "AUS",
    "bkHint": "Wenn Sie auf ein neues Smartphone wechseln, speichern Sie mit „Exportieren“ eine Datei und tippen Sie dann auf dem neuen Smartphone auf „Importieren“.",
    "bkExport": "Exportieren",
    "bkImport": "Importieren",
    "exported": "Exportiert ✓",
    "imported": "Importiert ✓",
    "importFail": "Importieren war nicht möglich",
    "importConfirm": "Ihre aktuellen Inhalte werden durch den Inhalt der Datei ersetzt. Möchten Sie importieren?",
    "note": "Alles, was Sie schreiben, wird nur auf diesem Gerät gespeichert. Nichts wird irgendwohin gesendet.",
    "privacy": "Datenschutzerklärung",
    "credit": "Entwickelt von SOYOGI, einer Beratungsstelle für Pflege und Unterstützung",
    "fontCredit": "Schrift: BIZ UDPGothic (Copyright 2022 The BIZ UDGothic Project Authors), SIL Open Font License 1.1. Den vollständigen Lizenztext finden Sie in der App unter fonts/OFL.txt."
  },
  "screen": {
    "home": {
      "title": "Textwerkbank",
      "mikurabe": "Vergleichen",
      "mikurabeSub": "Schriftart, Zeichenabstand, Zeilenabstand, Hintergrund und Größe wählen und als Leseprofil speichern",
      "yomu": "Lesen",
      "yomuSub": "Eingefügten Text Zeile für Zeile lesen, mit hervorgehobener aktueller Zeile",
      "note": "Der eingefügte Text und die gewählte Darstellung bleiben nur auf diesem Gerät. Nichts wird irgendwohin gesendet."
    },
    "mikurabe": {
      "title": "Vergleichen",
      "hint": "Wenn Sie auf „Diese Darstellung speichern“ tippen, wird diese Darstellung auf dem Bildschirm „Lesen“ verwendet.",
      "sample": [
        "Was gut lesbar ist, ist von Mensch zu Mensch verschieden.",
        "Sie können Schriftart und Zeilenabstand ändern und wählen, was zu Ihnen passt.",
        "Die gewählte Darstellung bleibt nur auf diesem Gerät."
      ],
      "font": "Schriftart",
      "fonts": [
        "BIZ UDPGothic",
        "Mit Serifen",
        "Abgerundet (je nach Gerät)"
      ],
      "spacing": "Zeichenabstand",
      "spacings": [
        "Normal",
        "Etwas weiter",
        "Weit"
      ],
      "lh": "Zeilenabstand",
      "lhs": [
        "1.6",
        "2.0",
        "2.4"
      ],
      "bg": "Hintergrundfarbe",
      "bgs": [
        "Weiß",
        "Creme",
        "Hellgrau",
        "Schwarz"
      ],
      "size": "Schriftgröße",
      "sizes": [
        "Normal",
        "Groß",
        "Sehr groß"
      ],
      "save": "Diese Darstellung speichern",
      "unsaved": "Noch nicht gespeichert",
      "reset": "Zurücksetzen",
      "saved": "Leseprofil gespeichert ✓",
      "resetDone": "Auf die erste Darstellung zurückgesetzt",
      "profile": "Leseprofil"
    },
    "yomu": {
      "title": "Lesen",
      "pasteLabel": "Text zum Lesen",
      "placeholder": "Fügen Sie hier Ihren Text ein",
      "pasteHint": "Der eingefügte Text bleibt nur auf diesem Gerät. Sie können auch einen selbst geschriebenen Text einfügen und ihn zur Kontrolle anhören.",
      "start": "Diesen Text lesen",
      "emptyText": "Noch kein Text vorhanden",
      "change": "Text ändern",
      "prev": "Vorherige",
      "next": "Nächste",
      "speak": "Vorlesen",
      "stop": "Stopp",
      "noSpeak": "Vorlesen ist auf diesem Gerät nicht möglich",
      "speakFail": "Vorlesen war nicht möglich",
      "cloudNote": "☁ bedeutet eine Online-Stimme. Der vorgelesene Text kann an den Anbieter der Stimme gesendet werden.",
      "lineOf": "Zeile {a} von {b}",
      "tapLineHint": "Tippen Sie auf eine Zeile, um ab dort zu lesen.",
      "breakLabel": "Pausen-Erinnerung",
      "breakOpts": [
        "Keine",
        "5 Min.",
        "10 Min.",
        "15 Min.",
        "20 Min."
      ],
      "breakBand": "Kurze Pause",
      "breakSub": "Die gewählte Zeit ist erreicht. Sie müssen sich nicht beeilen.",
      "breakGo": "Weiter",
      "breakSet": "Pausen-Erinnerung auf {m} gestellt",
      "breakOff": "Pausen-Erinnerung ausgeschaltet",
      "profileHint": "Die Darstellung können Sie unter „Vergleichen“ ändern."
    }
  }
});
/* ---- /de ---- */
/* ---- fr: 翻訳 ---- */
TBL.fr = mergeDeep(JSON.parse(JSON.stringify(en)), {
  "app": {
    "name": "Atelier de texte - SOYOGI",
    "short": "Atelier de texte",
    "tagline": "Choisissez l'affichage qui vous convient, puis lisez une ligne à la fois."
  },
  "nav": {
    "home": "Accueil",
    "mikurabe": "Comparer",
    "yomu": "Lire",
    "set": "Réglages"
  },
  "common": {
    "ok": "OK",
    "cancel": "Annuler",
    "save": "Enregistrer",
    "del": "Supprimer",
    "back": "Retour",
    "close": "Fermer",
    "yes": "Oui",
    "no": "Non",
    "add": "Ajouter",
    "edit": "Modifier",
    "next": "Suivant",
    "prev": "Précédent",
    "done": "Terminé",
    "saved": "Enregistré ✓",
    "saveFail": "Impossible d'enregistrer",
    "storageFull": "Mémoire pleine, impossible d'enregistrer",
    "deleted": "Supprimé",
    "delConfirm": "Voulez-vous vraiment supprimer ?",
    "empty": "Rien pour l'instant",
    "optional": "Vous n'avez pas besoin de tout remplir.",
    "today": "Aujourd'hui",
    "photo": {
      "camera": "Prendre une photo",
      "roll": "Choisir dans les photos",
      "cropTitle": "Recadrer la photo",
      "cropHint": "Déplacez avec le doigt ou avec les flèches, puis changez la taille avec le curseur.",
      "zoom": "Taille",
      "panUp": "Haut",
      "panDown": "Bas",
      "panLeft": "Gauche",
      "panRight": "Droite",
      "make": "Valider",
      "fail": "Impossible de charger la photo"
    }
  },
  "set": {
    "hNormal": "Réglages habituels",
    "hBackup": "Changer de téléphone (sauvegarde)",
    "fs": "Taille du texte",
    "fsSizes": [
      "Normale",
      "Grande",
      "Très grande"
    ],
    "lang": "ことば / Language",
    "theme": "Couleur",
    "themes": [
      "Vert",
      "Bleu clair",
      "Blanc",
      "Noir"
    ],
    "bgm": "Musique",
    "bgms": [
      "Aucune",
      "Ambiance verte",
      "Ambiance bleue"
    ],
    "sound": "Son au toucher",
    "on": "ON",
    "off": "OFF",
    "bkHint": "Pour passer à un nouveau téléphone, appuyez sur \"Exporter\" pour enregistrer un fichier, puis appuyez sur \"Importer\" sur le nouveau téléphone.",
    "bkExport": "Exporter",
    "bkImport": "Importer",
    "exported": "Exporté ✓",
    "imported": "Importé ✓",
    "importFail": "Impossible d'importer",
    "importConfirm": "Le contenu actuel sera remplacé par celui du fichier. Voulez-vous importer ?",
    "note": "Tout ce que vous écrivez est enregistré uniquement sur cet appareil. Rien n'est envoyé ailleurs.",
    "privacy": "Politique de confidentialité",
    "credit": "Application développée par SOYOGI, service de conseil en soins et en accompagnement",
    "fontCredit": "Police : BIZ UDPGothic (Copyright 2022 The BIZ UDGothic Project Authors), SIL Open Font License 1.1. Le texte complet de la licence se trouve dans l'application, dans fonts/OFL.txt."
  },
  "screen": {
    "home": {
      "title": "Atelier de texte",
      "mikurabe": "Comparer",
      "mikurabeSub": "Choisissez la police, l'espacement des lettres, l'interligne, le fond et la taille, puis enregistrez-les dans votre profil de lecture",
      "yomu": "Lire",
      "yomuSub": "Collez un texte et lisez-le ligne par ligne, avec la ligne en cours mise en évidence",
      "note": "Le texte collé et l'affichage choisi restent uniquement sur cet appareil. Rien n'est envoyé ailleurs."
    },
    "mikurabe": {
      "title": "Comparer",
      "hint": "Touchez \"Enregistrer cet affichage\" pour utiliser cet affichage sur l'écran \"Lire\".",
      "sample": [
        "Ce qui est facile à lire change d'une personne à l'autre.",
        "Vous pouvez changer la police et l'interligne pour choisir ce qui vous convient.",
        "L'affichage choisi reste uniquement sur cet appareil."
      ],
      "font": "Police",
      "fonts": [
        "BIZ UDPGothic",
        "Avec empattements",
        "Arrondie (selon l'appareil)"
      ],
      "spacing": "Espacement des lettres",
      "spacings": [
        "Normal",
        "Un peu large",
        "Large"
      ],
      "lh": "Interligne",
      "lhs": [
        "1,6",
        "2,0",
        "2,4"
      ],
      "bg": "Couleur du fond",
      "bgs": [
        "Blanc",
        "Crème",
        "Gris clair",
        "Noir"
      ],
      "size": "Taille du texte",
      "sizes": [
        "Normale",
        "Grande",
        "Très grande"
      ],
      "save": "Enregistrer cet affichage",
      "unsaved": "Pas encore enregistré",
      "reset": "Revenir à l'affichage de départ",
      "saved": "Profil de lecture enregistré ✓",
      "resetDone": "Affichage de départ rétabli",
      "profile": "Profil de lecture"
    },
    "yomu": {
      "title": "Lire",
      "pasteLabel": "Texte à lire",
      "placeholder": "Collez votre texte ici",
      "pasteHint": "Le texte collé reste uniquement sur cet appareil. Vous pouvez aussi coller un texte que vous avez écrit et l'écouter pour le vérifier.",
      "start": "Lire ce texte",
      "emptyText": "Il n'y a pas encore de texte",
      "change": "Changer de texte",
      "prev": "Précédent",
      "next": "Suivant",
      "speak": "Lire à voix haute",
      "stop": "Arrêter",
      "noSpeak": "La lecture à voix haute n'est pas disponible sur cet appareil",
      "speakFail": "Impossible de lire à voix haute",
      "cloudNote": "☁ indique une voix en ligne. Le texte lu peut être envoyé à l'entreprise qui fournit la voix.",
      "lineOf": "Ligne {a} sur {b}",
      "tapLineHint": "Touchez une ligne pour lire à partir de là.",
      "breakLabel": "Rappel de pause",
      "breakOpts": [
        "Aucun",
        "5 min",
        "10 min",
        "15 min",
        "20 min"
      ],
      "breakBand": "Petite pause",
      "breakSub": "Le temps que vous avez choisi est écoulé. Rien ne presse.",
      "breakGo": "Continuer",
      "breakSet": "Rappel de pause réglé sur {m}",
      "breakOff": "Rappel de pause désactivé",
      "profileHint": "Vous pouvez changer l'affichage sur l'écran \"Comparer\"."
    }
  }
});
/* ---- /fr ---- */
/* ---- es: 翻訳 ---- */
TBL.es = mergeDeep(JSON.parse(JSON.stringify(en)), {
  "app": {
    "name": "Taller de textos - SOYOGI",
    "short": "Taller de textos",
    "tagline": "Elegir la forma más cómoda de leer y leer línea por línea."
  },
  "nav": {
    "home": "Inicio",
    "mikurabe": "Comparar",
    "yomu": "Leer",
    "set": "Ajustes"
  },
  "common": {
    "ok": "OK",
    "cancel": "Cancelar",
    "save": "Guardar",
    "del": "Borrar",
    "back": "Volver",
    "close": "Cerrar",
    "yes": "Sí",
    "no": "No",
    "add": "Agregar",
    "edit": "Editar",
    "next": "Siguiente",
    "prev": "Anterior",
    "done": "Listo",
    "saved": "Guardado ✓",
    "saveFail": "No se pudo guardar",
    "storageFull": "No hay espacio para guardar",
    "deleted": "Borrado",
    "delConfirm": "¿Borrar de verdad?",
    "empty": "Todavía no hay nada",
    "optional": "No hace falta completarlo todo.",
    "today": "Hoy",
    "photo": {
      "camera": "Tomar una foto",
      "roll": "Elegir de las fotos",
      "cropTitle": "Recortar la foto",
      "cropHint": "Mover con el dedo o con las flechas, y cambiar el tamaño con el control deslizante.",
      "zoom": "Tamaño",
      "panUp": "Arriba",
      "panDown": "Abajo",
      "panLeft": "Izquierda",
      "panRight": "Derecha",
      "make": "Usar esta",
      "fail": "No se pudo cargar la foto"
    }
  },
  "set": {
    "hNormal": "Ajustes habituales",
    "hBackup": "Cambio de teléfono (copia de seguridad)",
    "fs": "Tamaño del texto",
    "fsSizes": [
      "Normal",
      "Grande",
      "Muy grande"
    ],
    "lang": "ことば / Language",
    "theme": "Color",
    "themes": [
      "Verde",
      "Azul claro",
      "Blanco",
      "Negro"
    ],
    "bgm": "Música",
    "bgms": [
      "Ninguna",
      "Sonido verde",
      "Sonido azul"
    ],
    "sound": "Sonido al tocar",
    "on": "ON",
    "off": "OFF",
    "bkHint": "Para pasar a un teléfono nuevo: guardar un archivo con \"Exportar\" y, en el teléfono nuevo, tocar \"Importar\".",
    "bkExport": "Exportar",
    "bkImport": "Importar",
    "exported": "Exportado ✓",
    "imported": "Importado ✓",
    "importFail": "No se pudo importar",
    "importConfirm": "El contenido actual se sustituirá por el del archivo. ¿Importar?",
    "note": "Todo lo que se escribe se guarda solo en este dispositivo. No se envía a ningún lugar.",
    "privacy": "Política de privacidad",
    "credit": "App desarrollada por SOYOGI, servicio de consulta sobre cuidados y apoyo",
    "fontCredit": "Tipo de letra: BIZ UDPGothic (Copyright 2022 The BIZ UDGothic Project Authors), SIL Open Font License 1.1. El texto completo de la licencia está en fonts/OFL.txt, dentro de la app."
  },
  "screen": {
    "home": {
      "title": "Taller de textos",
      "mikurabe": "Comparar",
      "mikurabeSub": "Elegir tipo de letra, espacio entre letras, espacio entre líneas, fondo y tamaño, y guardarlos en el perfil de lectura",
      "yomu": "Leer",
      "yomuSub": "Leer un texto pegado línea por línea, con la línea actual resaltada",
      "note": "El texto pegado y la forma elegida se quedan solo en este dispositivo. No se envían a ningún lugar."
    },
    "mikurabe": {
      "title": "Comparar",
      "hint": "Toque \"Guardar esta forma\" y la pantalla \"Leer\" usará esta forma.",
      "sample": [
        "Lo que resulta fácil de leer cambia según la persona.",
        "Se puede cambiar el tipo de letra y el espacio entre líneas para elegir lo más cómodo.",
        "La forma elegida se queda solo en este dispositivo."
      ],
      "font": "Tipo de letra",
      "fonts": [
        "BIZ UDPGothic",
        "Con serifa",
        "Redondeada (según el dispositivo)"
      ],
      "spacing": "Espacio entre letras",
      "spacings": [
        "Normal",
        "Un poco amplio",
        "Amplio"
      ],
      "lh": "Espacio entre líneas",
      "lhs": [
        "1.6",
        "2.0",
        "2.4"
      ],
      "bg": "Color de fondo",
      "bgs": [
        "Blanco",
        "Crema",
        "Gris claro",
        "Negro"
      ],
      "size": "Tamaño del texto",
      "sizes": [
        "Normal",
        "Grande",
        "Muy grande"
      ],
      "save": "Guardar esta forma",
      "unsaved": "Todavía no se ha guardado",
      "reset": "Volver a la forma inicial",
      "saved": "Perfil de lectura guardado ✓",
      "resetDone": "Forma inicial restablecida",
      "profile": "Perfil de lectura"
    },
    "yomu": {
      "title": "Leer",
      "pasteLabel": "Texto para leer",
      "placeholder": "Pegar aquí el texto",
      "pasteHint": "El texto pegado se queda solo en este dispositivo. También se puede pegar un texto propio y escucharlo para revisarlo.",
      "start": "Leer este texto",
      "emptyText": "Todavía no hay texto",
      "change": "Cambiar el texto",
      "prev": "Anterior",
      "next": "Siguiente",
      "speak": "Leer en voz alta",
      "stop": "Detener",
      "noSpeak": "La lectura en voz alta no está disponible en este dispositivo",
      "speakFail": "No se pudo leer en voz alta",
      "cloudNote": "☁ indica una voz en línea. El texto que se lee puede enviarse a la empresa que ofrece la voz.",
      "lineOf": "Línea {a} de {b}",
      "tapLineHint": "Al tocar una línea, la lectura empieza desde ahí.",
      "breakLabel": "Aviso de descanso",
      "breakOpts": [
        "Sin aviso",
        "5 min",
        "10 min",
        "15 min",
        "20 min"
      ],
      "breakBand": "Un pequeño descanso",
      "breakSub": "Es la hora elegida. No hay prisa.",
      "breakGo": "Continuar",
      "breakSet": "Aviso de descanso: {m}",
      "breakOff": "Aviso de descanso desactivado",
      "profileHint": "La forma se puede cambiar en la pantalla \"Comparar\"."
    }
  }
});
/* ---- /es ---- */
/* ---- it: 翻訳 ---- */
TBL.it = mergeDeep(JSON.parse(JSON.stringify(en)), {
  "app": {
    "name": "Officina dei testi - SOYOGI",
    "short": "Officina dei testi",
    "tagline": "Decida Lei la forma più facile da leggere e legga una riga alla volta."
  },
  "nav": {
    "home": "Home",
    "mikurabe": "Confronta",
    "yomu": "Leggi",
    "set": "Impostazioni"
  },
  "common": {
    "ok": "OK",
    "cancel": "Annulla",
    "save": "Salva",
    "del": "Elimina",
    "back": "Indietro",
    "close": "Chiudi",
    "yes": "Sì",
    "no": "No",
    "add": "Aggiungi",
    "edit": "Modifica",
    "next": "Successivo",
    "prev": "Precedente",
    "done": "Fatto",
    "saved": "Salvato ✓",
    "saveFail": "Non è stato possibile salvare",
    "storageFull": "Memoria piena, non è stato possibile salvare",
    "deleted": "Eliminato",
    "delConfirm": "Vuole davvero eliminarlo?",
    "empty": "Non c'è ancora niente",
    "optional": "Non è necessario compilare tutto.",
    "today": "Oggi",
    "photo": {
      "camera": "Scatta una foto",
      "roll": "Scegli dalle foto",
      "cropTitle": "Ritaglia la foto",
      "cropHint": "Sposti la foto con il dito o con le frecce, poi cambi la dimensione con il cursore.",
      "zoom": "Dimensione",
      "panUp": "Su",
      "panDown": "Giù",
      "panLeft": "Sinistra",
      "panRight": "Destra",
      "make": "Usa questa",
      "fail": "Non è stato possibile caricare la foto"
    }
  },
  "set": {
    "hNormal": "Impostazioni abituali",
    "hBackup": "Cambio di telefono (backup)",
    "fs": "Dimensione del testo",
    "fsSizes": [
      "Normale",
      "Grande",
      "Molto grande"
    ],
    "lang": "ことば / Language",
    "theme": "Colore",
    "themes": [
      "Verde",
      "Azzurro",
      "Bianco",
      "Nero"
    ],
    "bgm": "Musica",
    "bgms": [
      "Nessuna",
      "Suono verde",
      "Suono blu"
    ],
    "sound": "Suono al tocco",
    "on": "ON",
    "off": "OFF",
    "bkHint": "Quando passa a un nuovo telefono, tocchi «Esporta» per salvare un file, poi tocchi «Importa» sul nuovo telefono.",
    "bkExport": "Esporta",
    "bkImport": "Importa",
    "exported": "Esportato ✓",
    "imported": "Importato ✓",
    "importFail": "Non è stato possibile importare",
    "importConfirm": "I contenuti attuali verranno sostituiti con quelli del file. Vuole importare?",
    "note": "Tutto ciò che scrive viene salvato solo su questo dispositivo. Non viene inviato da nessuna parte.",
    "privacy": "Informativa sulla privacy",
    "credit": "App sviluppata da SOYOGI, servizio di consulenza per l'assistenza e il sostegno",
    "fontCredit": "Carattere: BIZ UDPGothic (Copyright 2022 The BIZ UDGothic Project Authors), SIL Open Font License 1.1. Il testo completo della licenza si trova nell'app, in fonts/OFL.txt."
  },
  "screen": {
    "home": {
      "title": "Officina dei testi",
      "mikurabe": "Confronta",
      "mikurabeSub": "Scelga carattere, spazio tra le lettere, interlinea, sfondo e dimensione, e li salvi nel Suo profilo di lettura",
      "yomu": "Leggi",
      "yomuSub": "Incolli un testo e lo legga una riga alla volta, con la riga attuale evidenziata",
      "note": "Il testo che incolla e la forma che sceglie restano solo su questo dispositivo. Non vengono inviati da nessuna parte."
    },
    "mikurabe": {
      "title": "Confronta",
      "hint": "Tocchi «Salva questa forma» e la schermata «Leggi» userà questa forma.",
      "sample": [
        "Ciò che è facile da leggere cambia da persona a persona.",
        "Cambiando carattere e interlinea, può scegliere ciò che fa per Lei.",
        "La forma scelta resta solo su questo dispositivo."
      ],
      "font": "Carattere",
      "fonts": [
        "BIZ UDPGothic",
        "Con grazie",
        "Arrotondato (dipende dal dispositivo)"
      ],
      "spacing": "Spazio tra le lettere",
      "spacings": [
        "Normale",
        "Un po' ampio",
        "Ampio"
      ],
      "lh": "Interlinea (spazio tra le righe)",
      "lhs": [
        "1.6",
        "2.0",
        "2.4"
      ],
      "bg": "Colore di sfondo",
      "bgs": [
        "Bianco",
        "Crema",
        "Grigio chiaro",
        "Nero"
      ],
      "size": "Dimensione del testo",
      "sizes": [
        "Normale",
        "Grande",
        "Molto grande"
      ],
      "save": "Salva questa forma",
      "unsaved": "Non ancora salvato",
      "reset": "Torna alla forma iniziale",
      "saved": "Profilo di lettura salvato ✓",
      "resetDone": "Forma iniziale ripristinata",
      "profile": "Profilo di lettura"
    },
    "yomu": {
      "title": "Leggi",
      "pasteLabel": "Testo da leggere",
      "placeholder": "Incolli qui il testo",
      "pasteHint": "Il testo incollato resta solo su questo dispositivo. Può anche incollare un testo scritto da Lei e ascoltarlo per ricontrollarlo.",
      "start": "Leggi questo testo",
      "emptyText": "Non c'è ancora un testo",
      "change": "Cambia testo",
      "prev": "Precedente",
      "next": "Successivo",
      "speak": "Leggi ad alta voce",
      "stop": "Ferma",
      "noSpeak": "La lettura ad alta voce non è disponibile su questo dispositivo",
      "speakFail": "Non è stato possibile leggere ad alta voce",
      "cloudNote": "☁ indica una voce online. Il testo letto può essere inviato all'azienda che fornisce la voce.",
      "lineOf": "Riga {a} di {b}",
      "tapLineHint": "Tocchi una riga per leggere da lì.",
      "breakLabel": "Promemoria per la pausa",
      "breakOpts": [
        "Nessuno",
        "5 min",
        "10 min",
        "15 min",
        "20 min"
      ],
      "breakBand": "Una piccola pausa",
      "breakSub": "È arrivato il momento che ha scelto. Non c'è fretta.",
      "breakGo": "Continua",
      "breakSet": "Promemoria per la pausa: {m}",
      "breakOff": "Promemoria per la pausa disattivato",
      "profileHint": "Può cambiare la forma nella schermata «Confronta»."
    }
  }
});
/* ---- /it ---- */
/* ---- pt: 翻訳 ---- */
TBL.pt = mergeDeep(JSON.parse(JSON.stringify(en)), {
  "app": {
    "name": "Bancada de textos - SOYOGI",
    "short": "Bancada de textos",
    "tagline": "Escolher o formato que facilita a leitura e ler uma linha de cada vez."
  },
  "nav": {
    "home": "Início",
    "mikurabe": "Comparar",
    "yomu": "Ler",
    "set": "Ajustes"
  },
  "common": {
    "ok": "OK",
    "cancel": "Cancelar",
    "save": "Guardar",
    "del": "Apagar",
    "back": "Voltar",
    "close": "Fechar",
    "yes": "Sim",
    "no": "Não",
    "add": "Adicionar",
    "edit": "Editar",
    "next": "Seguinte",
    "prev": "Anterior",
    "done": "Concluído",
    "saved": "Guardado ✓",
    "saveFail": "Não foi possível guardar",
    "storageFull": "Armazenamento cheio, não foi possível guardar",
    "deleted": "Apagado",
    "delConfirm": "Apagar mesmo?",
    "empty": "Ainda não há nada aqui",
    "optional": "Não é preciso preencher tudo.",
    "today": "Hoje",
    "photo": {
      "camera": "Tirar uma foto",
      "roll": "Escolher uma foto",
      "cropTitle": "Recortar a foto",
      "cropHint": "Arrastar com o dedo ou usar as setas para ajustar, e mudar o tamanho com a barra deslizante.",
      "zoom": "Tamanho",
      "panUp": "Cima",
      "panDown": "Baixo",
      "panLeft": "Esquerda",
      "panRight": "Direita",
      "make": "Usar esta",
      "fail": "Não foi possível carregar a foto"
    }
  },
  "set": {
    "hNormal": "Ajustes habituais",
    "hBackup": "Mudar de dispositivo (cópia de segurança)",
    "fs": "Tamanho do texto",
    "fsSizes": [
      "Normal",
      "Grande",
      "Muito grande"
    ],
    "lang": "ことば / Language",
    "theme": "Cor",
    "themes": [
      "Verde",
      "Azul-claro",
      "Branco",
      "Preto"
    ],
    "bgm": "Música",
    "bgms": [
      "Nenhuma",
      "Som verde",
      "Som azul"
    ],
    "sound": "Som de toque",
    "on": "ON",
    "off": "OFF",
    "bkHint": "Ao mudar para um novo dispositivo, tocar em “Exportar” para guardar uma cópia e, depois, no novo dispositivo, tocar em “Importar”.",
    "bkExport": "Exportar",
    "bkImport": "Importar",
    "exported": "Exportado ✓",
    "imported": "Importado ✓",
    "importFail": "Não foi possível importar",
    "importConfirm": "O conteúdo atual será substituído pelo conteúdo do ficheiro. Importar?",
    "note": "Tudo o que se escreve fica guardado apenas neste dispositivo. Nada é enviado para fora dele.",
    "privacy": "Política de privacidade",
    "credit": "Desenvolvido por SOYOGI, serviço de consulta sobre cuidados e apoio",
    "fontCredit": "Tipo de letra: BIZ UDPGothic (Copyright 2022 The BIZ UDGothic Project Authors), SIL Open Font License 1.1. O texto completo da licença está em fonts/OFL.txt, dentro da aplicação."
  },
  "screen": {
    "home": {
      "title": "Bancada de textos",
      "mikurabe": "Comparar",
      "mikurabeSub": "Escolher o tipo de letra, o espaço entre letras, o espaço entre linhas, o fundo e o tamanho, e guardar tudo no perfil de leitura",
      "yomu": "Ler",
      "yomuSub": "Ler o texto colado uma linha de cada vez, com a linha atual em destaque",
      "note": "O texto colado e o formato escolhido ficam apenas neste dispositivo. Nada é enviado para fora dele."
    },
    "mikurabe": {
      "title": "Comparar",
      "hint": "Toque em “Guardar este formato” para usar este formato em “Ler”.",
      "sample": [
        "O que é fácil de ler muda de pessoa para pessoa.",
        "É possível mudar o tipo de letra e o espaço entre linhas e escolher o que serve melhor.",
        "O formato escolhido fica apenas neste dispositivo."
      ],
      "font": "Tipo de letra",
      "fonts": [
        "BIZ UDPGothic",
        "Com serifa",
        "Arredondado (depende do dispositivo)"
      ],
      "spacing": "Espaço entre letras",
      "spacings": [
        "Normal",
        "Um pouco mais largo",
        "Largo"
      ],
      "lh": "Espaço entre linhas",
      "lhs": [
        "1,6",
        "2,0",
        "2,4"
      ],
      "bg": "Cor de fundo",
      "bgs": [
        "Branco",
        "Creme",
        "Cinza-claro",
        "Preto"
      ],
      "size": "Tamanho do texto",
      "sizes": [
        "Normal",
        "Grande",
        "Muito grande"
      ],
      "save": "Guardar este formato",
      "unsaved": "Ainda não guardado",
      "reset": "Voltar ao formato inicial",
      "saved": "Perfil de leitura guardado ✓",
      "resetDone": "Formato inicial restaurado",
      "profile": "Perfil de leitura"
    },
    "yomu": {
      "title": "Ler",
      "pasteLabel": "Texto para ler",
      "placeholder": "Colar o texto aqui",
      "pasteHint": "O texto colado fica apenas neste dispositivo. Também é possível colar um texto próprio e ouvir a leitura para rever.",
      "start": "Ler este texto",
      "emptyText": "Ainda não há texto",
      "change": "Mudar o texto",
      "prev": "Anterior",
      "next": "Seguinte",
      "speak": "Ler em voz alta",
      "stop": "Parar",
      "noSpeak": "A leitura em voz alta não está disponível neste dispositivo",
      "speakFail": "Não foi possível ler em voz alta",
      "cloudNote": "☁ indica uma voz online. O texto lido pode ser enviado à empresa que fornece a voz.",
      "lineOf": "Linha {a} de {b}",
      "tapLineHint": "Ao tocar numa linha, é possível ler a partir dela.",
      "breakLabel": "Lembrete de pausa",
      "breakOpts": [
        "Nenhum",
        "5 min",
        "10 min",
        "15 min",
        "20 min"
      ],
      "breakBand": "Pausa",
      "breakSub": "Chegou a hora escolhida. Não há pressa.",
      "breakGo": "Continuar",
      "breakSet": "Lembrete de pausa definido para {m}",
      "breakOff": "Lembrete de pausa desativado",
      "profileHint": "O formato pode ser mudado em “Comparar”."
    }
  }
});
/* ---- /pt ---- */
/* ---- nl: 翻訳 ---- */
TBL.nl = mergeDeep(JSON.parse(JSON.stringify(en)), {
  "app": {
    "name": "Tekstwerkbank - SOYOGI",
    "short": "Tekstwerkbank",
    "tagline": "Bepaal zelf wat voor u prettig leest, en lees regel voor regel."
  },
  "nav": {
    "home": "Start",
    "mikurabe": "Vergelijken",
    "yomu": "Lezen",
    "set": "Instellingen"
  },
  "common": {
    "ok": "OK",
    "cancel": "Annuleren",
    "save": "Opslaan",
    "del": "Verwijderen",
    "back": "Terug",
    "close": "Sluiten",
    "yes": "Ja",
    "no": "Nee",
    "add": "Toevoegen",
    "edit": "Bewerken",
    "next": "Volgende",
    "prev": "Vorige",
    "done": "Klaar",
    "saved": "Opgeslagen ✓",
    "saveFail": "Opslaan is niet gelukt",
    "storageFull": "Het geheugen is vol. Opslaan is niet gelukt.",
    "deleted": "Verwijderd",
    "delConfirm": "Wilt u dit echt verwijderen?",
    "empty": "Hier staat nog niets",
    "optional": "U hoeft niet alles in te vullen.",
    "today": "Vandaag",
    "photo": {
      "camera": "Foto maken",
      "roll": "Kiezen uit foto's",
      "cropTitle": "Foto bijsnijden",
      "cropHint": "Verschuif de foto met uw vinger of met de pijlen, en verander de grootte met de schuifregelaar.",
      "zoom": "Grootte",
      "panUp": "Omhoog",
      "panDown": "Omlaag",
      "panLeft": "Naar links",
      "panRight": "Naar rechts",
      "make": "Dit gebruiken",
      "fail": "De foto kon niet worden geladen"
    }
  },
  "set": {
    "hNormal": "Gewone instellingen",
    "hBackup": "Naar een nieuwe telefoon (back-up)",
    "fs": "Tekstgrootte",
    "fsSizes": [
      "Normaal",
      "Groot",
      "Heel groot"
    ],
    "lang": "ことば / Language",
    "theme": "Kleur",
    "themes": [
      "Groen",
      "Lichtblauw",
      "Wit",
      "Zwart"
    ],
    "bgm": "Muziek",
    "bgms": [
      "Geen",
      "Groene klank",
      "Blauwe klank"
    ],
    "sound": "Tikgeluid",
    "on": "AAN",
    "off": "UIT",
    "bkHint": "Gaat u over naar een nieuwe telefoon? Sla dan met \"Exporteren\" een bestand op, en tik op de nieuwe telefoon op \"Importeren\".",
    "bkExport": "Exporteren",
    "bkImport": "Importeren",
    "exported": "Geëxporteerd ✓",
    "imported": "Geïmporteerd ✓",
    "importFail": "Importeren is niet gelukt",
    "importConfirm": "Wat u nu hebt, wordt vervangen door de inhoud van het bestand. Wilt u importeren?",
    "note": "Alles wat u schrijft, wordt alleen op dit apparaat bewaard. Er wordt niets verstuurd.",
    "privacy": "Privacybeleid",
    "credit": "App-ontwikkeling: SOYOGI, adviespunt voor zorg en ondersteuning",
    "fontCredit": "Lettertype: BIZ UDPGothic (Copyright 2022 The BIZ UDGothic Project Authors), SIL Open Font License 1.1. De volledige licentietekst staat in de app in fonts/OFL.txt."
  },
  "screen": {
    "home": {
      "title": "Tekstwerkbank",
      "mikurabe": "Vergelijken",
      "mikurabeSub": "Kies lettertype, letterafstand, regelafstand, achtergrond en grootte, en sla ze op in uw leesprofiel",
      "yomu": "Lezen",
      "yomuSub": "Plak een tekst en lees die regel voor regel, met de huidige regel opgelicht",
      "note": "De tekst die u plakt en de weergave die u kiest, blijven alleen op dit apparaat. Er wordt niets verstuurd."
    },
    "mikurabe": {
      "title": "Vergelijken",
      "hint": "Tik op \"Deze weergave opslaan\", dan wordt deze weergave gebruikt bij Lezen.",
      "sample": [
        "Wat prettig leest, verschilt van persoon tot persoon.",
        "U kunt het lettertype en de regelafstand veranderen, en kiezen wat bij u past.",
        "De weergave die u kiest, blijft alleen op dit apparaat."
      ],
      "font": "Lettertype",
      "fonts": [
        "BIZ UDPGothic",
        "Schreef",
        "Afgerond (afhankelijk van het apparaat)"
      ],
      "spacing": "Letterafstand",
      "spacings": [
        "Normaal",
        "Iets ruimer",
        "Ruim"
      ],
      "lh": "Regelafstand",
      "lhs": [
        "1,6",
        "2,0",
        "2,4"
      ],
      "bg": "Achtergrondkleur",
      "bgs": [
        "Wit",
        "Crème",
        "Lichtgrijs",
        "Zwart"
      ],
      "size": "Tekstgrootte",
      "sizes": [
        "Normaal",
        "Groot",
        "Heel groot"
      ],
      "save": "Deze weergave opslaan",
      "unsaved": "Nog niet opgeslagen",
      "reset": "Terug naar de beginweergave",
      "saved": "Leesprofiel opgeslagen ✓",
      "resetDone": "Teruggezet naar de beginweergave",
      "profile": "Leesprofiel"
    },
    "yomu": {
      "title": "Lezen",
      "pasteLabel": "Tekst om te lezen",
      "placeholder": "Plak hier uw tekst",
      "pasteHint": "De geplakte tekst blijft alleen op dit apparaat. U kunt ook een tekst plakken die u zelf schreef, en ernaar luisteren om die na te gaan.",
      "start": "Deze tekst lezen",
      "emptyText": "Er is nog geen tekst",
      "change": "Andere tekst",
      "prev": "Vorige",
      "next": "Volgende",
      "speak": "Voorlezen",
      "stop": "Stoppen",
      "noSpeak": "Voorlezen kan niet op dit apparaat",
      "speakFail": "Voorlezen is niet gelukt",
      "cloudNote": "☁ betekent een onlinestem. De tekst die wordt voorgelezen, kan worden gestuurd naar het bedrijf dat die stem levert.",
      "lineOf": "Regel {a} van {b}",
      "tapLineHint": "Tik op een regel om vanaf daar te lezen.",
      "breakLabel": "Pauzeherinnering",
      "breakOpts": [
        "Geen",
        "5 min",
        "10 min",
        "15 min",
        "20 min"
      ],
      "breakBand": "Even pauze",
      "breakSub": "De gekozen tijd is bereikt. U hoeft zich niet te haasten.",
      "breakGo": "Verder",
      "breakSet": "Pauzeherinnering ingesteld op {m}",
      "breakOff": "Pauzeherinnering uitgezet",
      "profileHint": "U kunt de weergave aanpassen bij Vergelijken."
    }
  }
});
/* ---- /nl ---- */
/* ---- sv: 翻訳 ---- */
TBL.sv = mergeDeep(JSON.parse(JSON.stringify(en)), {
  "app": {
    "name": "Läs- och skrivbord - SOYOGI",
    "short": "Läs- och skrivbord",
    "tagline": "Välj själv hur texten blir lättast att läsa, och läs en rad i taget."
  },
  "nav": {
    "home": "Hem",
    "mikurabe": "Jämför",
    "yomu": "Läs",
    "set": "Inställningar"
  },
  "common": {
    "ok": "OK",
    "cancel": "Avbryt",
    "save": "Spara",
    "del": "Ta bort",
    "back": "Tillbaka",
    "close": "Stäng",
    "yes": "Ja",
    "no": "Nej",
    "add": "Lägg till",
    "edit": "Ändra",
    "next": "Nästa",
    "prev": "Föregående",
    "done": "Klar",
    "saved": "Sparat ✓",
    "saveFail": "Det gick inte att spara",
    "storageFull": "Minnet är fullt, det gick inte att spara",
    "deleted": "Borttaget",
    "delConfirm": "Vill du verkligen ta bort det här?",
    "empty": "Här finns inget ännu",
    "optional": "Du behöver inte fylla i allt.",
    "today": "Idag",
    "photo": {
      "camera": "Ta ett foto",
      "roll": "Välj bland foton",
      "cropTitle": "Beskär fotot",
      "cropHint": "Dra med fingret eller använd pilarna, och ändra storleken med reglaget.",
      "zoom": "Storlek",
      "panUp": "Upp",
      "panDown": "Ner",
      "panLeft": "Vänster",
      "panRight": "Höger",
      "make": "Använd det här",
      "fail": "Det gick inte att läsa in fotot"
    }
  },
  "set": {
    "hNormal": "Vanliga inställningar",
    "hBackup": "Byta telefon (säkerhetskopia)",
    "fs": "Textstorlek",
    "fsSizes": [
      "Normal",
      "Stor",
      "Mycket stor"
    ],
    "lang": "ことば / Language",
    "theme": "Färg",
    "themes": [
      "Grön",
      "Ljusblå",
      "Vit",
      "Svart"
    ],
    "bgm": "Musik",
    "bgms": [
      "Ingen",
      "Grön ton",
      "Blå ton"
    ],
    "sound": "Ljud vid tryck",
    "on": "PÅ",
    "off": "AV",
    "bkHint": "När du byter till en ny telefon: tryck på ”Exportera” för att spara en fil, och tryck sedan på ”Importera” i den nya telefonen.",
    "bkExport": "Exportera",
    "bkImport": "Importera",
    "exported": "Exporterat ✓",
    "imported": "Importerat ✓",
    "importFail": "Det gick inte att importera",
    "importConfirm": "Det du har nu ersätts med innehållet i filen. Vill du importera?",
    "note": "Allt du skriver sparas bara på den här enheten. Inget skickas någonstans.",
    "privacy": "Integritetspolicy",
    "credit": "Appen är utvecklad av SOYOGI, en rådgivning om omsorg och stöd",
    "fontCredit": "Typsnitt: BIZ UDPGothic (Copyright 2022 The BIZ UDGothic Project Authors), SIL Open Font License 1.1. Hela licenstexten finns i appen i fonts/OFL.txt."
  },
  "screen": {
    "home": {
      "title": "Läs- och skrivbord",
      "mikurabe": "Jämför",
      "mikurabeSub": "Välj typsnitt, bokstavsavstånd, radavstånd, bakgrund och storlek, och spara dem som din läsprofil",
      "yomu": "Läs",
      "yomuSub": "Klistra in en text och läs den en rad i taget. Raden du läser lyses upp",
      "note": "Texten du klistrar in och utseendet du väljer stannar bara på den här enheten. Inget skickas någonstans."
    },
    "mikurabe": {
      "title": "Jämför",
      "hint": "Tryck på ”Spara det här utseendet” så används det här utseendet på skärmen ”Läs”.",
      "sample": [
        "Vad som är lätt att läsa skiljer sig från person till person.",
        "Du kan ändra typsnitt och radavstånd och välja det som passar dig.",
        "Det du väljer stannar bara på den här enheten."
      ],
      "font": "Typsnitt",
      "fonts": [
        "BIZ UDPGothic",
        "Serif",
        "Rundad (beror på enheten)"
      ],
      "spacing": "Bokstavsavstånd",
      "spacings": [
        "Normalt",
        "Lite brett",
        "Brett"
      ],
      "lh": "Radavstånd",
      "lhs": [
        "1.6",
        "2.0",
        "2.4"
      ],
      "bg": "Bakgrundsfärg",
      "bgs": [
        "Vit",
        "Gräddvit",
        "Ljusgrå",
        "Svart"
      ],
      "size": "Textstorlek",
      "sizes": [
        "Normal",
        "Stor",
        "Mycket stor"
      ],
      "save": "Spara det här utseendet",
      "unsaved": "Inte sparat än",
      "reset": "Återställ",
      "saved": "Läsprofilen är sparad ✓",
      "resetDone": "Utseendet är återställt",
      "profile": "Läsprofil"
    },
    "yomu": {
      "title": "Läs",
      "pasteLabel": "Text att läsa",
      "placeholder": "Klistra in din text här",
      "pasteHint": "Texten du klistrar in stannar bara på den här enheten. Du kan också klistra in något du själv har skrivit och lyssna för att kontrollera det.",
      "start": "Läs den här texten",
      "emptyText": "Det finns ingen text ännu",
      "change": "Byt text",
      "prev": "Föregående",
      "next": "Nästa",
      "speak": "Läs upp",
      "stop": "Stoppa",
      "noSpeak": "Uppläsning fungerar inte på den här enheten",
      "speakFail": "Det gick inte att läsa upp",
      "cloudNote": "☁ betyder en röst via internet. Texten som läses upp kan skickas till företaget som står för rösten.",
      "lineOf": "Rad {a} av {b}",
      "tapLineHint": "Tryck på en rad för att läsa därifrån.",
      "breakLabel": "Påminnelse om paus",
      "breakOpts": [
        "Ingen",
        "5 min",
        "10 min",
        "15 min",
        "20 min"
      ],
      "breakBand": "En liten paus",
      "breakSub": "Tiden du valde har gått. Du behöver inte skynda dig.",
      "breakGo": "Fortsätt",
      "breakSet": "Påminnelse om paus: {m}",
      "breakOff": "Påminnelsen om paus är avstängd",
      "profileHint": "Du kan ändra utseendet på skärmen ”Jämför”."
    }
  }
});
/* ---- /sv ---- */
/* ---- ko: 翻訳 ---- */
TBL.ko = mergeDeep(JSON.parse(JSON.stringify(en)), {
  "app": {
    "name": "읽기·쓰기 작업대 - SOYOGI",
    "short": "읽기·쓰기 작업대",
    "tagline": "읽기 편한 모양을 스스로 정하고, 한 줄씩 읽어요."
  },
  "nav": {
    "home": "홈",
    "mikurabe": "비교",
    "yomu": "읽기",
    "set": "설정"
  },
  "common": {
    "ok": "확인",
    "cancel": "취소",
    "save": "저장",
    "del": "삭제",
    "back": "뒤로",
    "close": "닫기",
    "yes": "네",
    "no": "아니요",
    "add": "추가",
    "edit": "수정",
    "next": "다음",
    "prev": "이전",
    "done": "완료",
    "saved": "저장했어요 ✓",
    "saveFail": "저장하지 못했어요",
    "storageFull": "저장 공간이 가득 차서 저장하지 못했어요",
    "deleted": "삭제했어요",
    "delConfirm": "정말 삭제할까요?",
    "empty": "아직 아무것도 없어요",
    "optional": "전부 쓰지 않아도 괜찮아요.",
    "today": "오늘",
    "photo": {
      "camera": "카메라로 찍기",
      "roll": "사진에서 고르기",
      "cropTitle": "사진 자르기",
      "cropHint": "손가락으로 움직이거나 화살표로 맞추고, 슬라이더로 크기를 바꿔요.",
      "zoom": "크기",
      "panUp": "위로",
      "panDown": "아래로",
      "panLeft": "왼쪽으로",
      "panRight": "오른쪽으로",
      "make": "이걸로 정하기",
      "fail": "사진을 불러오지 못했어요"
    }
  },
  "set": {
    "hNormal": "일반 설정",
    "hBackup": "기기 변경(백업)",
    "fs": "글자 크기",
    "fsSizes": [
      "보통",
      "크게",
      "아주 크게"
    ],
    "lang": "ことば / Language",
    "theme": "색",
    "themes": [
      "초록",
      "하늘색",
      "흰색",
      "검정"
    ],
    "bgm": "배경음악",
    "bgms": [
      "없음",
      "초록의 소리",
      "파랑의 소리"
    ],
    "sound": "터치음",
    "on": "켬",
    "off": "끔",
    "bkHint": "새 스마트폰으로 옮길 때는 '내보내기'로 파일을 저장하고, 새 스마트폰에서 '가져오기'를 눌러 주세요.",
    "bkExport": "내보내기",
    "bkImport": "가져오기",
    "exported": "내보냈어요 ✓",
    "imported": "가져왔어요 ✓",
    "importFail": "가져오지 못했어요",
    "importConfirm": "지금 내용이 파일의 내용으로 바뀌어요. 가져올까요?",
    "note": "쓴 내용은 모두 이 기기 안에만 저장돼요. 어디에도 보내지 않아요.",
    "privacy": "개인정보 처리방침",
    "credit": "앱 개발: 돌봄과 지원 상담소 SOYOGI",
    "fontCredit": "글꼴: BIZ UDPGothic (Copyright 2022 The BIZ UDGothic Project Authors), SIL Open Font License 1.1. 라이선스 전문은 앱 안의 fonts/OFL.txt에 있어요."
  },
  "screen": {
    "home": {
      "title": "읽기·쓰기 작업대",
      "mikurabe": "비교하기",
      "mikurabeSub": "글꼴·자간·행간·배경·크기를 골라서 읽기 프로필에 저장",
      "yomu": "읽기",
      "yomuSub": "붙여 넣은 글을 한 줄씩 밝게 표시하며 읽기",
      "note": "붙여 넣은 글도, 고른 모양도 이 기기 안에만 남아요. 어디에도 보내지 않아요."
    },
    "mikurabe": {
      "title": "비교하기",
      "hint": "'이 모양으로 저장'을 누르면 '읽기' 화면에서 이 모양으로 보여요.",
      "sample": [
        "읽기 편한 모양은 사람마다 달라요.",
        "글꼴이나 행간을 바꿔서 나에게 맞는 것을 고를 수 있어요.",
        "고른 모양은 이 기기 안에만 남아요."
      ],
      "font": "글꼴",
      "fonts": [
        "BIZ UDPGothic",
        "명조",
        "둥근 고딕(기기에 따라 다름)"
      ],
      "spacing": "자간(글자와 글자 사이)",
      "spacings": [
        "보통",
        "조금 넓게",
        "넓게"
      ],
      "lh": "행간(줄과 줄 사이)",
      "lhs": [
        "1.6",
        "2.0",
        "2.4"
      ],
      "bg": "배경색",
      "bgs": [
        "흰색",
        "미색",
        "연한 회색",
        "검정"
      ],
      "size": "글자 크기",
      "sizes": [
        "보통",
        "크게",
        "아주 크게"
      ],
      "save": "이 모양으로 저장",
      "unsaved": "아직 저장하지 않았어요",
      "reset": "처음 모양으로 되돌리기",
      "saved": "읽기 프로필을 저장했어요 ✓",
      "resetDone": "처음 모양으로 되돌렸어요",
      "profile": "읽기 프로필"
    },
    "yomu": {
      "title": "읽기",
      "pasteLabel": "읽고 싶은 글",
      "placeholder": "여기에 글을 붙여 넣어 주세요",
      "pasteHint": "붙여 넣은 글은 이 기기 안에만 남아요. 직접 쓴 글을 붙여 넣고, 들으면서 확인할 수도 있어요.",
      "start": "이 글로 읽기",
      "emptyText": "아직 글이 없어요",
      "change": "글 바꾸기",
      "prev": "이전",
      "next": "다음",
      "speak": "읽어 주기",
      "stop": "멈추기",
      "noSpeak": "이 기기에서는 읽어 주기를 쓸 수 없어요",
      "speakFail": "읽어 주기를 하지 못했어요",
      "cloudNote": "☁는 인터넷 음성이에요. 읽는 글이 음성을 제공하는 회사로 보내질 수 있어요.",
      "lineOf": "{a}번째 줄 / 전체 {b}줄",
      "tapLineHint": "줄을 누르면 거기서부터 읽을 수 있어요.",
      "breakLabel": "쉬는 시간 알림",
      "breakOpts": [
        "없음",
        "5분",
        "10분",
        "15분",
        "20분"
      ],
      "breakBand": "잠깐 쉬어 가요",
      "breakSub": "정한 시간이 되었어요. 서두르지 않아도 괜찮아요.",
      "breakGo": "계속하기",
      "breakSet": "쉬는 시간 알림을 {m}으로 정했어요",
      "breakOff": "쉬는 시간 알림을 껐어요",
      "profileHint": "모양은 '비교' 화면에서 바꿀 수 있어요."
    }
  }
});
/* ---- /ko ---- */
/* ---- zh: 翻訳 ---- */
TBL.zh = mergeDeep(JSON.parse(JSON.stringify(en)), {
  "app": {
    "name": "读写工作台 - SOYOGI",
    "short": "读写工作台",
    "tagline": "自己决定容易读的样式，一行一行地读。"
  },
  "nav": {
    "home": "首页",
    "mikurabe": "对比",
    "yomu": "阅读",
    "set": "设置"
  },
  "common": {
    "ok": "确定",
    "cancel": "取消",
    "save": "保存",
    "del": "删除",
    "back": "返回",
    "close": "关闭",
    "yes": "是",
    "no": "否",
    "add": "添加",
    "edit": "修改",
    "next": "下一个",
    "prev": "上一个",
    "done": "完成",
    "saved": "已保存 ✓",
    "saveFail": "无法保存",
    "storageFull": "存储空间已满，无法保存",
    "deleted": "已删除",
    "delConfirm": "确定要删除吗？",
    "empty": "这里还没有内容",
    "optional": "不必全部填写。",
    "today": "今天",
    "photo": {
      "camera": "用相机拍照",
      "roll": "从相册选择",
      "cropTitle": "裁剪照片",
      "cropHint": "用手指拖动或用箭头调整位置，再用滑块改变大小。",
      "zoom": "大小",
      "panUp": "向上",
      "panDown": "向下",
      "panLeft": "向左",
      "panRight": "向右",
      "make": "就用这张",
      "fail": "无法读取照片"
    }
  },
  "set": {
    "hNormal": "日常设置",
    "hBackup": "更换手机（备份）",
    "fs": "文字大小",
    "fsSizes": [
      "普通",
      "大",
      "特大"
    ],
    "lang": "ことば / Language",
    "theme": "颜色",
    "themes": [
      "绿色",
      "浅蓝色",
      "白色",
      "黑色"
    ],
    "bgm": "背景音乐",
    "bgms": [
      "无",
      "绿色之音",
      "蓝色之音"
    ],
    "sound": "点按音",
    "on": "开",
    "off": "关",
    "bkHint": "换到新手机时，请先点“导出”保存文件，再在新手机上点“导入”。",
    "bkExport": "导出",
    "bkImport": "导入",
    "exported": "已导出 ✓",
    "imported": "已导入 ✓",
    "importFail": "无法导入",
    "importConfirm": "当前内容将被替换为文件中的内容。要导入吗？",
    "note": "写下的内容全部只保存在这台设备里，不会发送到任何地方。",
    "privacy": "隐私政策",
    "credit": "应用开发：护理与支援咨询处 SOYOGI",
    "fontCredit": "字体：BIZ UDPGothic（Copyright 2022 The BIZ UDGothic Project Authors），SIL Open Font License 1.1。许可证全文见应用内的 fonts/OFL.txt。"
  },
  "screen": {
    "home": {
      "title": "读写工作台",
      "mikurabe": "对比",
      "mikurabeSub": "选择字体、字间距、行间距、背景和大小，保存为阅读偏好",
      "yomu": "阅读",
      "yomuSub": "粘贴文章后，一行一行高亮显示来读",
      "note": "粘贴的文字和选好的样式，都只留在这台设备里，不会发送到任何地方。"
    },
    "mikurabe": {
      "title": "对比",
      "hint": "点“保存这个样式”后，“阅读”画面就会使用这个样式。",
      "sample": [
        "什么样的文字容易读，因人而异。",
        "可以改变字体和行间距，选出适合自己的样式。",
        "选好的样式只会留在这台设备里。"
      ],
      "font": "字体",
      "fonts": [
        "BIZ UDPGothic",
        "宋体",
        "圆体（因设备而异）"
      ],
      "spacing": "字间距（字与字之间）",
      "spacings": [
        "普通",
        "稍宽",
        "宽"
      ],
      "lh": "行间距（行与行之间）",
      "lhs": [
        "1.6",
        "2.0",
        "2.4"
      ],
      "bg": "背景颜色",
      "bgs": [
        "白色",
        "米色",
        "浅灰色",
        "黑色"
      ],
      "size": "文字大小",
      "sizes": [
        "普通",
        "大",
        "特大"
      ],
      "save": "保存这个样式",
      "unsaved": "还没有保存",
      "reset": "恢复初始样式",
      "saved": "阅读偏好已保存 ✓",
      "resetDone": "已恢复初始样式",
      "profile": "阅读偏好"
    },
    "yomu": {
      "title": "阅读",
      "pasteLabel": "要读的文章",
      "placeholder": "请把文章粘贴到这里",
      "pasteHint": "粘贴的文字只留在这台设备里。也可以粘贴自己写的文章，听一听来确认。",
      "start": "读这段文字",
      "emptyText": "还没有文字",
      "change": "更换文字",
      "prev": "上一行",
      "next": "下一行",
      "speak": "朗读",
      "stop": "停止",
      "noSpeak": "这台设备无法朗读",
      "speakFail": "无法朗读",
      "cloudNote": "☁ 表示联网语音。朗读的文字可能会发送给提供语音的公司。",
      "lineOf": "第 {a} 行 / 共 {b} 行",
      "tapLineHint": "点按某一行，就能从那里开始读。",
      "breakLabel": "休息提醒",
      "breakOpts": [
        "无",
        "5分钟",
        "10分钟",
        "15分钟",
        "20分钟"
      ],
      "breakBand": "休息一下",
      "breakSub": "设定的时间到了。不用着急。",
      "breakGo": "继续",
      "breakSet": "休息提醒已设为{m}",
      "breakOff": "已关闭休息提醒",
      "profileHint": "样式可以在“对比”中更改。"
    }
  }
});
/* ---- /zh ---- */
/* ---- ar: 翻訳 ---- */
TBL.ar = mergeDeep(JSON.parse(JSON.stringify(en)), {
  "app": {
    "name": "طاولة قراءة وكتابة - SOYOGI",
    "short": "طاولة قراءة وكتابة",
    "tagline": "اختر بنفسك الشكل الذي يسهل عليك قراءته، واقرأ سطرًا واحدًا في كل مرة."
  },
  "nav": {
    "home": "الرئيسية",
    "mikurabe": "المقارنة",
    "yomu": "القراءة",
    "set": "الإعدادات"
  },
  "common": {
    "ok": "حسنًا",
    "cancel": "إلغاء",
    "save": "حفظ",
    "del": "حذف",
    "back": "رجوع",
    "close": "إغلاق",
    "yes": "نعم",
    "no": "لا",
    "add": "إضافة",
    "edit": "تعديل",
    "next": "التالي",
    "prev": "السابق",
    "done": "تم",
    "saved": "تم الحفظ ✓",
    "saveFail": "تعذّر الحفظ",
    "storageFull": "المساحة ممتلئة، تعذّر الحفظ",
    "deleted": "تم الحذف",
    "delConfirm": "هل تريد الحذف فعلًا؟",
    "empty": "لا يوجد شيء بعد",
    "optional": "لا بأس إن لم تملأ كل شيء.",
    "today": "اليوم",
    "photo": {
      "camera": "التقاط صورة",
      "roll": "الاختيار من الصور",
      "cropTitle": "قصّ الصورة",
      "cropHint": "حرّك الصورة بإصبعك أو اضبطها بالأسهم، وغيّر الحجم بالمنزلق.",
      "zoom": "الحجم",
      "panUp": "إلى الأعلى",
      "panDown": "إلى الأسفل",
      "panLeft": "إلى اليسار",
      "panRight": "إلى اليمين",
      "make": "استخدام هذا",
      "fail": "تعذّر تحميل الصورة"
    }
  },
  "set": {
    "hNormal": "الإعدادات المعتادة",
    "hBackup": "تغيير الهاتف (نسخة احتياطية)",
    "fs": "حجم النص",
    "fsSizes": [
      "عادي",
      "كبير",
      "كبير جدًا"
    ],
    "lang": "ことば / Language",
    "theme": "اللون",
    "themes": [
      "أخضر",
      "أزرق فاتح",
      "أبيض",
      "أسود"
    ],
    "bgm": "موسيقى الخلفية",
    "bgms": [
      "بدون",
      "نغمة خضراء",
      "نغمة زرقاء"
    ],
    "sound": "صوت اللمس",
    "on": "تشغيل",
    "off": "إيقاف",
    "bkHint": "عند الانتقال إلى هاتف جديد، اضغط «تصدير» لحفظ ملف، ثم اضغط «استيراد» على الهاتف الجديد.",
    "bkExport": "تصدير",
    "bkImport": "استيراد",
    "exported": "تم التصدير ✓",
    "imported": "تم الاستيراد ✓",
    "importFail": "تعذّر الاستيراد",
    "importConfirm": "سيُستبدل المحتوى الحالي بمحتوى الملف. هل تريد الاستيراد؟",
    "note": "كل ما تكتبه يُحفظ على هذا الجهاز فقط. لا يُرسل شيء إلى أي مكان.",
    "privacy": "سياسة الخصوصية",
    "credit": "تطوير التطبيق: SOYOGI، مكان للاستشارة في الرعاية والدعم",
    "fontCredit": "الخط: BIZ UDPGothic، Copyright 2022 The BIZ UDGothic Project Authors، الترخيص: SIL Open Font License 1.1. النص الكامل للترخيص موجود داخل التطبيق في fonts/OFL.txt."
  },
  "screen": {
    "home": {
      "title": "طاولة قراءة وكتابة",
      "mikurabe": "المقارنة",
      "mikurabeSub": "اختر الخط والمسافة بين الحروف والمسافة بين الأسطر والخلفية والحجم، واحفظها في ملف القراءة الشخصي",
      "yomu": "القراءة",
      "yomuSub": "الصق نصًّا واقرأه سطرًا بعد سطر، مع إبراز السطر الذي تقرؤه",
      "note": "النص الذي تلصقه والشكل الذي تختاره يبقيان على هذا الجهاز فقط. لا يُرسل شيء إلى أي مكان."
    },
    "mikurabe": {
      "title": "المقارنة",
      "hint": "اضغط «حفظ هذا الشكل» ليُستخدم هذا الشكل في شاشة «القراءة».",
      "sample": [
        "الشكل السهل في القراءة يختلف من شخص إلى آخر.",
        "يمكنك تغيير الخط والمسافات لتختار ما يناسبك.",
        "الشكل الذي تختاره يبقى على هذا الجهاز فقط."
      ],
      "font": "نوع الخط",
      "fonts": [
        "BIZ UDPGothic",
        "بزوائد",
        "مستدير (حسب الجهاز)"
      ],
      "spacing": "المسافة بين الحروف",
      "spacings": [
        "عادية",
        "أوسع قليلًا",
        "واسعة"
      ],
      "lh": "المسافة بين الأسطر",
      "lhs": [
        "1.6",
        "2.0",
        "2.4"
      ],
      "bg": "لون الخلفية",
      "bgs": [
        "أبيض",
        "كريمي",
        "رمادي فاتح",
        "أسود"
      ],
      "size": "حجم النص",
      "sizes": [
        "عادي",
        "كبير",
        "كبير جدًا"
      ],
      "save": "حفظ هذا الشكل",
      "unsaved": "لم يُحفظ بعد",
      "reset": "العودة إلى الشكل الأول",
      "saved": "تم حفظ ملف القراءة الشخصي ✓",
      "resetDone": "تمت العودة إلى الشكل الأول",
      "profile": "ملف القراءة الشخصي"
    },
    "yomu": {
      "title": "القراءة",
      "pasteLabel": "النص الذي تريد قراءته",
      "placeholder": "الصق النص هنا",
      "pasteHint": "النص الذي تلصقه يبقى على هذا الجهاز فقط. يمكنك أيضًا لصق نص كتبته بنفسك والاستماع إليه للتأكد منه.",
      "start": "قراءة هذا النص",
      "emptyText": "لا يوجد نص بعد",
      "change": "تغيير النص",
      "prev": "السابق",
      "next": "التالي",
      "speak": "قراءة صوتية",
      "stop": "إيقاف",
      "noSpeak": "القراءة الصوتية غير متاحة على هذا الجهاز",
      "speakFail": "تعذّرت القراءة الصوتية",
      "cloudNote": "☁ تعني صوتًا عبر الإنترنت. قد يُرسَل النص الذي تتم قراءته إلى الشركة التي توفّر الصوت.",
      "lineOf": "السطر {a} من {b}",
      "tapLineHint": "اضغط على سطر لتبدأ القراءة منه.",
      "breakLabel": "تذكير بالاستراحة",
      "breakOpts": [
        "بدون",
        "5 دقائق",
        "10 دقائق",
        "15 دقيقة",
        "20 دقيقة"
      ],
      "breakBand": "استراحة قصيرة",
      "breakSub": "حان الوقت الذي اخترته. لا داعي للاستعجال.",
      "breakGo": "متابعة",
      "breakSet": "تم ضبط تذكير الاستراحة على {m}",
      "breakOff": "تم إيقاف تذكير الاستراحة",
      "profileHint": "يمكنك تغيير الشكل من شاشة «المقارنة»."
    }
  }
});
/* ---- /ar ---- */
/* 翻訳前の仮置き: de〜ar は en を流用する(翻訳Workflowで各言語を書いたらこの行より上に追加し、ここは残してよい) */
['de','fr','es','it','pt','nl','sv','ko','zh','ar'].forEach(function(l){
  if(!TBL[l]) TBL[l] = JSON.parse(JSON.stringify(en));
});
window.YOMU_I18N = TBL;
})();
