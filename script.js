"use strict";

document.addEventListener("DOMContentLoaded", init);

function init() {
  initClock();
  initDesktop();
  initStartMenu();
  initIcons();
  initDrag();
  // 異常管理モジュールの初期化とスケジュール開始
  anomalyManager.init();
  anomalyManager.scheduleAnomalies();
}

/* ===========================
   時計更新処理（現在時刻／異常時の変更反映）
   =========================== */
function initClock() {
  updateClock();
  setInterval(updateClock, 1000);
}
function updateClock() {
  let clockElem = document.getElementById("clock");
  let now = new Date();
  // 異常処理で設定されたカスタム時刻を使用
  if (window.customClockTime !== undefined) {
    now = new Date(window.customClockTime);
  }
  clockElem.textContent = now.toLocaleTimeString();
  // 巻き戻り中の場合は1秒ずつ減算
  if (window.clockRewinding) {
    window.customClockTime = new Date(window.customClockTime.getTime() - 1000);
  } else if (window.customClockTime !== undefined) {
    // 通常は実時刻に追随
    window.customClockTime = new Date(now.getTime());
  }
}

/* ===========================
   デスクトップ初期化
   =========================== */
function initDesktop() {
  // 必要に応じて背景変更など（異常処理で動的に変更）
}

/* ===========================
   スタートメニューの初期化
   =========================== */
function initStartMenu() {
  let startButton = document.getElementById("start-button");
  let startMenu = document.getElementById("start-menu");
  startButton.addEventListener("click", function() {
    startMenu.classList.toggle("hidden");
  });
  // スタートメニューからアプリ起動
  let menuItems = startMenu.querySelectorAll("li");
  menuItems.forEach(item => {
    item.addEventListener("click", function() {
      let app = this.getAttribute("data-app");
      openApp(app);
      startMenu.classList.add("hidden");
    });
  });
}

/* ===========================
   デスクトップアイコンの初期化
   =========================== */
function initIcons() {
  let icons = document.querySelectorAll(".icon");
  icons.forEach(icon => {
    icon.addEventListener("click", function() {
      let app = this.getAttribute("data-app");
      openApp(app);
    });
  });
}

/* ===========================
   アプリ起動処理（各種ウィンドウを生成）
   =========================== */
function openApp(app) {
  switch(app) {
    case "notepad":
      openNotepad();
      break;
    case "explorer":
      openExplorer();
      break;
    case "browser":
      openBrowser();
      break;
    case "shutdown":
      openShutdown();
      break;
    default:
      console.log("Unknown app: " + app);
  }
}
function createWindow(title, content, options = {}) {
  // ウィンドウ生成（windows-container に追加）
  let container = document.getElementById("windows-container");
  let win = document.createElement("div");
  win.classList.add("window");
  if (options.id) { win.id = options.id; }
  win.style.top = options.top || "50px";
  win.style.left = options.left || "50px";
  win.style.width = options.width || "300px";
  win.style.height = options.height || "200px";

  let header = document.createElement("div");
  header.classList.add("window-header");
  header.textContent = title;

  if (options.closable !== false) {
    let closeBtn = document.createElement("span");
    closeBtn.classList.add("window-close");
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", function() {
      if (options.nonClosable) return;
      container.removeChild(win);
    });
    header.appendChild(closeBtn);
  }

  let contentDiv = document.createElement("div");
  contentDiv.classList.add("window-content");
  if (typeof content === "string") {
    contentDiv.innerHTML = content;
  } else {
    contentDiv.appendChild(content);
  }

  win.appendChild(header);
  win.appendChild(contentDiv);
  container.appendChild(win);
  // ドラッグ可能に
  makeDraggable(win, header);
  return win;
}

