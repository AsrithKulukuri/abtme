/*
  Premium Micro-Interactions Engine
  - Focus-aware animations
  - Idle detection with smart recovery
  - Hover-duration intelligence
  - Section memory on reload
  - Motion hierarchy system
  - Feature discovery hints
*/

(function () {
    const PREMIUM_FEATURES = {
        focusAware: true,
        idleDetection: true,
        hoverIntelligence: true,
        sectionMemory: true,
        motionHierarchy: true,
        discoveryHints: true,
        smartCTA: true
    };

    const STORAGE_PREFIX = 'asrith-premium-';
    const HINT_OPACITY = 0.6;
    const IDLE_THRESHOLD = 15000; // 15 seconds
    const HOVER_THRESHOLD = 1500; // 1.5 seconds for enhanced hover

    let idleTimer = null;
    let isIdle = false;
    let lastActiveTime = Date.now();
    let hoveredElements = new Map();

    const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== MOTION HIERARCHY =====
    // Priority 0: Instant feedback (micro-interactions)
    // Priority 1: Important animations (page transitions)
    // Priority 2: Ambient animations (background, parallax)

    function getMotionPriority(element) {
        if (element.matches('.btn, button, a, input')) return 0; // Instant
        if (element.matches('h1, h2, .reveal, section')) return 1; // Important
        return 2; // Ambient
    }

    function getAnimationDuration(priority) {
        if (motionReduced) return 0.1;
        return [0.15, 0.45, 0.8][priority] || 0.45;
    }

    // ===== 1) FOCUS-AWARE ANIMATIONS =====
    function initFocusAware() {
        if (!PREMIUM_FEATURES.focusAware || motionReduced) return;

        document.addEventListener('focusin', (e) => {
            const el = e.target;
            if (el.matches('input, textarea, button, a')) {
                el.classList.add('focus-ring');
                el.style.setProperty(
                    '--focus-scale',
                    el.matches('input, textarea') ? '1.02' : '1.05'
                );
            }
        });

        document.addEventListener('focusout', (e) => {
            const el = e.target;
            el.classList.remove('focus-ring');
        });
    }

    // ===== 2) IDLE DETECTION WITH SMART RECOVERY =====
    function initIdleDetection() {
        if (!PREMIUM_FEATURES.idleDetection) return;

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        function updateActivity() {
            lastActiveTime = Date.now();
            if (isIdle) {
                isIdle = false;
                document.body.classList.remove('user-idle');
                showDiscoveryHint('👋 Welcome back!', 2000);
            }
            resetIdleTimer();
        }

        function resetIdleTimer() {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                isIdle = true;
                document.body.classList.add('user-idle');
                dimNonCriticalUI();
            }, IDLE_THRESHOLD);
        }

        function dimNonCriticalUI() {
            document.querySelectorAll('.ambient, .secondary').forEach((el) => {
                el.style.opacity = '0.4';
                el.style.transition = 'opacity 0.8s ease';
            });
        }

        events.forEach((event) => {
            document.addEventListener(event, updateActivity, { passive: true });
        });

        resetIdleTimer();
    }

    // ===== 3) HOVER-DURATION INTELLIGENCE =====
    function initHoverIntelligence() {
        if (!PREMIUM_FEATURES.hoverIntelligence || motionReduced) return;

        document.addEventListener(
            'mouseenter',
            (e) => {
                const el = e.target.closest('[data-hover-track]');
                if (!el) return;

                const hoverKey = `hover-${el.getAttribute('data-hover-track')}`;
                const hoverStartTime = Date.now();

                hoveredElements.set(el, {
                    startTime: hoverStartTime,
                    duration: 0
                });

                el.classList.add('hovering');

                const hoverTimer = setTimeout(() => {
                    if (hoveredElements.has(el)) {
                        el.classList.add('prolonged-hover');
                        const savedCount = parseInt(
                            localStorage.getItem(`${STORAGE_PREFIX}${hoverKey}`) || '0'
                        );
                        localStorage.setItem(`${STORAGE_PREFIX}${hoverKey}`, savedCount + 1);

                        if (savedCount > 2) {
                            showDiscoveryHint('💡 You seem interested! Click here.', 1000);
                        }
                    }
                }, HOVER_THRESHOLD);

                el.dataset.hoverTimer = hoverTimer;
            },
            true
        );

        document.addEventListener(
            'mouseleave',
            (e) => {
                const el = e.target.closest('[data-hover-track]');
                if (!el) return;

                if (el.dataset.hoverTimer) {
                    clearTimeout(parseInt(el.dataset.hoverTimer));
                }

                const hoverInfo = hoveredElements.get(el);
                if (hoverInfo) {
                    hoverInfo.duration = Date.now() - hoverInfo.startTime;
                }

                el.classList.remove('hovering', 'prolonged-hover');
            },
            true
        );
    }

    // ===== 4) SECTION MEMORY ON RELOAD =====
    function initSectionMemory() {
        if (!PREMIUM_FEATURES.sectionMemory) return;

        // Save scroll position on unload
        window.addEventListener('beforeunload', () => {
            const activeSection =
                document.querySelector('section[id]:in-viewport') ||
                document.querySelector('section[id]');
            if (activeSection) {
                localStorage.setItem(
                    `${STORAGE_PREFIX}last-section`,
                    activeSection.id
                );
            }
        });

        // Restore scroll position on load
        window.addEventListener('load', () => {
            const lastSection = localStorage.getItem(
                `${STORAGE_PREFIX}last-section`
            );
            if (lastSection) {
                const section = document.getElementById(lastSection);
                if (section) {
                    setTimeout(() => {
                        section.scrollIntoView({ behavior: 'smooth' });
                    }, 500);
                }
            }
        });
    }

    // ===== 5) FEATURE DISCOVERY HINTS =====
    function showDiscoveryHint(message, duration = 3000) {
        if (motionReduced) return;

        const hint = document.createElement('div');
        hint.className = 'discovery-hint';
        hint.textContent = message;
        hint.setAttribute('role', 'status');
        hint.setAttribute('aria-live', 'polite');

        document.body.appendChild(hint);

        setTimeout(() => {
            hint.classList.add('show');
        }, 50);

        setTimeout(() => {
            hint.classList.remove('show');
            setTimeout(() => hint.remove(), 300);
        }, duration);
    }

    // ===== 6) SMART CTA TEXT =====
    function initSmartCTA() {
        if (!PREMIUM_FEATURES.smartCTA) return;

        const ctaMessages = {
            '.btn-primary': [
                'Ship it! 🚀',
                'Let\'s go! 💨',
                'Make it happen 💪',
                'Show me! 👀'
            ],
            '.btn-secondary': [
                'Explore 🔍',
                'Learn more 📚',
                'Discover ✨'
            ],
            '[href*="github"]': [
                'See my code 👨‍💻',
                'Check repos 📦',
                'Explore GitHub 🐙'
            ],
            '[href*="linkedin"]': [
                'Connect 🤝',
                'Professional me 💼'
            ]
        };

        Object.entries(ctaMessages).forEach(([selector, messages]) => {
            document.querySelectorAll(selector).forEach((btn) => {
                const originalText = btn.textContent;
                let messageIndex = 0;

                btn.addEventListener('mouseenter', () => {
                    if (motionReduced) return;

                    const message = messages[messageIndex % messages.length];
                    btn.dataset.originalText = originalText;
                    btn.textContent = message;
                    messageIndex++;

                    btn.style.transition = 'all 0.3s ease';
                    btn.style.transform = 'scale(1.05)';
                });

                btn.addEventListener('mouseleave', () => {
                    if (btn.dataset.originalText) {
                        btn.textContent = btn.dataset.originalText;
                    }
                    btn.style.transform = 'scale(1)';
                });
            });
        });
    }

    // ===== 7) MOTION HIERARCHY ORCHESTRATION =====
    function initMotionHierarchy() {
        if (motionReduced) return;

        // Apply motion priority to all animated elements
        document.querySelectorAll('.reveal, .btn, a, section').forEach((el) => {
            const priority = getMotionPriority(el);
            const duration = getAnimationDuration(priority);
            el.style.setProperty('--motion-duration', `${duration}s`);
        });

        // Scroll-triggered animations with priority
        const revealElements = document.querySelectorAll('.reveal');
        if (!revealElements.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const priority = getMotionPriority(entry.target);
                        const delay = priority * 0.1; // Stagger based on priority
                        entry.target.style.transitionDelay = `${delay}s`;
                        entry.target.classList.add('revealed');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
        );

        revealElements.forEach((el) => observer.observe(el));
    }

    // ===== 8) SKELETON LOADERS =====
    function showSkeletonLoader(container, count = 3) {
        if (!container) return;

        const skeletons = Array(count)
            .fill(null)
            .map(
                () =>
                    `<div class="skeleton-card">
                <div class="skeleton-line skeleton-title"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line" style="width: 80%;"></div>
            </div>`
            )
            .join('');

        container.innerHTML = skeletons;
    }

    function hideSkeletonLoader(container, content) {
        if (!container) return;
        setTimeout(() => {
            container.innerHTML = content;
            container.querySelectorAll('.reveal').forEach((el) => {
                el.classList.add('revealed');
            });
        }, 300);
    }

    // ===== INITIALIZATION =====
    function initialize() {
        initFocusAware();
        initIdleDetection();
        initHoverIntelligence();
        initSectionMemory();
        initSmartCTA();
        initMotionHierarchy();

        // Expose utilities
        window.premiumUIUtils = {
            showDiscoveryHint,
            showSkeletonLoader,
            hideSkeletonLoader,
            getMotionPriority,
            getAnimationDuration
        };

        console.log(
            '%c✨ Premium Micro-Interactions Loaded',
            'color: #ff3b78; font-weight: bold; font-size: 12px;'
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
