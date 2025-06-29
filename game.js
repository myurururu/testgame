// キャンバス要素と描画コンテキストを取得
const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

// 盤面の列数・行数、ブロックサイズ（後で計算）
let COLS = 10;
let ROWS = 20;
let BLOCK_SIZE;

// ウィンドウサイズに応じてキャンバスサイズとブロックサイズを調整
function resizeCanvas() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  BLOCK_SIZE = Math.floor(width / COLS); // ブロックの幅を計算
  canvas.width = COLS * BLOCK_SIZE;
  canvas.height = ROWS * BLOCK_SIZE;
}
resizeCanvas(); // 初回呼び出し
window.addEventListener("resize", () => {
  resizeCanvas(); // ウィンドウサイズ変更時に再調整
  draw();         // 再描画
});

// 盤面を初期化（0は空きマス）
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let score = 0;
let gameOver = false;
let dropCounter = 0;
let dropInterval = 1000; // 落下間隔（ミリ秒）
let lastTime = 0;

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

// 新しいピースを作成
function createPiece() {
  const shape = pieces[Math.floor(Math.random() * pieces.length)];
  return {
    x: Math.floor((COLS - shape[0].length) / 2), // 中央に配置
    y: 0,
    shape: shape
  };
}

let current = createPiece(); // 現在操作中のピース

// ピースの色（インデックスと対応）
const colors = [
  null, "#FF0D72", "#0DC2FF", "#0DFF72",
  "#F538FF", "#FF8E0D", "#FFE138", "#3877FF"
];

// ブロック（マス）を描画
function drawBlock(x, y, color) {
  context.fillStyle = color;
  context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  context.strokeStyle = "#222"; // 枠線
  context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// 盤面と現在のピースを描画
function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height); // 画面クリア
  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) drawBlock(x, y, colors[value]); // 固定されたブロックを描画
    });
  });
  current.shape.forEach((row, dy) => {
    row.forEach((value, dx) => {
      if (value) drawBlock(current.x + dx, current.y + dy, colors[value]); // 操作中のピースを描画
    });
  });
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
    }
  }
  dropCounter = 0;
}

// 揃ったラインを削除しスコア加算
function clearLines() {
  outer: for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      board.splice(y, 1); // その行を削除
      board.unshift(Array(COLS).fill(0)); // 一番上に空行追加
      score += 100;
      document.getElementById("score").textContent = `スコア: ${score}`;
      y++; // 同じ行を再確認（連続で消せる場合）
    }
  }
}

// 新しいピースを生成
function resetPiece() {
  current = createPiece();
}

// 毎フレーム呼び出されるゲームループ
function update(time = 0) {
  if (gameOver) return; // ゲームオーバーなら処理しない
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    drop();
  }
  draw(); // 描画
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

// ゲーム開始
update();
