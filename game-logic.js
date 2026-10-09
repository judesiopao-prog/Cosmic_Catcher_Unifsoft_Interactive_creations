'use strict';

// ============================================================
// DOM ELEMENTS
// ============================================================

const gameCanvas = document.getElementById('gameCanvas');

const mainMenu = document.getElementById('mainMenu');
const gameOverScreen = document.getElementById('gameOverScreen');
const feedbackScreen = document.getElementById('feedbackScreen');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');

const scoreDisplay = document.getElementById('scoreDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const timeDisplay = document.getElementById('timeDisplay');
const livesDisplay = document.getElementById('livesDisplay');

const gameResultTitle = document.getElementById('gameResultTitle');
const gameResultText = document.getElementById('gameResultText');
const finalScoreDisplay = document.getElementById('finalScoreDisplay');

// ============================================================
// GAME STATE & CONSTANTS
// ============================================================

const TARGET_LEVEL_SCORE = 150;
const LEVEL_TIME = 60;
const STARTING_LIVES = 3;
const POINTS_PER_ORB = 10;

let score = 0;
let levelScore = 0;
let level = 1;
let lives = STARTING_LIVES;
let timeLeft = LEVEL_TIME;

// Keep these global because other files use gameActive.
let gameActive = false;
let isLevelComplete = false;

let timerInterval = null;
let animationFrameId = null;

// ============================================================
// PLAYER & GAME OBJECTS
// ============================================================

const player = {
    x: 270,
    y: 480,
    width: 60,
    height: 15,
    speed: 8
};

let collectibles = [];
let hazards = [];

// ============================================================
// KEYBOARD INPUT
// ============================================================

const keys = {
    left: false,
    right: false
};

document.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;

    // Do not interfere with form inputs.
    if (
        activeEl &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName)
    ) {
        return;
    }

    if (
        e.key === 'ArrowLeft' ||
        e.key === 'a' ||
        e.key === 'A'
    ) {
        e.preventDefault();
        keys.left = true;
    }

    if (
        e.key === 'ArrowRight' ||
        e.key === 'd' ||
        e.key === 'D'
    ) {
        e.preventDefault();
        keys.right = true;
    }
});

document.addEventListener('keyup', (e) => {
    const activeEl = document.activeElement;

    if (
        activeEl &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName)
    ) {
        return;
    }

    if (
        e.key === 'ArrowLeft' ||
        e.key === 'a' ||
        e.key === 'A'
    ) {
        keys.left = false;
    }

    if (
        e.key === 'ArrowRight' ||
        e.key === 'd' ||
        e.key === 'D'
    ) {
        keys.right = false;
    }
});

// ============================================================
// UI BUTTON LISTENERS
// ============================================================

startBtn?.addEventListener('click', () => {
    startGame();
});

restartBtn?.addEventListener('click', () => {
    if (isLevelComplete) {
        startNextLevel();
    } else {
        startGame();
    }
});

menuBtn?.addEventListener('click', () => {
    stopGameLoops();

    gameActive = false;
    isLevelComplete = false;

    keys.left = false;
    keys.right = false;

    gameOverScreen?.classList.add('hidden');
    feedbackScreen?.classList.add('hidden');
    mainMenu?.classList.remove('hidden');
});

// ============================================================
// SCREEN MANAGEMENT
// ============================================================

function hideAllScreens() {
    mainMenu?.classList.add('hidden');
    gameOverScreen?.classList.add('hidden');
    feedbackScreen?.classList.add('hidden');

    const highScoreScreenElement =
        document.getElementById('highScoreScreen');

    highScoreScreenElement?.classList.add('hidden');

    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
}

// ============================================================
// START GAME
// ============================================================

function startGame() {
    stopGameLoops();

    isLevelComplete = false;

    hideAllScreens();

    // Reset game state.
    score = 0;
    levelScore = 0;
    level = 1;
    lives = STARTING_LIVES;
    timeLeft = LEVEL_TIME;

    collectibles = [];
    hazards = [];

    // Reset player.
    const cWidth = gameCanvas ? gameCanvas.width : 600;

    player.width = 60;
    player.x = cWidth / 2 - player.width / 2;
    player.y = 480;

    // Reset controls.
    keys.left = false;
    keys.right = false;

    updateHUD();

    // Activate game.
    gameActive = true;

    startLevelTimer();
    gameLoop();
}