/* 各アプリウィンドウのオープン */
function openNotepad() {
  if (document.getElementById("window-notepad")) return;
  let content = `<textarea style="width:100%; height:100%;">ここにテキストを入力...</textarea>`;
  createWindow("メモ帳", content, { id: "window-notepad" });
}
function openExplorer() {
  if (document.getElementById("window-explorer")) return;
  let content = `<div>マイコンピュータの内容:<br>
                   <ul id="explorer-list">
                      <li>ドキュメント</li>
                      <li>画像</li>
                      <li>システムフォルダ</li>
                   </ul>
                 </div>`;
  createWindow("マイコンピュータ", content, { id: "window-explorer" });
}
function openBrowser() {
  if (document.getElementById("window-browser")) return;
  // 異常処理で変更される場合に備えた homepageURL 変数
  let homepage = window.homepageURL || "http://www.example.com";
  let content = `<iframe src="${homepage}" style="width:100%; height:100%; border:none;"></iframe>`;
  createWindow("インターネット", content, { id: "window-browser", width: "600px", height: "400px" });
}
function openShutdown() {
  if (document.getElementById("window-shutdown")) return;
  let content = `<div>
                   <p>シャットダウンを試みています...</p>
                   <button id="shutdown-confirm">実行</button>
                   <div id="shutdown-message"></div>
                 </div>`;
  createWindow("シャットダウン", content, { id: "window-shutdown" });
  setTimeout(() => {
    let btn = document.getElementById("shutdown-confirm");
    if (btn) {
      btn.addEventListener("click", function() {
        if (anomalyManager.shutdownRitualActive) {
          document.getElementById("shutdown-message").innerHTML = "<p>シャットダウン儀式が未完了です。</p>";
        } else {
          document.getElementById("shutdown-message").innerHTML = "<p>シャットダウン完了。お疲れ様でした。</p>";
          // 必要に応じ操作停止処理等
        }
      });
    }
  }, 500);
}

/* ===========================
   ドラッグ処理（各ウィンドウ）
   =========================== */
function initDrag() {
  // 各ウィンドウ生成後、makeDraggable() を呼ぶので特に初期化処理は不要
}
function makeDraggable(el, handle) {
  let posX = 0, posY = 0, mouseX = 0, mouseY = 0;
  handle.style.cursor = "move";
  handle.onmousedown = dragMouseDown;
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    posX = mouseX - e.clientX;
    posY = mouseY - e.clientY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    el.style.top = (el.offsetTop - posY) + "px";
    el.style.left = (el.offsetLeft - posX) + "px";
  }
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

/* ===========================
   ログ出力（システムログ／デバッグ用）
   =========================== */
function logMessage(message) {
  let logContainer = document.getElementById("log-messages");
  if (!logContainer) return;
  let msgElem = document.createElement("div");
  let timestamp = new Date().toLocaleTimeString();
  msgElem.textContent = `[${timestamp}] ${message}`;
  logContainer.appendChild(msgElem);
  logContainer.scrollTop = logContainer.scrollHeight;
}

/* ===========================
   【アノマリーマネージャー】
   異常（アノマリー）の各種処理を配列に格納し、順次ランダムなタイミングで発生
   =========================== */
var anomalyManager = {
  anomalies: [],
  shutdownRitualActive: false,
  init: function() {
    this.anomalies = [
      anomalyUnknownLogin,
      anomalyMysteriousShortcut,
      anomalyScrambledStartMenu,
      anomalyClockMismatch,
      anomalyChangedHomepage,
      anomalyMysteriousFile,
      anomalyAutoLog,
      anomalyResurrectedProgram,
      anomalyMysteriousSound,
      anomalyChangedWallpaper,
      anomalyPrinterRevenge,
      anomalyFutureError,
      anomalyMysteriousConnection,
      anomalyShutdownKeyProcess,
      anomalyPhantomHardware,
      anomalyFolderNameShift,
      anomalyImpossibleSector,
      anomalyAutoScreensaver,
      anomalyModifiedEmail,
      anomalyReversedSystemSound,
      anomalyUndyingNotepad,
      anomalyHiddenPartition,
      anomalyOverlappingWindows,
      anomalyNonexistentDevice,
      anomalyInvalidShortcuts,
      anomalyBlueScreenHint,
      anomalyTimeRewind,
      anomalySelfGeneratingVirus,
      anomalyFutureHardware,
      anomalyShutdownRitual,
      anomalySearchHistoryRewrite,
      anomalyDigitalChat
    ];
  },
  scheduleAnomalies: function() {
    let delay = 30000; // 初回30秒後から
    for (let i = 0; i < this.anomalies.length; i++) {
      setTimeout(() => {
        try {
          this.anomalies[i]();
        } catch (e) {
          console.error("Anomaly error:", e);
        }
      }, delay);
      delay += Math.floor(Math.random() * 30000) + 30000; // 30～60秒間隔
    }
  }
};

/* ===========================
   【各アノマリー処理】
   異常はすべて背景で発生し、ユーザー操作により故意に発生させることはできません
   =========================== */

