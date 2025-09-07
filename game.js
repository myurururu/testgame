// キャンバス要素と描画コンテキストを取得
const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

// 盤面の列数・行数、ブロックサイズ（後で計算）
let COLS = 10;
let ROWS = 20;
let BLOCK_SIZE;

// 盤面を初期化（0は空きマス）
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let score = 0;
let materialCounts = {1:0,2:0,3:0,4:0,5:0,6:0,7:0}
let gameOver = false;
let dropCounter = 0;
let dropInterval = 1000; // 落下間隔（ミリ秒）
let lastTime = 0;
let difficulty = "未選択";
let playerHp = 3;

// 各ピースの定義（数値は色のインデックス）
const pieces = [
  [[1, 1, 1], [0, 1, 0]], // T型
  [[0, 2, 2], [2, 2, 0]], // S型
  [[3, 3, 0], [0, 3, 3]], // Z型
  [[4, 4, 4, 4]],         // I型
  [[5, 5], [5, 5]],       // O型
  [[6, 0, 0], [6, 6, 6]], // J型
  [[0, 0, 7], [7, 7, 7]], // L型
];
// ピースの色（インデックスと対応）
const colors = [
    null, "#FF0D72", "#0DC2FF", "#0DFF72",
    "#F538FF", "#FF8E0D", "#FFE138", "#3877FF"
  ];
// ピースの表示名
const colorNames = [
  null, "鉱石", "植物", "水", "布", "骨", "回復", "毒"
];
// ピースのイメージ画像を設定
const picesImages = [
  null,
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
]
// パス指定
picesImages[1].src = "./img/pice1.png"
picesImages[2].src = "./img/pice2.png"
picesImages[3].src = "./img/pice3.png"
picesImages[4].src = "./img/pice4.png"
picesImages[5].src = "./img/pice5.png"
picesImages[6].src = "./img/pice6.png"
picesImages[7].src = "./img/pice7.png"

let current = createPiece(); // 現在操作中のピース
resizeCanvas();
update();

function startGame(difficulty) {
    console.log("ゲームスタート - 難易度:", difficulty);
  
    score = 0;
    playerHp = 3;
    gameOver = false;
    dropCounter = 0;
    if (difficulty == "easy"){
      dropInterval = 1500; // 落下間隔（ミリ秒）
    }
    if (difficulty == "normal"){
      dropInterval = 800; // 落下間隔（ミリ秒）
    }
    if (difficulty == "hard"){
      dropInterval = 300; // 落下間隔（ミリ秒）
    }
    lastTime = 0;
    for (let i = 1; i <= 7; i++) {
      materialCounts[i] = 0;
    }

    // 盤面を初期化（0は空きマス）
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    
    current = createPiece();
    document.getElementById("life").textContent = "ライフ: 3";
    document.getElementById("score").textContent = "スコア: 0";
    document.getElementById("material").textContent = "入手素材ポイント: 未取得";
    document.getElementById("message").textContent = "";
    resizeCanvas(); // 表示状態でcanvasを初期化
    draw();         // 再描画
    update();         // ゲームループ開始
  }

// ウィンドウサイズに応じてキャンバスサイズとブロックサイズを調整
function resizeCanvas() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  BLOCK_SIZE = Math.floor(width / COLS); // ブロックの幅を計算
  canvas.width = COLS * BLOCK_SIZE;
  canvas.height = ROWS * BLOCK_SIZE;
}

window.addEventListener("resize", () => {
  resizeCanvas(); // ウィンドウサイズ変更時に再調整
  draw();         // 再描画
});

// 新しいピースを作成
function createPiece() {
  const baseShape = pieces[Math.floor(Math.random() * pieces.length)];

  // 重みづけしたランダムインデックス
  const weightedColors = [1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 7, 1, 2, 3, 4, 5, 7];

  // ランダム色インデックスを各ブロックに割り当て
  const shape = baseShape.map(row =>
    row.map(cell => {
      if (cell) {
        // 色インデックス1〜7の中からランダムに選ぶ
        // return Math.floor(Math.random() * (colors.length - 1)) + 1;
        return weightedColors[Math.floor(Math.random() * weightedColors.length)];
      } else {
        // 空白（0）のまま
        return 0;
      }
    })
  );

  return {
    x: Math.floor((COLS - shape[0].length) / 2), // 中央に配置
    y: 0,
    shape: shape
  };
}

