import { tetrominoesData, HEART_TIME, START_SPEED, RISE_SPEED_COEFF } from "./initData.js";
import { Tetromino } from "./tetrominoClass.js";

const constantElements = {
    fpsDisplay: document.getElementById("fpsDisplay"),
    mainTimer: document.getElementById('mainTimer'),
}

export let gameStatus = {
    startScreen: true,
    isOver: false,
    startTime: undefined,
    prevAnimationTime: undefined,
    gameOneSecond: 0,
    nextTetromino: chooseTetrominoNumber(),

    pause: {
        startTime: undefined,
        duration: 0,
        is: false,
    },

    heart: {
        startTime: undefined,
        pauseDuration: 0,
        activeHeartWrapperEl: document.getElementsByClassName("heartWrapper")[2],
        activeHeartSymbolEl: document.getElementsByClassName("heart")[2],
        activeHeartStopperEl: document.getElementsByClassName("heartStopper")[2],
    },

    currentTetromino: {
        isBeingMovedDown: true,
        freezeDelayTime: 0,
        delayBeforeFreeze: 300,
        speed: {
            current: START_SPEED,
            fraction: 0,
        },
    },

    frame: {
        count: 0,
        last: undefined,
        animationId: 0,
    },

    statistic: {
        livesLeft: 3,
        score: 0,
        completedLines: 0,
        level: 1,
    },

    startInit(now) {
        this.startScreen = false;
        this.startTime = now;
        this.heart.startTime = now;
        this.frame.last = now;
        this.prevAnimationTime = now;
    },

    reset(now) {
        this.startTime = now;
        this.isOver = false;
        this.prevAnimationTime = now;
        this.gameOneSecond = 0;
        this.pause.duration = 0;
        this.pause.is = false;
        this.heart.startTime = now;
        this.heart.pauseDuration = 0;
        this.heart.activeHeartWrapperEl = document.getElementsByClassName("heartWrapper")[2];
        this.heart.activeHeartSymbolEl = document.getElementsByClassName("heart")[2];
        this.heart.activeHeartStopperEl = document.getElementsByClassName("heartStopper")[2];
        this.currentTetromino.freezeDelayTime = 0;
        this.currentTetromino.isBeingMovedDown = true;
        this.currentTetromino.speed.current = START_SPEED;
        this.currentTetromino.speed.fraction = 0;
        this.frame.count = 0;
        this.frame.last = now;
        this.statistic.livesLeft = 3;
        this.statistic.score = 0;
        this.statistic.completedLines = 0;
        this.statistic.level = 1;
    }
}

function chooseTetrominoNumber() {
    return Math.floor(Math.random() * 7)
}

export function pauseResumeToggle(event) {
    if (gameStatus.isOver === true) {
        return
    };
    const pauseBtn = document.getElementById("pauseButton");
    const pauseBtnText = document.getElementById("pauseButtonText");
    if (gameStatus.pause.is === true) {
        const newPauseDuration = performance.now() - gameStatus.pause.startTime;
        gameStatus.pause.duration += newPauseDuration;
        gameStatus.heart.pauseDuration += newPauseDuration;
        togglePauseButton(pauseBtn, pauseBtnText, "PAUSE", "pauseButtonGreen", "pauseButtonRed")
        toggleMessageBox();
        gameStatus.heart.activeHeartSymbolEl.style.animationPlayState = "running";
        gameStatus.pause.is = false;
        gameStatus.prevAnimationTime = event.timeStamp;
        window.dispatchEvent(new Event('runAnimation'));
    } else {
        gameStatus.pause.startTime = event.timeStamp;
        window.cancelAnimationFrame(gameStatus.frame.animationId);
        togglePauseButton(pauseBtn, pauseBtnText, "RESUME", "pauseButtonRed", "pauseButtonGreen")
        toggleMessageBox("PAUSED");
        gameStatus.heart.activeHeartSymbolEl.style.animationPlayState = "paused";
        gameStatus.pause.is = true;
    }
}

function togglePauseButton(pauseBtn, pauseBtnText, text, classToRemove, classToAdd) {
    pauseBtnText.textContent = text;
    pauseBtn.classList.remove(classToRemove);
    pauseBtn.classList.add(classToAdd);
}

export function restartGame(now) {
    window.cancelAnimationFrame(gameStatus.frame.animationId);
    constantElements.mainTimer.textContent = "00:00";

    const gameboxElement = document.getElementById("gamebox");
    const tetrominoes = gameboxElement.querySelectorAll('.tetromino');
    tetrominoes.forEach(tetromino => {
        tetromino.remove();
    });

    resetHearts();

    if (gameStatus.pause.is === true) {
        togglePauseButton(document.getElementById("pauseButton"), document.getElementById("pauseButtonText"), "PAUSE", "pauseButtonGreen", "pauseButtonRed")
    }

    const messageBox = document.getElementById("gameMessageBox");
    messageBox.style.display = "none";

    gameStatus.reset(now);

    displayScore(gameStatus.statistic.score);
    displayLines(gameStatus.statistic.completedLines);
    displayLevel(gameStatus.statistic.level);

    pickAndShowNextTetromino();
    return new Tetromino(tetrominoesData[chooseTetrominoNumber()]);
}

function resetHearts() {
    const hearts = document.getElementsByClassName("heart");
    [...hearts].forEach(heart => {
        heart.classList.remove("removedHeart");
        heart.classList.remove("heartBlinkLastSecs");
        heart.style.opacity = "1";
    });

    const heartStopper = document.getElementsByClassName("heartStopper");
    heartStopper[0].textContent = "";
    heartStopper[1].textContent = "";
    heartStopper[2].textContent = HEART_TIME;
}

