/* ═══════════════════════════════════════════════════════════════
   CUSTOM CURSOR
═══════════════════════════════════════════════════════════════ */
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  if (cursorDot) { cursorDot.style.left = mouseX + 'px'; cursorDot.style.top = mouseY + 'px'; }
});
(function animateCursor() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  if (cursorRing) { cursorRing.style.left = ringX + 'px'; cursorRing.style.top = ringY + 'px'; }
  requestAnimationFrame(animateCursor);
})();

/* ═══════════════════════════════════════════════════════════════
   NAV — scroll behaviour
═══════════════════════════════════════════════════════════════ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ═══════════════════════════════════════════════════════════════
   MOBILE MENU
═══════════════════════════════════════════════════════════════ */
function toggleMenu() {
  const menu = document.getElementById('mobileNav');
  const btn  = document.getElementById('hamburger');
  if (menu) menu.classList.toggle('open');
  if (btn)  btn.classList.toggle('open');
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ═══════════════════════════════════════════════════════════════
   FEATURED TESTIMONIAL CAROUSEL
═══════════════════════════════════════════════════════════════ */
const ftItems   = document.querySelectorAll('.ft-item');
const ftDotsEl  = document.getElementById('ftDots');
let   ftCurrent = 0;
let   ftTimer;

if (ftItems.length && ftDotsEl) {
  ftItems.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'ft-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Перейти до відгуку ' + (i + 1));
    dot.addEventListener('click', () => goToTestimonial(i));
    ftDotsEl.appendChild(dot);
  });
}

function goToTestimonial(n) {
  if (!ftItems.length) return;
  ftItems[ftCurrent].classList.remove('active');
  const dots = document.querySelectorAll('.ft-dot');
  if (dots[ftCurrent]) dots[ftCurrent].classList.remove('active');
  ftCurrent = ((n % ftItems.length) + ftItems.length) % ftItems.length;
  ftItems[ftCurrent].classList.add('active');
  if (dots[ftCurrent]) dots[ftCurrent].classList.add('active');
  resetFtTimer();
}

function testimonialNext() { goToTestimonial(ftCurrent + 1); }
function testimonialPrev() { goToTestimonial(ftCurrent - 1); }

function resetFtTimer() {
  clearInterval(ftTimer);
  ftTimer = setInterval(testimonialNext, 6500);
}
resetFtTimer();

/* ═══════════════════════════════════════════════════════════════
   GALLERY FILTER + LIGHTBOX
═══════════════════════════════════════════════════════════════ */
const allPhotos = [
  { src:'вікна/2023-11-29.jpg',                                               cat:'vikna',  label:'Вікна' },
  { src:'вікна/2023-12-16%20(1).jpg',                                         cat:'vikna',  label:'Вікна' },
  { src:'вікна/2024-01-15%20(1).jpg',                                         cat:'vikna',  label:'Вікна' },
  { src:'вікна/2024-01-15.jpg',                                                cat:'vikna',  label:'Вікна' },
  { src:'вікна/2024-09-07.jpg',                                                cat:'vikna',  label:'Вікна' },
  { src:'вікна/unnamed.jpg',                                                    cat:'vikna',  label:'Вікна' },
  { src:'вікна/unnamed1.jpg',                                                   cat:'vikna',  label:'Вікна' },
  { src:'вікна/unnamed2.jpg',                                                   cat:'vikna',  label:'Вікна' },
  { src:'двері/2023-12-16.jpg',                                                 cat:'dveri',  label:'Двері' },
  { src:'двері/2024-09-06.jpg',                                                 cat:'dveri',  label:'Двері' },
  { src:'двері/2024-10-24.jpg',                                                 cat:'dveri',  label:'Двері' },
  { src:'двері/unnamed%20(1).jpg',                                              cat:'dveri',  label:'Двері' },
  { src:'двері/unnamed%20(1)4.jpg',                                             cat:'dveri',  label:'Двері' },
  { src:'двері/unnamed2.jpg',                                                    cat:'dveri',  label:'Двері' },
  { src:'двері/unnamed3.jpg',                                                    cat:'dveri',  label:'Двері' },
  { src:'ролети/2023-11-22.jpg',                                                 cat:'rolety', label:'Ролети' },
  { src:'ролети/94030545_251778812869434_4568817305600917504_n.jpg',             cat:'rolety', label:'Ролети' },
];

let lbPhotos = [...allPhotos];
let lbIndex  = 0;
let gCurrentFilter = 'all';

function buildLbSet(cat) {
  lbPhotos = cat === 'all' ? [...allPhotos] : allPhotos.filter(p => p.cat === cat);
}
buildLbSet('all');

