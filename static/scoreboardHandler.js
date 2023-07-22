//TODO: reduce global variables. Put them in object?
//TODO: atm when new score is added, it jumps to page 1. Is that good behaviour?
//TODO: Restructure files - go files to separate folder?
//TODO: Show rank and percentile in game over window
//TODO: Could updateScoreboard() and changeScoresPage() be one function instead of separate ones?
//Bug - Sometimes 3rd heart has animation paused when being removed

import { gameStatus } from "./gameStatusHandler.js";
import { responseTexts, gameOverTextTemp } from "./initData.js";

let socket;
let allCurrentScores;
let currentPage = 1;
let totalPages;

const constantElements = {
    navPageNumberEl: document.getElementById("navPageNumber"),
    scoresWrappersEl: document.getElementsByClassName("scoresWrapper"),
}

//In this startWebSocket func may be redundant things, just trying to understand how it works
export function startWebSocket() {
    socket = new WebSocket("ws://localhost:8080/socket");
    console.log("Attempting connection...");

    socket.onopen = () => {
        console.log("Successfully connected");
    }

    socket.onmessage = (event) => {
        allCurrentScores = JSON.parse(event.data);
        updateScoreboard();
    }

    socket.onclose = event => {
        console.log("Socket Closed Connection: ", event);
        socket.send("Client Closed!")
    };

    socket.onerror = error => {
        console.log("Socket Error: ", error);
    };
}

function updateScoreboard() {
    //Update page numbers
    currentPage = 1;
    totalPages = Math.ceil(allCurrentScores.length / 5);
    constantElements.navPageNumberEl.textContent = "1/" + totalPages;

    //Show 5 top scores
    for (let i = 0; i < 5; i++) {
        const scoreEntryElements = constantElements.scoresWrappersEl[i].children;
        const scoreEntryData = allCurrentScores[i];
        scoreEntryElements[0].textContent = scoreEntryData["rank"];
        scoreEntryElements[1].textContent = scoreEntryData["name"];
        scoreEntryElements[2].textContent = scoreEntryData["score"];
        scoreEntryElements[3].textContent = scoreEntryData["time"];
    }
}

export function nextScoresPage() {
    if (currentPage === totalPages) {
        currentPage = 1;
    } else {
        currentPage += 1;
    }

    changeScoresPage();
}

export function prevScoresPage() {
    if (currentPage === 1) {
        currentPage = totalPages;
    } else {
        currentPage -= 1;
    }

    changeScoresPage();
}

function changeScoresPage() {
    //Update current page number
    constantElements.navPageNumberEl.innerHTML = currentPage + "/" + totalPages;

    //Update top scores
    for (let i = 0; i < 5; i++) {
        const scoreEntryElements = constantElements.scoresWrappersEl[i].children;
        let scoreEntryData = allCurrentScores[i + (5 * (currentPage-1))];
        if (scoreEntryData === undefined) {
            scoreEntryData = {
                rank: "",
                name: "",
                score: "",
                time: "",
            }
        }
        scoreEntryElements[0].textContent = scoreEntryData["rank"];
        scoreEntryElements[1].textContent = scoreEntryData["name"];
        scoreEntryElements[2].textContent = scoreEntryData["score"];
        scoreEntryElements[3].textContent = scoreEntryData["time"];
    }
}

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
    let gameOverText = gameOverTextTemp.replace('{responseText}', responseText)
                                       .replace('{score}', gameStatus.statistic.score);

    document.getElementById("gameOverText").textContent = gameOverText;
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
    
    //Send last game's data to server
    const lastGameData = {
        Name: nameInputEl.value,
        Score: gameStatus.statistic.score,
        Time: document.getElementById("mainTimer").textContent,
    }
    
    socket.send(JSON.stringify(lastGameData));

    //Close and reset game over elements
    nameInputEl.value = "";
    nameInputEl.blur();
    document.getElementById("submitScoreButton").disabled = true;
    document.getElementById("gameOverBox").style.display = "none";
    document.getElementById("screenOverlay").style.display = "none";
    gameStatus.readyToSubmitName = false;
    gameStatus.gameOverScreen = false;
}