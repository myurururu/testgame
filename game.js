// game.js

const canvas = document.getElementById('game');
canvas.width = 10 * 24;  // 横10マス × 24px
canvas.height = 20 * 24; // 縦20マス × 24px
const context = canvas.getContext('2d');
context.scale(24, 24);   // マス単位にスケーリング

const ROWS = 20;
const COLUMNS = 10;

let score = 0;
let gameOver = false;

const SHAPES = {
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  I: [
    [1, 1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ]
};

const COLORS = {
  T: 'purple',
  O: 'yellow',
  I: 'cyan',
  L: 'orange',
  J: 'blue',
  S: 'green',
  Z: 'red'
};

function createMatrix(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

const field = createMatrix(ROWS, COLUMNS);

function drawMatrix(matrix, offset, color) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = color;
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, COLUMNS, ROWS);
  drawMatrix(field, { x: 0, y: 0 }, 'gray');
  if (piece) drawMatrix(piece.matrix, piece.pos, piece.color);
}

function collide(field, piece) {
  const { matrix, pos } = piece;
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < matrix[y].length; ++x) {
      if (
        matrix[y][x] &&
        (field[y + pos.y] && field[y + pos.y][x + pos.x]) !== 0
      ) {
        return true;
      }
    }
  }
  return false;
}

function merge(field, piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        field[y + piece.pos.y][x + piece.pos.x] = value;
      }
    });
  });
}

function sweep() {
  let lines = 0;
  outer: for (let y = field.length - 1; y >= 0; --y) {
    for (let x = 0; x < field[y].length; ++x) {
      if (field[y][x] === 0) continue outer;
    }
    field.splice(y, 1);
    field.unshift(Array(COLUMNS).fill(0));
    lines++;
  }
  if (lines > 0) {
    score += lines * 10;
    document.getElementById('score').textContent = score;
  }
}

function createPiece(type) {
  return {
    matrix: SHAPES[type],
    pos: { x: Math.floor(COLUMNS / 2) - Math.floor(SHAPES[type][0].length / 2), y: 0 },
    color: COLORS[type]
  };
}

function drop() {
  if (gameOver) return;
  piece.pos.y++;
  if (collide(field, piece)) {
    piece.pos.y--;
    merge(field, piece);
    sweep();
    piece = createPiece(randomType());
    if (collide(field, piece)) {
      document.getElementById('message').textContent = 'ゲームオーバー';
      gameOver = true;
    }
  }
  dropCounter = 0;
}

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

function rotatePiece() {
  if (gameOver) return;
  const rotated = rotate(piece.matrix);
  const old = piece.matrix;
  piece.matrix = rotated;
  if (collide(field, piece)) piece.matrix = old;
}

function moveLeft() {
  if (gameOver) return;
  piece.pos.x--;
  if (collide(field, piece)) piece.pos.x++;
}

function moveRight() {
  if (gameOver) return;
  piece.pos.x++;
  if (collide(field, piece)) piece.pos.x--;
}

function softDrop() {
  if (gameOver) return;
  drop();
}

document.addEventListener('keydown', e => {
  if (gameOver) return;
  if (e.key === 'ArrowLeft') moveLeft();
  else if (e.key === 'ArrowRight') moveRight();
  else if (e.key === 'ArrowDown') softDrop();
  else if (e.key === 'ArrowUp') rotatePiece();
});

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    drop();
  }
  draw();
  requestAnimationFrame(update);
}

function randomType() {
  const types = Object.keys(SHAPES);
  return types[Math.floor(Math.random() * types.length)];
}

let piece = createPiece(randomType());
update();

let lastTouchEnd = 0;

document.addEventListener('touchend', function (event) {
  const now = new Date().getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault(); // ダブルタップをキャンセル
  }
  lastTouchEnd = now;
}, false);

function resizeCanvas() {
    const blockSize = Math.floor(window.innerWidth / COLUMNS); // 1マスのサイズ
    const height = blockSize * ROWS;
    const width = blockSize * COLUMNS;
  
    canvas.width = width;
    canvas.height = height;
    context.setTransform(1, 0, 0, 1, 0, 0); // スケーリング前にリセット
    context.scale(blockSize, blockSize);
    draw(); // 再描画
  }
  
  // 初回とウィンドウサイズ変更時に実行
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  