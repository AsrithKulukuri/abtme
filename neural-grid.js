/*
  ═══════════════════════════════════════════════════════════
  NEURAL GRID BACKGROUND
  ═══════════════════════════════════════════════════════════
  - Animated particle grid
  - Connects nearby particles with lines
  - Mouse-reactive
  - Theme-aware colors
  - GPU-accelerated
*/

(function () {
    let canvas, ctx;
    let particles = [];
    let mouseX = -1000, mouseY = -1000;
    let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let currentTheme = 'studio';

    const config = {
        particleCount: 80,
        particleSpeed: 0.3,
        connectionDistance: 150,
        mouseRadius: 200,
        particleSize: 2
    };

    function init() {
        if (isReducedMotion) return;

        // Create canvas
        canvas = document.createElement('canvas');
        canvas.id = 'neuralGrid';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1';
        canvas.style.opacity = '0.4';
        document.body.insertBefore(canvas, document.body.firstChild);

        ctx = canvas.getContext('2d');
        resizeCanvas();

        // Create particles
        for (let i = 0; i < config.particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * config.particleSpeed,
                vy: (Math.random() - 0.5) * config.particleSpeed,
                baseX: 0,
                baseY: 0
            });
        }

        // Track mouse
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        document.addEventListener('mouseleave', () => {
            mouseX = -1000;
            mouseY = -1000;
        });

        // Listen for theme changes
        window.addEventListener('themeChanged', (e) => {
            currentTheme = e.detail.theme;
        });

        // Resize handler
        window.addEventListener('resize', resizeCanvas);

        // Start animation
        animate();
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles.forEach((p, i) => {
            // Mouse interaction
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < config.mouseRadius) {
                const force = (config.mouseRadius - dist) / config.mouseRadius;
                p.vx -= (dx / dist) * force * 0.5;
                p.vy -= (dy / dist) * force * 0.5;
            }

            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Damping
            p.vx *= 0.98;
            p.vy *= 0.98;

            // Boundaries
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            p.x = Math.max(0, Math.min(canvas.width, p.x));
            p.y = Math.max(0, Math.min(canvas.height, p.y));

            // Draw particle
            const color = getThemeColor();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, config.particleSize, 0, Math.PI * 2);
            ctx.fill();

            // Connect to nearby particles
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx2 = p.x - p2.x;
                const dy2 = p.y - p2.y;
                const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                if (dist2 < config.connectionDistance) {
                    const opacity = 1 - (dist2 / config.connectionDistance);
                    ctx.strokeStyle = color.replace(')', `, ${opacity * 0.3})`).replace('rgb', 'rgba');
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(animate);
    }

    function getThemeColor() {
        const colors = {
            studio: 'rgb(255, 59, 120)',
            midnightHacker: 'rgb(0, 255, 136)',
            chillStudent: 'rgb(138, 180, 248)',
            startupEnergy: 'rgb(255, 170, 0)',
            gamerMode: 'rgb(138, 82, 226)',
            experimentalChaos: 'rgb(255, 0, 255)'
        };
        return colors[currentTheme] || colors.studio;
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
