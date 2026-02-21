/*
  Playful Animation Engine
  - Toggle any feature in ANIMATION_TOGGLES
  - Built to stay smooth and mobile-safe
*/
(function () {
    const ANIMATION_TOGGLES = {
        loader: true,
        magneticButtons: true,
        skillJokes: true,
        fakeTerminal: true,
        bugEasterEgg: true,
        inactivityOverlay: true,
        consoleEasterEgg: true,
        darkModeJoke: true,
        scrollProgress: true,
        smartNav: true,
        parallaxGlow: true,
        tabVisibilityPause: true,
        konamiCode: true,
        smartTooltips: true
    };

    const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointerFine = window.matchMedia('(pointer:fine)').matches;

    const loader = document.getElementById('loadingScreen');
    const loaderLine = document.getElementById('loaderLine');
    const loaderProgress = document.getElementById('loaderProgress');
    const loaderJoke = document.getElementById('loaderJoke');
    const themeToggle = document.getElementById('themeToggle');
    const toast = document.getElementById('toast');
    const idleOverlay = document.getElementById('idleOverlay');
    const typedCommand = document.getElementById('typedCommand');
    const bugEgg = document.getElementById('bugEgg');
    const projectSection = document.querySelector('.project-section');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const bgGlow = document.querySelector('.bg-glow');

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        window.setTimeout(() => {
            toast.classList.remove('show');
        }, 2100);
    }

    /* 1 + 7) First-visit loading screen + progress joke */
    function runLoader() {
        if (!ANIMATION_TOGGLES.loader || !loader || !loaderLine || !loaderProgress || !loaderJoke) {
            loader?.classList.add('is-hidden');
            return;
        }

        const firstVisitKey = 'asrith-loader-seen-v1';
        const hasSeenLoader = localStorage.getItem(firstVisitKey) === '1';

        if (hasSeenLoader) {
            loader.classList.add('is-hidden');
            return;
        }

        const lines = [
            'Booting Asrith.exe',
            'Compiling curiosity...',
            'Turning coffee into code ☕',
            'Asking StackOverflow...'
        ];

        let lineIndex = 0;
        let progress = 0;

        const lineTimer = window.setInterval(() => {
            lineIndex = (lineIndex + 1) % lines.length;
            loaderLine.textContent = lines[lineIndex];
        }, 800);

        const progressTimer = window.setInterval(() => {
            if (progress < 90) {
                progress += 3;
                loaderProgress.style.width = `${progress}%`;
                return;
            }

            window.clearInterval(progressTimer);
            loaderJoke.textContent = 'Almost done… like my assignments';

            window.setTimeout(() => {
                loaderProgress.style.width = '100%';
                window.setTimeout(() => {
                    loader.classList.add('is-hidden');
                    localStorage.setItem(firstVisitKey, '1');
                    window.clearInterval(lineTimer);
                }, 260);
            }, 1000);
        }, motionReduced ? 120 : 90);
    }

    /* 2) Magnetic CTA buttons */
    function initMagneticButtons() {
        if (!ANIMATION_TOGGLES.magneticButtons || motionReduced || !pointerFine) return;

        const magneticButtons = document.querySelectorAll('.cta-row .btn');
        magneticButtons.forEach((button) => {
            button.addEventListener('pointermove', (event) => {
                const bounds = button.getBoundingClientRect();
                const x = event.clientX - bounds.left - bounds.width / 2;
                const y = event.clientY - bounds.top - bounds.height / 2;
                button.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
            });

            button.addEventListener('pointerleave', () => {
                button.style.transform = 'translate(0, 0)';
            });
        });
    }

    /* 3) Skill card hover jokes + subtle tilt */
    function initSkillJokes() {
        if (!ANIMATION_TOGGLES.skillJokes) return;

        const cards = document.querySelectorAll('[data-joke-card]');
        cards.forEach((card) => {
            const text = card.querySelector('p');
            if (!text) return;

            const baseText = text.getAttribute('data-default') || text.textContent;
            const jokeText = text.getAttribute('data-joke') || text.textContent;

            card.addEventListener('mouseenter', () => {
                text.textContent = jokeText;
                card.classList.add('is-joking');
            });

            card.addEventListener('mouseleave', () => {
                text.textContent = baseText;
                card.classList.remove('is-joking');
                card.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg)';
            });

            if (motionReduced || !pointerFine) return;

            card.addEventListener('pointermove', (event) => {
                const bounds = card.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width;
                const y = (event.clientY - bounds.top) / bounds.height;
                const rx = (0.5 - y) * 5;
                const ry = (x - 0.5) * 6;
                card.style.transform = `translateY(-3px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
            });
        });
    }

    /* 4) Fake terminal auto-typing loop */
    function initFakeTerminal() {
        if (!ANIMATION_TOGGLES.fakeTerminal || !typedCommand) return;

        const commands = [
            '> learning new tech',
            '> error',
            '> googling error',
            '> fixed',
            '> feeling like a hacker 😎'
        ];

        let commandIndex = 0;
        let charIndex = 0;
        let deleting = false;

        function tick() {
            const command = commands[commandIndex];

            if (motionReduced) {
                typedCommand.textContent = command;
                commandIndex = (commandIndex + 1) % commands.length;
                window.setTimeout(tick, 1000);
                return;
            }

            if (!deleting) {
                charIndex += 1;
                typedCommand.textContent = command.slice(0, charIndex);

                if (charIndex === command.length) {
                    deleting = true;
                    window.setTimeout(tick, 850);
                    return;
                }
            } else {
                charIndex -= 1;
                typedCommand.textContent = command.slice(0, Math.max(charIndex, 0));

                if (charIndex <= 0) {
                    deleting = false;
                    commandIndex = (commandIndex + 1) % commands.length;
                }
            }

            window.setTimeout(tick, deleting ? 35 : 60);
        }

        tick();
    }

    /* 5) Bug icon runs away when hovered */
    function initBugEasterEgg() {
        if (!ANIMATION_TOGGLES.bugEasterEgg || !bugEgg || !projectSection) return;

        let bugX = 0;
        let bugY = 0;

        function runAway() {
            const sectionRect = projectSection.getBoundingClientRect();
            const maxX = Math.max(24, sectionRect.width - 80);
            const maxY = Math.max(24, sectionRect.height - 120);

            bugX = Math.floor(Math.random() * maxX);
            bugY = Math.floor(Math.random() * maxY);

            bugEgg.style.left = `${bugX}px`;
            bugEgg.style.top = `${bugY}px`;
            bugEgg.style.right = 'auto';
        }

        bugEgg.addEventListener('mouseenter', runAway);
        bugEgg.addEventListener('focus', runAway);
    }

    /* 6) Inactivity dimmer overlay */
    function initInactivityOverlay() {
        if (!ANIMATION_TOGGLES.inactivityOverlay || !idleOverlay) return;

        let idleTimer = null;

        idleOverlay.hidden = false;
        idleOverlay.classList.remove('is-visible');

        function wakeUp() {
            idleOverlay.classList.remove('is-visible');
            document.body.classList.remove('is-idle');
            startIdleTimer();
        }

        function goIdle() {
            idleOverlay.classList.add('is-visible');
            document.body.classList.add('is-idle');
        }

        function startIdleTimer() {
            window.clearTimeout(idleTimer);
            idleTimer = window.setTimeout(goIdle, 10000);
        }

        ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach((eventName) => {
            window.addEventListener(eventName, startIdleTimer, { passive: true });
        });

        idleOverlay.addEventListener('pointerdown', wakeUp);
        idleOverlay.addEventListener('click', wakeUp);
        startIdleTimer();
    }

    /* 8) Console easter egg when devtools likely opens */
    function initConsoleEasterEgg() {
        if (!ANIMATION_TOGGLES.consoleEasterEgg) return;

        let announced = false;

        function maybeAnnounce() {
            const widthGap = Math.abs(window.outerWidth - window.innerWidth) > 160;
            const heightGap = Math.abs(window.outerHeight - window.innerHeight) > 160;

            if (!announced && (widthGap || heightGap)) {
                announced = true;
                console.log('👋 Hey dev! Yes, I see you inspecting 😄');
            }
        }

        window.setInterval(maybeAnnounce, 1200);
    }

    /* 9) Dark mode toggle + joke toast */
    function initDarkModeJoke() {
        if (!ANIMATION_TOGGLES.darkModeJoke || !themeToggle) return;

        const savedMode = localStorage.getItem('asrith-theme-mode') || 'dark';
        if (savedMode === 'light') {
            document.body.classList.add('light-mode');
            themeToggle.textContent = '☀️';
        } else {
            document.body.classList.remove('light-mode');
            themeToggle.textContent = '🌙';
        }

        themeToggle.addEventListener('click', () => {
            const nowLight = document.body.classList.toggle('light-mode');

            if (nowLight) {
                themeToggle.textContent = '☀️';
                localStorage.setItem('asrith-theme-mode', 'light');
            } else {
                themeToggle.textContent = '🌙';
                localStorage.setItem('asrith-theme-mode', 'dark');
                showToast('Dark mode activated. Developer instincts confirmed.');
            }
        });
    }

    /* 10) Smart top progress bar */
    function initScrollProgress() {
        if (!ANIMATION_TOGGLES.scrollProgress) return;

        const bar = document.createElement('div');
        bar.className = 'smart-progress';
        document.body.appendChild(bar);

        function updateProgress() {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
            bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }

        updateProgress();
        window.addEventListener('scroll', updateProgress, { passive: true });
        window.addEventListener('resize', updateProgress);
    }

    /* 11) Smart active nav highlight by section */
    function initSmartNav() {
        if (!ANIMATION_TOGGLES.smartNav || !navLinks.length) return;

        const sections = [...document.querySelectorAll('main section[id]')];
        if (!sections.length) return;

        function activateLink(id) {
            navLinks.forEach((link) => {
                const active = link.getAttribute('href') === `#${id}`;
                link.classList.toggle('active-link', active);
            });
        }

        if (!('IntersectionObserver' in window) || motionReduced) {
            activateLink(sections[0].id);
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
                .forEach((entry) => activateLink(entry.target.id));
        }, {
            rootMargin: '-30% 0px -45% 0px',
            threshold: [0.2, 0.4, 0.6]
        });

        sections.forEach((section) => observer.observe(section));
    }

    /* 12) Subtle parallax for background glow */
    function initParallaxGlow() {
        if (!ANIMATION_TOGGLES.parallaxGlow || motionReduced || !pointerFine || !bgGlow) return;

        let rafId = 0;
        let targetX = 85;
        let targetY = 20;

        function render() {
            bgGlow.style.background = `radial-gradient(circle at ${targetX}% ${targetY}%, rgba(90, 111, 255, 0.18), transparent 35%)`;
            rafId = 0;
        }

        window.addEventListener('pointermove', (event) => {
            const x = (event.clientX / window.innerWidth) * 100;
            const y = (event.clientY / window.innerHeight) * 100;
            targetX = 70 + (x - 50) * 0.08;
            targetY = 20 + (y - 50) * 0.08;

            if (!rafId) {
                rafId = window.requestAnimationFrame(render);
            }
        });
    }

    /* 13) Tab visibility awareness - pause animations when tab is hidden */
    function initTabVisibilityPause() {
        if (!ANIMATION_TOGGLES.tabVisibilityPause) return;

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                document.body.classList.add('tab-hidden');
                console.log('👋 See you soon! Tab animations paused.');
            } else {
                document.body.classList.remove('tab-hidden');
                console.log('✨ Welcome back! Resuming animations.');
            }
        });
    }

    /* 14) Konami code easter egg - ↑ ↑ ↓ ↓ ← → ← → B A */
    function initKonamiCode() {
        if (!ANIMATION_TOGGLES.konamiCode) return;

        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        let konamiIndex = 0;
        let lastKeyTime = 0;

        document.addEventListener('keydown', (e) => {
            const now = Date.now();
            if (now - lastKeyTime > 2000) {
                konamiIndex = 0;
            }
            lastKeyTime = now;

            if (e.code === konamiCode[konamiIndex]) {
                konamiIndex++;

                if (konamiIndex === konamiCode.length) {
                    activateKonamiMode();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
                if (e.code === konamiCode[0]) konamiIndex = 1;
            }
        });

        function activateKonamiMode() {
            // Unlock experimental chaos theme
            if (window.themesEngine) {
                window.themesEngine.unlockChaosMode();
            } else {
                const body = document.body;
                body.classList.add('konami-mode');
                showToast('🎮 KONAMI MODE ACTIVATED!');
                console.log('%c 🎮 KONAMI CODE UNLOCKED!', 'font-size:20px; color:#ff3b78; font-weight:bold;');
                console.log('%c Experimental Chaos theme unlocked! Try it from the theme menu.', 'font-size:14px; color:#5a6fff;');

                setTimeout(() => {
                    body.classList.remove('konami-mode');
                    showToast('Chaos unlocked! 🎲');
                }, 3000);
            }
        }
    }

    /* 15) Smart tooltips with developer humor */
    function initSmartTooltips() {
        if (!ANIMATION_TOGGLES.smartTooltips) return;

        const tooltips = {
            '.btn-primary': ['Ship it! 🚀', 'Make it break later 😄', 'Deploy with confidence... maybe'],
            '.btn-secondary': ['Just vibes 👯', 'Explore', 'No pressure'],
            '.social': ['Connect', 'Let\'s talk', 'Send me a message'],
            '[aria-label="Download Resume"]': ['Resume time! 📄', 'My qualifications summarized', 'Prove my worth'],
            '[aria-label="GitHub Profile"]': ['Check my code 👨‍💻', 'Public suffering', 'Blame the internet'],
            '[aria-label="LinkedIn Profile"]': ['Network mode activated', 'Professional me', 'Selling myself™']
        };

        function setupTooltip(selector, messages) {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el) => {
                const originalTitle = el.getAttribute('title') || el.textContent;
                const randomMsg = messages[Math.floor(Math.random() * messages.length)];

                el.setAttribute('data-tooltip', randomMsg);
                el.classList.add('has-tooltip');

                el.addEventListener('mouseenter', () => {
                    if (motionReduced) return;
                    el.setAttribute('title', randomMsg);
                });

                el.addEventListener('mouseleave', () => {
                    el.setAttribute('title', originalTitle);
                });
            });
        }

        Object.entries(tooltips).forEach(([selector, messages]) => {
            setupTooltip(selector, messages);
        });
    }

    /* 16) Theme-aware animation speed adjustment */
    function initThemeAwareAnimations() {
        window.addEventListener('themeChanged', (e) => {
            const config = e.detail.config;
            if (!config) return;

            // Adjust animation speed based on theme
            const speedMultiplier = config.animationSpeed || 1;
            const root = document.documentElement;

            // Get current transition value and apply speed multiplier
            const baseSpeed = 0.4; // Default theme transition
            const adjustedSpeed = (baseSpeed / speedMultiplier).toFixed(2);
            root.style.setProperty('--theme-transition', `${adjustedSpeed}s ease`);

            // Log theme change for debugging
            console.log(`🎨 Theme applied: ${config.name} (speed: ${speedMultiplier}x)`);
        });
    }

    initMagneticButtons();
    initSkillJokes();
    initFakeTerminal();
    initBugEasterEgg();
    initInactivityOverlay();
    initConsoleEasterEgg();
    initDarkModeJoke();
    initScrollProgress();
    initSmartNav();
    initParallaxGlow();
    initTabVisibilityPause();
    initKonamiCode();
    initSmartTooltips();
    initThemeAwareAnimations();

    runLoader();
})();
