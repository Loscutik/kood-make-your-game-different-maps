//TODO: atm when new score is added, it jumps to page 1. Is that good behaviour?
//TODO: Restructure files - go files to separate folder?
//TODO: Show rank and percentile in game over window
//Bug - Sometimes 3rd heart has animation paused when being removed

import { gameStatus } from "./gameStatusHandler.js";
import { responseTexts, gameOverTextTemp } from "./initData.js";

let socket;

const scoreboard = {
    allCurrentScores: undefined,
    currentPage: 1,
    totalPages: undefined,
}

const constantDOMElements = {
    navPageNumberEl: document.getElementById("navPageNumber"),
    scoresWrappersEl: document.getElementsByClassName("scoresWrapper"),
}

//In this startWebSocket func may be redundant things, just trying to understand how it works
export function startWebSocket() {
    socket = new WebSocket("ws://localhost:8080/socket");
    console.log("Attempting connection to server...");

    socket.onopen = () => {
        console.log("Successfully connected to server");
    }

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
    
        if (message.type === 'scoreboard') {
            scoreboard.allCurrentScores = message.payload;
            updateScoreboard(true);
        }
    }

    socket.onclose = event => {
        console.log("Socket Closed Connection: ", event);
        socket.send("Client Closed!")
    };

    socket.onerror = error => {
        console.log("Socket Error: ", error);
    };
}

function updateScoreboard(reset) {
    if (reset) {
    //Set current page number to 1 and update total amount
    scoreboard.currentPage = 1;
    scoreboard.totalPages = Math.ceil(scoreboard.allCurrentScores.length / 5);
    }
    
    //Update current page number
    constantDOMElements.navPageNumberEl.innerHTML = scoreboard.currentPage + 
                                                 "/" + 
                                                 scoreboard.totalPages;

    //Update top scores
    for (let i = 0; i < 5; i++) {
        const scoreEntryElements = constantDOMElements.scoresWrappersEl[i].children;
        let scoreEntryData = scoreboard.allCurrentScores[i + (5 * (scoreboard.currentPage-1))];

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

export function nextScoresPage() {
    if (scoreboard.currentPage === scoreboard.totalPages) {
        scoreboard.currentPage = 1;
    } else {
        scoreboard.currentPage += 1;
    }

    updateScoreboard();
}

export function prevScoresPage() {
    if (scoreboard.currentPage === 1) {
        scoreboard.currentPage = scoreboard.totalPages;
    } else {
        scoreboard.currentPage -= 1;
    }

    updateScoreboard();
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

function sendScoreForRankAndPercentile() {
    const message = {
        type: "getRankAndPercentile",
        payload: gameStatus.statistic.score
    }
    
    socket.send(JSON.stringify(message));
}

export function showGameOverScreen() {
    gameStatus.gameOverScreen = true;

    sendScoreForRankAndPercentile();

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
        name: nameInputEl.value,
        score: gameStatus.statistic.score,
        time: document.getElementById("mainTimer").textContent,
    }

    const message = {
        type: "addEntry",
        payload: lastGameData
    }
    
    socket.send(JSON.stringify(message));

    //Close and reset game over elements
    nameInputEl.value = "";
    nameInputEl.blur();
    document.getElementById("submitScoreButton").disabled = true;
    document.getElementById("gameOverBox").style.display = "none";
    document.getElementById("screenOverlay").style.display = "none";
    gameStatus.readyToSubmitName = false;
    gameStatus.gameOverScreen = false;
}