// ============================================================
// START NEXT LEVEL
// ============================================================

function startNextLevel() {
    stopGameLoops();

    isLevelComplete = false;

    hideAllScreens();

    level++;
    levelScore = 0;
    timeLeft = LEVEL_TIME;

    collectibles = [];
    hazards = [];

    const cWidth = gameCanvas ? gameCanvas.width : 600;

    // Make player smaller as levels increase.
    player.width = Math.max(
        20,
        60 - (level - 1) * 3
    );

    player.x = cWidth / 2 - player.width / 2;
    player.y = 480;

    keys.left = false;
    keys.right = false;

    updateHUD();

    gameActive = true;

    startLevelTimer();
    gameLoop();
}

// ============================================================
// TIMER
// ============================================================

function startLevelTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    timerInterval = setInterval(() => {
        if (!gameActive) {
            return;
        }

        timeLeft--;

        updateHUD();

        if (timeLeft <= 0) {
            endGame(
                false,
                `Time expired! Failed to score ${TARGET_LEVEL_SCORE} points on Level ${level}.`
            );
        }
    }, 1000);
}

// ============================================================
// STOP GAME LOOPS
// ============================================================

function stopGameLoops() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// ============================================================
// MAIN GAME LOOP
// ============================================================

function gameLoop() {
    if (!gameActive) {
        return;
    }

    update();

    // game-draw.js should provide draw().
    if (typeof draw === 'function') {
        try {
            draw();
        } catch (err) {
            console.error('Error in draw function:', err);
        }
    }

    if (gameActive) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// ============================================================
// UPDATE GAME
// ============================================================

function update() {
    if (!gameActive) {
        return;
    }

    const cWidth = gameCanvas ? gameCanvas.width : 600;
    const cHeight = gameCanvas ? gameCanvas.height : 520;

    // --------------------------------------------------------
    // PLAYER MOVEMENT
    // --------------------------------------------------------

    if (keys.left) {
        player.x -= player.speed;
    }

    if (keys.right) {
        player.x += player.speed;
    }

    // Keep player inside canvas.
    player.x = Math.max(
        0,
        Math.min(
            player.x,
            cWidth - player.width
        )
    );

    // --------------------------------------------------------
    // DIFFICULTY
    // --------------------------------------------------------

    const orbSpawnProb = Math.min(
        0.08,
        0.03 + (level - 1) * 0.002
    );

    const hazardSpawnProb = Math.min(
        0.16,
        0.02 + (level - 1) * 0.01
    );

    const orbSpeed =
        3.0 + (level - 1) * 0.5;

    const hazardSpeed =
        3.5 + (level - 1) * 0.75;

    // --------------------------------------------------------
    // SPAWN COLLECTIBLES
    // --------------------------------------------------------

    if (Math.random() < orbSpawnProb) {
        const size = 28;

        collectibles.push({
            x:
                Math.random() *
                    (cWidth - size) +
                size / 2,

            y: -size,

            size: size,

            speed: orbSpeed
        });
    }

    // --------------------------------------------------------
    // SPAWN HAZARDS
    // --------------------------------------------------------

    if (Math.random() < hazardSpawnProb) {
        const size = 32;

        hazards.push({
            x:
                Math.random() *
                    (cWidth - size) +
                size / 2,

            y: -size,

            size: size,

            speed: hazardSpeed
        });
    }

    // --------------------------------------------------------
    // UPDATE COLLECTIBLES
    // --------------------------------------------------------

    for (
        let i = collectibles.length - 1;
        i >= 0;
        i--
    ) {
        if (!gameActive) {
            return;
        }

        const item = collectibles[i];

        item.y += item.speed;

        // Collision with player.
        if (
            checkCircleRectCollision(
                item,
                player
            )
        ) {
            score += POINTS_PER_ORB;
            levelScore += POINTS_PER_ORB;

            collectibles.splice(i, 1);

            updateHUD();

            // Level completed.
            if (
                levelScore >=
                TARGET_LEVEL_SCORE
            ) {
                advanceLevel();
                return;
            }
        }

        // Remove when off screen.
        else if (
            item.y - item.size > cHeight
        ) {
            collectibles.splice(i, 1);
        }
    }

    // --------------------------------------------------------
    // UPDATE HAZARDS
    // --------------------------------------------------------

    for (
        let i = hazards.length - 1;
        i >= 0;
        i--
    ) {
        if (!gameActive) {
            return;
        }

        const hazard = hazards[i];

        hazard.y += hazard.speed;

        // Collision with player.
        if (
            checkCircleRectCollision(
                hazard,
                player
            )
        ) {
            lives--;

            hazards.splice(i, 1);

            updateHUD();

            // Game over.
            if (lives <= 0) {
                endGame(
                    false,
                    `Ran out of lives on Level ${level}!`
                );

                return;
            }
        }

        // Remove when off screen.
        else if (
            hazard.y - hazard.size > cHeight
        ) {
            hazards.splice(i, 1);
        }
    }
}

// ============================================================
// LEVEL COMPLETE
// ============================================================

function advanceLevel() {
    if (!gameActive) {
        return;
    }

    isLevelComplete = true;
    gameActive = false;

    stopGameLoops();

    keys.left = false;
    keys.right = false;

    if (gameResultTitle) {
        gameResultTitle.textContent = 'Victory!';
        gameResultTitle.style.color = '#4ade80';
    }

    if (gameResultText) {
        gameResultText.textContent =
            `Level ${level} complete! Press Next Level when you're ready.`;
    }

    if (finalScoreDisplay) {
        finalScoreDisplay.textContent = score;
    }

    if (restartBtn) {
        restartBtn.textContent = 'Next Level';
    }

    gameOverScreen?.classList.remove('hidden');

    // Tell high-score.js about the completed level.
    document.dispatchEvent(
        new CustomEvent('gameFinished', {
            detail: {
                score: score,
                level: level
            }
        })
    );
}

// ============================================================
// COLLISION DETECTION
// ============================================================

function checkCircleRectCollision(circle, rect) {
    const radius = circle.size / 2;

    const closestX = Math.max(
        rect.x,
        Math.min(
            circle.x,
            rect.x + rect.width
        )
    );

    const closestY = Math.max(
        rect.y,
        Math.min(
            circle.y,
            rect.y + rect.height
        )
    );

    const dx = circle.x - closestX;
    const dy = circle.y - closestY;

    return (
        dx * dx + dy * dy
        <= radius * radius
    );
}

// ============================================================
// HUD
// ============================================================

function updateHUD() {
    if (scoreDisplay) {
        scoreDisplay.textContent = score;
    }

    if (levelDisplay) {
        levelDisplay.textContent = level;
    }

    if (timeDisplay) {
        timeDisplay.textContent = timeLeft;
    }

    if (livesDisplay) {
        livesDisplay.textContent = lives;
    }
}

// ============================================================
// GAME OVER
// ============================================================

function endGame(isWin, message) {
    if (!gameActive) {
        return;
    }

    isLevelComplete = false;
    gameActive = false;

    stopGameLoops();

    keys.left = false;
    keys.right = false;

    if (gameResultTitle) {
        gameResultTitle.textContent =
            isWin ? 'Victory!' : 'Game Over';

        gameResultTitle.style.color =
            isWin ? '#4ade80' : '#f87171';
    }

    if (gameResultText) {
        gameResultText.textContent = message;
    }

    if (finalScoreDisplay) {
        finalScoreDisplay.textContent = score;
    }

    if (restartBtn) {
        restartBtn.textContent = 'Play Again';
    }

    gameOverScreen?.classList.remove('hidden');

    // Tell high-score.js the game has ended.
    document.dispatchEvent(
        new CustomEvent('gameFinished', {
            detail: {
                score: score,
                level: level
            }
        })
    );
}