(function initGalleryOnclick() {
  document.querySelectorAll('.gp').forEach((item, i) => {
    item.onclick = () => openLb(i);
  });
})();

function filterGallery(cat, btn) {
  document.querySelectorAll('.gf-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  gCurrentFilter = cat;
  buildLbSet(cat);
  let vi = 0;
  document.querySelectorAll('.gp').forEach(item => {
    const match = cat === 'all' || item.dataset.cat === cat;
    item.classList.toggle('gp-hidden', !match);
    if (match) { const idx = vi; item.onclick = () => openLb(idx); vi++; }
  });
}

function openLb(index) {
  lbIndex = Math.max(0, Math.min(index, lbPhotos.length - 1));
  renderLb();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLb() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
function lbNav(dir) {
  lbIndex = ((lbIndex + dir) + lbPhotos.length) % lbPhotos.length;
  renderLb();
}
function renderLb() {
  const p = lbPhotos[lbIndex];
  const img = document.getElementById('lbImg');
  img.style.opacity = '0';
  img.src = p.src;
  img.onload = () => { img.style.opacity = '1'; };
  const catEl = document.getElementById('lbCat');
  const cntEl = document.getElementById('lbCounter');
  if (catEl) catEl.textContent = p.label;
  if (cntEl) cntEl.textContent = (lbIndex + 1) + ' / ' + lbPhotos.length;
}
document.addEventListener('keydown', e => {
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'ArrowRight') lbNav(1);
  if (e.key === 'ArrowLeft')  lbNav(-1);
  if (e.key === 'Escape')     closeLb();
});

/* ═══════════════════════════════════════════════════════════════
   PRODUCT PANEL — mouse parallax
═══════════════════════════════════════════════════════════════ */
document.querySelectorAll('.product-visual').forEach(visual => {
  visual.addEventListener('mousemove', e => {
    const r  = visual.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) / r.width;
    const dy = (e.clientY - r.top  - r.height / 2) / r.height;
    const scene = visual.querySelector('.pv-scene');
    if (scene) scene.style.transform = `translate(${dx * 12}px, ${dy * 8}px)`;
  });
  visual.addEventListener('mouseleave', () => {
    const scene = visual.querySelector('.pv-scene');
    if (scene) { scene.style.transition = 'transform .6s ease'; scene.style.transform = ''; }
  });
  visual.addEventListener('mouseenter', () => {
    const scene = visual.querySelector('.pv-scene');
    if (scene) scene.style.transition = 'transform .1s ease';
  });
});

/* ═══════════════════════════════════════════════════════════════
   HERO STATS — counter animation
═══════════════════════════════════════════════════════════════ */
function animCount(el, to, suffix, duration) {
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * to) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statsBar = document.querySelector('.hero-stats-bar');
if (statsBar) {
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const nums = statsBar.querySelectorAll('.hstat-n');
      nums.forEach(n => {
        const txt = n.textContent;
        if      (txt === '4')    animCount(n, 4,   '',  800);
        else if (txt === '8')    animCount(n, 8,   '',  900);
        else if (txt === '500+') animCount(n, 500, '+', 1200);
      });
    }
  }, { threshold: 0.5 }).observe(statsBar);
}

/* ═══════════════════════════════════════════════════════════════
   PHONE AUTO-FILL
═══════════════════════════════════════════════════════════════ */
const phoneInput = document.getElementById('clientPhone');
if (phoneInput) {
  phoneInput.addEventListener('focus', function() {
    if (!this.value) this.value = '+380';
  });
}

/* ═══════════════════════════════════════════════════════════════
   CALCULATOR
═══════════════════════════════════════════════════════════════ */
let currentType    = 'window';
let currentProfile = 'standard';
let currentGlass   = 'single';

// Ціни за розмір 100×100 см
const priceMx = {
  standard: {
    single: { window: 2681, window_open: 4100 },
    double: { window: 2950, window_open: 4510 }
  },
  comfort: {
    single: { window: 3077, window_open: 4579 },
    double: { window: 3385, window_open: 5037 }
  },
  premium: {
    double: { window: 4132, window_open: 5927 }
  },
  premium_plus: {
    double: { window: 5942, window_open: 9441 }
  }
};
// Двері — профільна матриця, база 85×205 = 9300 (100×100 = 5338), +25% кожен профіль
const doorMx = {
  standard:     5338,
  comfort:      6650,
  premium:      8350,
  premium_plus: 10450
};
// Балконний блок — та сама структура що й вікна, база 100×100 = 3870
const balconyMx = {
  standard:     { single: 3870, double: 4250 },
  comfort:      { single: 4450, double: 4900 },
  premium:      { double: 5950 },
  premium_plus: { double: 8600 }
};

