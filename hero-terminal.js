(function () {
    const form = document.getElementById('terminalForm');
    const input = document.getElementById('terminalInput');
    const output = document.getElementById('terminalOutput');

    if (!form || !input || !output) return;

    const history = [];
    let historyIndex = -1;

    const sections = {
        about: '#about',
        skills: '#skills',
        projects: '#projects',
        proof: '#proof',
        journey: '#journey',
        contact: '#contact'
    };

    function appendLine(text, className = '') {
        const line = document.createElement('p');
        if (className) line.className = className;
        line.textContent = text;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    function appendPrompt(command) {
        const line = document.createElement('p');
        line.innerHTML = `<span class="u">visitor@portfolio</span>:~$ ${escapeHtml(command)}`;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    function escapeHtml(value) {
        return value
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function goToSection(section) {
        const selector = sections[section];
        if (!selector) return false;
        const target = document.querySelector(selector);
        if (!target) return false;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
    }

    function runCommand(rawInput) {
        const commandText = rawInput.trim();
        if (!commandText) return;

        appendPrompt(commandText);

        const [command, ...rest] = commandText.split(/\s+/);
        const arg = rest.join(' ').toLowerCase();

        switch (command.toLowerCase()) {
            case 'help':
                appendLine('Commands: help, about, projects, contact, journey, skills, proof, resume, chat, theme, theme <id>, clear');
                appendLine('Theme ids: studio, midnightHacker, chillStudent, startupEnergy, gamerMode, experimentalChaos');
                break;
            case 'about':
            case 'skills':
            case 'projects':
            case 'proof':
            case 'journey':
            case 'contact':
                goToSection(command.toLowerCase());
                appendLine(`Opened ${command.toLowerCase()} section.`);
                break;
            case 'open':
                if (!arg) {
                    appendLine('Usage: open <about|skills|projects|proof|journey|contact>');
                    break;
                }
                if (goToSection(arg)) {
                    appendLine(`Opened ${arg} section.`);
                } else {
                    appendLine(`Unknown section: ${arg}`);
                }
                break;
            case 'resume': {
                const link = document.querySelector('a[href="./Asrith-Kulukuri-Resume.txt"]');
                if (link) {
                    link.click();
                    appendLine('Started resume download.');
                } else {
                    appendLine('Resume link not found.');
                }
                break;
            }
            case 'chat': {
                const chatButton = document.getElementById('chatWidget');
                if (chatButton) {
                    chatButton.click();
                    appendLine('Opened AI chat widget.');
                } else {
                    appendLine('Chat widget not available.');
                }
                break;
            }
            case 'theme': {
                if (!window.themesEngine) {
                    appendLine('Theme engine unavailable.');
                    break;
                }
                if (!arg) {
                    const current = window.themesEngine.getCurrentTheme();
                    appendLine(`Current theme: ${current}`);
                    appendLine('Use: theme <id>');
                    break;
                }
                const success = window.themesEngine.applyTheme(arg);
                if (success) {
                    appendLine(`Theme switched to ${arg}.`);
                } else {
                    appendLine(`Unknown theme: ${arg}`);
                }
                break;
            }
            case 'clear':
                output.innerHTML = '';
                appendLine('Terminal cleared. Type help to continue.');
                break;
            default:
                appendLine(`Command not found: ${command}. Try "help".`);
        }
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const value = input.value;
        if (!value.trim()) return;
        history.push(value);
        historyIndex = history.length;
        runCommand(value);
        input.value = '';
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!history.length) return;
            historyIndex = Math.max(0, historyIndex - 1);
            input.value = history[historyIndex] || '';
            input.setSelectionRange(input.value.length, input.value.length);
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!history.length) return;
            historyIndex = Math.min(history.length, historyIndex + 1);
            input.value = history[historyIndex] || '';
            input.setSelectionRange(input.value.length, input.value.length);
        }
    });

    document.querySelector('.hero-terminal')?.addEventListener('click', () => input.focus());
})();
