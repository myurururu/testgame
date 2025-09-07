function normalAcftion1() {
  console.log("動作確認ログ：スキル関数呼び出し");
  // スキルのコスト消費 発動に必要なコストと減算処理
  if(materialCounts[2] >= 3 && materialCounts[3] >= 3){
        materialCounts[2] -= 3;
        materialCounts[3] -= 3;
        updatePoint();
        console.log("動作確認ログ：スキル発動");
        // 実際の処理をここに書く
        playerHp += 1;
        document.getElementById("life").textContent = `ライフ: ${playerHp}`;
        draw(); // 描画
  }
}

function normalAcftion2() {
  console.log("動作確認ログ：スキル関数呼び出し");
  // スキルのコスト消費 発動に必要なコストと減算処理
  if(materialCounts[1] >= 3 && materialCounts[4] >= 3 && materialCounts[5] >= 3){
        materialCounts[1] -= 3;
        materialCounts[4] -= 3;
        materialCounts[5] -= 3;
        updatePoint();
        console.log("動作確認ログ：スキル発動");
        // 実際の処理をここに書く
        score += 5000;
        document.getElementById("score").textContent = `スコア: ${score}`;
        draw(); // 描画
  }
}

// 盤面の毒を回復に変化
function charaAcftion3() {
  console.log("動作確認ログ：スキル関数呼び出し");
  // スキルのコスト消費 発動に必要なコストと減算処理
  if(materialCounts[2] >= 3){
        materialCounts[2] -= 3;
        updatePoint();
        console.log("動作確認ログ：スキル発動");
        // 実際の処理をここに書く
        changeBoardPieceValues(7,6);
        // 盤面の再描画
        draw();
  }
}

// ピース落下を一時停止
function charaAcftion1() {
  console.log("動作確認ログ：スキル関数呼び出し");
  // スキルのコスト消費 発動に必要なコストと減算処理
  if(materialCounts[5] >= 3){
        materialCounts[5] -= 3;
        updatePoint();
        console.log("動作確認ログ：スキル発動");
        // 実際の処理をここに書く
        dropCounter = -3500;
        // 盤面の再描画
        draw();
  }
}

// 下3列を削除
function charaAcftion2() {
  console.log("動作確認ログ：スキル関数呼び出し");
  // スキルのコスト消費 発動に必要なコストと減算処理
  if(materialCounts[4] >= 3){
        materialCounts[4] -= 3;
        updatePoint();
        console.log("動作確認ログ：スキル発動");
        // 実際の処理をここに書く
        clearBottomThreeRows();
        // 盤面の再描画
        draw();
  }
}

// ピース属性変換
function changeBoardPieceValues(targetValue, newValue) {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x] === targetValue) {
        board[y][x] = newValue;
      }
    }
  }
}

// 列削除
function clearBottomThreeRows() {
  // 下3行を消去
  for (let y = ROWS - 3; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      board[y][x] = 0;
    }
  }

  // 上の行を下にずらす（下から順に処理）
  for (let y = ROWS - 4; y >= 0; y--) {
    for (let x = 0; x < COLS; x++) {
      board[y + 3][x] = board[y][x]; // 3行下にコピー
      board[y][x] = 0;               // 元の位置は空に
    }
  }
}