function setType(el, val) {
  currentType = val;
  document.querySelectorAll('#typeTabs .calc-tab').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  const isEntryDoor = val === 'entry_door';
  const hide = isEntryDoor ? 'none' : '';
  ['calcPriceBlock','groupProfile','groupGlass','groupDims','groupQty','groupOptions'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = hide;
  });
  const entryBlock = document.getElementById('entryDoorBlock');
  if (entryBlock) entryBlock.style.display = isEntryDoor ? '' : 'none';
  if (!isEntryDoor) calc();
}
function setProfile(el, val) {
  currentProfile = val;
  document.querySelectorAll('#profileTabs .calc-tab').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  // Преміум та Преміум+ — тільки 2-камерний
  const singleTab = document.querySelector('#glassTabs [data-glass="single"]');
  if (val === 'premium' || val === 'premium_plus') {
    if (singleTab) singleTab.style.display = 'none';
    if (currentGlass === 'single') {
      currentGlass = 'double';
      document.querySelectorAll('#glassTabs .calc-tab').forEach(b => {
        b.classList.toggle('active', b.dataset.glass === 'double');
      });
    }
  } else {
    if (singleTab) singleTab.style.display = '';
  }
  calc();
}
function setGlass(el, val) {
  currentGlass = val;
  document.querySelectorAll('#glassTabs .calc-tab').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  calc();
}
function adjustDim(id, delta) {
  const el = document.getElementById(id);
  if (el) { el.value = Math.max(40, Math.min(300, parseInt(el.value || 100) + delta)); calc(); }
}
function fmt(n) { return n.toLocaleString('uk-UA') + ' ₴'; }

function calc() {
  const w   = parseInt((document.getElementById('width')  || {}).value) || 100;
  const h   = parseInt((document.getElementById('height') || {}).value) || 100;
  const qty = parseInt((document.getElementById('qty')    || {}).value) || 1;

  const area       = (w / 100) * (h / 100);
  const REFERENCE  = 1.0; // еталон 100×100
  const areaFactor = Math.max(0.5, Math.min(2.5, area / REFERENCE));

  let base;
  if (currentType === 'window' || currentType === 'window_open') {
    const profile   = priceMx[currentProfile] || priceMx['standard'];
    const glass     = profile[currentGlass]   || profile['double'];
    const unitPrice = glass[currentType]      || glass['window'];
    base = Math.max(unitPrice, Math.round(unitPrice * areaFactor / 50) * 50);
  } else if (currentType === 'balcony') {
    const profile   = balconyMx[currentProfile] || balconyMx['standard'];
    const unitPrice = profile[currentGlass]     || profile['double'];
    base = Math.max(unitPrice, Math.round(unitPrice * areaFactor / 50) * 50);
  } else {
    const glassFactor = currentGlass === 'double' ? 1.10 : 1;
    const unitPrice   = (doorMx[currentProfile] || doorMx['standard']) * glassFactor;
    base = Math.max(Math.round(unitPrice), Math.round(unitPrice * areaFactor / 50) * 50);
  }

  let options = 0;
  if ((document.getElementById('opt_sill')     || {}).checked) options += Math.round(base * 0.12);
  if ((document.getElementById('opt_mosquito') || {}).checked) options += 680;
  if ((document.getElementById('opt_color')    || {}).checked) options += Math.round(base * 0.25);

  let install = 0;
  if ((document.getElementById('opt_install')  || {}).checked) install = Math.max(800, Math.round(area * 800));

  const perUnit = base + options + install;
  const total   = perUnit * qty;

  // Animate price number
  const priceEl = document.getElementById('resultPrice');
  if (priceEl) {
    priceEl.style.transition = 'transform .1s ease, opacity .1s ease';
    priceEl.style.transform  = 'scale(0.94)'; priceEl.style.opacity = '0.5';
    setTimeout(() => {
      priceEl.textContent     = fmt(perUnit);
      priceEl.style.transform = 'scale(1)'; priceEl.style.opacity = '1';
    }, 110);
  }

  const perEl  = document.getElementById('resultPer');
  if (perEl)  perEl.textContent = qty > 1 ? `за 1 шт. · разом: ${fmt(total)}` : 'за 1 шт.';

  const bProd  = document.getElementById('b_product');
  const bInst  = document.getElementById('b_install');
  const bOpt   = document.getElementById('b_options');
  const bTotal = document.getElementById('b_total');
  if (bProd)  bProd.textContent  = fmt(base);
  if (bInst)  bInst.textContent  = install ? fmt(install) : 'не обрано';
  if (bOpt)   bOpt.textContent   = options ? fmt(options) : 'не обрано';
  if (bTotal) bTotal.textContent = fmt(total);
}
calc();

