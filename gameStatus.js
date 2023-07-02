import { tetrominoesData, HEART_TIME } from "./data.js";
import { Tetromino } from "./tetrominoclass.js";

const now = performance.now();
export let currentStatus = {
    startScreen: true,
    startTime: now,
    pauseStartTime: undefined,
    pauseDuration: 0,
    heartStartTime: now,
    frameCount: 0,
    lastFrame: now,
    isPaused: false,
    isOver: false,
    animationFrameId: 0,
    livesLeft: 3,
    score: 0,
    prevAnimationTime: now,
    freezeDelayTime: 0,
    nextTetromino: 0,

    reset() {
        this.frameCount = 0;
        this.livesLeft = 3;
        this.freezeDelayTime = 0;
        this.startTime = performance.now();
        this.heartStartTime = performance.now();
    }
}

export function pauseResumeToggle() {
    if (currentStatus.isOver === true) {
        return
    };
    const pauseBtn = document.getElementById("pauseButton");
    const pauseBtnText = document.getElementById("pauseButtonText");
    const activeHeart = document.getElementsByClassName("heart")[currentStatus.livesLeft-1];
    if (currentStatus.isPaused === true) {
        currentStatus.pauseDuration += performance.now() - currentStatus.pauseStartTime;
        pauseBtnText.textContent = "PAUSE";
        pauseBtn.classList.remove("pauseButtonGreen");
        pauseBtn.classList.add("pauseButtonRed");
        toggleMessageBox();
        activeHeart.style.animationPlayState = "running";
        currentStatus.isPaused = false;
        window.dispatchEvent(new Event('runAnimation'));
    } else {
        currentStatus.pauseStartTime = performance.now();
        pauseBtnText.textContent = "RESUME";
        pauseBtn.classList.remove("pauseButtonRed");
        pauseBtn.classList.add("pauseButtonGreen");
        toggleMessageBox("PAUSED");
        activeHeart.style.animationPlayState = "paused";
        currentStatus.isPaused = true;
    }
}

//PREVIOUS IMPLEMENTATION FOR RESETING HEARTS
// function createHeart() {
//     const divHeartWrapper = document.createElement('div');
//     divHeartWrapper.classList.add('heartWrapper');

//     const spanHeartStopper = document.createElement('span');
//     spanHeartStopper.classList.add('heartStopper');
//     divHeartWrapper.appendChild(spanHeartStopper);

//     const svgHeart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
//     svgHeart.setAttribute('width', `41px`);
//     svgHeart.setAttribute('height', `40px`);
//     svgHeart.setAttribute('viewBox', `0 0 20 18`);
//     svgHeart.classList.add('heart');
//     divHeartWrapper.appendChild(svgHeart);

//     const heart = document.createElementNS('http://www.w3.org/2000/svg', 'path');
//     heart.setAttributeNS(null, 'd', `M11 18H9v-1H8v-1H7v-1H6v-1H5v-1H4v-1H3v-1H2v-1H1V8H0V3h1V2h1V1h1V0h5v1h1v1h2V1h1V0h5v1h1v1h1v1h1v5h-1v2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1`);
//     heart.setAttributeNS(null, 'style', 'fill:#d92327;fill-opacity:1');
//     svgHeart.appendChild(heart);

//     return divHeartWrapper;
// }

// function createHeartsSet() {
//     const heartsContainer = document.getElementById('livesWrapper');
//     while (heartsContainer.firstChild) {
//         heartsContainer.removeChild(heartsContainer.firstChild);
//     }

//     heartsContainer.appendChild(createHeart());
//     heartsContainer.appendChild(createHeart());
//     const lastHeart = createHeart();
//     lastHeart.querySelector('span').innerHTML = 'HEART_TIME';
//     heartsContainer.appendChild(lastHeart);
// }

function resetHearts() {
    const hearts = document.getElementsByClassName("heart");
    [...hearts].forEach(heart => {
        heart.classList.remove("removedHeart");
        heart.style.opacity = "1";
    });
    const heartStopper = document.getElementsByClassName("heartStopper");
    heartStopper[0].innerHTML = "";
    heartStopper[1].innerHTML = "";
    heartStopper[2].innerHTML = HEART_TIME;
}


