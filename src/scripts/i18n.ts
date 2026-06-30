import {
  DEFAULT_LOCALE,
  LOCALE_OPTIONS,
  LOCALE_STORAGE_KEY,
  detectLocale,
  isLocale,
  messages,
  t,
  type Locale,
  type Messages,
} from '../i18n';

const OG_LOCALE: Record<Locale, string> = {
  'zh-CN': 'zh_CN',
  'zh-TW': 'zh_TW',
  en: 'en_US',
  ja: 'ja_JP',
};

function applyTextContent(root: ParentNode, dict: Messages) {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (!key) return;
    el.textContent = t(dict, key);
  });

  root.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((el) => {
    const key = el.dataset.i18nHtml;
    if (!key) return;
    el.innerHTML = t(dict, key);
  });

  root.querySelectorAll<HTMLElement>('[data-i18n-aria-label]').forEach((el) => {
    const key = el.dataset.i18nAriaLabel;
    if (!key) return;
    el.setAttribute('aria-label', t(dict, key));
  });

  root.querySelectorAll<HTMLImageElement>('[data-i18n-alt]').forEach((el) => {
    const key = el.dataset.i18nAlt;
    if (!key) return;
    el.alt = t(dict, key);
  });

  root.querySelectorAll<HTMLElement>('[data-i18n-prefix]').forEach((el) => {
    const key = el.dataset.i18nPrefix;
    const name = el.dataset.i18nName;
    if (!key || !name) return;
    el.alt = `${name}${t(dict, key)}`;
  });
}

function applyMeta(locale: Locale) {
  const dict = messages[locale];
  document.documentElement.lang = locale;
  document.title = dict.meta.title;

  document.querySelector('meta[name="description"]')?.setAttribute('content', dict.meta.description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', dict.meta.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', dict.meta.description);
  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', OG_LOCALE[locale]);
}

function applyBadges(dict: Messages) {
  document.querySelectorAll<HTMLElement>('[data-i18n-badge]').forEach((el) => {
    const key = el.dataset.i18nBadge;
    if (!key) return;
    const text = t(dict, key);
    el.textContent = text;
    el.hidden = !text;
  });
}

function applyLangSwitcher(locale: Locale) {
  const current = LOCALE_OPTIONS.find((option) => option.code === locale);

  document.querySelectorAll<HTMLElement>('[data-lang-current]').forEach((el) => {
    if (current) el.textContent = current.shortLabel;
  });

  document.querySelectorAll<HTMLButtonElement>('[data-lang-option]').forEach((btn) => {
    const active = btn.dataset.langOption === locale;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

function closeLangMenus() {
  document.querySelectorAll<HTMLElement>('[data-lang-switcher]').forEach((root) => {
    const trigger = root.querySelector<HTMLButtonElement>('[data-lang-trigger]');
    const menu = root.querySelector<HTMLElement>('.lang-menu');
    if (!trigger || !menu) return;
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    root.classList.remove('is-open');
  });
}

function initLangSwitcher() {
  document.querySelectorAll<HTMLElement>('[data-lang-switcher]').forEach((root) => {
    const trigger = root.querySelector<HTMLButtonElement>('[data-lang-trigger]');
    const menu = root.querySelector<HTMLElement>('.lang-menu');
    if (!trigger || !menu) return;

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = menu.hidden;
      closeLangMenus();
      menu.hidden = !open;
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      root.classList.toggle('is-open', open);
    });

    menu.querySelectorAll<HTMLButtonElement>('[data-lang-option]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.langOption;
        if (!next || !isLocale(next)) return;
        localStorage.setItem(LOCALE_STORAGE_KEY, next);
        applyLocale(next);
        closeLangMenus();
      });
    });
  });

  document.addEventListener('click', closeLangMenus);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLangMenus();
  });
}

export function applyLocale(locale: Locale) {
  const dict = messages[locale];
  applyMeta(locale);
  applyTextContent(document, dict);
  applyBadges(dict);
  applyLangSwitcher(locale);
}

export function initI18n() {
  const locale = detectLocale();
  applyLocale(locale);
  initLangSwitcher();
}

export function getInitialLocaleScript(): string {
  return `(function(){try{var k='${LOCALE_STORAGE_KEY}';var s=localStorage.getItem(k);var n=(navigator.language||'').toLowerCase();var l=s||'${DEFAULT_LOCALE}';if(['zh-CN','zh-TW','en','ja'].indexOf(l)<0){if(n==='zh-tw'||n==='zh-hk'||n==='zh-mo')l='zh-TW';else if(n.indexOf('zh')===0)l='zh-CN';else if(n.indexOf('ja')===0)l='ja';else l='en';}document.documentElement.lang=l;}catch(e){}})();`;
}
