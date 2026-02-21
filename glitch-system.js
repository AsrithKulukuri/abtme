/*
  ═══════════════════════════════════════════════════════════
  GLITCH EFFECT SYSTEM
  ═══════════════════════════════════════════════════════════
  - Controlled glitch animations
  - Text scramble effects
  - RGB split effect
  - Triggered by user actions or random intervals
  - Theme-aware intensity
*/

(function () {
    let glitchTimeout;
    let isGlitching = false;

    function init() {
        // Add glitch to headers on hover
        document.querySelectorAll('h1, h2, .brand').forEach(el => {
            el.addEventListener('mouseenter', () => glitchText(el));
        });

        // Random ambient glitches (rare)
        startAmbientGlitch();

        // Listen for theme changes (chaos mode triggers glitches)
        window.addEventListener('themeChanged', (e) => {
            if (e.detail.theme === 'experimentalChaos') {
                startChaosGlitches();
            }
        });
    }

    function glitchText(element) {
        if (isGlitching) return;
        isGlitching = true;

        const originalText = element.textContent;
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let iterations = 0;

        const interval = setInterval(() => {
            element.textContent = originalText
                .split('')
                .map((char, index) => {
                    if (index < iterations) {
                        return originalText[index];
                    }
                    return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                })
                .join('');

            iterations += 1 / 3;

            if (iterations >= originalText.length) {
                clearInterval(interval);
                element.textContent = originalText;
                isGlitching = false;
            }
        }, 30);
    }

    function glitchVisual(element) {
        element.classList.add('glitch-active');
        setTimeout(() => {
            element.classList.remove('glitch-active');
        }, 400);
    }

    function startAmbientGlitch() {
        setInterval(() => {
            // 10% chance every 30 seconds
            if (Math.random() < 0.1) {
                const targets = document.querySelectorAll('h1, h2, h3');
                if (targets.length > 0) {
                    const randomTarget = targets[Math.floor(Math.random() * targets.length)];
                    glitchVisual(randomTarget);
                }
            }
        }, 30000);
    }

    function startChaosGlitches() {
        // More frequent glitches in chaos mode
        const chaosInterval = setInterval(() => {
            if (!document.body.classList.contains('chaos-mode')) {
                clearInterval(chaosInterval);
                return;
            }

            const allElements = document.querySelectorAll('h1, h2, h3, button, .project-card');
            if (allElements.length > 0) {
                const randomEl = allElements[Math.floor(Math.random() * allElements.length)];
                glitchVisual(randomEl);
            }
        }, 5000);
    }

    // Screen shake effect
    function screenShake(intensity = 5, duration = 300) {
        const body = document.body;
        const startTime = Date.now();

        function shake() {
            const elapsed = Date.now() - startTime;
            if (elapsed < duration) {
                const x = (Math.random() - 0.5) * intensity;
                const y = (Math.random() - 0.5) * intensity;
                body.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(shake);
            } else {
                body.style.transform = '';
            }
        }

        shake();
    }

    // Expose API
    window.glitchSystem = {
        glitchText,
        glitchVisual,
        screenShake
    };

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
