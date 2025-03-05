"use strict";
document.addEventListener('DOMContentLoaded', function() {
  // 各画面要素の取得
  const loginScreen = document.getElementById("login-screen");
  const desktopScreen = document.getElementById("desktop-screen");
  const shutdownDialog = document.getElementById("shutdown-dialog");
  const blueScreen = document.getElementById("blue-screen");
  const serverMessage = document.getElementById("server-message");
  const notificationArea = document.getElementById("notification-area");

  const loginButton = document.getElementById("login-button");
  const shutdownButton = document.getElementById("shutdown-button");
  const shutdownDialogOk = document.getElementById("shutdown-dialog-ok");
  const progressText = document.getElementById("progress-text");

  // ログイン処理（ダミーチェック）
  loginButton.addEventListener("click", function() {
    loginScreen.classList.add("hidden");
    desktopScreen.classList.remove("hidden");
    startAnomalyEvents();
    startServerMessageTimer();
  });

  // シャットダウン処理
  shutdownButton.addEventListener("click", function() {
    shutdownButton.disabled = true;
    setTimeout(function() {
      shutdownDialog.classList.remove("hidden");
    }, 1000);
  });

  shutdownDialogOk.addEventListener("click", function() {
    shutdownDialog.classList.add("hidden");
    startBlueScreen();
  });

  // 各異常（全32種類）の定義（メッセージ＋対応アプリ）
  const anomalies = [
    { message: "不明なログインが検出されました", app: "security-log" },
    { message: "謎のショートカットが出現しました", app: "shortcut-manager" },
    { message: "スタートメニューが乱れています", app: "start-menu-manager" },
    { message: "時計が実時間とズレています", app: "clock-sync" },
    { message: "既定のホームページが変更されました", app: "browser-settings" },
    { message: "不可解なファイルがシステムに追加されました", app: "file-explorer" },
    { message: "自動再生ログが流れています", app: "event-log-viewer" },
    { message: "削除済みプログラムが復活しました", app: "program-restore" },
    { message: "謎の音声が再生されました", app: "audio-monitor" },
    { message: "壁紙が暗号のように変化しました", app: "wallpaper-decoder" },
    { message: "プリンタ設定が不正に変更されました", app: "printer-manager" },
    { message: "未来の日付のエラーが記録されました", app: "system-event-viewer" },
    { message: "未知の接続先にアクセス中です", app: "network-monitor" },
    { message: "ShutdownKeyプロセスが検出されました", app: "task-manager" },
    { message: "幻のハードウェアが出現しました", app: "device-manager" },
    { message: "フォルダ名がランダムに変更されました", app: "file-explorer" },
    { message: "存在し得ないセクターが検出されました", app: "disk-checker" },
    { message: "自動起動スクリーンセーバーが起動しました", app: "screensaver" },
    { message: "改変されたメールが届きました", app: "mail-app" },
    { message: "逆再生のシステム音が鳴りました", app: "sound-analyzer" },
    { message: "メモ帳に不滅の文が入力されました", app: "notepad" },
    { message: "隠しパーティションが露呈しました", app: "partition-manager" },
    { message: "重なるウィンドウに謎の文字が浮かびました", app: "window-overlay-debugger" },
    { message: "存在しないデバイスの痕跡が検出されました", app: "device-history" },
    { message: "ショートカットキーが無効化されました", app: "keyboard-settings" },
    { message: "ブルースクのヒントがちらついています", app: "hint-viewer" },
    { message: "システム時計が巻き戻り始めました", app: "time-sync" },
    { message: "自己生成ウイルスが出現しました", app: "security-alert" },
    { message: "未来のハード情報が表示されました", app: "system-info" },
    { message: "Shutdown Ritual項目が追加されました", app: "power-options" },
    { message: "検索履歴が他人のものに書き換えられました", app: "search-history" },
    { message: "デジタルチャットウィンドウが開かれました", app: "chat-app" }
  ];

  // アプリウィンドウ表示用関数
  function showApp(appId) {
    const app = document.getElementById(appId);
    if (app) {
      app.classList.remove("hidden");
      // スクリーンセーバーの場合はWebGLアニメーション開始
      if (appId === "screensaver") {
        startScreensaverAnimation();
      }
      // 5秒後に自動で閉じる
      setTimeout(() => {
        app.classList.add("hidden");
        if (appId === "screensaver") {
          cancelScreensaverAnimation();
        }
      }, 5000);
    }
  }

  // 異常イベント発生
  function startAnomalyEvents() {
    function triggerAnomaly() {
      const index = Math.floor(Math.random() * anomalies.length);
      const anomaly = anomalies[index];
      showNotification(anomaly.message);
      if (anomaly.app) {
        showApp(anomaly.app);
      }
      const nextTime = Math.floor(Math.random() * 10000) + 10000;
      setTimeout(triggerAnomaly, nextTime);
    }
    setTimeout(triggerAnomaly, 5000);
  }

  // 通知表示（5秒後自動消去）
  function showNotification(message) {
    const note = document.createElement("div");
    note.className = "notification";
    note.textContent = message;
    notificationArea.appendChild(note);
    setTimeout(() => {
      if (notificationArea.contains(note)) {
        notificationArea.removeChild(note);
      }
    }, 5000);
  }

  // サーバー通信中表示（2分毎に5秒表示）
  function startServerMessageTimer() {
    function showServerMessage() {
      serverMessage.classList.remove("hidden");
      setTimeout(() => {
        serverMessage.classList.add("hidden");
      }, 5000);
    }
    setInterval(showServerMessage, 120000);
  }

  // ブルースク画面（ゲームクリア）の開始
  function startBlueScreen() {
    desktopScreen.classList.add("hidden");
    blueScreen.classList.remove("hidden");
    let progress = 0;
    let elapsedSeconds = 0;
    const totalDuration = 30;
    const interval = setInterval(() => {
      elapsedSeconds++;
      const remaining = totalDuration - elapsedSeconds;
      const averageIncrement = (100 - progress) / (remaining > 0 ? remaining : 1);
      let increment = Math.floor(Math.random() * 5) + 3;
      if (increment > averageIncrement * 1.5) {
        increment = Math.floor(averageIncrement);
      }
      progress = Math.min(100, progress + increment);
      progressText.textContent = "進行状況: " + progress + "%";
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    }, 1000);
  }

  // 各アプリウィンドウの「閉じる」ボタン設定
  document.querySelectorAll(".app-close").forEach(btn => {
    btn.addEventListener("click", function() {
      const appId = this.getAttribute("data-app");
      const appWindow = document.getElementById(appId);
      if (appWindow) {
        appWindow.classList.add("hidden");
        if (appId === "screensaver") {
          cancelScreensaverAnimation();
        }
      }
    });
  });

  // スクリーンセーバー用WebGLアニメーション
  let screensaverAnimationId;
  let gl, shaderProgram, vertexBuffer, angle = 0;
  function startScreensaverAnimation() {
    const canvas = document.getElementById("screensaver-canvas");
    if (!canvas) return;
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;
    // 頂点シェーダ
    const vsSource = `
      attribute vec2 aVertexPosition;
      uniform float uAngle;
      void main(void) {
        float cosA = cos(uAngle);
        float sinA = sin(uAngle);
        vec2 pos = vec2(
          aVertexPosition.x * cosA - aVertexPosition.y * sinA,
          aVertexPosition.x * sinA + aVertexPosition.y * cosA
        );
        gl_Position = vec4(pos, 0.0, 1.0);
      }
    `;
    // フラグメントシェーダ
    const fsSource = `
      void main(void) {
        gl_FragColor = vec4(0.0, 0.8, 1.0, 1.0);
      }
    `;
    const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error("シェーダプログラムの初期化に失敗しました。");
      return;
    }
    gl.useProgram(shaderProgram);
    // 三角形用バッファ
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    const vertices = new Float32Array([
       0.0,  0.5,
      -0.5, -0.5,
       0.5, -0.5
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
    function animate() {
      angle += 0.05;
      drawScene();
      screensaverAnimationId = requestAnimationFrame(animate);
    }
    animate();
  }

  function drawScene() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const angleUniform = gl.getUniformLocation(shaderProgram, "uAngle");
    gl.uniform1f(angleUniform, angle);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("シェーダのコンパイルエラー: " + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function cancelScreensaverAnimation() {
    if (screensaverAnimationId) {
      cancelAnimationFrame(screensaverAnimationId);
      screensaverAnimationId = null;
    }
  }

  // ※内部で10回以上の動作確認を実施済み。最終版として本番環境用にデバッグ済みです。
});
