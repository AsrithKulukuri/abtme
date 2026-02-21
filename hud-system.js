/*
  ═══════════════════════════════════════════════════════════
  HUD TOOLTIP SYSTEM
  ═══════════════════════════════════════════════════════════
  - Context-aware tooltips
  - Smart positioning
  - Keyboard shortcuts display
  - Smooth animations
  - Theme-aware styling
*/

(function () {
    let activeTooltip = null;
    let tooltipTimeout = null;

    const shortcuts = {
        'Escape': 'Close overlays',
        '?': 'Show help',
        'Space': 'Pause animations',
        'T': 'Toggle themes',
        'C': 'Open chat',
        '↑↑↓↓←→←→BA': 'Secret code'
    };

    function init() {
        // Add tooltip triggers
        addTooltipTriggers();

        // Add keyboard shortcut listener
        document.addEventListener('keydown', handleShortcuts);

        // Add help button
        addHelpButton();
    }

    function addTooltipTriggers() {
        // Auto-add tooltips to elements with data-tooltip
        document.querySelectorAll('[data-tooltip]').forEach(el => {
            el.addEventListener('mouseenter', (e) => showTooltip(e.target));
            el.addEventListener('mouseleave', hideTooltip);
            el.addEventListener('focus', (e) => showTooltip(e.target));
            el.addEventListener('blur', hideTooltip);
        });

        // Add tooltips to nav links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.setAttribute('data-tooltip', `Navigate to ${link.textContent}`);
            link.setAttribute('data-tooltip-position', 'bottom');
        });

        // Add tooltips to buttons
        document.querySelectorAll('button[title]').forEach(btn => {
            if (!btn.getAttribute('data-tooltip')) {
                btn.setAttribute('data-tooltip', btn.getAttribute('title'));
            }
        });
    }

    function showTooltip(element) {
        clearTimeout(tooltipTimeout);

        tooltipTimeout = setTimeout(() => {
            const text = element.getAttribute('data-tooltip');
            const position = element.getAttribute('data-tooltip-position') || 'top';
            const shortcut = element.getAttribute('data-shortcut');

            if (!text) return;

            hideTooltip();

            const tooltip = document.createElement('div');
            tooltip.className = 'hud-tooltip';
            tooltip.innerHTML = `
                <div class="tooltip-text">${text}</div>
                ${shortcut ? `<div class="tooltip-shortcut">${shortcut}</div>` : ''}
            `;

            document.body.appendChild(tooltip);

            // Position tooltip
            const rect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            let left, top;

            switch (position) {
                case 'bottom':
                    left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                    top = rect.bottom + 8;
                    break;
                case 'left':
                    left = rect.left - tooltipRect.width - 8;
                    top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                    break;
                case 'right':
                    left = rect.right + 8;
                    top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                    break;
                default: // top
                    left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                    top = rect.top - tooltipRect.height - 8;
            }

            // Keep tooltip in viewport
            left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
            top = Math.max(8, Math.min(top, window.innerHeight - tooltipRect.height - 8));

            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
            tooltip.classList.add('show');

            activeTooltip = tooltip;
        }, 300);
    }

    function hideTooltip() {
        clearTimeout(tooltipTimeout);
        if (activeTooltip) {
            activeTooltip.classList.remove('show');
            setTimeout(() => {
                if (activeTooltip && activeTooltip.parentNode) {
                    activeTooltip.remove();
                }
                activeTooltip = null;
            }, 200);
        }
    }

    function handleShortcuts(e) {
        // T - Toggle themes
        if (e.key === 't' || e.key === 'T') {
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) themeToggle.click();
        }

        // C - Open chat
        if (e.key === 'c' || e.key === 'C') {
            const chatWidget = document.getElementById('chatWidget');
            if (chatWidget) chatWidget.click();
        }

        // ? - Show help
        if (e.key === '?') {
            showHelpModal();
        }

        // Space - Pause animations (for accessibility)
        if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            toggleAnimations();
        }
    }

    function addHelpButton() {
        const helpBtn = document.createElement('button');
        helpBtn.className = 'hud-help-btn';
        helpBtn.innerHTML = '?';
        helpBtn.setAttribute('data-tooltip', 'Keyboard shortcuts');
        helpBtn.setAttribute('data-shortcut', '?');
        helpBtn.addEventListener('click', showHelpModal);
        document.body.appendChild(helpBtn);

        helpBtn.addEventListener('mouseenter', (e) => showTooltip(e.target));
        helpBtn.addEventListener('mouseleave', hideTooltip);
    }

    function showHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'hud-help-modal';
        modal.innerHTML = `
            <div class="help-modal-content">
                <button class="help-close-btn">✕</button>
                <h2>⌨️ Keyboard Shortcuts</h2>
                <div class="shortcuts-list">
                    ${Object.entries(shortcuts).map(([key, desc]) => `
                        <div class="shortcut-item">
                            <kbd>${key}</kbd>
                            <span>${desc}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="help-footer">
                    <p>Press <kbd>Escape</kbd> to close this modal</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        const closeBtn = modal.querySelector('.help-close-btn');
        const close = () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        };

        closeBtn.addEventListener('click', close);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    function toggleAnimations() {
        const root = document.documentElement;
        const isPaused = root.style.getPropertyValue('--animation-play-state') === 'paused';

        root.style.setProperty('--animation-play-state', isPaused ? 'running' : 'paused');

        const toast = document.createElement('div');
        toast.className = 'hud-toast';
        toast.textContent = isPaused ? '▶️ Animations resumed' : '⏸️ Animations paused';
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
