/*
  Multi-Theme System
  - 5 unique themes with personality
  - CSS variable-based for smooth transitions
  - localStorage persistence
  - System preference detection
  - Theme-specific behaviors
*/

(function () {
    const THEMES = {
        studio: {
            name: 'Studio',
            emoji: '✨',
            colors: {
                bg: '#020419',
                bgSoft: '#0a1030',
                card: '#080d26',
                text: '#e9f0ff',
                muted: '#9cabcc',
                accent: '#ff3b78',
                accent2: '#5a6fff',
                line: '#1b2452',
                glow: 'rgba(255, 59, 120, 0.2)'
            },
            animationSpeed: 1,
            cursor: 'auto',
            description: 'Original design - pink + blue neon'
        },

        midnightHacker: {
            name: 'Midnight Hacker',
            emoji: '🌙',
            colors: {
                bg: '#0a0e27',
                bgSoft: '#0f1542',
                card: '#0d1244',
                text: '#00ff88',
                muted: '#00cc6a',
                accent: '#00ff88',
                accent2: '#00ffff',
                line: '#1a3a2a',
                glow: 'rgba(0, 255, 136, 0.2)'
            },
            animationSpeed: 0.8,
            cursor: 'crosshair',
            terminalMode: true,
            description: 'Dark hacker vibes with neon green accents'
        },

        chillStudent: {
            name: 'Chill Student',
            emoji: '😌',
            colors: {
                bg: '#faf9f6',
                bgSoft: '#f0ede6',
                card: '#fffbf7',
                text: '#3a3935',
                muted: '#7a7570',
                accent: '#ff8fa3',
                accent2: '#a8d5ff',
                line: '#e5dfd7',
                glow: 'rgba(255, 143, 163, 0.15)'
            },
            animationSpeed: 1.2,
            cursor: 'pointer',
            reducedMotion: true,
            description: 'Soft, calm, pastel vibes'
        },

        startupEnergy: {
            name: 'Startup Energy',
            emoji: '⚡',
            colors: {
                bg: '#1a1d2e',
                bgSoft: '#242836',
                card: '#1f2335',
                text: '#e4e8f5',
                muted: '#8b92b8',
                accent: '#00d9ff',
                accent2: '#6366f1',
                line: '#2d3548',
                glow: 'rgba(0, 217, 255, 0.25)'
            },
            animationSpeed: 0.7,
            cursor: 'grab',
            boldCTA: true,
            description: 'Electric blue energy, fast micro-interactions'
        },

        gamerMode: {
            name: 'Gamer Mode',
            emoji: '🎮',
            colors: {
                bg: '#0f0f1e',
                bgSoft: '#1a1a2e',
                card: '#16213e',
                text: '#eef0f5',
                muted: '#9aa5b1',
                accent: '#ff006e',
                accent2: '#00f5ff',
                line: '#2d3e4f',
                glow: 'rgba(0, 245, 255, 0.28)'
            },
            animationSpeed: 0.65,
            cursor: 'pointer',
            pixelMode: true,
            achievementToasts: true,
            description: 'Retro gaming aesthetic with bold colors'
        },

        experimentalChaos: {
            name: 'Experimental Chaos',
            emoji: '🎲',
            colors: {
                bg: '#1a0f2e',
                bgSoft: '#2d1b47',
                card: '#251d3f',
                text: '#f0e6ff',
                muted: '#c9a8ff',
                accent: '#ff006e',
                accent2: '#00f5ff',
                line: '#4d2e6f',
                glow: 'rgba(255, 0, 110, 0.25)'
            },
            animationSpeed: 0.5,
            cursor: 'grabbing',
            chaosMode: true,
            randomAccents: true,
            unpredictableAnimations: true,
            description: 'Random, unpredictable, pure chaos'
        }
    };

    const STORAGE_KEY = 'asrith-theme';
    const CHAOS_KEY = 'asrith-chaos-mode';
    let currentTheme = null;
    let isChaosUnlocked = localStorage.getItem(CHAOS_KEY) === 'true';

    function isWebViewContext() {
        const userAgent = navigator.userAgent || '';
        return (
            !!window.ReactNativeWebView ||
            /\bwv\b/i.test(userAgent) ||
            /WebView/i.test(userAgent) ||
            /(FBAN|FBAV|Instagram)/i.test(userAgent)
        );
    }

    function getSystemPreference() {
        // Default to original Studio theme
        return 'studio';
    }

    function applyTheme(themeId) {
        if (!THEMES[themeId]) return false;

        const theme = THEMES[themeId];
        const root = document.documentElement;

        // Apply CSS variables
        Object.entries(theme.colors).forEach(([key, value]) => {
            const cssVar = `--${key.replace(/([A-Z])/g, '-$1').replace(/([a-z])(\d)/g, '$1-$2').toLowerCase()}`;
            root.style.setProperty(cssVar, value);
        });

        // Apply theme-specific classes
        document.body.className = '';
        document.body.classList.add(`theme-${themeId}`);

        if (theme.terminalMode) document.body.classList.add('terminal-mode');
        if (theme.reducedMotion) document.body.classList.add('reduced-motion-theme');
        if (theme.boldCTA) document.body.classList.add('bold-cta');
        if (theme.pixelMode) document.body.classList.add('pixel-mode');
        if (theme.chaosMode) document.body.classList.add('chaos-mode');

        // Update cursor
        document.documentElement.style.cursor = theme.cursor || 'auto';

        // Store preference
        localStorage.setItem(STORAGE_KEY, themeId);
        currentTheme = themeId;

        // Dispatch custom event for other scripts
        window.dispatchEvent(
            new CustomEvent('themeChanged', {
                detail: { theme: themeId, config: theme }
            })
        );

        return true;
    }

    function initThemeSwitcher() {
        const switcher = document.getElementById('themeSwitcher');
        const mobileSwitcher = document.getElementById('mobileThemeSwitcher');
        const themeToggle = document.getElementById('themeToggle');
        const menuButton = document.getElementById('menuButton');
        const isWebView = isWebViewContext();

        if (isWebView) {
            document.body.classList.add('webview-mode');
        }

        if (!switcher && !mobileSwitcher) return;

        const themeList = Object.entries(THEMES)
            .filter(([id]) => id !== 'experimentalChaos' || isChaosUnlocked)
            .map(([id, config]) => ({
                id,
                name: config.name,
                emoji: config.emoji
            }));

        const getNextThemeId = () => {
            const ids = themeList.map((theme) => theme.id);
            const currentIndex = ids.indexOf(currentTheme);
            if (currentIndex === -1) return ids[0];
            return ids[(currentIndex + 1) % ids.length];
        };

        const themeButtonsHTML =
            `<div class="theme-options-grid">` +
            themeList
                .map(
                    (t) =>
                        `<button class="theme-option icon-only" data-theme="${t.id}" aria-label="${t.name}" title="${THEMES[t.id].description}">
                            <span aria-hidden="true">${t.emoji}</span>
                        </button>`
                )
                .join('') +
            `</div>`;

        // Populate desktop switcher
        if (switcher) {
            switcher.innerHTML = `
                <div style="margin-bottom: 0.8rem; padding-bottom: 0.8rem; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 1.1rem; color: var(--text); font-weight: 600;">Choose Theme</h3>
                    <button class="theme-close-btn" aria-label="Close theme switcher">✕</button>
                </div>
            ` + themeButtonsHTML;
        }

        // Populate mobile switcher
        if (mobileSwitcher) {
            mobileSwitcher.innerHTML = themeList
                .map(
                    (t) =>
                        `<button class="mobile-theme-option icon-only" data-theme="${t.id}" aria-label="${t.name}" title="${THEMES[t.id].description}">
                        <span aria-hidden="true">${t.emoji}</span>
                    </button>`
                )
                .join('');
        }

        // Attach click handlers to desktop theme options
        const buttons = switcher ? switcher.querySelectorAll('.theme-option') : [];
        buttons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent switcher click handler from interfering
                const themeId = btn.dataset.theme;
                applyTheme(themeId);
                updateSwitcherUI();
                showToast(`Switched to ${THEMES[themeId].name} 🎨`);
                switcher.classList.remove('open');
                if (themeToggle) themeToggle.classList.remove('active');

                // Close overlay
                const overlay = document.querySelector('.theme-overlay');
                if (overlay) overlay.classList.remove('show');
            });
        });

        // Attach click handlers to mobile theme options
        const mobileButtons = mobileSwitcher ? mobileSwitcher.querySelectorAll('.mobile-theme-option') : [];
        mobileButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const themeId = btn.dataset.theme;
                applyTheme(themeId);
                updateSwitcherUI();
                showToast(`Switched to ${THEMES[themeId].name} 🎨`);

                // Close mobile menu
                if (menuButton && document.getElementById('navLinks')) {
                    document.getElementById('navLinks').classList.remove('open');
                    menuButton.setAttribute('aria-expanded', 'false');
                }
            });
        });

        // Toggle switcher sidebar (desktop)
        if (themeToggle && switcher) {
            // Create overlay element
            let overlay = document.querySelector('.theme-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'theme-overlay';
                document.body.appendChild(overlay);
            }

            themeToggle.addEventListener('click', () => {
                if (isWebView) {
                    const nextThemeId = getNextThemeId();
                    applyTheme(nextThemeId);
                    updateSwitcherUI();
                    showToast(`Vibe shifted to ${THEMES[nextThemeId].name} ${THEMES[nextThemeId].emoji}`);
                    themeToggle.classList.add('vibe-shift');
                    setTimeout(() => themeToggle.classList.remove('vibe-shift'), 260);
                    return;
                }

                const isOpen = switcher.classList.toggle('open');
                themeToggle.classList.toggle('active', isOpen);
                overlay.classList.toggle('show', isOpen);
            });

            const closeSwitcher = () => {
                switcher.classList.remove('open');
                themeToggle.classList.remove('active');
                overlay.classList.remove('show');
            };

            if (!switcher.dataset.outsideCloseBound) {
                document.addEventListener('mousedown', (event) => {
                    if (!switcher.classList.contains('open')) return;
                    const clickedInsidePanel = switcher.contains(event.target);
                    const clickedToggle = themeToggle.contains(event.target);
                    if (!clickedInsidePanel && !clickedToggle) {
                        closeSwitcher();
                    }
                });
                switcher.dataset.outsideCloseBound = 'true';
            }

            // Close button handler
            const closeBtn = switcher.querySelector('.theme-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeSwitcher();
                });
            }

            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && switcher.classList.contains('open')) {
                    closeSwitcher();
                }
            });
        }

        updateSwitcherUI();
    }

    function updateSwitcherUI() {
        const buttons = document.querySelectorAll('.theme-option');
        const mobileButtons = document.querySelectorAll('.mobile-theme-option');
        const themeToggle = document.getElementById('themeToggle');
        const isWebView = isWebViewContext();

        buttons.forEach((btn) => {
            const isActive = btn.dataset.theme === currentTheme;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive);
        });

        mobileButtons.forEach((btn) => {
            const isActive = btn.dataset.theme === currentTheme;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive);
        });

        // Update the toggle button to show current theme
        if (themeToggle && THEMES[currentTheme]) {
            const displayThemeId = currentTheme;
            const currentConfig = THEMES[displayThemeId];
            themeToggle.innerHTML = isWebView
                ? `${currentConfig.emoji}`
                : `${currentConfig.emoji} ${currentConfig.name}`;
            themeToggle.title = isWebView
                ? `Tap to shift vibe • Current: ${currentConfig.name}`
                : 'Switch themes';
        }
    }

    function showToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2100);
    }

    function unlockChaosMode() {
        if (isChaosUnlocked) return;
        isChaosUnlocked = true;
        localStorage.setItem(CHAOS_KEY, 'true');
        showToast('🎲 Experimental Chaos unlocked! Check theme menu.');
        applyTheme('experimentalChaos');
        initThemeSwitcher();
    }

    function getRandomAccentColor() {
        const hue = Math.random() * 360;
        const saturation = 70 + Math.random() * 30;
        const lightness = 45 + Math.random() * 15;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    function initChaosAnimations() {
        if (!document.body.classList.contains('chaos-mode')) return;

        const elements = document.querySelectorAll('a, button, .btn');
        elements.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                const randomColor = getRandomAccentColor();
                el.style.setProperty('--accent-override', randomColor);
            });

            el.addEventListener('mouseleave', () => {
                el.style.removeProperty('--accent-override');
            });
        });

        // Random element rotations
        setInterval(() => {
            const randomEl = document.querySelectorAll('*')[Math.floor(Math.random() * 100)];
            if (randomEl && Math.random() > 0.95) {
                const rotate = (Math.random() - 0.5) * 2;
                randomEl.style.transition = 'transform 0.3s ease';
                randomEl.style.transform = `rotate(${rotate}deg)`;
                setTimeout(() => {
                    randomEl.style.transform = 'rotate(0deg)';
                }, 300);
            }
        }, 500);
    }

    function initialize() {
        // Get saved theme or system preference
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        const themeToUse = savedTheme && THEMES[savedTheme] ? savedTheme : getSystemPreference();

        applyTheme(themeToUse);
        initThemeSwitcher();

        if (THEMES[themeToUse].chaosMode) {
            initChaosAnimations();
        }

        // Listen for theme change events from other scripts
        window.addEventListener('themeChanged', (e) => {
            if (e.detail.config.chaosMode) {
                initChaosAnimations();
            }
        });
    }

    // Expose for other scripts
    window.themesEngine = {
        applyTheme,
        unlockChaosMode,
        getCurrentTheme: () => currentTheme,
        getTheme: (id) => THEMES[id],
        getAllThemes: () => THEMES,
        isChaosUnlocked: () => isChaosUnlocked
    };

    // Initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
