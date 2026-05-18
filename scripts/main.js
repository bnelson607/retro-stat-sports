// main.js — Retro Stat Sports site script
// NOTE: The USA/UEFA/NCAA header loaders have been removed since the site now uses
// a single consolidated header. If you have pages that still reference #usa-header,
// #uefa-header, or #ncaa-header divs, those divs can be deleted from those pages.

// Load main page header HTML dynamically
fetch('/retro-stat-sports/header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('site-header').innerHTML = data;
    });

// Load main page footer HTML dynamically
fetch('/retro-stat-sports/footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('site-footer').innerHTML = data;
    });

// Tab switching function
function showTab(group, tabId) {
    const tabElement = document.getElementById(tabId);
    if (!tabElement) return;

    const container = tabElement.closest('details');
    if (!container) return;

    const tabs = container.querySelectorAll('.tab-content.' + group);
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.id === tabId);
    });

    const buttons = container.querySelectorAll('.tab-buttons button');
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(tabId));
    });
}

function resizeIframe(iframe) {
    try {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        if (!iframeDocument) return;

        const body = iframeDocument.body;
        const html = iframeDocument.documentElement;

        if (!body || !html) return;

        const contentHeight = Math.max(
            body.scrollHeight || 0,
            body.offsetHeight || 0,
            html.clientHeight || 0,
            html.scrollHeight || 0,
            html.offsetHeight || 0
        );

        const extra_1 = iframe.classList.contains('extra-padding') ? 15 : 0;
        const extra_2 = iframe.classList.contains('double-extra-padding') ? 30 : 0;

        iframe.style.height = (contentHeight + extra_1 + extra_2) + 'px';
    } catch (e) {
        console.warn('Resize failed:', e);
    }
}

function attachIframeListeners() {
    const iframes = document.querySelectorAll('iframe');

    iframes.forEach(iframe => {
        iframe.addEventListener('load', () => {
            setTimeout(() => resizeIframe(iframe), 100);
        });

        if (iframe.contentDocument?.readyState === 'complete') {
            setTimeout(() => resizeIframe(iframe), 100);
        }
    });
}

function lazyLoadIframes() {
    const detailsElements = document.querySelectorAll('details');

    detailsElements.forEach(details => {
        details.addEventListener('toggle', () => {
            if (details.open) {
                const iframes = details.querySelectorAll('iframe');

                iframes.forEach(iframe => {
                    if (!iframe.src) {
                        const dataSrc = iframe.getAttribute('data-src');
                        if (dataSrc) {
                            iframe.src = dataSrc;
                        }
                    }
                });
            }
        });
    });
}

window.addEventListener('load', () => {
    lazyLoadIframes();
    attachIframeListeners();
});

document.addEventListener("DOMContentLoaded", function() {
    const dateSpan = document.getElementById('update-date');
    if (!dateSpan) return;

    fetch("sim_date.json")
        .then(response => response.json())
        .then(data => {
            dateSpan.textContent = data.simulation_date;
        })
        .catch(err => {
            console.error("Failed to load simulation date:", err);
        });
});

// Landing-page projection table. Only runs on pages that have the
// projection table elements (sport landing pages); other pages early-return.
document.addEventListener("DOMContentLoaded", function() {
    const headlineEl = document.getElementById('projection-headline');
    const tbodyEl = document.getElementById('projection-table-body');
    if (!headlineEl || !tbodyEl) return;

    fetch("projection.json")
        .then(response => response.json())
        .then(data => {
            headlineEl.textContent = data.headline;
            tbodyEl.innerHTML = data.top5.map(r => `
                <tr>
                    <td class="tm">${r.team}</td>
                    <td class="num">${r.elo != null ? r.elo : '—'}</td>
                    <td class="num">${r.title_pct.toFixed(1)}</td>
                </tr>
            `).join('');
        })
        .catch(err => {
            console.error("Failed to load projection:", err);
        });
});