// 1. 不明なログイン：自動ログイン中のオーバーレイ表示
function anomalyUnknownLogin() {
  logMessage("不明なユーザーで自動ログインしました。");
  let overlay = document.createElement("div");
  overlay.id = "anomaly-login-overlay";
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0,0,0,0.7)";
  overlay.style.color = "#FFF";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "1000";
  overlay.innerHTML = "<div>自動ログイン中: ユーザー『MysteryUser』</div>";
  document.body.appendChild(overlay);
  setTimeout(() => { document.body.removeChild(overlay); }, 3000);
}

// 2. 謎のショートカット：デスクトップに謎のアイコン追加
function anomalyMysteriousShortcut() {
  logMessage("謎のショートカットがデスクトップに出現しました。");
  let desktopIcons = document.getElementById("desktop-icons");
  let icon = document.createElement("div");
  icon.classList.add("icon");
  icon.textContent = "謎アイコン";
  icon.style.backgroundColor = "#FFD700";
  desktopIcons.appendChild(icon);
}

// 3. スタートメニューの乱れ：メニュー項目をシャッフル
function anomalyScrambledStartMenu() {
  logMessage("スタートメニューが乱れました。");
  let startMenu = document.getElementById("start-menu");
  let ul = startMenu.querySelector("ul");
  let items = Array.from(ul.children);
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    ul.insertBefore(items[j], items[i]);
  }
}

// 4. 不一致の時計：タスクバーの時計を5分先に設定
function anomalyClockMismatch() {
  logMessage("時計が狂いました。");
  window.customClockTime = new Date(Date.now() + 5 * 60000);
}

// 5. 変わるホームページ：ブラウザのホームページURL変更
function anomalyChangedHomepage() {
  logMessage("ホームページが変わりました。");
  window.homepageURL = "http://www.mysterious-site.com";
  let browserWin = document.getElementById("window-browser");
  if (browserWin) {
    let iframe = browserWin.querySelector("iframe");
    if (iframe) iframe.src = window.homepageURL;
  }
}

// 6. 不可解なファイル：Explorerに謎のファイルを追加
function anomalyMysteriousFile() {
  logMessage("不可解なファイルが発見されました。");
  let explorerList = document.getElementById("explorer-list");
  if (explorerList) {
    let li = document.createElement("li");
    li.textContent = "??_X12A3.tmp";
    explorerList.appendChild(li);
  }
}

// 7. 自動再生ログ：定期的にログを出力
function anomalyAutoLog() {
  logMessage("自動再生ログが開始されました。");
  let counter = 0;
  let autoLogInterval = setInterval(() => {
    logMessage("自動ログメッセージ #" + (++counter));
    if (counter >= 10) { clearInterval(autoLogInterval); }
  }, 2000);
}

// 8. 復活するプログラム：閉じたメモ帳が自動再生成
function anomalyResurrectedProgram() {
  logMessage("閉じたプログラムが復活しました。");
  if (!document.getElementById("window-notepad")) { openNotepad(); }
}

// 9. 謎の音声：短いビープ音を再生
function anomalyMysteriousSound() {
  logMessage("謎の音声が再生されました。");
  try {
    let ctx = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
  } catch (e) { console.error(e); }
}

// 10. 変わる壁紙：デスクトップ背景を変更
function anomalyChangedWallpaper() {
  logMessage("壁紙が変わりました。");
  let desktop = document.getElementById("desktop");
  desktop.style.backgroundImage = "url('https://via.placeholder.com/1920x1080/000000/FFFFFF/?text=謎のメッセージ')";
}

// 11. プリンタの逆襲：プリンタウィンドウを生成
function anomalyPrinterRevenge() {
  logMessage("プリンタが謎のメッセージを印刷中です。");
  createWindow("プリンタ", "<p>エラーコード: 0xDEADBEEF</p>", { id: "window-printer" });
}

// 12. 未来のエラー：未来の日付のシステムエラーを表示
function anomalyFutureError() {
  logMessage("未来のエラーが発生しました。");
  let futureDate = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000);
  createWindow("システムエラー", `<p>エラー発生日時: ${futureDate.toLocaleString()}</p>`, { id: "window-future-error" });
}

// 13. 謎の接続先：ネットワーク接続先を表示
function anomalyMysteriousConnection() {
  logMessage("謎の接続先に接続しました。");
  createWindow("ネットワーク", `<p>接続先: 192.168.999.999</p>`, { id: "window-network" });
}

// 14. ShutdownKeyプロセス：タスクマネージャーに偽プロセスを表示
function anomalyShutdownKeyProcess() {
  logMessage("ShutdownKeyプロセスが起動しました。");
  createWindow("タスクマネージャー", `<p>プロセス: ShutdownKey.exe (PID: 4242)</p>`, { id: "window-taskmgr" });
}