// ブロックのピース描画
function drawBlock(x, y, colorIndex) {
  const img = picesImages[colorIndex];
  if (img && img.complete) {
    context.drawImage(img, x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  } else {
    // 読み込み前は仮の枠を表示
    context.fillStyle = "#444";
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  }
  context.strokeStyle = "#222";
  context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}


// 盤面と現在のピースを描画
function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height); // 画面クリア
  board.forEach((row, y) => {
    row.forEach((value, x) => {
      // if (value) drawBlock(x, y, colors[value]); // 固定されたブロックを描画
      if (value) drawBlock(x, y, value); // 固定されたブロックを描画
    });
  });
  current.shape.forEach((row, dy) => {
    row.forEach((value, dx) => {
      // if (value) drawBlock(current.x + dx, current.y + dy, colors[value]); // 操作中のピースを描画
      if (value) drawBlock(current.x + dx, current.y + dy, value); // 操作中のピースを描画
    });
  });
}

// ゲームオーバー時のメニュー表示
function showGameOverMenu() {
  document.getElementById("gameover-menu").style.display = "block";
}
// ピースが盤面と衝突しているかを判定
function collide(board, piece) {
  return piece.shape.some((row, y) =>
    row.some((value, x) => {
      if (!value) return false;
      const px = piece.x + x;
      const py = piece.y + y;
      return (
        px < 0 || px >= COLS || py >= ROWS || (py >= 0 && board[py][px])
      );
    })
  );
}

// ピースを盤面に固定
function merge(board, piece) {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value && piece.y + y >= 0) {
        board[piece.y + y][piece.x + x] = value;
      }
    });
  });
}

// ピースを右回転（90度）
function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

// ピースを1マス下に移動させ、衝突したら固定して新しいピースへ
function drop() {
  current.y++;
  if (collide(board, current)) {
    current.y--;
    merge(board, current);
    resetPiece();
    clearLines(); // ラインが揃っていたら削除
    if (collide(board, current)) { // 新しいピースが即座に衝突するならゲームオーバー
      gameOver = true;
      document.getElementById("message").textContent = "ゲームオーバー";
      showGameOverMenu();
    }
  }
  dropCounter = 0;
}

// 即座に落下、次のピースへ
function hardDrop() {
  while (!collide(board, current)) {
    current.y++;
  }
  current.y--; // 最後に衝突した位置に戻す
  merge(board, current);
  resetPiece();
  clearLines();
  if (collide(board, current)) {
    gameOver = true;
    document.getElementById("message").textContent = "ゲームオーバー";
    showGameOverMenu();
  }
  draw(); // 描画更新
}


// 揃ったラインを削除しスコア加算 消したピースの属性毎加算
function clearLines() {
  outer: for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      // 色ごとのカウントを更新
      for (let x = 0; x < COLS; x++) {
        const colorIndex = board[y][x];
        if (colorIndex !== 0) {
          materialCounts[colorIndex] += 1;
        }
        console.log("colorIndex:", colorIndex);
        console.log("materialCounts:", materialCounts);
      }
      // 回復&ダメージ計算
      // ライフ回復
      if (materialCounts[6] > 0){
        playerHp += materialCounts[6];
        materialCounts[6] = 0;
      }
      // 毒ダメージ
      if (materialCounts[7] > 0){
        playerHp -= materialCounts[7];
        materialCounts[7] = 0;
      }      
      board.splice(y, 1); // その行を削除
      board.unshift(Array(COLS).fill(0)); // 一番上に空行追加
      score += 100;
      document.getElementById("life").textContent = `ライフ: ${playerHp}`;
      document.getElementById("score").textContent = `スコア: ${score}`;
      updatePoint(); // 素材のポイントを画面の出力に反映
      y++; // 同じ行を再確認（連続で消せる場合）
    }
  }
  if (playerHp <= 0) { // ライフが０以下ならゲームオーバー
    gameOver = true;
    document.getElementById("message").textContent = "ゲームオーバー";
    showGameOverMenu();
  }
  draw(); // 描画
}

