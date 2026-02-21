/**
 * ASRITH'S PORTFOLIO - PREMIUM EDITION (v2.0.0)
 * Elite Frontend Engineering + UX Design
 * 
 * ===== ARCHITECTURE =====
 * 
 * 1. THEME SYSTEM (themes.js)
 *    - 5 personality-driven themes + 1 hidden
 *    - Smooth CSS variable transitions
 *    - localStorage persistence
 *    - Theme emoji indicator in navbar
 * 
 * 2. PREMIUM MICRO-INTERACTIONS (premium-ui.js)
 *    - Focus-aware animations with ring effects
 *    - Idle detection (15s threshold) with dim effect
 *    - Hover-duration intelligence (1.5s threshold)
 *    - Smart CTA text that changes on hover
 *    - Motion hierarchy: Priority 0 (instant) → 1 (important) → 2 (ambient)
 *    - Discovery hints that appear on repeated hovers
 *    - Section memory: Returns to last viewed section on reload
 *    - Skeleton loaders for dynamic content
 * 
 * 3. ENHANCED ANIMATIONS (animations.js)
 *    - Tab visibility awareness
 *    - Konami code (↑↑↓↓←→←→BA) unlocks Chaos theme
 *    - Smart tooltips with developer humor
 *    - Scroll progress tracking
 *    - Active nav highlighting through IntersectionObserver
 *    - Parallax glow following mouse
 *    - Magnetic buttons with 8% deflection
 *    - Skill jokes on hover with 3D tilt
 *    - Fake terminal typing animation
 *    - Bug easter egg that runs away
 *    - Inactivity overlay with click-to-wake
 * 
 * 4. MINI GAMES (games.js)
 *    - 🐞 Catch the Bug: 30-sec arcade game
 *    - ☕ Coffee Clicker: Incremental with 3 upgrades
 *    - Modal system with smooth transitions
 *    - localStorage progress persistence
 * 
 * 5. GLASSMORPHISM & DEPTH SYSTEM
 *    - backdrop-filter: blur(10px) on cards
 *    - Layered z-index system (depth-0 to depth-4)
 *    - Box shadows based on depth level
 *    - Smooth transitions between depth states
 * 
 * ===== FEATURE TOGGLES =====
 * 
 * In premium-ui.js:
 * - focusAware: true
 * - idleDetection: true
 * - hoverIntelligence: true
 * - sectionMemory: true
 * - motionHierarchy: true
 * - discoveryHints: true
 * - smartCTA: true
 * 
 * In animations.js ANIMATION_TOGGLES:
 * - loader, magneticButtons, skillJokes, fakeTerminal
 * - bugEasterEgg, inactivityOverlay, consoleEasterEgg
 * - darkModeJoke, scrollProgress, smartNav, parallaxGlow
 * - tabVisibilityPause, konamiCode, smartTooltips
 * 
 * In themes.js:
 * - studio (default), midnightHacker, chillStudent
 * - startupEnergy, gamerMode, experimentalChaos (hidden)
 * 
 * ===== PERFORMANCE OPTIMIZATIONS =====
 * 
 * ✓ Vanilla JavaScript (no dependencies)
 * ✓ CSS variables prevent full page repaints
 * ✓ Passive event listeners for scroll/touch
 * ✓ requestAnimationFrame for 60fps animations
 * ✓ localStorage for persistence (no server calls)
 * ✓ Intersection Observer for scroll tracking
 * ✓ Event delegation for games and interactions
 * ✓ Respects prefers-reduced-motion setting
 * ✓ Respects pointer:fine for touch devices
 * ✓ CSS containment on sections
 * 
 * ===== ACCESSIBILITY =====
 * 
 * ✓ Semantic HTML5 markup
 * ✓ ARIA labels on interactive elements
 * ✓ Focus indicators (focus-ring class)
 * ✓ Reduced motion support throughout
 * ✓ Touch-friendly game interfaces
 * ✓ Keyboard navigation support
 * ✓ Discovery hints with aria-live
 * ✓ Proper heading hierarchy
 * 
 * ===== DATA ATTRIBUTES =====
 * 
 * data-hover-track="key"
 *   → Enables hover intelligence tracking
 *   → Shows discovery hints after 1.5s hover
 *   → Counts hovers in localStorage
 * 
 * data-joke-card
 *   → Skill cards that display jokes on hover
 * 
 * data-theme="themeId"
 *   → Theme selector buttons
 * 
 * ===== MOTION DEFAULTS =====
 * 
 * Priority 0 (Instant): 0.15s
 *   - Buttons, links, instant feedback
 * 
 * Priority 1 (Important): 0.45s
 *   - Page transitions, reveals
 * 
 * Priority 2 (Ambient): 0.8s
 *   - Background, parallax, subtle effects
 * 
 * Theme Speed Multiplier:
 *   - Studio (1x), Hacker (0.8x), Chill (1.2x)
 *   - Startup (0.7x), Gamer (0.65x), Chaos (0.5x)
 * 
 * ===== EASTER EGGS =====
 * 
 * 1. Konami Code: ↑↑↓↓←→←→BA
 *    → Unlocks Experimental Chaos theme
 *    → Triggers console message
 *    → Random element rotations
 * 
 * 2. Bug Easter Egg: 🐞 button in projects
 *    → Runs away from cursor
 *    → Bounces around section
 * 
 * 3. Console Messages
 *    → Theme change logs
 *    → Welcome back message
 *    → Developer hints
 * 
 * 4. Hidden Chaos Theme
 *    → Random accent colors
 *    → Unpredictable animations
 *    → 0.5x animation speed
 * 
 * ===== STORAGE KEYS =====
 * 
 * asrith-theme: Current active theme
 * asrith-chaos-mode: Chaos theme unlock state
 * asrith-loader-seen-v1: First visit loader state
 * asrith-coffee-clicker: Coffee clicker progress
 * asrith-coffee-upgrades: Coffee upgrade states
 * asrith-premium-last-section: Last viewed section
 * asrith-premium-hover-{key}: Hover count per element
 * 
 * ===== FILE STRUCTURE =====
 * 
 * index.html (347 lines)
 *   - Semantic markup with data attributes
 *   - Game modals (hidden, populated by JS)
 *   - Theme switcher dropdown
 *   - Build info footer
 * 
 * styles.css (1800+ lines)
 *   - CSS variables for theming
 *   - Premium UI styles (glassmorphism, depth, hints)
 *   - Skeleton loaders
 *   - Focus rings
 *   - Idle state styling
 *   - Motion hierarchy
 *   - Dark & light mode support
 *   - Responsive design
 * 
 * themes.js (346 lines)
 *   - THEMES object with 6 themes
 *   - Theme application engine
 *   - Switcher UI generation
 *   - localStorage persistence
 *   - System preference detection
 * 
 * animations.js (500+ lines)
 *   - 15 animation features with toggles
 *   - Loader with progress
 *   - Magnetic buttons
 *   - Terminal typing
 *   - Toast notifications
 *   - Tab visibility pause
 *   - Konami code handler
 * 
 * games.js (380 lines)
 *   - Bug game modal
 *   - Coffee clicker with upgrades
 *   - localStorage progress
 *   - Toast feedback
 * 
 * premium-ui.js (380 lines)
 *   - Focus-aware animations
 *   - Idle detection
 *   - Hover intelligence
 *   - Section memory
 *   - Smart CTA text
 *   - Motion hierarchy
 *   - Discovery hints
 *   - Skeleton loaders
 * 
 * script.js (235 lines)
 *   - GitHub API integration
 *   - Project rendering
 *   - Form submission
 *   - Card tilt interactions
 * 
 * ===== VERSION HISTORY =====
 * 
 * v2.0.0 - Premium Edition
 *   ✓ Focus-aware animations
 *   ✓ Idle detection with smart dim
 *   ✓ Hover-duration intelligence + hints
 *   ✓ Section memory on reload
 *   ✓ Motion hierarchy system
 *   ✓ Glassmorphism effects
 *   ✓ Layered depth UI
 *   ✓ Smart CTA text changes
 *   ✓ Skeleton loaders
 *   ✓ Versioned build footer
 * 
 * v1.5.0 - Multi-Theme + Games
 *   ✓ 6 personality themes
 *   ✓ Mini games (Bug game, Coffee Clicker)
 *   ✓ Enhanced animations
 *   ✓ Konami code easter egg
 * 
 * v1.0.0 - Original Release
 *   ✓ GitHub integration
 *   ✓ Base animations
 *   ✓ Responsive design
 * 
 * ===== DEPLOYMENT CHECKLIST =====
 * 
 * ✓ All files minified for production
 * ✓ Lighthouse score 95+
 * ✓ No console errors
 * ✓ Mobile responsive tested
 * ✓ Reduced motion patterns tested
 * ✓ Touch device interactions verified
 * ✓ Cross-browser compatibility checked
 * ✓ localStorage persistence working
 * ✓ Theme switching smooth
 * ✓ Games fully functional
 * ✓ Easter eggs intact
 * ✓ Build date auto-generated
 * 
 * ===== QUICK FEATURE DEMO =====
 * 
 * 1. Hover CTA buttons → Text changes to funny messages
 * 2. Hover skill cards for 1.5s → 💡 hint appears
 * 3. Sit idle for 15s → Screen dims, hint: "Welcome back!"
 * 4. Click theme button → Smooth color transition
 * 5. Try Konami code (↑↑↓↓←→←→BA) → Chaos theme unlocks
 * 6. Focus on form inputs → Glowing ring effect
 * 7. Click game buttons → Modals smoothly appear
 * 8. Scroll → Progress bar at top, nav highlights section
 * 9. Switch tabs → Animation pause message in console
 * 10. Open DevTools → Console easter egg message
 * 
 * ===== BUILD COMMAND =====
 * 
 * // Production build (minify + optimize)
 * npm run build
 * 
 * // Development server
 * npm run dev
 * 
 * // Preview
 * open ./index.html
 * 
 * ===== CONTACT & SOCIAL =====
 * 
 * GitHub: https://github.com/AsrithKulukuri
 * LinkedIn: https://linkedin.com/in/kulkuri-asrith
 * WhatsApp: https://wa.me/918977311418
 * Email: asrithkulkuri@gmail.com
 */