export function restartGame() {
    window.cancelAnimationFrame(currentStatus.animationFrameId);
    document.getElementById('mainTimer').textContent = "00:00";
    // currentStatus.frameCount = 0;
    // currentStatus.livesLeft = 3;
    // currentStatus.freezeDelayTime = 0;

    currentStatus.reset();
    console.log("reseting:", currentStatus.freezeDelayTime)
    const gameboxElement = document.getElementById("gamebox");
    const tetrominoes = gameboxElement.querySelectorAll('.tetromino');
    tetrominoes.forEach(tetromino => {
        tetromino.remove();
    });

    resetHearts();

    if (currentStatus.isPaused === true) {
        const pauseBtn = document.getElementById("pauseButton");
        const pauseBtnText = document.getElementById("pauseButtonText");
        pauseBtnText.textContent = "PAUSE";
        pauseBtn.classList.remove("pauseButtonGreen");
        pauseBtn.classList.add("pauseButtonRed");
        currentStatus.isPaused = false;
    }
    const messageBox = document.getElementById("gameMessageBox");
    messageBox.style.display = "none";
    currentStatus.isOver = false;
    currentStatus.pauseDuration = 0;
    currentStatus.score = 0;
    displayScore(0);
    currentStatus.startTime = performance.now();
    pickAndShowNextTetromino();
    //window.dispatchEvent(new Event('runAnimation'));
    return new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
}

export function toggleMessageBox(message) {
    const messageBox = document.getElementById("gameMessageBox");
    const messageSpan = document.getElementById("gameMessage");
    if (messageBox.style.display !== "flex") {
        messageSpan.textContent = message;
        messageBox.style.display = "flex";
    } else {
        messageBox.style.display = "none";
    }
}

export function msToMinutesSecondsString(ms) {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return (minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

//Updated score by how many rows were completed at once
export function updateScore(rowsCompleted) {
    const pointsPerRows = {
        1: 100,
        2: 300,
        3: 500,
        4: 800,
    }
    if (rowsCompleted > 4) {
        rowsCompleted = 4;
    }
    currentStatus.score += pointsPerRows[rowsCompleted];
    displayScore(currentStatus.score);
}

//Add leading zeroes to score and display new score in DOM
function displayScore(newScore) {
    const leadingZeroes = 4 - String(newScore).length;
    let scoreString = "";
    for (let i = 0; i < leadingZeroes; i++) {
        scoreString += "0"
    }
    scoreString += newScore;
    document.getElementById("score").innerHTML = scoreString;
}

export function blinkHeart() {
    const heartToBlink = document.getElementsByClassName("heart")[currentStatus.livesLeft-1];
    heartToBlink.classList.add("heartBlinkLastSecs");
}
 
//Remove heart if time has ran out
export function removeHeartOrEndGame() {
    currentStatus.livesLeft -= 1;
    document.getElementsByClassName("heartStopper")[currentStatus.livesLeft].innerHTML = "";
    const heartToRemove = document.getElementsByClassName("heart")[currentStatus.livesLeft];
    heartToRemove.classList.remove("heartBlinkLastSecs");
    heartToRemove.classList.add("removedHeart");
    if (currentStatus.livesLeft === 0) {
        cancelAnimationFrame(currentStatus.animationFrameId);
        toggleMessageBox("GAME OVER");
        currentStatus.isOver = true;
    }
    currentStatus.heartStartTime = performance.now();
    setTimeout(function() {
        document.getElementsByClassName("heartStopper")[currentStatus.livesLeft - 1].innerHTML = HEART_TIME;
    }, 500)
}

export function pickAndShowNextTetromino() {
    const tetrominoPreviews = document.getElementsByClassName("nextTetromino");
    tetrominoPreviews[currentStatus.nextTetromino].style.opacity = "0";
    currentStatus.nextTetromino = Math.floor(Math.random() * 7);
    tetrominoPreviews[currentStatus.nextTetromino].style.opacity = "1";
}