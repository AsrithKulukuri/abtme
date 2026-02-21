/*
  ═══════════════════════════════════════════════════════════
  PARALLAX SCROLL ENGINE
  ═══════════════════════════════════════════════════════════
  - Depth-based parallax (2.5D effect)
  - Scroll-reactive animations
  - Reveal animations on scroll
  - Performance optimized with IntersectionObserver
*/

(function () {
    let scrollY = 0;
    let ticking = false;
    let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function init() {
        if (isReducedMotion) return;

        // Add parallax layers
        addParallaxLayers();

        // Add scroll reveal animations
        addScrollReveal();

        // Scroll handler
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    function onScroll() {
        scrollY = window.pageYOffset;

        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    }

    function addParallaxLayers() {
        // Add data-parallax attributes to elements
        document.querySelectorAll('.hero').forEach(el => {
            el.setAttribute('data-parallax', '0.3');
        });

        document.querySelectorAll('.hero-terminal').forEach(el => {
            el.setAttribute('data-parallax', '0.15');
        });

        document.querySelectorAll('.section-gap').forEach(el => {
            el.setAttribute('data-parallax', '0.05');
        });
    }

    function updateParallax() {
        document.querySelectorAll('[data-parallax]').forEach(el => {
            const speed = parseFloat(el.getAttribute('data-parallax'));
            const rect = el.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const viewportCenter = window.innerHeight / 2;
            const distance = centerY - viewportCenter;

            el.style.transform = `translateY(${distance * speed}px) translateZ(0)`;
        });
    }

    function addScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal, .project-card, .skill-card');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -100px 0px'
        });

        revealElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(40px)';
            el.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            observer.observe(el);
        });

        // Add revealed class styles
        const style = document.createElement('style');
        style.textContent = `
            .revealed {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
