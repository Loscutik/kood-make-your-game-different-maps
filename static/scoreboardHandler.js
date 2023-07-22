import { gameStatus } from "./gameStatusHandler.js";
import { responseTexts, gameOverTextTemp } from "./initData.js";

let socket;

//In this startWebSocket func may be redundant things, just trying to understand how it works
export function startWebSocket() {
    socket = new WebSocket("ws://localhost:8080/socket");
    console.log("Attempting connection...");

    socket.onopen = () => {
        console.log("Successfully connected");
        socket.send("Hi from client!");
    }

    socket.onmessage = (event) => {
        let message = JSON.parse(event.data);
        console.log("Received data from server: ", message);
    }

    socket.onclose = event => {
        console.log("Socket Closed Connection: ", event);
        socket.send("Client Closed!")
    };

    socket.onerror = error => {
        console.log("Socket Error: ", error);
    };
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
        name: nameInputEl.value,
        score: gameStatus.statistic.score,
        time: document.getElementById("mainTimer").textContent,
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