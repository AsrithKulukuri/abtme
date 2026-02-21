/*
  Lightweight Mini Games Engine
  - Catch the Bug: Click-based bug avoidance game
  - Coffee Clicker: Incremental clicker with dev humor
  - Modal-based, easy to extend
*/

(function () {
    const GAMES_ENABLED = {
        bugGame: true,
        coffeeClicker: true
    };

    // Modal Management
    function createModal(gameId) {
        const existing = document.getElementById(gameId);
        if (existing) return existing;

        const modal = document.createElement('div');
        modal.id = gameId;
        modal.className = 'game-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');

        return modal;
    }

    function openModal(modal) {
        modal.classList.add('open');
        document.body.classList.add('game-open');
        modal.focus();
    }

    function closeModal(modal) {
        modal.classList.remove('open');
        document.body.classList.remove('game-open');
    }

    function setupModalClose(modal) {
        const closeBtn = modal.querySelector('.game-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal));
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                closeModal(modal);
            }
        });
    }

    // Game 1: Catch the Bug
    function initBugGame() {
        if (!GAMES_ENABLED.bugGame) return;

        const modal = createModal('bugGameModal');
        modal.innerHTML = `
          <div class="game-content bug-game-content">
            <div class="game-header">
              <h3>🐞 Catch the Bug</h3>
              <button class="game-close" aria-label="Close game">✕</button>
            </div>
            <div class="game-info">
              <p>Click the bug before it escapes! Each catch = +10 points.</p>
              <div class="game-stats">
                <div>Score: <span id="bugScore">0</span></div>
                <div>Time: <span id="bugTimer">30</span>s</div>
              </div>
            </div>
            <div class="bug-game-arena" id="bugArena"></div>
            <div class="game-controls">
              <button id="bugStartBtn" class="game-btn">Start Game</button>
              <button id="bugRestartBtn" class="game-btn" style="display:none;">Play Again</button>
            </div>
          </div>
        `;

        document.body.appendChild(modal);
        setupModalClose(modal);

        let gameActive = false;
        let score = 0;
        let timeLeft = 30;
        let bugX = 50;
        let bugY = 50;
        let bugs = [];

        const arena = document.getElementById('bugArena');
        const scoreEl = document.getElementById('bugScore');
        const timerEl = document.getElementById('bugTimer');
        const startBtn = document.getElementById('bugStartBtn');
        const restartBtn = document.getElementById('bugRestartBtn');

        function createBug() {
            const bug = document.createElement('button');
            bug.className = 'bug-target';
            bug.textContent = '🐛';
            bug.setAttribute('aria-label', 'Bug to catch');

            const x = Math.random() * 85;
            const y = Math.random() * 80;
            bug.style.left = `${x}%`;
            bug.style.top = `${y}%`;

            bug.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!gameActive) return;
                score += 10;
                scoreEl.textContent = score;
                bug.remove();
                bugs = bugs.filter(b => b !== bug);
                createBug();
            });

            arena.appendChild(bug);
            bugs.push(bug);
        }

        function startGame() {
            gameActive = true;
            score = 0;
            timeLeft = 30;
            scoreEl.textContent = '0';
            timerEl.textContent = '30';
            arena.innerHTML = '';
            startBtn.style.display = 'none';
            restartBtn.style.display = 'none';
            bugs = [];

            createBug();

            const timer = setInterval(() => {
                timeLeft--;
                timerEl.textContent = timeLeft;

                if (timeLeft <= 0) {
                    clearInterval(timer);
                    gameActive = false;
                    timerEl.textContent = 'Time\'s Up!';
                    restartBtn.style.display = 'block';
                    arena.innerHTML = `<div class="game-end-msg">🎉 Final Score: ${score}</div>`;
                    showToast(`Bug Game: ${score} points! 🐞`);
                }
            }, 1000);
        }

        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', startGame);

        const gameBtn = document.getElementById('gamesBugBtn');
        if (gameBtn) {
            gameBtn.addEventListener('click', () => openModal(modal));
        }

        return modal;
    }

    // Game 2: Coffee Clicker
    function initCoffeeClicker() {
        if (!GAMES_ENABLED.coffeeClicker) return;

        const modal = createModal('coffeeClickerModal');
        modal.innerHTML = `
          <div class="game-content coffee-clicker-content">
            <div class="game-header">
              <h3>☕ Coffee Clicker</h3>
              <button class="game-close" aria-label="Close game">✕</button>
            </div>
            <div class="game-info">
              <p>Click coffee to fuel your dev session!</p>
            </div>
            <div class="coffee-game">
              <button id="coffeeBtn" class="coffee-btn" aria-label="Click coffee">☕</button>
              <div class="coffee-stats">
                <div class="stat-row">
                  <span>Cups:</span>
                  <span id="coffeeCount">0</span>
                </div>
                <div class="stat-row">
                  <span>Per Click:</span>
                  <span id="coffeePerClick">1</span>
                </div>
                <div class="stat-row">
                  <span>Per Second:</span>
                  <span id="coffeePerSec">0</span>
                </div>
              </div>
              <div class="coffee-upgrades">
                <h4>Upgrades</h4>
                <button id="upgradeDouble" class="upgrade-btn" data-cost="10">2x Click (Cost: 10)</button>
                <button id="upgradeAuto" class="upgrade-btn" data-cost="50">Auto Brew (Cost: 50)</button>
                <button id="upgradeSpeed" class="upgrade-btn" data-cost="100">Speed Boost (Cost: 100)</button>
              </div>
            </div>
            <div class="game-controls">
              <button id="coffeeResetBtn" class="game-btn subtle">Reset Game</button>
            </div>
          </div>
        `;

        document.body.appendChild(modal);
        setupModalClose(modal);

        let coffee = parseInt(localStorage.getItem('asrith-coffee-clicker') || '0');
        let perClick = 1;
        let autoPerSec = 0;
        let upgrades = JSON.parse(localStorage.getItem('asrith-coffee-upgrades') || '{}');

        const coffeeBtn = document.getElementById('coffeeBtn');
        const countEl = document.getElementById('coffeeCount');
        const perClickEl = document.getElementById('coffeePerClick');
        const perSecEl = document.getElementById('coffeePerSec');
        const doubleBtn = document.getElementById('upgradeDouble');
        const autoBtn = document.getElementById('upgradeAuto');
        const speedBtn = document.getElementById('upgradeSpeed');
        const resetBtn = document.getElementById('coffeeResetBtn');

        function saveCoffee() {
            localStorage.setItem('asrith-coffee-clicker', coffee);
            localStorage.setItem('asrith-coffee-upgrades', JSON.stringify(upgrades));
        }

        function updateDisplay() {
            countEl.textContent = coffee;
            perClickEl.textContent = perClick;
            perSecEl.textContent = autoPerSec;

            doubleBtn.disabled = coffee < 10;
            autoBtn.disabled = coffee < 50;
            speedBtn.disabled = coffee < 100;
        }

        function applyUpgrades() {
            perClick = 1;
            autoPerSec = 0;

            if (upgrades.double) perClick *= 2;
            if (upgrades.auto) autoPerSec += 0.1;
            if (upgrades.speed) autoPerSec *= 2;
        }

        coffeeBtn.addEventListener('click', () => {
            coffee += perClick;
            updateDisplay();
            saveCoffee();
            coffeeBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                coffeeBtn.style.transform = 'scale(1)';
            }, 100);
        });

        doubleBtn.addEventListener('click', () => {
            if (coffee >= 10) {
                coffee -= 10;
                upgrades.double = true;
                applyUpgrades();
                updateDisplay();
                saveCoffee();
                showToast('Double click power! ⚡');
            }
        });

        autoBtn.addEventListener('click', () => {
            if (coffee >= 50) {
                coffee -= 50;
                upgrades.auto = true;
                applyUpgrades();
                updateDisplay();
                saveCoffee();
                showToast('Auto brew started! 🤖');
            }
        });

        speedBtn.addEventListener('click', () => {
            if (coffee >= 100) {
                coffee -= 100;
                upgrades.speed = true;
                applyUpgrades();
                updateDisplay();
                saveCoffee();
                showToast('Speed enabled! 🚀');
            }
        });

        resetBtn.addEventListener('click', () => {
            if (confirm('Reset coffee clicker progress?')) {
                coffee = 0;
                upgrades = {};
                applyUpgrades();
                updateDisplay();
                saveCoffee();
            }
        });

        // Auto generation
        setInterval(() => {
            if (autoPerSec > 0) {
                coffee += autoPerSec;
                updateDisplay();
                saveCoffee();
            }
        }, 1000);

        applyUpgrades();
        updateDisplay();

        const gameBtn = document.getElementById('gamesClickerBtn');
        if (gameBtn) {
            gameBtn.addEventListener('click', () => openModal(modal));
        }

        return modal;
    }

    // Initialize and expose utility
    function showToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2100);
    }

    // Expose for animations.js
    window.gamesEngine = {
        initBugGame,
        initCoffeeClicker,
        openModal,
        closeModal
    };

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initBugGame();
            initCoffeeClicker();
        });
    } else {
        initBugGame();
        initCoffeeClicker();
    }
})();
