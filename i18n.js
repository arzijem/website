let currentLang = localStorage.getItem('az_lang') || 'en';
let globalTranslations = null;

async function initI18n() {
    updateLangButtons();
    try {
        const res = await fetch('content/translations.json');
        if (res.ok) {
            globalTranslations = await res.json();
            applyTranslations();
        }
    } catch (err) {
        console.warn('translations.json not found yet; using HTML default values.');
    }
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('az_lang', lang);
    updateLangButtons();
    applyTranslations();
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

function updateLangButtons() {
    document.querySelectorAll('.az-lang-btn').forEach(btn => {
        btn.classList.toggle('is-active', btn.getAttribute('data-lang') === currentLang);
    });
}

function applyTranslations() {
    if (!globalTranslations) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = globalTranslations[`${key}_${currentLang}`];
        if (translated) {
            el.innerHTML = translated;
        }
    });
}

document.addEventListener('DOMContentLoaded', initI18n);
