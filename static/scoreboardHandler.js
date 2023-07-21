import { gameStatus } from "./gameStatusHandler.js";
import { responseTexts } from "./initData.js";

function pickResponseText(score) {
    let response;
    if (score === 0) {
        response = responseTexts["zero"];
    } else if (score < 3000) {
        response = responseTexts["low"];
    } else if (score < 15000) {
        response = responseTexts["medium"];
    } else {
        response = responseTexts["high"];
    }
    let randomIndex = Math.floor(Math.random() * response.length);
    return response[randomIndex];
}

export function showGameOverScreen() {
    gameStatus.gameOverScreen = true;

    const responseText = pickResponseText(gameStatus.statistic.score);

    const nameInput = document.getElementById("nameInput");
    const submitButton = document.getElementById("submitScoreButton");
    const gameOverTextEl = document.getElementById("gameOverText");
    let gameOverText = gameOverTextEl.textContent.replace('{responseText}', responseText)
                                                 .replace('{score}', gameStatus.statistic.score);

    gameOverTextEl.textContent = gameOverText;
    document.getElementById("gameOverBox").style.display = "flex";
    document.getElementById("screenOverlay").style.display = "block";
    nameInput.focus();

    nameInput.addEventListener("input", function() {
        if (this.value.trim() !== "") {
            submitButton.disabled = false;
            gameStatus.readyToSubmitName = true;
        } else {
            submitButton.disabled = true;
            gameStatus.readyToSubmitName = false;
        }
    })
    
}

export function submitScore() {
    const nameInputEl = document.getElementById("nameInput");
    nameInputEl.value = "";
    nameInputEl.blur();
    document.getElementById("submitScoreButton").disabled = true;
    document.getElementById("gameOverBox").style.display = "none";
    document.getElementById("screenOverlay").style.display = "none";
    gameStatus.readyToSubmitName = false;
    gameStatus.gameOverScreen = false;
}