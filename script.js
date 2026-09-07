/* =========================================================
   Future Me — script
   Vanilla JS, organized by concern.
   ========================================================= */

(() => {
    'use strict';

    /* ----- Constants ----- */
    const STORAGE_KEY = 'futureMe.messages.v1';
    const THEME_KEY = 'futureMe.theme';
    const QUOTE_KEY = 'futureMe.quoteIndex';
    const MAX_NAME = 40;
    const MAX_MESSAGE = 800;

    /* ----- Quotes ----- */
    const QUOTES = [
        { text: 'The only way to predict the future is to have the power to shape it.', author: 'Peter Drucker' },
        { text: 'You are the author of your own story. Write a good one.', author: 'Anonymous' },
        { text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', author: 'Ralph Waldo Emerson' },
        { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
        { text: 'Do not go where the path may lead, go instead where there is no path and leave a trail.', author: 'Ralph Waldo Emerson' },
        { text: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein' },
        { text: 'Be yourself; everyone else is already taken.', author: 'Oscar Wilde' },
        { text: 'The best time to plant a tree was twenty years ago. The second best time is now.', author: 'Chinese Proverb' },
        { text: 'Your future is created by what you do today, not tomorrow.', author: 'Robert Kiyosaki' },
        { text: 'Small steps in the right direction can turn out to be the biggest step of your life.', author: 'Anonymous' },
        { text: 'What we think, we become.', author: 'Buddha' },
        { text: 'You must be the change you wish to see in the world.', author: 'Mahatma Gandhi' },
        { text: 'Difficult roads often lead to beautiful destinations.', author: 'Anonymous' },
        { text: 'Every moment is a fresh beginning.', author: 'T.S. Eliot' },
        { text: 'Trust yourself. You know more than you think you do.', author: 'Benjamin Spock' },
        { text: 'The only limit to our realization of tomorrow is our doubts of today.', author: 'Franklin D. Roosevelt' }
    ];

    /* ----- DOM ----- */
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const els = {
        form: $('#messageForm'),
        name: $('#name'),
        message: $('#message'),
        unlockDate: $('#unlockDate'),
        dateHint: $('#dateHint'),
        messageCount: $('#messageCount'),
        messages: $('#messages'),
        emptyState: $('#emptyState'),
        statTotal: $('#statTotal'),
        statLocked: $('#statLocked'),
        statUnlocked: $('#statUnlocked'),
        themeToggle: $('#themeToggle'),
        quoteText: $('#quoteText'),
        quoteAuthor: $('#quoteAuthor'),
        quoteRefresh: $('#quoteRefresh'),
        modal: $('#revealModal'),
        modalPanel: $('.modal-panel', $('#revealModal')),
        revealMeta: $('#revealMeta'),
        revealText: $('#revealText'),
        revealFrom: $('#revealFrom'),
        toast: $('#toast')
    };

    /* ----- State ----- */
    let messages = loadMessages();
    let countdownTimer = null;

    /* ----- Init ----- */
    const init = () => {
        initTheme();
        initDate();
        initQuote();
        bindEvents();
        render();
        startCountdownLoop();
        showUnlockedToasts();
    };

    /* ----- Storage ----- */
    const loadMessages = () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const data = JSON.parse(raw);
            return Array.isArray(data) ? data : [];
        } catch (err) {
            console.warn('Failed to load messages:', err);
            return [];
        }
    };

    const saveMessages = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        } catch (err) {
            console.error('Failed to save messages:', err);
            showToast('Could not save — storage may be full.', 'error');
        }
    };

    /* ----- Theme ----- */
    const initTheme = () => {
        const stored = localStorage.getItem(THEME_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = stored || (prefersDark ? 'dark' : 'light');
        setTheme(theme);
    };

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    };

    const toggleTheme = () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        setTheme(current === 'dark' ? 'light' : 'dark');
    };

    /* ----- Date input ----- */
    const initDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate() + 1).padStart(2, '0');
        els.unlockDate.min = `${yyyy}-${mm}-${dd}`;
    };

    const formatDate = (iso) => {
        const d = new Date(iso + 'T00:00:00');
        if (Number.isNaN(d.getTime())) return iso;
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    /* ----- Quote ----- */
    const initQuote = () => {
        let index;
        try {
            index = Number(localStorage.getItem(QUOTE_KEY));
        } catch (e) { index = NaN; }
        if (!Number.isFinite(index) || index < 0 || index >= QUOTES.length) {
            index = Math.floor(Math.random() * QUOTES.length);
            localStorage.setItem(QUOTE_KEY, String(index));
        }
        renderQuote(index);
    };

    const nextQuote = () => {
        let index = Math.floor(Math.random() * QUOTES.length);
        try {
            const used = Number(localStorage.getItem(QUOTE_KEY));
            if (Number.isFinite(used)) {
                while (index === used) index = Math.floor(Math.random() * QUOTES.length);
            }
        } catch (e) { /* ignore */ }
        localStorage.setItem(QUOTE_KEY, String(index));
        renderQuote(index);
    };

    const renderQuote = (i) => {
        const q = QUOTES[i];
        els.quoteText.style.opacity = '0';
        els.quoteAuthor.style.opacity = '0';
        setTimeout(() => {
            els.quoteText.textContent = q.text;
            els.quoteAuthor.textContent = q.author ? `— ${q.author}` : '';
            els.quoteText.style.opacity = '1';
            els.quoteAuthor.style.opacity = '1';
        }, 200);
    };

    /* ----- Events ----- */
    const bindEvents = () => {
        els.form.addEventListener('submit', onSubmit);
        els.message.addEventListener('input', onMessageInput);
        els.unlockDate.addEventListener('change', onDateChange);
        els.themeToggle.addEventListener('click', toggleTheme);
        els.quoteRefresh.addEventListener('click', nextQuote);
        els.modal.addEventListener('click', (e) => {
            if (e.target.matches('[data-close]')) closeReveal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && els.modal.classList.contains('open')) closeReveal();
        });
    };

    const onMessageInput = () => {
        if (!els.message || !els.messageCount) return;
        const len = els.message.value.length;
        els.messageCount.textContent = len;
        els.messageCount.style.color = len > MAX_MESSAGE * 0.9 ? 'var(--danger)' : '';
    };

    const onDateChange = () => {
        const val = els.unlockDate.value;
        if (!val) {
            setHint('Choose a date in the future.', '');
            return;
        }
        const target = new Date(val + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (target <= today) {
            setHint('Pick a date after today.', 'error');
        } else {
            const days = Math.ceil((target - today) / 86400000);
            setHint(`Unlocks in ${days} day${days === 1 ? '' : 's'}.`, 'success');
        }
    };

    const setHint = (text, kind) => {
        els.dateHint.textContent = text;
        els.dateHint.className = `hint ${kind}`;
    };

    /* ----- Submit ----- */
    const onSubmit = (e) => {
        e.preventDefault();
        const name = els.name.value.trim();
        const body = els.message.value.trim();
        const date = els.unlockDate.value;

        if (!name) return showToast('Please add your name.', 'error');
        if (!body) return showToast('A message is required.', 'error');
        if (!date) return showToast('Please choose an unlock date.', 'error');

        const target = new Date(date + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (target <= today) return showToast('Unlock date must be in the future.', 'error');

        const msg = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            name: name.slice(0, MAX_NAME),
            message: body.slice(0, MAX_MESSAGE),
            unlockDate: date,
            createdAt: new Date().toISOString(),
            seen: false
        };

        messages.unshift(msg);
        saveMessages();
        render();
        els.form.reset();
        els.messageCount.textContent = '0';
        setHint('Choose a date in the future.', '');
        showToast('Message sealed. The countdown begins.', 'success');
    };

    /* ----- Render ----- */
    const render = () => {
        renderStats();
        renderMessages();
    };

    const renderStats = () => {
        const total = messages.length;
        const unlocked = messages.filter(isUnlocked).length;
        const locked = total - unlocked;
        if (els.statTotal) animateNumber(els.statTotal, total);
        if (els.statLocked) animateNumber(els.statLocked, locked);
        if (els.statUnlocked) animateNumber(els.statUnlocked, unlocked);
    };

    const animateNumber = (el, target) => {
        if (!el) return;
        const current = Number(el.textContent) || 0;
        if (current === target) {
            el.textContent = target;
            return;
        }
        const start = current;
        const duration = 500;
        const startTime = performance.now();
        const step = (now) => {
            const t = Math.min(1, (now - startTime) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(start + (target - start) * eased);
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const renderMessages = () => {
        els.messages.innerHTML = '';
        if (messages.length === 0) {
            els.emptyState.classList.add('show');
            return;
        }
        els.emptyState.classList.remove('show');

        messages.forEach((msg) => {
            const card = createMessageCard(msg);
            els.messages.appendChild(card);
        });
    };

    const createMessageCard = (msg) => {
        const unlocked = isUnlocked(msg);
        const el = document.createElement('article');
        el.className = `message ${unlocked ? 'unlocked' : ''}`;
        el.style.animationDelay = '40ms';
        el.dataset.id = msg.id;

        const preview = unlocked
            ? escapeHtml(msg.message)
            : '✦ Sealed until ' + formatDate(msg.unlockDate) + ' ✦';

        el.innerHTML = `
            <div class="message-head">
                <span class="message-from">From ${escapeHtml(msg.name)}</span>
                <span class="message-date">${formatDate(msg.unlockDate)}</span>
            </div>
            <p class="message-body">${preview}</p>
            <div class="message-foot">
                ${unlocked
                    ? `<span class="countdown" style="color: var(--success)">✓ Unlocked</span>`
                    : `<div class="progress" aria-label="Time until unlock">
                            <div class="progress-bar" style="width: ${progressPercent(msg)}%"></div>
                        </div>
                        <span class="countdown" data-target="${msg.unlockDate}" data-created="${msg.createdAt}">…</span>`
                }
                <div class="message-actions">
                    ${unlocked
                        ? `<button class="action-btn read" data-action="read" aria-label="Read message" title="Read">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>`
                        : ''}
                    <button class="action-btn delete" data-action="delete" aria-label="Delete message" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    </button>
                </div>
            </div>
        `;

        el.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            if (action === 'read') openReveal(msg);
            if (action === 'delete') deleteMessage(msg.id);
        });

        return el;
    };

    /* ----- Time math ----- */
    const isUnlocked = (msg) => {
        const target = new Date(msg.unlockDate + 'T00:00:00');
        const now = new Date();
        return now >= target;
    };

    const progressPercent = (msg) => {
        const start = new Date(msg.createdAt).getTime();
        const end = new Date(msg.unlockDate + 'T23:59:59').getTime();
        const now = Date.now();
        if (now >= end) return 100;
        if (now <= start) return 0;
        return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    };

    const formatRemaining = (ms) => {
        if (ms <= 0) return 'Unlocked';
        const totalSec = Math.floor(ms / 1000);
        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec % 86400) / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        const parts = [];
        if (days) parts.push(`${days}d`);
        if (days || hours) parts.push(`${hours}h`);
        if (!days) parts.push(`${mins}m`, `${secs}s`);
        return parts.join(' ');
    };

    /* ----- Countdown loop ----- */
    const startCountdownLoop = () => {
        const tick = () => {
            const now = Date.now();
            $$('.countdown').forEach((el) => {
                const target = el.dataset.target;
                if (!target) return;
                const targetTime = new Date(target + 'T00:00:00').getTime();
                el.textContent = formatRemaining(targetTime - now);
            });
            checkForNewUnlocks();
        };
        tick();
        countdownTimer = setInterval(tick, 1000);
    };

    const checkForNewUnlocks = () => {
        const newlyUnlocked = messages.filter(m => isUnlocked(m) && !m.seen);
        if (newlyUnlocked.length === 0) return;
        newlyUnlocked.forEach(m => { m.seen = true; });
        saveMessages();
        renderStats();
        newlyUnlocked.forEach(m => {
            showToast(`A letter for ${m.name} is now unlocked!`, 'success');
        });
    };

    const showUnlockedToasts = () => {
        const fresh = messages.filter(m => isUnlocked(m) && !m.seen);
        if (!fresh.length) return;
        fresh.forEach(m => { m.seen = true; });
        saveMessages();
        setTimeout(() => {
            fresh.forEach(m => showToast(`A letter for ${m.name} is unlocked.`, 'success'));
        }, 600);
    };

    /* ----- Delete ----- */
    const deleteMessage = (id) => {
        const target = messages.find(m => m.id === id);
        if (!target) return;
        const card = els.messages.querySelector(`[data-id="${id}"]`);
        if (card) {
            card.style.transition = 'all 350ms ease';
            card.style.opacity = '0';
            card.style.transform = 'translateX(40px) scale(0.95)';
            setTimeout(() => {
                messages = messages.filter(m => m.id !== id);
                saveMessages();
                render();
                showToast('Letter removed.', 'success');
            }, 320);
        } else {
            messages = messages.filter(m => m.id !== id);
            saveMessages();
            render();
        }
    };

    /* ----- Reveal modal ----- */
    const openReveal = (msg) => {
        els.revealMeta.textContent = `Sealed on ${new Date(msg.createdAt).toLocaleDateString()} • Unlocked ${formatDate(msg.unlockDate)}`;
        els.revealText.textContent = msg.message;
        els.revealFrom.textContent = msg.name;
        resetSealAnimation();
        els.modal.classList.add('open');
        els.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeReveal = () => {
        els.modal.classList.remove('open');
        els.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    const resetSealAnimation = () => {
        const seal = $('.seal-letter');
        const flap = $('.seal-flap');
        const content = $('.reveal-content');
        if (!seal || !flap || !content) return;
        seal.style.animation = 'none';
        flap.style.animation = 'none';
        content.style.animation = 'none';
        // Force reflow to restart animations
        void seal.offsetWidth;
        seal.style.animation = '';
        flap.style.animation = '';
        content.style.animation = '';
    };

    /* ----- Toast ----- */
    let toastTimer = null;
    const showToast = (text, kind = '') => {
        clearTimeout(toastTimer);
        els.toast.textContent = text;
        els.toast.className = `toast show ${kind}`;
        toastTimer = setTimeout(() => {
            els.toast.classList.remove('show');
        }, 3000);
    };

    /* ----- Helpers ----- */
    const escapeHtml = (str) => {
        const div = document.createElement('div');
        div.textContent = String(str ?? '');
        return div.innerHTML;
    };

    /* ----- Start ----- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
