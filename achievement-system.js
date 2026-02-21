/*
  ═══════════════════════════════════════════════════════════
  ACHIEVEMENT SYSTEM
  ═══════════════════════════════════════════════════════════
  - Easter egg discovery
  - Interaction tracking
  - Achievement notifications
  - Progress persistence
  - Gamification elements
*/

(function () {
    const STORAGE_KEY = 'asrith_achievements';
    let achievements = {
        explorer: { unlocked: false, name: 'Explorer', desc: 'Scrolled to every section', icon: '🗺️' },
        chatter: { unlocked: false, name: 'Chatter', desc: 'Sent 5 messages to AI', icon: '💬' },
        themeCollector: { unlocked: false, name: 'Theme Collector', desc: 'Tried all themes', icon: '🎨' },
        bugCatcher: { unlocked: false, name: 'Bug Catcher', desc: 'Played the bug game', icon: '🐞' },
        coffeeAddict: { unlocked: false, name: 'Coffee Addict', desc: 'Clicked coffee 50 times', icon: '☕' },
        speedReader: { unlocked: false, name: 'Speed Reader', desc: 'Visited 5+ projects quickly', icon: '⚡' },
        nightOwl: { unlocked: false, name: 'Night Owl', desc: 'Used site after midnight', icon: '🦉' },
        secretFinder: { unlocked: false, name: 'Secret Finder', desc: 'Found the hidden command', icon: '🔍' }
    };

    let stats = {
        scrolledSections: new Set(),
        messagesSent: 0,
        themesUsed: new Set(),
        coffeeClicks: 0,
        projectVisits: 0
    };

    function init() {
        loadProgress();
        setupTrackers();
        checkTimeBasedAchievements();
    }

    function loadProgress() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            achievements = { ...achievements, ...data.achievements };
            stats = { ...stats, ...data.stats };
            stats.scrolledSections = new Set(data.stats.scrolledSections || []);
            stats.themesUsed = new Set(data.stats.themesUsed || []);
        }
    }

    function saveProgress() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            achievements,
            stats: {
                ...stats,
                scrolledSections: Array.from(stats.scrolledSections),
                themesUsed: Array.from(stats.themesUsed)
            }
        }));
    }

    function setupTrackers() {
        // Track section scrolling
        const sections = document.querySelectorAll('section[id]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    stats.scrolledSections.add(entry.target.id);
                    if (stats.scrolledSections.size >= sections.length) {
                        unlock('explorer');
                    }
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => observer.observe(section));

        // Track theme changes
        window.addEventListener('themeChanged', (e) => {
            stats.themesUsed.add(e.detail.theme);
            if (stats.themesUsed.size >= 5) {
                unlock('themeCollector');
            }
            saveProgress();
        });

        // Track coffee clicks
        const coffeeBtn = document.getElementById('gamesClickerBtn');
        if (coffeeBtn) {
            coffeeBtn.addEventListener('click', () => {
                stats.coffeeClicks++;
                if (stats.coffeeClicks >= 50) {
                    unlock('coffeeAddict');
                }
                saveProgress();
            });
        }

        // Track bug game
        const bugBtn = document.getElementById('gamesBugBtn');
        if (bugBtn) {
            bugBtn.addEventListener('click', () => {
                unlock('bugCatcher');
            });
        }

        // Track AI messages
        window.addEventListener('aiMessageSent', () => {
            stats.messagesSent++;
            if (stats.messagesSent >= 5) {
                unlock('chatter');
            }
            saveProgress();
        });

        // Secret command (Konami code)
        let konamiCode = [];
        const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

        document.addEventListener('keydown', (e) => {
            konamiCode.push(e.key);
            konamiCode = konamiCode.slice(-10);

            if (konamiCode.join(',') === konamiSequence.join(',')) {
                unlock('secretFinder');
                if (window.themesEngine) {
                    window.themesEngine.unlockChaosMode();
                }
            }
        });
    }

    function checkTimeBasedAchievements() {
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 6) {
            unlock('nightOwl');
        }
    }

    function unlock(achievementId) {
        if (achievements[achievementId] && !achievements[achievementId].unlocked) {
            achievements[achievementId].unlocked = true;
            showNotification(achievements[achievementId]);
            saveProgress();
        }
    }

    function showNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);

        // Play sound (optional)
        playAchievementSound();
    }

    function playAchievementSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    // Expose API
    window.achievementSystem = {
        unlock,
        getProgress: () => ({ achievements, stats })
    };

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
