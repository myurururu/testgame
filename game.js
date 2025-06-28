const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

let COLS = 10;
let ROWS = 20;
let BLOCK_SIZE;

function resizeCanvas() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  BLOCK_SIZE = Math.floor(width / COLS);
  canvas.width = COLS * BLOCK_SIZE;
  canvas.height = ROWS * BLOCK_SIZE;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  draw();
});

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let score = 0;
let gameOver = false;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

const pieces = [
  [[1, 1, 1], [0, 1, 0]], // T
  [[0, 2, 2], [2, 2, 0]], // S
  [[3, 3, 0], [0, 3, 3]], // Z
  [[4, 4, 4, 4]],         // I
  [[5, 5], [5, 5]],       // O
  [[6, 0, 0], [6, 6, 6]], // J
  [[0, 0, 7], [7, 7, 7]], // L
];

function createPiece() {
  const shape = pieces[Math.floor(Math.random() * pieces.length)];
  return {
    x: Math.floor((COLS - shape[0].length) / 2),
    y: 0,
    shape: shape
  };
}

let current = createPiece();

const colors = [
  null, "#FF0D72", "#0DC2FF", "#0DFF72",
  "#F538FF", "#FF8E0D", "#FFE138", "#3877FF"
];

function drawBlock(x, y, color) {
  context.fillStyle = color;
  context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  context.strokeStyle = "#222";
  context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) drawBlock(x, y, colors[value]);
    });
  });
  current.shape.forEach((row, dy) => {
    row.forEach((value, dx) => {
      if (value) drawBlock(current.x + dx, current.y + dy, colors[value]);
    });
  });
}

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

function merge(board, piece) {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value && piece.y + y >= 0) {
        board[piece.y + y][piece.x + x] = value;
      }
    });
  });
}

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

function drop() {
  current.y++;
  if (collide(board, current)) {
    current.y--;
    merge(board, current);
    resetPiece();
    clearLines();
    if (collide(board, current)) {
      gameOver = true;
      document.getElementById("message").textContent = "ゲームオーバー";
    }
  }
  dropCounter = 0;
}

function clearLines() {
  outer: for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      score += 100;
      document.getElementById("score").textContent = `スコア: ${score}`;
      y++;
    }
  }
}

function resetPiece() {
  current = createPiece();
}

function update(time = 0) {
  if (gameOver) return;
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    drop();
  }
  draw();
  requestAnimationFrame(update);
}

document.addEventListener("keydown", e => {
  if (gameOver) return;
  switch (e.key) {
    case "ArrowLeft": current.x--; if (collide(board, current)) current.x++; break;
    case "ArrowRight": current.x++; if (collide(board, current)) current.x--; break;
    case "ArrowDown": drop(); break;
    case "ArrowUp":
      current.shape = rotate(current.shape);
      if (collide(board, current)) current.shape = rotate(rotate(rotate(current.shape)));
      break;
  }
});

document.getElementById("left").addEventListener("click", () => {
  current.x--; if (collide(board, current)) current.x++;
});
document.getElementById("right").addEventListener("click", () => {
  current.x++; if (collide(board, current)) current.x--;
});
document.getElementById("down").addEventListener("click", drop);
document.getElementById("rotate").addEventListener("click", () => {
  current.shape = rotate(current.shape);
  if (collide(board, current)) current.shape = rotate(rotate(rotate(current.shape)));
});

update();
