import { tetrominoesData, HEART_TIME, START_SPEED, RISE_SPEED_COEFF } from "./initData.js";
import { Tetromino } from "./tetrominoClass.js";

/*-----------------------------------------------*/

const constantElements = {
    fpsDisplay: document.getElementById("fpsDisplay"),
    mainTimer: document.getElementById('mainTimer'),
}

/*-----------------------------------------------*/

export let gameStatus = {
    startScreen: true,
    isOver: false,
    startTime: undefined,
    prevAnimationTime: undefined,
    gameOneSecond: 0,
    nextTetromino: chooseTetrominoNumber(),

    /*----------------*/

    pause: {
        startTime: undefined,
        duration: 0,
        is: false,
    },

    /*----------------*/

    activeHeart: {
        startTime: undefined,
        pauseDuration: 0,
        activeWrapperEl: document.getElementsByClassName("heartWrapper")[2],
        activeSymbolEl: document.getElementsByClassName("heart")[2],
        activeStopperEl: document.getElementsByClassName("heartStopper")[2],


        refill(fireTime) {
            this.activeStopperEl.textContent = HEART_TIME;
            this.activeSymbolEl.classList.remove("heartBlinkLastSecs");
            this.activeWrapperEl.classList.remove("refillHeart");
            void this.activeWrapperEl.offsetWidth;
            this.activeWrapperEl.classList.add("refillHeart");
            this.startTime = fireTime + 1000;
            this.pauseDuration = 0;
        }
    },

    /*----------------*/

    currentTetromino: {
        isBeingMovedDown: true,
        freezeDelayTime: 0,
        delayBeforeFreeze: 300,
        speed: {
            current: START_SPEED,
            fraction: 0,
        },
    },

    /*----------------*/

    frame: {
        count: 0,
        last: undefined,
        animationId: 0,
    },

    /*----------------*/

    statistic: {
        livesLeft: 3,
        score: 0,
        completedLines: 0,
        level: 1,

        displayScore() {
            document.getElementById("score").textContent = String(this.score).padStart(4, '0');
        },

        displayLines() {
            document.getElementById("lines").textContent = this.completedLines;
        },

        displayLevel() {
            document.getElementById("level").textContent = this.level;
        },

    },

    /*----------------*/

    //Updated score by how many rows were completed at once
    updateScore(rowsCompleted) {
        const pointsPerRows = {
            1: (100 * this.statistic.level),
            2: (300 * this.statistic.level),
            3: (500 * this.statistic.level),
            4: (800 * this.statistic.level),
        }
        this.statistic.score += pointsPerRows[rowsCompleted];
        this.statistic.displayScore();
    },

    /*----------------*/

    updateLines(number) {
        this.statistic.completedLines += number;
        this.statistic.displayLines();
    },

    /*----------------*/

    levelUp() {
        if (this.statistic.completedLines > 0 && this.statistic.completedLines / 10 >= this.statistic.level) {
            this.statistic.level++;
            this.currentTetromino.speed.current += RISE_SPEED_COEFF * START_SPEED;
            this.currentTetromino.delayBeforeFreeze -= 50;
            this.statistic.displayLevel();
        }
    },

    /*----------------*/

    updateAfterRowComplete(fireTime, removedRows) {
        this.activeHeart.refill(fireTime);
        this.updateScore(removedRows);
        this.updateLines(removedRows);
        this.levelUp();
    },

    /*--------------------*/

    updateHearts(time) {
        let heartTime = HEART_TIME - ((time - this.activeHeart.startTime - this.activeHeart.pauseDuration) / 1000);
        if (heartTime > HEART_TIME) heartTime = HEART_TIME;

        if (heartTime < 0.5) {
            this.removeHeart(time);
        } else {
            this.activeHeart.activeStopperEl.textContent = heartTime.toFixed();
            if (heartTime <= 3 && heartTime >= 2) {
                this.activeHeart.activeSymbolEl.classList.add("heartBlinkLastSecs");
            }
        }
    },

    /*--------------------*/

    //Remove heart if time has ran out
    removeHeart(time) {
        this.statistic.livesLeft -= 1;
        this.activeHeart.activeStopperEl.textContent = "";
        this.activeHeart.activeSymbolEl.classList.remove("heartBlinkLastSecs");
        this.activeHeart.activeSymbolEl.classList.add("removedHeart");

        if (this.statistic.livesLeft !== 0) {
            this.activeHeart.startTime = time;
            this.activeHeart.pauseDuration = 0;

            //Update DOM element variables with new active heart elements
            this.activeHeart.activeWrapperEl = document.getElementsByClassName("heartWrapper")[this.statistic.livesLeft - 1];
            this.activeHeart.activeSymbolEl = document.getElementsByClassName("heart")[this.statistic.livesLeft - 1];
            this.activeHeart.activeStopperEl = document.getElementsByClassName("heartStopper")[this.statistic.livesLeft - 1];

            //Wait for previous hearts dissapearing animation to finish, then show seconds on next active heart
            setTimeout( () => {
                this.activeHeart.activeStopperEl.textContent = HEART_TIME;
            }, 500)
        }
    },

    /*--------------------*/

    startInit(now) {
        this.startScreen = false;
        this.startTime = now;
        this.activeHeart.startTime = now;
        this.frame.last = now;
        this.prevAnimationTime = now;
    },

    /*--------------------*/

    reset(now) {
        this.startTime = now;
        this.isOver = false;
        this.prevAnimationTime = now;
        this.gameOneSecond = 0;
        this.pause.duration = 0;
        this.pause.is = false;
        this.activeHeart.startTime = now;
        this.activeHeart.pauseDuration = 0;
        this.activeHeart.activeWrapperEl = document.getElementsByClassName("heartWrapper")[2];
        this.activeHeart.activeSymbolEl = document.getElementsByClassName("heart")[2];
        this.activeHeart.activeStopperEl = document.getElementsByClassName("heartStopper")[2];
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

/*-----------------------------------------------*/

function chooseTetrominoNumber() {
    return Math.floor(Math.random() * 7)
}

/*-----------------------------------------------*/

export function pauseResumeToggle(event) {
    if (gameStatus.isOver === true) {
        return
    };
    const pauseBtn = document.getElementById("pauseButton");
    const pauseBtnText = document.getElementById("pauseButtonText");
    if (gameStatus.pause.is === true) {
        const newPauseDuration = performance.now() - gameStatus.pause.startTime;
        gameStatus.pause.duration += newPauseDuration;
        gameStatus.activeHeart.pauseDuration += newPauseDuration;
        togglePauseButton(pauseBtn, pauseBtnText, "PAUSE", "pauseButtonGreen", "pauseButtonRed")
        toggleMessageBox();
        gameStatus.activeHeart.activeSymbolEl.style.animationPlayState = "running";
        gameStatus.pause.is = false;
        gameStatus.prevAnimationTime = event.timeStamp;
        window.dispatchEvent(new Event('runAnimation'));
    } else {
        gameStatus.pause.startTime = event.timeStamp;
        window.cancelAnimationFrame(gameStatus.frame.animationId);
        togglePauseButton(pauseBtn, pauseBtnText, "RESUME", "pauseButtonRed", "pauseButtonGreen")
        toggleMessageBox("PAUSED");
        gameStatus.activeHeart.activeSymbolEl.style.animationPlayState = "paused";
        gameStatus.pause.is = true;
    }
}

/*-----------------------------------------------*/

function togglePauseButton(pauseBtn, pauseBtnText, text, classToRemove, classToAdd) {
    pauseBtnText.textContent = text;
    pauseBtn.classList.remove(classToRemove);
    pauseBtn.classList.add(classToAdd);
}

/*-----------------------------------------------*/

export function restartGame(now) {
    window.cancelAnimationFrame(gameStatus.frame.animationId);
    constantElements.mainTimer.textContent = "00:00";

    const gameboxElement = document.getElementById("gamebox");
    const tetrominoes = gameboxElement.querySelectorAll('.tetromino');
    tetrominoes.forEach(tetromino => {
        tetromino.remove();
    });


    if (gameStatus.pause.is === true) {
        togglePauseButton(document.getElementById("pauseButton"), document.getElementById("pauseButtonText"), "PAUSE", "pauseButtonGreen", "pauseButtonRed")
    }

    const messageBox = document.getElementById("gameMessageBox");
    messageBox.style.display = "none";

    gameStatus.reset(now);
    resetHearts();

    gameStatus.statistic.displayScore();
    gameStatus.statistic.displayLines();
    gameStatus.statistic.displayLevel();

    pickAndShowNextTetromino();
    return new Tetromino(tetrominoesData[chooseTetrominoNumber()]);
}

/*-----------------------------------------------*/

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

/*-----------------------------------------------*/

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

/*-----------------------------------------------*/



export function pickAndShowNextTetromino() {
    const tetrominoPreviews = document.getElementsByClassName("nextTetromino");
    tetrominoPreviews[gameStatus.nextTetromino].style.opacity = "0";
    gameStatus.nextTetromino = chooseTetrominoNumber();
    tetrominoPreviews[gameStatus.nextTetromino].style.opacity = "1";
}

/*-----------------------------------------------*/

export function gameOver() {
    toggleMessageBox("GAME OVER");
    gameStatus.isOver = true;
}

/*-----------------------------------------------*/

export function calculateFPS() {
    let averageFPS = (gameStatus.frame.count) / (gameStatus.gameOneSecond / 1000);

    constantElements.fpsDisplay.textContent = averageFPS.toFixed(2);

    gameStatus.frame.count = 0;
    gameStatus.gameOneSecond = 0;
}

/*-----------------------------------------------*/

export function updateMainTimer(time) {
    let playingTime = time - gameStatus.startTime - gameStatus.pause.duration;
    constantElements.mainTimer.textContent = msToMinutesSecondsString(playingTime);
}

/*-----------------------------------------------*/

function msToMinutesSecondsString(ms) {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return (minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}