function toggleMessageBox(message) {
    const messageBox = document.getElementById("gameMessageBox");
    const messageSpan = document.getElementById("gameMessage");
    if (messageBox.style.display !== "flex") {
        messageSpan.textContent = message;
        messageBox.style.display = "flex";
    } else {
        messageBox.style.display = "none";
    }
}

export function updateGameStatistic(fireTime, removedRows) {
    refillHeart(fireTime);
    updateScore(removedRows);
    updateLines(removedRows);
    updateLevel();
}

function refillHeart(fireTime) {
    gameStatus.heart.activeHeartStopperEl.textContent = HEART_TIME;
    gameStatus.heart.activeHeartSymbolEl.classList.remove("heartBlinkLastSecs");
    gameStatus.heart.activeHeartWrapperEl.classList.remove("refillHeart");
    void gameStatus.heart.activeHeartWrapperEl.offsetWidth;
    gameStatus.heart.activeHeartWrapperEl.classList.add("refillHeart");
    gameStatus.heart.startTime = fireTime + 1000;
    gameStatus.heart.pauseDuration = 0;
}

//Updated score by how many rows were completed at once
function updateScore(rowsCompleted) {
    const pointsPerRows = {
        1: (100 * gameStatus.statistic.level),
        2: (300 * gameStatus.statistic.level),
        3: (500 * gameStatus.statistic.level),
        4: (800 * gameStatus.statistic.level),
    }
    gameStatus.statistic.score += pointsPerRows[rowsCompleted];
    displayScore(gameStatus.statistic.score);
}

function updateLines(number) {
    gameStatus.statistic.completedLines += number;
    displayLines(gameStatus.statistic.completedLines);
}

function updateLevel() {
    if (gameStatus.statistic.completedLines > 0 && gameStatus.statistic.completedLines / 10 >= gameStatus.statistic.level) {
        gameStatus.statistic.level++;
        gameStatus.currentTetromino.speed.current += RISE_SPEED_COEFF * START_SPEED;
        gameStatus.currentTetromino.delayBeforeFreeze -= 50;
        displayLevel(gameStatus.statistic.level);
    }
}

function displayScore(newScore) {
    document.getElementById("score").textContent = String(newScore).padStart(4, '0');
}

function displayLines(newLines) {
    document.getElementById("lines").textContent = newLines;
}

function displayLevel(newLevel) {
    document.getElementById("level").textContent = newLevel;
}

export function pickAndShowNextTetromino() {
    const tetrominoPreviews = document.getElementsByClassName("nextTetromino");
    tetrominoPreviews[gameStatus.nextTetromino].style.opacity = "0";
    gameStatus.nextTetromino = chooseTetrominoNumber();
    tetrominoPreviews[gameStatus.nextTetromino].style.opacity = "1";
}

export function gameOver() {
    toggleMessageBox("GAME OVER");
    gameStatus.isOver = true;
}

export function updateHearts(time) {
    let heartTime = HEART_TIME - ((time - gameStatus.heart.startTime - gameStatus.heart.pauseDuration) / 1000);
    if (heartTime > HEART_TIME) heartTime = HEART_TIME;

    if (heartTime < 0.5) {
        removeHeart(time);
    } else {
        gameStatus.heart.activeHeartStopperEl.textContent = heartTime.toFixed(); 
        if (heartTime <= 3 && heartTime >= 2) {
            gameStatus.heart.activeHeartSymbolEl.classList.add("heartBlinkLastSecs");
        }
    }
}

//Remove heart if time has ran out
function removeHeart(time) {
    gameStatus.statistic.livesLeft -= 1;
    gameStatus.heart.activeHeartStopperEl.textContent = "";
    gameStatus.heart.activeHeartSymbolEl.classList.remove("heartBlinkLastSecs");
    gameStatus.heart.activeHeartSymbolEl.classList.add("removedHeart");

    if (gameStatus.statistic.livesLeft !== 0) {
        gameStatus.heart.startTime = time;
        gameStatus.heart.pauseDuration = 0;

        //Update DOM element variables with new active heart elements
        gameStatus.heart.activeHeartWrapperEl = document.getElementsByClassName("heartWrapper")[gameStatus.statistic.livesLeft - 1];
        gameStatus.heart.activeHeartSymbolEl = document.getElementsByClassName("heart")[gameStatus.statistic.livesLeft - 1];
        gameStatus.heart.activeHeartStopperEl = document.getElementsByClassName("heartStopper")[gameStatus.statistic.livesLeft - 1];

        //Wait for previous hearts dissapearing animation to finish, then show seconds on next active heart
        setTimeout(function () {
            gameStatus.heart.activeHeartStopperEl.textContent = HEART_TIME;
        }, 500)
    }
}

export function calculateFPS() {
    let averageFPS = (gameStatus.frame.count) / (gameStatus.gameOneSecond / 1000);

    constantElements.fpsDisplay.textContent = averageFPS.toFixed(2);

    gameStatus.frame.count = 0;
    gameStatus.gameOneSecond = 0;
}

export function updateMainTimer(time) {
    let playingTime = time - gameStatus.startTime - gameStatus.pause.duration;
    constantElements.mainTimer.textContent = msToMinutesSecondsString(playingTime);
}

function msToMinutesSecondsString(ms) {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return (minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}