// 15. 幻のハードウェア：デバイスマネージャーに未知のデバイスを表示
function anomalyPhantomHardware() {
  logMessage("幻のハードウェアが検出されました。");
  createWindow("デバイスマネージャー", `<p>未知のデバイス: QuantumFlux Module</p>`, { id: "window-devicemgr" });
}

// 16. フォルダ名の変動：Explorer内のフォルダ名を変更
function anomalyFolderNameShift() {
  logMessage("フォルダ名が変動しています。");
  let explorerList = document.getElementById("explorer-list");
  if (explorerList) {
    let items = explorerList.querySelectorAll("li");
    items.forEach(li => {
      li.textContent += " (" + Math.random().toString(36).substring(2,5) + ")";
    });
  }
}

// 17. 不可能なセクター：ディスクチェックウィンドウを生成
function anomalyImpossibleSector() {
  logMessage("不可能なセクターが検出されました。");
  createWindow("ディスクチェック", `<p>エラー: セクター 0xFFFFF が不正です。</p>`, { id: "window-diskcheck" });
}

// 18. 自動起動スクリーンセーバー：全画面に謎のスクリーンセーバーを表示
function anomalyAutoScreensaver() {
  logMessage("スクリーンセーバーが自動起動しました。");
  let screensaver = document.createElement("div");
  screensaver.id = "screensaver";
  screensaver.style.position = "absolute";
  screensaver.style.top = "0";
  screensaver.style.left = "0";
  screensaver.style.width = "100%";
  screensaver.style.height = "100%";
  screensaver.style.backgroundColor = "black";
  screensaver.style.color = "white";
  screensaver.style.display = "flex";
  screensaver.style.justifyContent = "center";
  screensaver.style.alignItems = "center";
  screensaver.style.fontSize = "24px";
  screensaver.style.zIndex = "1000";
  screensaver.textContent = "謎の映像...";
  document.body.appendChild(screensaver);
  setTimeout(() => { document.body.removeChild(screensaver); }, 5000);
}

// 19. 改変されたメール：メールウィンドウを生成
function anomalyModifiedEmail() {
  logMessage("メールが改変されました。");
  createWindow("メール", `<p>件名: 失われた記憶<br>本文: このメールは存在しないはずの記録です。</p>`, { id: "window-email" });
}

// 20. 逆再生のシステム音：別のトーンを再生
function anomalyReversedSystemSound() {
  logMessage("逆再生のシステム音が鳴りました。");
  try {
    let ctx = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator = ctx.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(330, ctx.currentTime);
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
  } catch (e) { console.error(e); }
}

// 21. メモ帳の不滅文：メモ帳の内容を固定化（編集不可）
function anomalyUndyingNotepad() {
  logMessage("メモ帳に不滅の文が現れました。");
  openNotepad();
  let notepad = document.getElementById("window-notepad");
  if (notepad) {
    let textarea = notepad.querySelector("textarea");
    if (textarea) {
      textarea.value = "この文は消せない...";
      textarea.readOnly = true;
    }
  }
}

// 22. 隠しパーティション：隠しパーティションウィンドウを生成
function anomalyHiddenPartition() {
  logMessage("隠しパーティションが発見されました。");
  createWindow("隠しパーティション", `<p>ここには何か重要な秘密が隠されています。</p>`, { id: "window-hidden-partition" });
}

// 23. 重なるウィンドウの謎：重なったウィンドウに隠し文字列表示
function anomalyOverlappingWindows() {
  logMessage("重なったウィンドウに謎の文字列が浮かび上がりました。");
  createWindow("謎のウィンドウ", `<p style="opacity:0.5;">SECRET CODE: 42-19-88</p>`, { id: "window-secret" });
}

// 24. 存在しないデバイスの痕跡：USB接続履歴のログ出力
function anomalyNonexistentDevice() {
  logMessage("存在しないUSBデバイスの接続履歴が記録されました。");
}

// 25. 無効なショートカットキー：一時的にキーボードショートカットを無効化
function anomalyInvalidShortcuts() {
  logMessage("ショートカットキーが無効になりました。");
  window.disableShortcuts = true;
  setTimeout(() => {
    window.disableShortcuts = false;
    logMessage("ショートカットキーが復活しました。");
  }, 10000);
}

