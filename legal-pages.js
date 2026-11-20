(() => {
  'use strict';
  let lang = 'ms';
  let theme = 'light';
  try {
    const saved = JSON.parse(localStorage.getItem('juaija.app.v1') || '{}');
    if (saved.settings?.lang === 'en') lang = 'en';
    if (saved.settings?.theme === 'dark') theme = 'dark';
  } catch {}
  document.body.dataset.theme = theme;
  const page = document.body.dataset.legalPage;
  const copy = {
    ms: {about:'Tentang', terms:'Terma dan Privasi', language:'Bahasa', published:'Tarikh diterbitkan:'},
    en: {about:'About', terms:'Terms and Privacy', language:'Language', published:'Publication date:'}
  };
  function updatePublicationDate() {
    const dateElement = document.querySelector('#publicationDate');
    if (!dateElement) return;
    const now = new Date();
    const dateOptions = {timeZone:'Asia/Kuala_Lumpur', day:'numeric', month:'long', year:'numeric'};
    dateElement.textContent = new Intl.DateTimeFormat(lang === 'ms' ? 'ms-MY' : 'en-MY', dateOptions).format(now);
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
      timeZone:'Asia/Kuala_Lumpur', year:'numeric', month:'2-digit', day:'2-digit'
    }).formatToParts(now).map(part => [part.type, part.value]));
    dateElement.dateTime = [parts.year, parts.month, parts.day].join('-');
    document.querySelector('#publicationLabel').textContent = copy[lang].published;
  }
  function showCopy() {
    document.documentElement.lang = lang === 'ms' ? 'ms-MY' : 'en-MY';
    document.querySelectorAll('[data-legal-copy]').forEach(section => {
      section.hidden = section.dataset.legalCopy !== lang;
    });
    document.querySelectorAll('[data-legal-lang]').forEach(button => {
      const active = button.dataset.legalLang === lang;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelector('.legal-language').setAttribute('aria-label', copy[lang].language);
    document.title = 'juaija - ' + copy[lang][page];
    updatePublicationDate();
  }
  document.querySelectorAll('[data-legal-lang]').forEach(button => {
    button.addEventListener('click', () => { lang = button.dataset.legalLang; showCopy(); });
  });
  showCopy();
  if (document.querySelector('#publicationDate')) {
    setInterval(updatePublicationDate, 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) updatePublicationDate(); });
  }
})();
