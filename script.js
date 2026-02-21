const menuButton = document.getElementById('menuButton');
const navLinks = document.getElementById('navLinks');

if (menuButton && navLinks) {
    menuButton.addEventListener('click', () => {
        const expanded = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', String(!expanded));
        navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            menuButton.setAttribute('aria-expanded', 'false');
        });
    });
}

const projectGrid = document.getElementById('projectGrid');
const githubUser = 'AsrithKulukuri';
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function toTitle(name) {
    return name
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function createProjectCard(repo) {
    const language = repo.language || 'Code';
    const description = repo.description || 'Clean and practical project implementation.';
    const updated = new Date(repo.updated_at).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric'
    });

    const card = document.createElement('article');
    card.className = 'project-card';
    card.innerHTML = `
    <div class="project-meta">
      <span>${language}</span>
      <span>Updated ${updated}</span>
    </div>
    <h3>${toTitle(repo.name)}</h3>
    <p>${description}</p>
    <div class="project-tags">
      <span>${language}</span>
      ${repo.fork ? '<span>Fork</span>' : '<span>Original</span>'}
      ${repo.stargazers_count > 0 ? `<span>★ ${repo.stargazers_count}</span>` : ''}
    </div>
        <div class="project-link-row">
            <a class="project-link" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">View Source →</a>
            <a class="project-link" href="./case-study.html?repo=${encodeURIComponent(repo.name)}">Case Study →</a>
        </div>
  `;
    return card;
}

async function renderProjects() {
    if (!projectGrid) return;

    projectGrid.innerHTML = '<p class="section-sub">Loading your latest GitHub projects…</p>';

    try {
        const response = await fetch(
            `https://api.github.com/users/${githubUser}/repos?sort=updated&per_page=6&type=owner`
        );

        if (!response.ok) {
            throw new Error('Unable to fetch projects right now.');
        }

        const repos = await response.json();
        const filtered = repos.filter((repo) => !repo.archived && !repo.private);

        if (!filtered.length) {
            projectGrid.innerHTML = '<p class="section-sub">No public projects found yet.</p>';
            return;
        }

        projectGrid.innerHTML = '';
        filtered.slice(0, 6).forEach((repo) => {
            const card = createProjectCard(repo);
            card.classList.add('reveal');
            projectGrid.appendChild(card);
            observeRevealElements([card]);
        });

        initInteractiveCards();
    } catch {
        projectGrid.innerHTML = `
      <p class="section-sub">Couldn’t load GitHub projects automatically.</p>
      <a class="project-link" href="https://github.com/${githubUser}" target="_blank" rel="noopener noreferrer">Open GitHub Profile →</a>
    `;
    }
}

renderProjects();

if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const message = document.getElementById('message')?.value.trim();

        if (!name || !email || !message) {
            if (formStatus) {
                formStatus.textContent = 'Please fill all fields before sending.';
            }
            return;
        }

        if (formStatus) {
            formStatus.textContent = 'Sending...';
        }

        try {
            const response = await fetch('https://formsubmit.co/ajax/asrithkulkuri@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    message,
                    _subject: `Portfolio message from ${name}`,
                    _captcha: 'false'
                })
            });

            if (!response.ok) {
                throw new Error('Unable to send message.');
            }

            contactForm.reset();
            if (formStatus) {
                formStatus.textContent = 'Message sent successfully. I will get back to you soon.';
            }
        } catch {
            if (formStatus) {
                formStatus.textContent = 'Could not send now. Please try WhatsApp or LinkedIn.';
            }
        }
    });
}

let revealObserver = null;

function observeRevealElements(elements) {
    if (!elements?.length) return;

    elements.forEach((element, index) => {
        element.style.setProperty('--reveal-delay', `${index * 70}ms`);
    });

    if (prefersReducedMotion) {
        elements.forEach((element) => element.classList.add('revealed'));
        return;
    }

    if (!('IntersectionObserver' in window)) {
        elements.forEach((element) => element.classList.add('revealed'));
        return;
    }

    if (!revealObserver) {
        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
    }

    elements.forEach((element) => revealObserver.observe(element));
}

function initInteractiveCards() {
    const cards = document.querySelectorAll('.project-card, .skill-card, .contact-card, .proof-grid .about-card');

    cards.forEach((card) => {
        if (card.dataset.animated === 'true') return;
        card.dataset.animated = 'true';
        card.classList.add('interactive-card');

        if (prefersReducedMotion || !window.matchMedia('(pointer:fine)').matches) {
            return;
        }

        card.addEventListener('pointerenter', () => {
            card.classList.add('is-hover');
        });

        card.addEventListener('pointermove', (event) => {
            const bounds = card.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width;
            const y = (event.clientY - bounds.top) / bounds.height;
            const rotateX = (0.5 - y) * 5;
            const rotateY = (x - 0.5) * 7;

            card.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
            card.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
        });

        card.addEventListener('pointerleave', () => {
            card.classList.remove('is-hover');
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        });
    });
}

const revealElements = [...document.querySelectorAll('.reveal')];
observeRevealElements(revealElements);
initInteractiveCards();

const analyticsDomain = '';
const analyticsScript = '';

if (analyticsDomain && analyticsScript) {
    const script = document.createElement('script');
    script.defer = true;
    script.src = analyticsScript;
    script.setAttribute('data-domain', analyticsDomain);
    document.head.appendChild(script);
}
