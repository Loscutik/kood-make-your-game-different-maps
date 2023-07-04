import { tetrominoesData, HEART_TIME } from "./data.js";
import { Tetromino } from "./tetrominoclass.js";

const now = performance.now();
//TODO separate into inside objects corresponding to their objects (heart, pause, frame,...etc) 
export let currentStatus = {
    startScreen: true,
    startTime: now,
    pauseStartTime: undefined,
    pauseDuration: 0,
    heartStartTime: now,
    heartPauseDuration: 0,
    frameCount: 0,
    lastFrame: now,
    isPaused: false,
    isOver: false,
    animationFrameId: 0,
    livesLeft: 3,
    score: 0,
    prevAnimationTime: undefined,
    freezeDelayTime: 0,
    isMovingDown: true,
    nextTetromino: chooseTetrominoNumber(),

    reset() {
        const now = performance.now();
        this.startTime = now;
        this.pauseDuration = 0;
        this.heartStartTime = now;
        this.heartPauseDuration = 0;
        this.frameCount = 0;
        this.isPaused = false;
        this.isOver = false;
        this.livesLeft = 3;
        this.score = 0;
        this.freezeDelayTime = 0;
        this.isMovingDown=true;
    }
}

function chooseTetrominoNumber(){
    return Math.floor(Math.random() * 7)
}

export function pauseResumeToggle() {
    if (currentStatus.isOver === true) {
        return
    };
    const pauseBtn = document.getElementById("pauseButton");
    const pauseBtnText = document.getElementById("pauseButtonText");
    const activeHeart = document.getElementsByClassName("heart")[currentStatus.livesLeft - 1];
    if (currentStatus.isPaused === true) {
        const newPauseDuration = performance.now() - currentStatus.pauseStartTime;
        currentStatus.pauseDuration += newPauseDuration;
        currentStatus.heartPauseDuration += newPauseDuration;
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

function resetHearts() {
    const hearts = document.getElementsByClassName("heart");
    [...hearts].forEach(heart => {
        heart.classList.remove("removedHeart");
        heart.classList.remove("heartBlinkLastSecs");
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
    }
    
    const messageBox = document.getElementById("gameMessageBox");
    messageBox.style.display = "none";
    
    currentStatus.reset();
    displayScore(0);
    pickAndShowNextTetromino();
    //window.dispatchEvent(new Event('runAnimation'));
    return new Tetromino(tetrominoesData[chooseTetrominoNumber()]);
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
    const heartToBlink = document.getElementsByClassName("heart")[currentStatus.livesLeft - 1];
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
    currentStatus.heartPauseDuration = 0;
    setTimeout(function () {
        document.getElementsByClassName("heartStopper")[currentStatus.livesLeft - 1].innerHTML = HEART_TIME;
    }, 500)
}

export function pickAndShowNextTetromino() {
    const tetrominoPreviews = document.getElementsByClassName("nextTetromino");
    tetrominoPreviews[currentStatus.nextTetromino].style.opacity = "0";
    currentStatus.nextTetromino = chooseTetrominoNumber();
    tetrominoPreviews[currentStatus.nextTetromino].style.opacity = "1";
}