// 26. ヒント付きブルースクリーン：BSOD風ウィンドウを表示
function anomalyBlueScreenHint() {
  logMessage("ブルースクリーンが発生しました。");
  let bsod = document.createElement("div");
  bsod.id = "bsod";
  bsod.style.position = "absolute";
  bsod.style.top = "0";
  bsod.style.left = "0";
  bsod.style.width = "100%";
  bsod.style.height = "100%";
  bsod.style.backgroundColor = "#0000AA";
  bsod.style.color = "white";
  bsod.style.display = "flex";
  bsod.style.flexDirection = "column";
  bsod.style.justifyContent = "center";
  bsod.style.alignItems = "center";
  bsod.style.zIndex = "1000";
  bsod.innerHTML = "<h1>ブルースクリーン</h1><p>ヒント: システムファイルを調べよ。</p>";
  document.body.appendChild(bsod);
  setTimeout(() => { document.body.removeChild(bsod); }, 5000);
}

// 27. 巻き戻る時間：システム時計を一時的に逆行させる
function anomalyTimeRewind() {
  logMessage("時間が巻き戻り始めました。");
  window.clockRewinding = true;
  window.customClockTime = new Date();
  setTimeout(() => {
    window.clockRewinding = false;
    window.customClockTime = undefined;
    logMessage("時間は正常に戻りました。");
  }, 15000);
}

// 28. 自己生成ウイルス：短時間で複数のウィンドウを生成
function anomalySelfGeneratingVirus() {
  logMessage("自己生成ウイルスが発見されました。");
  let count = 0;
  let virusInterval = setInterval(() => {
    createWindow("ウイルス", `<p>ウイルス感染中...</p>`, { width: "200px", height: "100px" });
    count++;
    if (count >= 5) { clearInterval(virusInterval); }
  }, 3000);
}

// 29. 未来のハード情報：未来のハードウェア情報を表示
function anomalyFutureHardware() {
  logMessage("未来のハードウェア情報が表示されました。");
  createWindow("システム情報", `<p>CPU: Quantum Processor 9000<br>RAM: 128TB<br>GPU: Holographic Renderer</p>`, { id: "window-sysinfo" });
}

// 30. Shutdown Ritual：シャットダウン儀式ウィンドウを表示し、正しいコード（42-19-88）の入力を求める
function anomalyShutdownRitual() {
  logMessage("シャットダウン儀式が開始されました。");
  anomalyManager.shutdownRitualActive = true;
  createWindow("シャットダウン儀式", `<p>全てのウィンドウを閉じ、謎のコードを入力してください:</p>
    <input type="text" id="ritual-code" placeholder="謎のコード">
    <button id="ritual-submit">送信</button>
    <div id="ritual-message"></div>`, { id: "window-ritual", closable: false });
  document.getElementById("ritual-submit").addEventListener("click", function() {
    let code = document.getElementById("ritual-code").value;
    if (code.trim() === "42-19-88") {
      document.getElementById("ritual-message").innerHTML = "<p>儀式成功！シャットダウン可能です。</p>";
      anomalyManager.shutdownRitualActive = false;
      let ritualWin = document.getElementById("window-ritual");
      if (ritualWin) {
        ritualWin.querySelector(".window-close").style.display = "block";
      }
    } else {
      document.getElementById("ritual-message").innerHTML = "<p>コードが違います。</p>";
    }
  });
}

// 31. 書き換えられる検索履歴：ブラウザ内の検索履歴を書き換え（iframe のURLに疑似パラメータを追加）
function anomalySearchHistoryRewrite() {
  logMessage("検索履歴が書き換えられました。");
  let browserWin = document.getElementById("window-browser");
  if (browserWin) {
    let iframe = browserWin.querySelector("iframe");
    if (iframe) {
      let url = new URL(iframe.src);
      url.searchParams.set("history", "altered");
      iframe.src = url.toString();
    }
  }
}

// 32. デジタルチャット：チャットウィンドウを生成し、背景からのメッセージを表示
function anomalyDigitalChat() {
  logMessage("デジタルチャットが開始されました。");
  createWindow("チャット", `<div id="chat-box" style="height:150px; overflow:auto; border:1px solid #ccc; padding:5px;"></div>
    <input type="text" id="chat-input" placeholder="メッセージを入力" style="width:80%;">
    <button id="chat-send">送信</button>`, { id: "window-chat" });
  let chatBox = document.getElementById("chat-box");
  let messages = [
    "過去の記憶: 誰かがここにいる。",
    "システム: 注意せよ、異変が続く。",
    "謎: 全ては必然だ。",
    "幽霊: シャットダウンできぬ運命…"
  ];
  let msgIndex = 0;
  let c
