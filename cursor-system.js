/*
  ═══════════════════════════════════════════════════════════
  FUTURISTIC CURSOR SYSTEM
  ═══════════════════════════════════════════════════════════
  - Custom cursor with glow trail
  - Magnetic hover effects
  - Click ripple animations
  - Theme-aware colors
  - Reduced-motion support
*/

(function () {
    let cursor, cursorGlow, cursorTrail = [];
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function init() {
        if (isReducedMotion) return;

        // Create custom cursor
        cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        cursorGlow = document.createElement('div');
        cursorGlow.className = 'cursor-glow';
        document.body.appendChild(cursorGlow);

        // Track mouse position
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Animate cursor
        animateCursor();

        // Add magnetic effect to interactive elements
        addMagneticEffect();

        // Click ripple effect
        document.addEventListener('click', createRipple);

        // Hide default cursor
        document.body.style.cursor = 'none';
        document.querySelectorAll('a, button, input, textarea').forEach(el => {
            el.style.cursor = 'none';
        });
    }

    function animateCursor() {
        // Smooth follow
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;

        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        cursorGlow.style.transform = `translate(${cursorX}px, ${cursorY}px)`;

        requestAnimationFrame(animateCursor);
    }

    function addMagneticEffect() {
        const magneticElements = document.querySelectorAll('button, a, .theme-option, .project-card');

        magneticElements.forEach(el => {
            el.addEventListener('mouseenter', function () {
                cursor.classList.add('hovering');
                cursorGlow.classList.add('hovering');
            });

            el.addEventListener('mouseleave', function () {
                cursor.classList.remove('hovering');
                cursorGlow.classList.remove('hovering');
            });

            el.addEventListener('mousemove', function (e) {
                const rect = el.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const deltaX = (e.clientX - centerX) * 0.2;
                const deltaY = (e.clientY - centerY) * 0.2;

                el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            });

            el.addEventListener('mouseleave', function () {
                el.style.transform = '';
            });
        });
    }

    function createRipple(e) {
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        document.body.appendChild(ripple);

        setTimeout(() => ripple.remove(), 800);
    }

    // Initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
