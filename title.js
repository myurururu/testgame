const titleScreen = document.getElementById("title-screen");
const characterScreen = document.getElementById("character-screen");
const difficultyScreen = document.getElementById("difficulty-screen");
gameScreen = document.getElementById("game-screen");
const startButton = document.getElementById("start-button");
const charaButtons = document.querySelectorAll(".character-button");
const difficultyButtons = document.querySelectorAll(".difficulty-button");
const difficultyDisplay = document.getElementById("difficulty-display");

let selectedDifficulty = "";

//ゲーム開始要求時のイベント
startButton.addEventListener("click", () => {
    titleScreen.style.display = "none";//タイトルを非表示
    characterScreen.style.display = "block";//キャラ選択を非表示
});

//キャラ選択時のイベント
charaButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedCharacter = button.dataset.chara;
        document.getElementById("character").textContent = selectedCharacter;
        characterScreen.style.display = "none";//キャラ選択を非表示
        difficultyScreen.style.display = "block";//難易度選択を表示
  });
});


//難易度選択時のイベント
difficultyButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedDifficulty = button.dataset.level;
        difficultyScreen.style.display = "none";//難易度選択を非表示
        gameScreen.style.visibility = "visible";//ゲーム画面を表示
        document.getElementById("difficulty").textContent = selectedDifficulty;
  });
});

