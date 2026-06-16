'use strict';

/* ===== Данные: марки и модели авто ===== */
const CAR_DATA = {
  'Audi':        ['A3', 'A4', 'A5', 'A6', 'Q3', 'Q5', 'Q7', 'Q8'],
  'BMW':         ['1 серия', '3 серия', '5 серия', '7 серия', 'X1', 'X3', 'X5', 'X6'],
  'Chevrolet':   ['Aveo', 'Cruze', 'Captiva', 'Niva', 'Tahoe'],
  'Ford':        ['Focus', 'Fiesta', 'Mondeo', 'Kuga', 'Explorer'],
  'Geely':       ['Atlas', 'Coolray', 'Tugella', 'Monjaro'],
  'Haval':       ['Jolion', 'F7', 'F7x', 'Dargo', 'H9'],
  'Honda':       ['Civic', 'Accord', 'CR-V', 'Pilot'],
  'Hyundai':     ['Solaris', 'Elantra', 'Sonata', 'Creta', 'Tucson', 'Santa Fe'],
  'Kia':         ['Rio', 'Ceed', 'Optima', 'Sportage', 'Sorento', 'K5'],
  'Lada':        ['Granta', 'Vesta', 'XRAY', 'Niva', 'Largus'],
  'Lexus':       ['ES', 'IS', 'NX', 'RX', 'LX'],
  'Mazda':       ['3', '6', 'CX-5', 'CX-30', 'CX-9'],
  'Mercedes-Benz': ['A-класс', 'C-класс', 'E-класс', 'S-класс', 'GLC', 'GLE', 'GLS'],
  'Mitsubishi':  ['Lancer', 'Outlander', 'Pajero', 'ASX', 'Eclipse Cross'],
  'Nissan':      ['Almera', 'Qashqai', 'X-Trail', 'Murano', 'Patrol'],
  'Renault':     ['Logan', 'Sandero', 'Duster', 'Arkana', 'Kaptur'],
  'Skoda':       ['Octavia', 'Rapid', 'Superb', 'Kodiaq', 'Karoq'],
  'Toyota':      ['Camry', 'Corolla', 'RAV4', 'Land Cruiser', 'Highlander'],
  'Volkswagen':  ['Polo', 'Golf', 'Passat', 'Tiguan', 'Touareg'],
  'Volvo':       ['S60', 'S90', 'XC40', 'XC60', 'XC90'],
  'Chery':       ['Tiggo 4', 'Tiggo 7 Pro', 'Tiggo 8 Pro', 'Arrizo 8'],
  'Exeed':       ['LX', 'TXL', 'VX', 'RX'],
};

const MANUAL = '__manual__';

/* ===== Шапка: фон при прокрутке ===== */
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ===== Мобильное меню ===== */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const toggleMenu = (open) => {
  const next = open ?? !nav.classList.contains('open');
  nav.classList.toggle('open', next);
  burger.classList.toggle('active', next);
  burger.setAttribute('aria-expanded', String(next));
  document.body.style.overflow = next ? 'hidden' : '';
};
burger.addEventListener('click', () => toggleMenu());
nav.querySelectorAll('.nav__link').forEach((l) => l.addEventListener('click', () => toggleMenu(false)));

/* ===== Анимация появления блоков ===== */
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        // лёгкий каскад внутри одной секции
        const siblings = [...e.target.parentElement.querySelectorAll('.reveal')];
        const idx = Math.max(0, siblings.indexOf(e.target));
        e.target.style.transitionDelay = `${Math.min(idx * 70, 280)}ms`;
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('visible'));
}

/* ===== Заполнение марок ===== */
const brandSelect = document.getElementById('brand');
const modelSelect = document.getElementById('model');
const brandManualWrap = document.getElementById('brandManualWrap');
const brandManual = document.getElementById('brandManual');
const modelManualWrap = document.getElementById('modelManualWrap');
const modelManual = document.getElementById('modelManual');

const addOption = (select, value, text = value) => {
  const o = document.createElement('option');
  o.value = value; o.textContent = text;
  select.appendChild(o);
};

