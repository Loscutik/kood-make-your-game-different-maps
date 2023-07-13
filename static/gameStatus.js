import { tetrominoesData, HEART_TIME, START_SPEED, RISE_SPEED_COEFF } from "./initData.js";
import { Tetromino } from "./tetrominoClass.js";

export let currentStatus = {
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
       // numbersDuringRowsRemove: 0,
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
    if (currentStatus.isOver === true) {
        return
    };
    const pauseBtn = document.getElementById("pauseButton");
    const pauseBtnText = document.getElementById("pauseButtonText");
    const activeHeart = document.getElementsByClassName("heart")[currentStatus.statistic.livesLeft - 1];
    if (currentStatus.pause.is === true) {
        const newPauseDuration = performance.now() - currentStatus.pause.startTime;
        currentStatus.pause.duration += newPauseDuration;
        currentStatus.heart.pauseDuration += newPauseDuration;
        togglePauseButton(pauseBtn, pauseBtnText, "PAUSE", "pauseButtonGreen", "pauseButtonRed")
        toggleMessageBox();
        activeHeart.style.animationPlayState = "running";
        currentStatus.pause.is = false;
        currentStatus.prevAnimationTime = event.timeStamp;
        window.dispatchEvent(new Event('runAnimation'));
    } else {
        currentStatus.pause.startTime = event.timeStamp;
        window.cancelAnimationFrame(currentStatus.frame.animationId);
        togglePauseButton(pauseBtn, pauseBtnText, "RESUME", "pauseButtonRed", "pauseButtonGreen")
        toggleMessageBox("PAUSED");
        activeHeart.style.animationPlayState = "paused";
        currentStatus.pause.is = true;
    }
}

function togglePauseButton(pauseBtn, pauseBtnText, text, classToRemove, classToAdd) {
    pauseBtnText.textContent = text;
    pauseBtn.classList.remove(classToRemove);
    pauseBtn.classList.add(classToAdd);
}

export function restartGame(now) {
    window.cancelAnimationFrame(currentStatus.frame.animationId);
    document.getElementById('mainTimer').textContent = "00:00";

    const gameboxElement = document.getElementById("gamebox");
    const tetrominoes = gameboxElement.querySelectorAll('.tetromino');
    tetrominoes.forEach(tetromino => {
        tetromino.remove();
    });

    resetHearts();

    if (currentStatus.pause.is === true) {
        togglePauseButton(document.getElementById("pauseButton"), document.getElementById("pauseButtonText"), "PAUSE", "pauseButtonGreen", "pauseButtonRed")
    }

    const messageBox = document.getElementById("gameMessageBox");
    messageBox.style.display = "none";

    currentStatus.reset(now);

    displayScore(currentStatus.statistic.score);
    displayLines(currentStatus.statistic.completedLines);
    displayLevel(currentStatus.statistic.level);

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
    heartStopper[0].innerHTML = "";
    heartStopper[1].innerHTML = "";
    heartStopper[2].innerHTML = HEART_TIME;
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
    const heartWrapper = document.getElementsByClassName("heartWrapper")[currentStatus.statistic.livesLeft - 1];
    heartWrapper.getElementsByClassName("heartStopper")[0].innerHTML = HEART_TIME; //CHNG : not to search through the whole document

   const heartToBlink = heartWrapper.getElementsByClassName("heart")[0]; //CHNG : not to search through the whole document

   heartToBlink.classList.remove("heartBlinkLastSecs");

   heartWrapper.classList.remove("refillHeart");
   void heartWrapper.offsetWidth; //Force a reflow to run animation again // when this function runs in the animate function we don't need this
   heartWrapper.classList.add("refillHeart");

   currentStatus.heart.startTime = fireTime + 1000;
   currentStatus.heart.pauseDuration = 0;
}