function updatePoint(){
  // カウント用の変数に加算
  let colorScoreText = "入手素材ポイント: ";
  for (let i = 1; i < colors.length; i++) {
    if (materialCounts[i] > 0) {
      colorScoreText += `${colorNames[i]}${materialCounts[i]} `;
    }
  }
  document.getElementById("material").textContent = colorScoreText.trim();
}

// 新しいピースを生成
function resetPiece() {
  current = createPiece();
}

// 毎フレーム呼び出されるゲームループ
function update(time = 0) {
    gameScreen = document.getElementById("game-screen");
    if (gameOver) return; // ゲームオーバーなら処理しない
    // ゲーム開始前に呼ばれた場合は処理しない
    if (gameScreen.style.visibility == "visible") {
        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            drop();
        }
        draw(); // 描画
    }
    requestAnimationFrame(update); // 次のフレームへ
}

// キーボード操作
document.addEventListener("keydown", e => {
  if (gameOver) return;
  switch (e.key) {
    case "ArrowLeft":
      current.x--;
      if (collide(board, current)) current.x++; // 衝突したら戻す
      break;
    case "ArrowRight":
      current.x++;
      if (collide(board, current)) current.x--;
      break;
    case "ArrowDown":
      drop(); // すぐに落とす
      break;
    case "ArrowUp":
      current.shape = rotate(current.shape);
      if (collide(board, current)) {
        // 回転して衝突するなら元に戻す（3回追加回転で逆回転）
        current.shape = rotate(rotate(rotate(current.shape)));
      }
      break;
    case "a":
    case "A":
      console.log("回復スキル呼び出し");
      normalAcftion1();
      break;
    case "s":
    case "S":
      console.log("スコアスキル呼び出し");
      normalAcftion2();
      break;
    case "d":
    case "D":
      console.log("キャラスキル呼び出し");
      charaAcftion1();
      break;
    case "f":
    case "F":
      console.log("キャラスキル呼び出し");
      charaAcftion2();
      break;
    case "g":
    case "G":
      console.log("キャラスキル呼び出し");
      charaAcftion3();
      break;
    case "Enter":
      hardDrop();
      break;
  }
});

// タッチ操作ボタン（スマホ用）に対応
document.getElementById("left").addEventListener("click", () => {
  current.x--;
  if (collide(board, current)) current.x++;
});
document.getElementById("right").addEventListener("click", () => {
  current.x++;
  if (collide(board, current)) current.x--;
});
document.getElementById("down").addEventListener("click", drop);
document.getElementById("rotate").addEventListener("click", () => {
  current.shape = rotate(current.shape);
  if (collide(board, current)) {
    current.shape = rotate(rotate(rotate(current.shape)));
  }
});

document.getElementById("skill1").addEventListener("click", () => {
  normalAcftion1();
});
document.getElementById("skill2").addEventListener("click", () => {
  normalAcftion2();
});
document.getElementById("unikeskill1").addEventListener("click", () => {
  charaAcftion1();
});
document.getElementById("unikeskill2").addEventListener("click", () => {
  charaAcftion2();
});
document.getElementById("unikeskill3").addEventListener("click", () => {
  charaAcftion3();
});

document.getElementById("retry-button").addEventListener("click", () => {
  document.getElementById("gameover-menu").style.display = "none";
  startGame(difficulty); // 難易度は前回選択されたものを再利用
});

document.getElementById("title-button").addEventListener("click", () => {
  document.getElementById("gameover-menu").style.display = "none";
  document.getElementById("game-screen").style.visibility = "hidden";
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("title-screen").style.visibility = "visible";
  document.getElementById("title-screen").style.display = "block";
});