Object.keys(CAR_DATA).sort((a, b) => a.localeCompare(b, 'ru')).forEach((brand) => addOption(brandSelect, brand));
addOption(brandSelect, MANUAL, 'Другая марка (ввести вручную)');

const resetSelect = (select, placeholder) => {
  select.innerHTML = '';
  const o = document.createElement('option');
  o.value = ''; o.disabled = true; o.selected = true; o.textContent = placeholder;
  select.appendChild(o);
};

/* ===== Логика марка → модель ===== */
brandSelect.addEventListener('change', () => {
  const val = brandSelect.value;
  const isManual = val === MANUAL;

  brandManualWrap.hidden = !isManual;
  brandManual.required = isManual;
  if (!isManual) brandManual.value = '';

  // модели
  resetSelect(modelSelect, 'Выберите модель');
  modelManualWrap.hidden = true;
  modelManual.value = '';

  if (isManual) {
    // ручная марка → модель только вручную
    modelSelect.parentElement.hidden = true;
    modelManualWrap.hidden = false;
  } else {
    modelSelect.parentElement.hidden = false;
    (CAR_DATA[val] || []).forEach((m) => addOption(modelSelect, m));
    addOption(modelSelect, MANUAL, 'Другая модель (ввести вручную)');
  }
});

modelSelect.addEventListener('change', () => {
  const isManual = modelSelect.value === MANUAL;
  modelManualWrap.hidden = !isManual;
  if (!isManual) modelManual.value = '';
});

/* ===== Карточки услуг → подстановка в форму ===== */
document.querySelectorAll('.card__cta[data-service]').forEach((cta) => {
  cta.addEventListener('click', () => {
    const service = cta.getAttribute('data-service');
    const select = document.getElementById('service');
    [...select.options].forEach((opt) => { if (opt.value === service || opt.text === service) opt.selected = true; });
  });
});

/* ===== Маска телефона ===== */
const phone = document.getElementById('phone');
phone.addEventListener('input', () => {
  let d = phone.value.replace(/\D/g, '');
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;
  d = d.slice(0, 11);
  let out = '+7';
  if (d.length > 1) out += ' (' + d.slice(1, 4);
  if (d.length >= 4) out += ') ' + d.slice(4, 7);
  if (d.length >= 7) out += '-' + d.slice(7, 9);
  if (d.length >= 9) out += '-' + d.slice(9, 11);
  phone.value = out;
});

/* ===== Отправка формы (заглушка) ===== */
const form = document.getElementById('bookingForm');
const success = document.getElementById('formSuccess');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  // простая валидация обязательных видимых полей
  const required = [...form.querySelectorAll('[required]')].filter((el) => {
    const wrap = el.closest('.field');
    return !(wrap && wrap.hidden) && !(el.offsetParent === null && el.type !== 'hidden');
  });

  let valid = true;
  required.forEach((el) => {
    const ok = el.value.trim() !== '';
    el.classList.toggle('invalid', !ok);
    if (!ok && valid) { el.focus(); valid = false; }
  });

  const digits = phone.value.replace(/\D/g, '');
  if (digits.length < 11) { phone.classList.add('invalid'); valid = false; }

  if (!valid) return;

  // Заглушка: здесь могла бы быть отправка менеджеру (Telegram/CRM/почта)
  const payload = Object.fromEntries(new FormData(form).entries());
  console.log('Заявка (демо):', payload);

  success.hidden = false;
  form.querySelectorAll('input, select, textarea, button').forEach((el) => { el.disabled = true; });

  setTimeout(() => {
    form.reset();
    success.hidden = true;
    form.querySelectorAll('input, select, textarea, button').forEach((el) => { el.disabled = false; });
    resetSelect(modelSelect, 'Сначала выберите марку');
    modelSelect.parentElement.hidden = false;
    brandManualWrap.hidden = true;
    modelManualWrap.hidden = true;
    form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
  }, 4500);
});

// снимаем подсветку ошибки при вводе
form.addEventListener('input', (e) => {
  if (e.target.classList.contains('invalid')) e.target.classList.remove('invalid');
});

/* ===== Год в подвале ===== */
document.getElementById('year').textContent = new Date().getFullYear();