function fillFormFromCalc() {
  const comment = document.getElementById('clientComment');
  const productEl = document.getElementById('clientProduct');

  if (currentType === 'entry_door') {
    if (comment) comment.value = 'Вхідні двері металеві';
    if (productEl) productEl.value = 'Вхідні двері';
    return;
  }

  const typeLabels    = { window: 'Вікно (глухе)', window_open: 'Вікно з відкриванням', door: 'Металопластикові двері', balcony: 'Балконний блок' };
  const profileLabels = { standard: 'Стандарт', comfort: 'Comfort', premium: 'Premium', premium_plus: 'Premium+' };
  const glassLabels   = { single: '1-камерний', double: '2-камерний' };

  const w   = (document.getElementById('width')  || {}).value || 100;
  const h   = (document.getElementById('height') || {}).value || 100;
  const qty = (document.getElementById('qty')    || {}).value || 1;

  const opts = [];
  if ((document.getElementById('opt_install')  || {}).checked) opts.push('Монтаж');
  if ((document.getElementById('opt_sill')     || {}).checked) opts.push('Підвіконня');
  if ((document.getElementById('opt_mosquito') || {}).checked) opts.push('Москітна сітка');
  if ((document.getElementById('opt_color')    || {}).checked) opts.push('Кольоровий профіль');

  const price = (document.getElementById('resultPrice') || {}).textContent || '';

  const lines = [
    `Тип: ${typeLabels[currentType] || currentType}`,
    `Профіль: ${profileLabels[currentProfile] || currentProfile}`,
    `Склопакет: ${glassLabels[currentGlass] || currentGlass}`,
    `Розміри: ${w}×${h} см`,
    `Кількість: ${qty} шт.`,
  ];
  if (opts.length) lines.push(`Опції: ${opts.join(', ')}`);
  lines.push(`Орієнтовна вартість: ${price}`);
  if (comment) comment.value = lines.join('\n');

  // Вибір типу продукту у формі
  const productMap = { window: 'Металопластикові вікна', window_open: 'Металопластикові вікна', door: 'Металопластикові вікна', balcony: 'Балконний блок' };
  if (comment) comment.value = lines.join('\n');
  if (productEl && productMap[currentType]) productEl.value = productMap[currentType];
}

/* ═══════════════════════════════════════════════════════════════
   FORM SUBMIT (webhook до Google Sheets)
═══════════════════════════════════════════════════════════════ */
const _formLoadTime = Date.now();

async function handleSubmit(btn) {
  // Honeypot: якщо бот заповнив приховане поле — ігноруємо
  const hp = (document.getElementById('_hp') || {}).value || '';
  if (hp) return;

  // Rate limit: не частіше 1 разу на 60 секунд
  const lastSent = parseInt(localStorage.getItem('_lastFormSent') || '0');
  if (Date.now() - lastSent < 60000) {
    alert('Заявку вже надіслано. Зачекайте хвилину перед повторним відправленням.');
    return;
  }

  // Мінімальний час на сторінці: 3 секунди
  if (Date.now() - _formLoadTime < 3000) return;
  const nameEl    = document.getElementById('clientName');
  const phoneEl   = document.getElementById('clientPhone');
  const productEl = document.getElementById('clientProduct');
  const commentEl = document.getElementById('clientComment');

  const name    = (nameEl    || {}).value?.trim() || '';
  const phone   = (phoneEl   || {}).value?.trim() || '';
  const product = (productEl || {}).value || 'Не обрано';
  const comment = (commentEl || {}).value?.trim() || '';

  if (!name || !phone) {
    alert('Будь ласка, вкажіть ваше ім\'я та номер телефону.');
    return;
  }

  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Відправка...';

  const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyomo3DMtKATb0SGbg4MvkVFLWI23BGLt35nqOvA3phdQDQMcOAZgqVNV1hhOMkCLJ0sA/exec';

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ name, phone, product, comment, _key: 'vd2026site' })
    });
    btn.textContent = '✓ Заявку надіслано!';
    btn.style.background = '#4caf50';
    localStorage.setItem('_lastFormSent', Date.now().toString());
    if (nameEl)    nameEl.value    = '';
    if (phoneEl)   phoneEl.value   = '';
    if (productEl) productEl.value = '';
    if (commentEl) commentEl.value = '';
  } catch (err) {
    btn.textContent = '❌ Помилка. Спробуйте ще';
    btn.style.background = '#f44336';
  }

  setTimeout(() => {
    btn.disabled     = false;
    btn.textContent  = originalText;
    btn.style.background = '';
  }, 4000);
}