//Updated score by how many rows were completed at once
 function updateScore(rowsCompleted) {
    const pointsPerRows = {
        1: 100,
        2: 300,
        3: 500,
        4: 800,
    }
    if (rowsCompleted > 4) {
        rowsCompleted = 4;
    }
    currentStatus.statistic.score += pointsPerRows[rowsCompleted];
    displayScore(currentStatus.statistic.score);
}

 function updateLines(number) {
    currentStatus.statistic.completedLines += number;
    displayLines(currentStatus.statistic.completedLines);
}

 function updateLevel() {
    if (currentStatus.statistic.completedLines > 0 && currentStatus.statistic.completedLines / 10 >= currentStatus.statistic.level) {
        currentStatus.statistic.level++;
        currentStatus.currentTetromino.speed.current += RISE_SPEED_COEFF * START_SPEED;
        currentStatus.currentTetromino.delayBeforeFreeze -= 50;
        displayLevel(currentStatus.statistic.level);
    }
}

function displayScore(newScore) {
    document.getElementById("score").innerHTML = String(newScore).padStart(4, '0');
}

function displayLines(newLines) {
    document.getElementById("lines").innerHTML = newLines;
}

function displayLevel(newLevel) {
    document.getElementById("level").innerHTML = newLevel;
}

function blinkHeart() {
    const heartToBlink = document.getElementsByClassName("heart")[currentStatus.statistic.livesLeft - 1];
    heartToBlink.classList.add("heartBlinkLastSecs");
}

export function pickAndShowNextTetromino() {
    const tetrominoPreviews = document.getElementsByClassName("nextTetromino");
    tetrominoPreviews[currentStatus.nextTetromino].style.opacity = "0";
    currentStatus.nextTetromino = chooseTetrominoNumber();
    tetrominoPreviews[currentStatus.nextTetromino].style.opacity = "1";
}

export function gameOver() {
    toggleMessageBox("GAME OVER");
    currentStatus.isOver = true;
}

export function updateHearts(time) {
    let heartTime = HEART_TIME - ((time - currentStatus.heart.startTime - currentStatus.heart.pauseDuration) / 1000);
    if (heartTime > HEART_TIME) heartTime = HEART_TIME;

    if (heartTime < 0.5) { //CHNG
        removeHeart(time);
    } else {
        document.getElementsByClassName('heartStopper')[currentStatus.statistic.livesLeft - 1].textContent = heartTime.toFixed(); //CHNG moved .toFixed here
        if (heartTime <= 3) { //CHNG
            blinkHeart();
        }
    }
}

//Remove heart if time has ran out
function removeHeart(time) {
    currentStatus.statistic.livesLeft -= 1;

    document.getElementsByClassName("heartStopper")[currentStatus.statistic.livesLeft].innerHTML = "";

    const heartToRemove = document.getElementsByClassName("heart")[currentStatus.statistic.livesLeft];
    heartToRemove.classList.remove("heartBlinkLastSecs");
    heartToRemove.classList.add("removedHeart");

    if (currentStatus.statistic.livesLeft !== 0) {
        currentStatus.heart.startTime = time;
        currentStatus.heart.pauseDuration = 0;
        setTimeout(function () {
            document.getElementsByClassName("heartStopper")[currentStatus.statistic.livesLeft - 1].innerHTML = HEART_TIME;
        }, 500)
    }
}

export function calculateFPS() {
    const fpsDisplay = document.getElementById("fpsDisplay");
    let averageFPS = (currentStatus.frame.count /*+ currentStatus.frame.numbersDuringRowsRemove*/) / (currentStatus.gameOneSecond / 1000);
    //currentStatus.frame.numbersDuringRowsRemove = 0;

    fpsDisplay.innerHTML = averageFPS.toFixed(2);

    currentStatus.frame.count = 0;
    currentStatus.gameOneSecond = 0;
}

export function updateMainTimer(time) {
    const mainTimer = document.getElementById('mainTimer');
    let playingTime = time - currentStatus.startTime - currentStatus.pause.duration;
    mainTimer.textContent = msToMinutesSecondsString(playingTime);
}

function msToMinutesSecondsString(ms) {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return (minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}