function parseLocalDate(dateString) {
    if (dateString instanceof Date) {
        return new Date(dateString.getFullYear(), dateString.getMonth(), dateString.getDate());
    }

    const parts = String(dateString).split("-").map(Number);
    if (parts.length === 3 && parts.every(Number.isFinite)) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    return new Date(dateString);
}

function getWeekFromDate(startDate, maxWeek) {
    const start = parseLocalDate(startDate);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const weekNum = Math.floor(diffDays / 7) + 1;

    if (weekNum < 1) return 1;
    if (weekNum > maxWeek) return maxWeek;
    return weekNum;
}

function initWeekTabs(options = {}) {
    const weekPrefix = options.weekPrefix || 'week';
    const initialWeek = options.initialWeek || 1;
    const nav = document.querySelector('.week-nav');
    const buttons = Array.from(document.querySelectorAll('.week-btn'));
    const weeks = Array.from(document.querySelectorAll('.week'));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!nav || buttons.length === 0 || weeks.length === 0) return;

    nav.setAttribute('role', 'tablist');
    if (!nav.hasAttribute('aria-label')) {
        nav.setAttribute('aria-label', 'Week selector');
    }

    buttons.forEach((button, index) => {
        const weekNum = Number(button.dataset.week || button.textContent.match(/\d+/)?.[0] || index + 1);
        const panelId = `${weekPrefix}${weekNum}`;
        const tabId = `tab-${panelId}`;

        button.type = 'button';
        button.dataset.week = String(weekNum);
        button.id = tabId;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-controls', panelId);
        button.setAttribute('aria-selected', 'false');

        button.addEventListener('click', () => showWeek(weekNum));
        button.addEventListener('keydown', event => {
            const currentIndex = buttons.indexOf(event.currentTarget);
            let nextIndex = null;

            if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % buttons.length;
            if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
            if (event.key === 'Home') nextIndex = 0;
            if (event.key === 'End') nextIndex = buttons.length - 1;

            if (nextIndex !== null) {
                event.preventDefault();
                buttons[nextIndex].focus();
                showWeek(Number(buttons[nextIndex].dataset.week), { scroll: false });
            }
        });
    });

    weeks.forEach(week => {
        const weekNum = week.id.replace(weekPrefix, '').replace('-', '');
        const tab = document.getElementById(`tab-${week.id}`);
        week.setAttribute('role', 'tabpanel');
        week.setAttribute('tabindex', '0');
        if (tab) week.setAttribute('aria-labelledby', tab.id);
        if (!week.classList.contains('active')) week.hidden = true;
    });

    function showWeek(weekNum, settings = {}) {
        const shouldScroll = settings.scroll !== false;
        const activeWeek = document.getElementById(`${weekPrefix}${weekNum}`);
        const activeButton = buttons.find(button => Number(button.dataset.week) === Number(weekNum));

        if (!activeWeek || !activeButton) return;

        weeks.forEach(week => {
            const isActive = week === activeWeek;
            week.classList.toggle('active', isActive);
            week.hidden = !isActive;
        });

        buttons.forEach(button => {
            const isActive = button === activeButton;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', String(isActive));
            button.tabIndex = isActive ? 0 : -1;
        });

        if (typeof options.afterShow === 'function') {
            options.afterShow(activeWeek, weekNum);
        }

        if (shouldScroll) {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
    }

    window.showWeek = showWeek;
    showWeek(initialWeek, { scroll: false });
}
