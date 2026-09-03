/* ══════════════════════════════════════════════════════
   ARPAN CREATIONS — UX Engine v4
   Responsive · Touch-first · Performance-optimised
   ══════════════════════════════════════════════════════ */

// ── DEVICE DETECTION ──
const IS_TOUCH   = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
const IS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_MOBILE  = window.innerWidth < 769;

// ── PAGE LOADER ──
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  if (IS_REDUCED) { loader.classList.add('hidden'); triggerHeroReveals(); return; }
  setTimeout(() => {
    loader.classList.add('hidden');
    triggerHeroReveals();
  }, IS_MOBILE ? 400 : 600);
});

function triggerHeroReveals() {
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    if (IS_REDUCED) { el.classList.add('visible'); return; }
    setTimeout(() => el.classList.add('visible'), i * 80);
  });
}

// ── CUSTOM CURSOR (desktop only) ──
const cursor = document.getElementById('cursor');
if (cursor && !IS_TOUCH) {
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let x = mx, y = my;
  let locked = null;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.85)';
  });
  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  function tickCursor() {
    let tx = mx, ty = my;
    if (locked) {
      const b = locked.getBoundingClientRect();
      tx = b.left + b.width / 2;
      ty = b.top + b.height / 2;
    }
    x += (tx - x) * 0.2;
    y += (ty - y) * 0.2;
    cursor.style.left = x + 'px';
    cursor.style.top  = y + 'px';
    requestAnimationFrame(tickCursor);
  }
  tickCursor();

  const magneticSelectors = 'a, button, .nav__toggle, .feat-carousel__dot';
  document.querySelectorAll(magneticSelectors).forEach(el => {
    el.addEventListener('mouseenter', () => {
      locked = el;
      const b = el.getBoundingClientRect();
      cursor.style.width = (b.width + 12) + 'px';
      cursor.style.height = (b.height + 12) + 'px';
      const computedStyle = window.getComputedStyle(el);
      let rValue = computedStyle.borderRadius;
      if (rValue === '0px' || rValue === '50%' || rValue === '100%') rValue = '14px';
      if (computedStyle.borderRadius.includes('50%') || computedStyle.borderRadius.includes('100px')) rValue = '100px';
      cursor.style.borderRadius = rValue;
      cursor.style.background = 'rgba(45, 226, 230, 0.1)';
      cursor.style.borderColor = 'rgba(45, 226, 230, 0.45)';
    });
    el.addEventListener('mouseleave', () => {
      locked = null;
      cursor.style.width = '40px';
      cursor.style.height = '40px';
      cursor.style.borderRadius = '50%';
      cursor.style.background = 'rgba(255, 255, 255, 0.07)';
      cursor.style.borderColor = 'rgba(255, 255, 255, 0.35)';
    });
  });

  const hoverSelectors = '.service-item, .client-card, .video-card, .tool-card';
  document.querySelectorAll(hoverSelectors).forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (!locked) {
        cursor.style.width = '55px';
        cursor.style.height = '55px';
        cursor.style.background = 'rgba(255, 255, 255, 0.12)';
        cursor.style.borderColor = 'rgba(255, 255, 255, 0.5)';
      }
    });
    el.addEventListener('mouseleave', () => {
      if (!locked) {
        cursor.style.width = '40px';
        cursor.style.height = '40px';
        cursor.style.background = 'rgba(255, 255, 255, 0.07)';
        cursor.style.borderColor = 'rgba(255, 255, 255, 0.35)';
      }
    });
  });
}

// ── SCROLL PROGRESS BAR ──
const progressBar = document.getElementById('scroll-progress');
if (progressBar && !IS_MOBILE) {
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = total > 0 ? (window.scrollY / total * 100) + '%' : '0%';
  }, { passive: true });
}

// ── NAVBAR ──
const nav = document.getElementById('nav');
if (nav) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ── MOBILE MENU ──
const toggle = document.getElementById('navToggle');
const drawer = document.getElementById('navDrawer');
if (toggle && drawer) {
  let drawerOpen = false;
  function openDrawer() {
    drawerOpen = true;
    drawer.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
    document.body.style.overflow = 'hidden';
    setTimeout(() => drawer.querySelector('a')?.focus(), 100);
  }
  function closeDrawer() {
    drawerOpen = false;
    drawer.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    document.body.style.overflow = '';
  }
  toggle.addEventListener('click', () => drawerOpen ? closeDrawer() : openDrawer());
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => { closeDrawer(); setTimeout(() => {}, 50); });
  });
  drawer.addEventListener('click', e => { if (e.target === drawer) closeDrawer(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawerOpen) closeDrawer(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 768 && drawerOpen) closeDrawer(); }, { passive: true });
}

// ── INTERSECTION OBSERVER — REVEAL ──
const REVEAL_OPTS = { threshold: IS_MOBILE ? 0.08 : 0.12, rootMargin: '0px 0px -40px 0px' };
const revealObs   = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    if (IS_REDUCED) { entry.target.classList.add('visible'); }
    else { requestAnimationFrame(() => entry.target.classList.add('visible')); }
    revealObs.unobserve(entry.target);
  });
}, REVEAL_OPTS);
document.querySelectorAll('.reveal').forEach(el => {
  if (!el.closest('.hero')) revealObs.observe(el);
});

// ── ACTIVE NAV LINK ──
const navLinks  = document.querySelectorAll('.nav__link');
const sections  = document.querySelectorAll('section[id]');
const activeObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(a => a.classList.remove('active'));
    const match = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
    if (match) match.classList.add('active');
  });
}, { rootMargin: '-35% 0px -35% 0px' });
sections.forEach(s => activeObs.observe(s));

// ── 3D TILT — VIDEO CARDS (desktop / mouse only) ──
if (!IS_TOUCH && !IS_REDUCED) {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    let tiltRaf;
    const shine = card.querySelector('.video-card__shine');
    card.addEventListener('mouseenter', () => { card.style.transition = 'box-shadow .3s'; });
    card.addEventListener('mousemove', e => {
      cancelAnimationFrame(tiltRaf);
      tiltRaf = requestAnimationFrame(() => {
        const r  = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top  - r.height/2) / (r.height/2)) * -7;
        const ry = ((e.clientX - r.left - r.width /2) / (r.width /2)) *  7;
        const px = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
        const py = ((e.clientY - r.top ) / r.height * 100).toFixed(1);
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
        if (shine) { shine.style.setProperty('--mx', px+'%'); shine.style.setProperty('--my', py+'%'); }
      });
    });
    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(tiltRaf);
      card.style.transition = 'transform .55s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow .3s';
      card.style.transform  = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      setTimeout(() => { card.style.transition = ''; }, 600);
    });
  });
}

// ── GLASS TOOL — mouse glow + tilt (desktop only) ──
if (!IS_TOUCH && !IS_REDUCED) {
  document.querySelectorAll('.glass-tool').forEach(card => {
    let toolRaf;
    card.addEventListener('mouseenter', () => { card.style.transition = 'none'; });
    card.addEventListener('mousemove', e => {
      cancelAnimationFrame(toolRaf);
      toolRaf = requestAnimationFrame(() => {
        const r  = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top  - r.height/2) / (r.height/2)) * -5;
        const ry = ((e.clientX - r.left - r.width /2) / (r.width /2)) *  5;
        const px = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
        const py = ((e.clientY - r.top ) / r.height * 100).toFixed(1);
        card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px) scale(1.01)`;
        card.style.setProperty('--mx', px + '%');
        card.style.setProperty('--my', py + '%');
      });
    });
    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(toolRaf);
      card.style.transition = 'transform .5s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow .3s, background .3s, border-color .3s';
      card.style.transform  = '';
      setTimeout(() => { card.style.transition = ''; }, 550);
    });
  });
}

// ── GLASS TOOL BAR ANIMATION ──
const barObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.glass-tool__bar-fill').forEach(fill => {
      if (IS_REDUCED) { fill.style.transform = 'scaleX(1)'; return; }
      fill.style.animation = 'none';
      fill.offsetHeight;
      fill.style.animation = '';
    });
    barObs.unobserve(entry.target);
  });
}, { threshold: 0.4 });
document.querySelectorAll('.glass-tool').forEach(c => barObs.observe(c));

// ── SMOOTH SCROLL — anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h') || 72);
    window.scrollTo({ top: offset, behavior: IS_REDUCED ? 'instant' : 'smooth' });
  });
});

// ── TOUCH FEEDBACK — ripple on buttons ──
if (IS_TOUCH) {
  document.querySelectorAll('.btn-primary, .btn-outline, .btn-white').forEach(btn => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.addEventListener('touchstart', function(e) {
      const rect = this.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 2;
      Object.assign(ripple.style, {
        position: 'absolute',
        width: size + 'px', height: size + 'px',
        left: (x - size/2) + 'px', top: (y - size/2) + 'px',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '50%', pointerEvents: 'none',
        transform: 'scale(0)',
        animation: 'ripple .5s ease-out forwards'
      });
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }, { passive: true });
  });
  const style = document.createElement('style');
  style.textContent = '@keyframes ripple { to { transform: scale(1); opacity: 0; } }';
  document.head.appendChild(style);
}

// ── LAZY LOAD iframes — only load when near viewport ──
const iframeObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const iframe = entry.target;
    if (iframe.dataset.src) {
      iframe.src = iframe.dataset.src;
      delete iframe.dataset.src;
    }
    iframeObs.unobserve(iframe);
  });
}, { rootMargin: '200px' });
document.querySelectorAll('iframe[loading="lazy"]').forEach(iframe => {
  iframe.dataset.src = iframe.src;
  iframe.src = 'about:blank';
  iframeObs.observe(iframe);
});

// ── RESIZE HANDLER ──
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const hero = document.querySelector('.hero');
    if (hero) hero.style.minHeight = '';
  }, 150);
}, { passive: true });

// ── ORIENTATION CHANGE ──
window.addEventListener('orientationchange', () => {
  setTimeout(() => window.scrollTo({ top: window.scrollY }), 300);
}, { passive: true });


/* ══════════════════════════════════════════════════════
   PORTFLAIR PREMIUM BOOKING & SCHEDULING JS ENGINE
   Multi-step form · Week-slider calendar · Admin dashboard
   ══════════════════════════════════════════════════════ */

// ── UTILITY TOAST WRAPPER ──
function showToast(message, type = 'default') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast-message ${type}`;
  toast.setAttribute('role', 'alert');
  const icon = type === 'success'
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.2s';
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

// ── SCHEDULER WIDGET LOGIC ──
const schedulerState = {
  currentWeekOffset: 0,
  selectedDate: null,
  selectedTime: null,
  unavailableSlots: {}
};

function getWeekDays(offsetWeeks) {
  const days = [];
  const startDay = new Date();
  startDay.setDate(startDay.getDate() + 1 + (offsetWeeks * 7));
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

const timeSlotPills = [
  "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM",
  "07:00 PM", "08:00 PM", "08:30 PM"
];

function generateTimeSlots(dateISO) {
  const grid = document.getElementById('time-slots-grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!schedulerState.unavailableSlots[dateISO]) {
    const seed = parseInt(dateISO.replace(/-/g, ''));
    const taken = [];
    if (seed % 3 === 0) taken.push(timeSlotPills[0], timeSlotPills[3]);
    if (seed % 2 === 0) taken.push(timeSlotPills[2]);
    if (seed % 5 === 0) taken.push(timeSlotPills[1], timeSlotPills[5]);
    schedulerState.unavailableSlots[dateISO] = taken;
  }
  const takenSlots = schedulerState.unavailableSlots[dateISO];
  timeSlotPills.forEach(time => {
    const isTaken = takenSlots.includes(time);
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = `time-pill ${isTaken ? 'disabled' : ''}`;
    pill.textContent = time;
    pill.setAttribute('role', 'radio');
    if (isTaken) {
      pill.disabled = true;
      pill.setAttribute('aria-disabled', 'true');
    } else {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.time-pill').forEach(p => {
          p.classList.remove('selected');
          p.setAttribute('aria-checked', 'false');
        });
        pill.classList.add('selected');
        pill.setAttribute('aria-checked', 'true');
        schedulerState.selectedTime = time;
        validateCurrentStep();
      });
    }
    grid.appendChild(pill);
  });
}

function renderCalendar() {
  const track = document.getElementById('calendar-days-track');
  const dateLabel = document.getElementById('selected-date-label');
  if (!track) return;
  track.innerHTML = '';
  const days = getWeekDays(schedulerState.currentWeekOffset);
  days.forEach((date) => {
    const isoString = formatDateISO(date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayDate = date.getDate();
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'calendar-chip';
    chip.setAttribute('role', 'radio');
    chip.setAttribute('aria-label', date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }));
    const isWeekend = false;
    chip.innerHTML = `
      <span class="calendar-chip__day">${dayName}</span>
      <span class="calendar-chip__date">${dayDate}</span>
    `;
    if (!isWeekend) {
      if (schedulerState.selectedDate && formatDateISO(schedulerState.selectedDate) === isoString) {
        chip.classList.add('selected');
        chip.setAttribute('aria-checked', 'true');
      }
      chip.addEventListener('click', () => {
        document.querySelectorAll('.calendar-chip').forEach(c => {
          c.classList.remove('selected');
          c.setAttribute('aria-checked', 'false');
        });
        chip.classList.add('selected');
        chip.setAttribute('aria-checked', 'true');
        schedulerState.selectedDate = date;
        schedulerState.selectedTime = null;
        dateLabel.textContent = `Available slots for ${date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}`;
        generateTimeSlots(isoString);
        validateCurrentStep();
      });
    }
    track.appendChild(chip);
  });
  document.getElementById('cal-prev').disabled = schedulerState.currentWeekOffset === 0;
  document.getElementById('cal-next').disabled = schedulerState.currentWeekOffset >= 3;
}

const ADMIN_PIN = '2026'; // Change to a strong PIN before deploying.

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function safeUrl(url) {
  if (!url) return '#';
  try {
    const u = new URL(url);
    return (u.protocol === 'https:' || u.protocol === 'http:') ? url : '#';
  } catch (e) { return '#'; }
}

// ── BOOKING SYSTEM DATA & STATE ENGINE ──
const bookingState = {
  currentStep: 1,
  isDirectCall: false,
  formData: {
    client: { name: '', email: '', handle: '', source: '' },
    project: { types: [], budget: '', referenceUrl: '', details: '' },
    call: { mode: 'call', date: null, time: null, timezone: '', meetLink: '' }
  }
};

function trapFocus(containerEl) {
  const focusableEls = containerEl.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"]');
  const firstFocusableEl = focusableEls[0];
  const lastFocusableEl = focusableEls[focusableEls.length - 1];
  containerEl.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableEl) { lastFocusableEl.focus(); e.preventDefault(); }
      } else {
        if (document.activeElement === lastFocusableEl) { firstFocusableEl.focus(); e.preventDefault(); }
      }
    }
  });
}

function openBookingModal() {
  const existingSubmissions = JSON.parse(localStorage.getItem('arpan_bookings') || '[]');
  if (existingSubmissions.length > 0) {
    const lastSub = existingSubmissions[0];
    document.getElementById('client-name').value = lastSub.client.name;
    document.getElementById('client-email').value = lastSub.client.email;
    document.getElementById('client-handle').value = lastSub.client.handle || '';
    document.getElementById('client-source').value = lastSub.client.source;
  }
  const backdrop = document.getElementById('booking-backdrop');
  const modal = document.getElementById('booking-modal');
  backdrop.classList.add('active');
  modal.focus();
  trapFocus(modal);
  const isDirect = bookingState.isDirectCall;
  const titleEl = document.getElementById('modal-step-title');
  const descEl = document.getElementById('modal-step-desc');
  if (isDirect) {
    if (titleEl) titleEl.textContent = "Book a Video Consultation";
    if (descEl) descEl.textContent = "First, tell me about yourself, then choose your preferred time slot.";
  } else {
    if (titleEl) titleEl.textContent = "Tell me about yourself";
    if (descEl) descEl.textContent = "Let's start with who you are and how I can reach you.";
  }
  goToStep(1);
  validateCurrentStep();
}

function closeBookingModal(force = false) {
  if (!force && isFormDirty()) {
    const abandonDialog = document.getElementById('abandon-dialog');
    abandonDialog.classList.add('active');
    trapFocus(abandonDialog);
    return;
  }
  document.getElementById('booking-backdrop').classList.remove('active');
  clearAllErrors();
}

function isFormDirty() {
  if (bookingState.currentStep === 4) return false;
  const name = document.getElementById('client-name').value.trim();
  const email = document.getElementById('client-email').value.trim();
  const desc = document.getElementById('project-desc').value.trim();
  const typesSelected = document.querySelectorAll('.type-card.selected').length;
  return name !== '' || email !== '' || desc !== '' || typesSelected > 0;
}

function clearAllErrors() {
  document.querySelectorAll('.error-msg').forEach(el => el.remove());
  document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateCurrentStep() {
  let isValid = false;
  const nextBtn = document.getElementById('btn-booking-next');
  const submitBtn = document.getElementById('btn-booking-submit');
  if (bookingState.currentStep === 1) {
    const name = document.getElementById('client-name').value.trim();
    const email = document.getElementById('client-email').value.trim();
    const source = document.getElementById('client-source').value;
    isValid = name.length > 0 && validateEmail(email) && source !== '';
  } else if (bookingState.currentStep === 2) {
    const selectedTypes = document.querySelectorAll('.type-card.selected');
    isValid = selectedTypes.length > 0;
  } else if (bookingState.currentStep === 3) {
    const mode = bookingState.formData.call.mode;
    isValid = (mode === 'email' || mode === 'none')
      ? true
      : (schedulerState.selectedDate !== null && schedulerState.selectedTime !== null);
  } else if (bookingState.currentStep === 4) {
    isValid = true;
  }
  if (bookingState.currentStep === 3) {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'inline-flex';
    submitBtn.disabled = !isValid;
  } else if (bookingState.currentStep === 4) {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'none';
  } else {
    nextBtn.style.display = 'inline-flex';
    submitBtn.style.display = 'none';
    nextBtn.disabled = !isValid;
  }
}

function selectForkOption(val) {
  const card = document.querySelector(`.fork-card[data-value="${val}"]`);
  if (!card) return;
  document.querySelectorAll('.fork-card').forEach(c => {
    c.classList.remove('selected');
    c.setAttribute('aria-checked', 'false');
  });
  card.classList.add('selected');
  card.setAttribute('aria-checked', 'true');
  bookingState.formData.call.mode = val;
  const widget = document.getElementById('scheduler-widget');
  if (val === 'call') {
    if (widget) widget.classList.add('active');
    renderCalendar();
  } else {
    if (widget) widget.classList.remove('active');
    schedulerState.selectedDate = null;
    schedulerState.selectedTime = null;
  }
  validateCurrentStep();
}

function updateConsultationOptions() {
  const forkCards = document.querySelectorAll('.fork-card');
  const callCard = document.querySelector('.fork-card[data-value="call"]');
  const emailCard = document.querySelector('.fork-card[data-value="email"]');
  const noneCard = document.querySelector('.fork-card[data-value="none"]');
  if (!callCard || !emailCard || !noneCard) return;
  let budgetVal = 500;
  if (bookingState.isDirectCall) {
    budgetVal = 25;
  } else {
    const slider = document.getElementById('budget-slider');
    if (slider) budgetVal = parseInt(slider.value);
  }
  forkCards.forEach(card => {
    card.style.display = 'block';
    card.classList.remove('disabled', 'mandatory-highlight');
    card.style.pointerEvents = 'auto';
  });
  const defaultCallDesc = "We'll review video references and strategy face-to-face. (Recommended)";
  const callDescEl = callCard.querySelector('.fork-card__desc');
  if (callDescEl) callDescEl.textContent = defaultCallDesc;
  if (bookingState.isDirectCall) {
    emailCard.style.display = 'none';
    noneCard.style.display = 'none';
    selectForkOption('call');
    if (callDescEl) callDescEl.innerHTML = "Required: Includes a minimum $25 service by default to proceed with the booking.";
    callCard.classList.add('mandatory-highlight');
  } else if (budgetVal < 100) {
    callCard.style.display = 'none';
    if (bookingState.formData.call.mode === 'call') selectForkOption('email');
  } else if (budgetVal >= 500) {
    emailCard.style.display = 'none';
    noneCard.style.display = 'none';
    selectForkOption('call');
    if (callDescEl) callDescEl.innerHTML = "<strong>Mandatory for high-value orders ($500+):</strong> We need to align on specific project requirements face-to-face.";
    callCard.classList.add('mandatory-highlight');
  }
}

function goToStep(step) {
  clearAllErrors();
  if (bookingState.isDirectCall) {
    if (step === 2) {
      if (bookingState.currentStep === 1) step = 3;
      else if (bookingState.currentStep === 3) step = 1;
    }
  }
  if (step === 3) updateConsultationOptions();
  const activeStepEl = document.querySelector('.booking-step.active');
  const nextStepEl = document.getElementById(`step-${step}`);
  if (activeStepEl) activeStepEl.classList.remove('active');
  if (nextStepEl) {
    nextStepEl.classList.add('active');
    if (step > bookingState.currentStep) {
      nextStepEl.style.animation = 'stepForward 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards';
    } else {
      nextStepEl.style.animation = 'stepBack 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards';
    }
  }
  bookingState.currentStep = step;
  const isDirect = bookingState.isDirectCall;
  const seg2 = document.getElementById('prog-seg-2');
  const lbl2 = document.getElementById('prog-lbl-2');
  if (seg2 && lbl2) { seg2.style.display = isDirect ? 'none' : 'block'; lbl2.style.display = isDirect ? 'none' : 'inline'; }
  for (let i = 1; i <= 4; i++) {
    const seg = document.getElementById(`prog-seg-${i}`);
    const lbl = document.getElementById(`prog-lbl-${i}`);
    if (i < step) { seg.classList.add('completed'); seg.classList.remove('active'); lbl.classList.remove('active'); }
    else if (i === step) { seg.classList.add('active'); seg.classList.remove('completed'); lbl.classList.add('active'); }
    else { seg.classList.remove('active', 'completed'); lbl.classList.remove('active'); }
  }
  const prevBtn    = document.getElementById('btn-booking-prev');
  const nextBtn    = document.getElementById('btn-booking-next');
  const submitBtn  = document.getElementById('btn-booking-submit');
  const doneBtn    = document.getElementById('btn-booking-done');
  const skipBtn    = document.getElementById('btn-booking-skip');
  [prevBtn, nextBtn, submitBtn, doneBtn, skipBtn].forEach(b => { if (b) b.style.display = 'none'; });
  const budgetSlider = document.getElementById('budget-slider');
  const currentBudget = budgetSlider ? parseInt(budgetSlider.value) : 999;
  const showSkip = step === 3 && !bookingState.isDirectCall && currentBudget < 500;
  if (step === 1) {
    nextBtn.style.display = 'inline-flex';
  } else if (step === 2) {
    prevBtn.style.display = 'inline-flex';
    nextBtn.style.display = 'inline-flex';
  } else if (step === 3) {
    prevBtn.style.display = 'inline-flex';
    if (showSkip) skipBtn.style.display = 'inline-flex';
    submitBtn.style.display = 'inline-flex';
  } else if (step === 4) {
    doneBtn.style.display = 'inline-flex';
    const titleEl = document.getElementById('modal-step-title');
    const descEl  = document.getElementById('modal-step-desc');
    if (titleEl) titleEl.textContent = 'Thank you!';
    if (descEl)  descEl.textContent  = 'Your details have been successfully logged.';
  }
  const modalContainer = document.getElementById('booking-modal');
  if (step === 1) {
    modalContainer.setAttribute('aria-labelledby', 'modal-step-title');
    modalContainer.setAttribute('aria-describedby', 'modal-step-desc');
  } else {
    modalContainer.removeAttribute('aria-labelledby');
    modalContainer.removeAttribute('aria-describedby');
  }
  validateCurrentStep();
}

function addFieldValidationError(fieldId, errorText) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  const existingError = field.parentNode.querySelector('.error-msg');
  if (existingError) existingError.remove();
  field.classList.add('error');
  const errMsg = document.createElement('div');
  errMsg.className = 'error-msg';
  errMsg.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><span>${errorText}</span>`;
  field.parentNode.appendChild(errMsg);
}

function removeFieldValidationError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove('error');
  const existingError = field.parentNode.querySelector('.error-msg');
  if (existingError) existingError.remove();
}

function setupBlurValidation() {
  const nameInput = document.getElementById('client-name');
  const emailInput = document.getElementById('client-email');
  const sourceInput = document.getElementById('client-source');
  nameInput.addEventListener('blur', () => {
    if (nameInput.value.trim().length === 0) {
      addFieldValidationError('client-name', "Please enter your name so we know who we're talking to.");
    } else { removeFieldValidationError('client-name'); }
    validateCurrentStep();
  });
  emailInput.addEventListener('blur', () => {
    const val = emailInput.value.trim();
    if (val.length === 0) {
      addFieldValidationError('client-email', "Email is required to coordinate details.");
    } else if (!validateEmail(val)) {
      addFieldValidationError('client-email', "This doesn't look like a valid email address.");
    } else { removeFieldValidationError('client-email'); }
    validateCurrentStep();
  });
  sourceInput.addEventListener('change', () => {
    if (sourceInput.value === '') {
      addFieldValidationError('client-source', "Please let us know how you found us.");
    } else { removeFieldValidationError('client-source'); }
    validateCurrentStep();
  });
  nameInput.addEventListener('input', validateCurrentStep);
  emailInput.addEventListener('input', validateCurrentStep);
}

// ── SUBMISSION PROCESSING ──
async function submitBooking(bookingData) {
  const bookings = JSON.parse(localStorage.getItem('arpan_bookings') || '[]');
  bookings.unshift(bookingData);
  localStorage.setItem('arpan_bookings', JSON.stringify(bookings));
  const payload = {
    access_key: "adff26fa-2fbc-4c92-8c91-5f0ab7fc003d",
    botcheck: document.getElementById('botcheck')?.checked || false,
    name: bookingData.client.name,
    email: bookingData.client.email,
    "Brand Handle": bookingData.client.handle || "None provided",
    "How they found you": bookingData.client.source || "Not specified",
    "Project Types": bookingData.project.types.join(", ") || "None selected",
    "Budget Tier": bookingData.project.budget,
    "Reference Video Link": bookingData.project.referenceUrl || "None provided",
    "Project Details": bookingData.project.details || "None provided",
    "Consultation Option": bookingData.call.mode,
    "Timezone": bookingData.call.timezone,
    "Consultation Date": bookingData.call.date || "N/A",
    "Consultation Time": bookingData.call.time || "N/A",
    "Meeting Link": bookingData.call.meetLink || "N/A",
    "subject": "New Project Booking: " + bookingData.client.name,
    "from_name": "Arpan Creations Portfolio"
  };
  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (response.status === 200 || result.success) {
    return { success: true };
  } else {
    console.error("Web3Forms error:", result);
    throw new Error(result.message || "Failed to submit form to Web3Forms");
  }
}

function processBookingSubmission() {
  const submitBtn = document.getElementById('btn-booking-submit');
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span>● Processing...</span>`;
  submitBtn.setAttribute('aria-busy', 'true');
  bookingState.formData.client.name = document.getElementById('client-name').value.trim();
  bookingState.formData.client.email = document.getElementById('client-email').value.trim();
  bookingState.formData.client.handle = document.getElementById('client-handle').value.trim();
  bookingState.formData.client.source = document.getElementById('client-source').value;
  if (bookingState.isDirectCall) {
    bookingState.formData.project.types = ["Direct Video Call (includes $25 service)"];
    bookingState.formData.project.budget = "$25";
    bookingState.formData.project.referenceUrl = "";
    bookingState.formData.project.details = "Direct video call scheduled.";
  } else {
    const selectedTypes = [];
    document.querySelectorAll('.type-card.selected').forEach(card => {
      selectedTypes.push(card.getAttribute('data-value'));
    });
    bookingState.formData.project.types = selectedTypes;
    const slider = document.getElementById('budget-slider');
    const val = slider ? parseInt(slider.value) : 500;
    bookingState.formData.project.budget = val > 1000 ? 'Custom ($1,000+)' : `$${val}`;
    bookingState.formData.project.referenceUrl = document.getElementById('project-link').value.trim();
    bookingState.formData.project.details = document.getElementById('project-desc').value.trim();
  }
  const meetCode = Math.random().toString(36).substring(2, 7);
  bookingState.formData.call.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  if (bookingState.formData.call.mode === 'call') {
    bookingState.formData.call.date = schedulerState.selectedDate ? formatDateISO(schedulerState.selectedDate) : null;
    bookingState.formData.call.time = schedulerState.selectedTime;
    bookingState.formData.call.meetLink = `https://meet.arpancreations.com/call-${meetCode}`;
  } else {
    bookingState.formData.call.date = null;
    bookingState.formData.call.time = null;
    bookingState.formData.call.meetLink = '';
  }
  const fullBookingObj = {
    id: "BK-" + Date.now(),
    submittedAt: new Date().toISOString(),
    status: bookingState.formData.call.mode === 'call' ? 'scheduled' : 'pending',
    client: { ...bookingState.formData.client },
    project: { ...bookingState.formData.project },
    call: { ...bookingState.formData.call }
  };
  submitBooking(fullBookingObj).then(res => {
    if (res.success) {
      showToast("Booking submitted successfully!", "success");
      document.getElementById('sum-name').textContent = fullBookingObj.client.name;
      const tagsContainer = document.getElementById('sum-types');
      tagsContainer.innerHTML = '';
      fullBookingObj.project.types.forEach(t => {
        const tag = document.createElement('span');
        tag.className = 'summary-tag';
        tag.textContent = t;
        tagsContainer.appendChild(tag);
      });
      document.getElementById('sum-budget').textContent = fullBookingObj.project.budget;
      const scheduleRow = document.getElementById('sum-schedule-row');
      const meetContainer = document.getElementById('sum-meet-container');
      if (fullBookingObj.call.mode === 'call') {
        scheduleRow.style.display = 'flex';
        meetContainer.style.display = 'block';
        const d = new Date(fullBookingObj.call.date);
        const formattedDate = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        document.getElementById('sum-schedule').textContent = `${formattedDate} · ${fullBookingObj.call.time}`;
        const linkEl = document.getElementById('sum-meet-url');
        linkEl.href = fullBookingObj.call.meetLink;
        linkEl.textContent = fullBookingObj.call.meetLink.replace('https://', '');
      } else if (fullBookingObj.call.mode === 'email') {
        scheduleRow.style.display = 'flex';
        document.getElementById('sum-schedule').textContent = "Consult via Email";
        meetContainer.style.display = 'none';
      } else {
        scheduleRow.style.display = 'flex';
        document.getElementById('sum-schedule').textContent = "None (Skipped)";
        meetContainer.style.display = 'none';
      }
      goToStep(4);
      const headerTitle = document.getElementById('modal-step-title');
      const headerDesc  = document.getElementById('modal-step-desc');
      headerTitle.textContent = `You're all set, ${fullBookingObj.client.name.split(' ')[0]}!`;
      headerDesc.textContent  = "We'll review your details and connect shortly.";
      const footer = document.getElementById('modal-footer');
      const oldIcs = document.getElementById('btn-download-ics');
      if (oldIcs) oldIcs.remove();
      // ── GUARD: only trigger Cal.com booking if mode is 'call' AND date+time are set ──
      if (fullBookingObj.call.mode === 'call' &&
          fullBookingObj.call.date && fullBookingObj.call.time) {
        const [year, month, day] = fullBookingObj.call.date.split('-').map(Number);
        const timeParts = fullBookingObj.call.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        let hours = timeParts ? parseInt(timeParts[1]) : 10;
        const mins = timeParts ? parseInt(timeParts[2]) : 0;
        const ampm = timeParts ? timeParts[3].toUpperCase() : 'AM';
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        const callDateTime = new Date(year, month - 1, day, hours, mins);
        const icsBtn = document.createElement('button');
        icsBtn.className = 'btn-booking btn-booking--prev';
        icsBtn.id = 'btn-download-ics';
        icsBtn.type = 'button';
        icsBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> Add to Calendar`;
        icsBtn.addEventListener('click', () => { downloadICS(callDateTime, fullBookingObj.call.meetLink); });
        footer.insertBefore(icsBtn, document.getElementById('btn-booking-done'));
        scheduleSilentCalBooking(fullBookingObj);
      }
    }
  }).catch(() => {
    showToast("Submission failed. Please try again.", "error");
    submitBtn.disabled = false;
    submitBtn.innerHTML = `Submit Request`;
    submitBtn.removeAttribute('aria-busy');
  });
}

// ── CAL.COM BOOKING API CALL ──
async function bookSlot(name, email, selectedDateTime, timezone) {
  const response = await fetch('/api/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, start: selectedDateTime, timeZone: timezone })
  });
  const result = await response.json();
  if (!response.ok || result.status !== 'success') {
    throw new Error(result.message || JSON.stringify(result));
  }
  return result;
}

// ── CAL.COM SILENT BACKGROUND BOOKING ──
// BUG FIX: Added null-guard — only called when call.mode === 'call' AND date+time are both set.
// Previously, if call.date was null (email/skip mode), bookingObj.call.date.split('-')
// would throw a TypeError, silently killing the booking before any network request was sent.
async function scheduleSilentCalBooking(bookingObj) {
  // Safety guard: bail out if date or time is missing (should not reach here, but defensive)
  if (!bookingObj.call.date || !bookingObj.call.time) {
    console.warn('[Cal.com] Skipped: call.date or call.time is null.');
    return;
  }
  try {
    const [year, month, day] = bookingObj.call.date.split('-').map(Number);
    const timeParts = bookingObj.call.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    let hours = timeParts ? parseInt(timeParts[1]) : 10;
    const mins  = timeParts ? parseInt(timeParts[2]) : 0;
    const ampm  = timeParts ? timeParts[3].toUpperCase() : 'AM';
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    const localDt = new Date(year, month - 1, day, hours, mins);
    const startISO = localDt.toISOString();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Calcutta';
    const name = document.getElementById('client-name').value.trim() || bookingObj.client.name;
    const email = document.getElementById('client-email').value.trim() || bookingObj.client.email;
    const result = await bookSlot(name, email, startISO, tz);
    console.info('[Cal.com] Booking created successfully ✓', result);
  } catch (e) {
    console.error('[Cal.com] Booking failed:', e.message);
    showToast("Cal booking debug: " + e.message, "error");
  }
}

function downloadICS(dateTime, meetLink) {
  const start = dateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const end = new Date(dateTime.getTime() + 15 * 60000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:Video Consultation – Arpan Creations\nDESCRIPTION:Join at ${meetLink}\nLOCATION:${meetLink}\nEND:VEVENT\nEND:VCALENDAR`;
  const blob = new Blob([ics], { type: 'text/calendar' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'arpan-creations-call.ics';
  a.click();
}

// ── ADMIN BOOKINGS DASHBOARD RENDER ──
function renderAdminDashboard() {
  const grid = document.getElementById('admin-bookings-grid');
  const countBadge = document.getElementById('admin-booking-count');
  const emptyState = document.getElementById('admin-empty');
  if (!grid) return;
  grid.innerHTML = '';
  const bookings = JSON.parse(localStorage.getItem('arpan_bookings') || '[]');
  countBadge.textContent = `${bookings.length} Bookings`;
  const activeFilter = document.querySelector('.filter-pill.active').getAttribute('data-filter');
  const filtered = bookings.filter(b => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return b.status === 'pending';
    if (activeFilter === 'scheduled') return b.status === 'scheduled';
    if (activeFilter === 'reviewed') return b.status === 'reviewed';
    return true;
  });
  if (filtered.length === 0) {
    emptyState.style.display = 'flex';
    grid.style.display = 'none';
    return;
  }
  emptyState.style.display = 'none';
  grid.style.display = 'grid';
  filtered.forEach(b => {
    const card = document.createElement('div');
    card.className = 'bento-card';
    card.setAttribute('data-id', b.id);
    const dateFormatted = new Date(b.submittedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    let statusClass = b.status;
    let callSnippet = '';
    if (b.call.mode === 'call' && b.call.date) {
      const callDateStr = new Date(b.call.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
      callSnippet = `
        <div class="card-schedule">
          <div class="card-schedule__time">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="4"></line><line x1="8" y1="2" x2="8" y2="4"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            ${escHtml(callDateStr)} @ ${escHtml(b.call.time)} (${escHtml(b.call.timezone.split('/').pop().replace('_', ' '))})
          </div>
          <a class="card-schedule__meet" href="${safeUrl(b.call.meetLink)}" target="_blank" rel="noopener noreferrer">${escHtml(b.call.meetLink.replace('https://', ''))}</a>
        </div>
      `;
    }
    let typesTags = '';
    b.project.types.forEach(t => { typesTags += `<span class="card-tag">${escHtml(t)}</span>`; });
    const detailsExcerpt = b.project.details
      ? `<div class="card-details"><p class="card-details__text collapsed">${escHtml(b.project.details)}</p><button class="card-details__toggle" type="button">Read more</button></div>`
      : '';
    card.innerHTML = `
      <div class="card-top">
        <div><h4 class="card-client__name">${escHtml(b.client.name)}</h4><span class="card-client__source">Source: ${escHtml(b.client.source)}</span></div>
        <span class="card-status ${escHtml(statusClass)}">${escHtml(b.status)}</span>
      </div>
      <div class="card-middle">
        <div class="card-tags">${typesTags}<span class="card-tag card-tag--budget">${escHtml(b.project.budget)} Tier</span></div>
        ${b.project.referenceUrl ? `<p style="font-size:12px;margin-bottom:8px;">Ref: <a href="${safeUrl(b.project.referenceUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--color-primary-hover);text-decoration:underline;">${escHtml(b.project.referenceUrl)}</a></p>` : ''}
        ${detailsExcerpt}
        ${callSnippet}
        <div style="font-size:11px;color:var(--text-disabled);margin-top:10px;">Submitted: ${escHtml(dateFormatted)}</div>
      </div>
      <div class="card-bottom">
        <a class="card-email" href="mailto:${escHtml(b.client.email)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          ${escHtml(b.client.email)}
        </a>
        <div class="card-actions">
          ${b.status !== 'reviewed' ? `<button class="card-action-btn card-action-btn--check" title="Mark as Reviewed" onclick="markBookingReviewed('${escHtml(b.id)}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></button>` : ''}
          <button class="card-action-btn card-action-btn--delete" title="Delete Booking" onclick="deleteBookingEntry('${escHtml(b.id)}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
        </div>
      </div>
    `;
    const toggleBtn = card.querySelector('.card-details__toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const text = card.querySelector('.card-details__text');
        if (text.classList.contains('collapsed')) { text.classList.remove('collapsed'); toggleBtn.textContent = 'Read less'; }
        else { text.classList.add('collapsed'); toggleBtn.textContent = 'Read more'; }
      });
    }
    grid.appendChild(card);
  });
}

window.markBookingReviewed = function(id) {
  const bookings = JSON.parse(localStorage.getItem('arpan_bookings') || '[]');
  const index = bookings.findIndex(b => b.id === id);
  if (index > -1) {
    bookings[index].status = 'reviewed';
    localStorage.setItem('arpan_bookings', JSON.stringify(bookings));
    showToast("Booking marked as reviewed.", "success");
    renderAdminDashboard();
  }
};

window.deleteBookingEntry = function(id) {
  if (confirm("Are you sure you want to delete this booking request?")) {
    const bookings = JSON.parse(localStorage.getItem('arpan_bookings') || '[]');
    const filtered = bookings.filter(b => b.id !== id);
    localStorage.setItem('arpan_bookings', JSON.stringify(filtered));
    showToast("Booking request removed.");
    renderAdminDashboard();
  }
};

function updateBudgetSlider() {
  const slider = document.getElementById('budget-slider');
  const display = document.getElementById('budget-amount-display');
  const tierName = document.getElementById('budget-tier-name');
  const tierBadge = document.getElementById('budget-tier-badge');
  const tierDesc = document.getElementById('budget-tier-desc');
  const featuresList = document.getElementById('budget-tier-features');
  const promptBox = document.getElementById('consultation-prompt');
  if (!slider) return;
  const val = parseInt(slider.value);
  let tier = 'Starter', desc = '', badgeText = '', features = [], showPrompt = false;
  if (val <= 250) {
    tier = 'Starter Tier'; badgeText = 'Basic';
    desc = '60s reel, 15min raw, transitions, music, 1080p HD, 2 revisions, 24-hour delivery';
    features = ['Up to 15 minutes of footage provided', 'Up to 1 minute running time', 'Sound design & mixing'];
    if (display) display.textContent = `$${val}`;
  } else if (val <= 750) {
    tier = 'Growth Tier'; badgeText = 'Popular';
    desc = '90s short, 30min raw, captions, grading, SFX, 4K, 3 revisions, 24-hour delivery';
    features = ['Up to 30 minutes of footage provided', 'Up to 1 minute running time', 'Color grading', 'Sound design & mixing', 'Motion graphics', 'Subtitles'];
    if (display) display.textContent = `$${val}`;
  } else if (val <= 1000) {
    tier = 'Premium Tier'; badgeText = 'Professional';
    desc = '3min video, 60min raw, branding, VFX, thumbnail, source file, unlimited revisions';
    features = ['Up to 60 minutes of footage provided', 'Up to 3 minutes running time', 'Color grading', 'Sound design & mixing', 'Motion graphics', 'Subtitles', 'Thumbnail included', 'Include source file'];
    if (display) display.textContent = `$${val}`;
  } else {
    tier = 'Custom Tier'; badgeText = 'Consultation';
    desc = 'For large projects requiring custom resources and scale.';
    features = ['Tailored asset design and custom branding', 'Dedicated collaborative post-production pipeline', 'Flexible budgeting built around deliverables'];
    if (display) display.textContent = '>$1,000';
    showPrompt = true;
  }
  if (tierName) tierName.textContent = tier;
  if (tierBadge) { tierBadge.textContent = badgeText; tierBadge.className = `badge-${badgeText.toLowerCase()}`; }
  if (tierDesc) tierDesc.textContent = desc;
  if (featuresList) {
    featuresList.innerHTML = '';
    features.forEach(f => { const li = document.createElement('li'); li.textContent = f; featuresList.appendChild(li); });
  }
  if (promptBox) promptBox.style.display = showPrompt ? 'flex' : 'none';
  bookingState.formData.project.budget = val > 1000 ? 'Custom ($1,000+)' : `$${val}`;
}

// ── BOOTSTRAP EVENT BINDINGS ──
function initBookingSystem() {
  document.querySelectorAll('#btn-start-project, #nav-start-project').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); bookingState.isDirectCall = false; openBookingModal(); });
  });
  document.querySelectorAll('#btn-book-call').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); bookingState.isDirectCall = true; openBookingModal(); });
  });
  document.getElementById('btn-close-booking').addEventListener('click', () => closeBookingModal(false));
  document.getElementById('booking-backdrop').addEventListener('click', (e) => {
    if (e.target === document.getElementById('booking-backdrop')) closeBookingModal(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const backdrop = document.getElementById('booking-backdrop');
      const adminDash = document.getElementById('admin-dashboard');
      const abandonDialog = document.getElementById('abandon-dialog');
      if (abandonDialog.classList.contains('active')) { abandonDialog.classList.remove('active'); }
      else if (backdrop.classList.contains('active')) { closeBookingModal(false); }
      else if (adminDash.classList.contains('active')) { window.location.hash = ''; }
    }
  });
  document.getElementById('btn-abandon-stay').addEventListener('click', () => {
    document.getElementById('abandon-dialog').classList.remove('active');
    document.getElementById('booking-modal').focus();
  });
  document.getElementById('btn-abandon-leave').addEventListener('click', () => {
    document.getElementById('abandon-dialog').classList.remove('active');
    closeBookingModal(true);
  });
  document.getElementById('btn-booking-prev').addEventListener('click', () => {
    if (bookingState.currentStep > 1) goToStep(bookingState.currentStep - 1);
  });
  document.getElementById('btn-booking-skip').addEventListener('click', () => {
    bookingState.formData.call.mode = 'none';
    processBookingSubmission();
  });
  document.getElementById('btn-booking-next').addEventListener('click', () => {
    if (bookingState.currentStep < 3) goToStep(bookingState.currentStep + 1);
  });
  document.getElementById('btn-booking-submit').addEventListener('click', processBookingSubmission);
  document.getElementById('btn-booking-done').addEventListener('click', () => { closeBookingModal(true); });
  setupBlurValidation();
  document.querySelectorAll('.type-card').forEach(card => {
    const toggleCard = () => {
      const isSelected = card.classList.contains('selected');
      if (isSelected) { card.classList.remove('selected'); card.setAttribute('aria-checked', 'false'); }
      else { card.classList.add('selected'); card.setAttribute('aria-checked', 'true'); card.focus(); }
      validateCurrentStep();
    };
    card.addEventListener('click', toggleCard);
    card.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleCard(); } });
  });
  const budgetSlider = document.getElementById('budget-slider');
  if (budgetSlider) { budgetSlider.addEventListener('input', updateBudgetSlider); updateBudgetSlider(); }
  const textarea = document.getElementById('project-desc');
  const charCounter = document.getElementById('char-counter');
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 250) + 'px';
    const len = textarea.value.length;
    charCounter.textContent = `${len} / 500 characters`;
    charCounter.style.color = len >= 500 ? 'var(--color-error)' : 'var(--text-secondary)';
  });
  document.querySelectorAll('.fork-card').forEach(card => {
    const selectFork = () => {
      document.querySelectorAll('.fork-card').forEach(c => { c.classList.remove('selected'); c.setAttribute('aria-checked', 'false'); });
      card.classList.add('selected');
      card.setAttribute('aria-checked', 'true');
      const val = card.getAttribute('data-value');
      bookingState.formData.call.mode = val;
      const widget = document.getElementById('scheduler-widget');
      if (val === 'call') { widget.classList.add('active'); renderCalendar(); }
      else { widget.classList.remove('active'); schedulerState.selectedDate = null; schedulerState.selectedTime = null; }
      validateCurrentStep();
    };
    card.addEventListener('click', selectFork);
    card.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); selectFork(); } });
  });
  const checkHashRoute = () => {
    const isDashboard = window.location.hash === '#admin-bookings';
    const adminDash = document.getElementById('admin-dashboard');

    if (isDashboard) {
      const sessionOk = sessionStorage.getItem('admin_auth') === 'true';
      if (!sessionOk) {
        const input = prompt('Enter admin PIN to access bookings:');
        if (input !== ADMIN_PIN) {
          window.location.hash = '';
          alert('Incorrect PIN. Access denied.');
          return;
        }
        sessionStorage.setItem('admin_auth', 'true');
      }
      adminDash.classList.add('active');
      adminDash.focus();
      trapFocus(adminDash);
      renderAdminDashboard();
    } else {
      adminDash.classList.remove('active');
    }
  };
  window.addEventListener('hashchange', checkHashRoute);
  window.addEventListener('DOMContentLoaded', checkHashRoute);
  document.getElementById('btn-admin-close').addEventListener('click', () => { window.location.hash = ''; });
  document.getElementById('btn-admin-clear').addEventListener('click', () => {
    const bookings = JSON.parse(localStorage.getItem('arpan_bookings') || '[]');
    if (bookings.length === 0) { showToast("No bookings currently logged."); return; }
    if (confirm("WARNING: Are you sure you want to permanently clear all booking records? This cannot be undone.")) {
      localStorage.removeItem('arpan_bookings');
      showToast("All bookings cleared.");
      renderAdminDashboard();
    }
  });
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => { p.classList.remove('active'); p.setAttribute('aria-selected', 'false'); });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      renderAdminDashboard();
    });
  });
}

initBookingSystem();

/* ── Clients Carousel ── */
// ── PERSPECTIVE CAROUSEL CONTROLLER ──
(function () {
  const carousel = document.getElementById('perspective-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('#pc-track');
  const slides = Array.from(carousel.querySelectorAll('.pc-slide'));
  const prevBtn = carousel.querySelector('.pc-btn--prev');
  const nextBtn = carousel.querySelector('.pc-btn--next');
  const dots = Array.from(carousel.querySelectorAll('.pc-dot'));
  const counter = carousel.querySelector('#pc-counter');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const total = slides.length;
  const loop = false;

  function getSlideWidth() {
    return slides[0].getBoundingClientRect().width || (window.innerWidth <= 480 ? 240 : window.innerWidth <= 768 ? 280 : 365);
  }

  function getRotationStep() {
    if (window.innerWidth <= 480) return 18;
    if (window.innerWidth <= 768) return 22;
    return 26;
  }

  function update() {
    const slideWidth = getSlideWidth();
    const rotationStep = getRotationStep();
    const inactiveScale = window.innerWidth <= 480 ? 0.90 : 0.86;

    // Center active slide horizontally via CSS variable --tx
    // This preserves translateY(-50%) defined in CSS perfectly!
    const translateX = -(currentIndex * slideWidth + slideWidth / 2);
    track.style.setProperty('--tx', `${translateX}px`);

    slides.forEach((slide, index) => {
      const inner = slide.querySelector('.pc-card-wrap');
      const label = slide.querySelector('.pc-label');
      const isActive = index === currentIndex;
      const diff = currentIndex - index;
      const rotateY = diff * rotationStep;
      const scale = isActive ? 1 : inactiveScale;
      const zIndex = 10 - Math.abs(diff);
      const opacity = isActive ? 1 : 0.88;

      slide.classList.toggle('pc-active', isActive);

      if (inner) {
        inner.style.transform = `rotateY(${rotateY}deg) scale(${scale})`;
        inner.style.zIndex = zIndex;
        inner.style.opacity = opacity;
      }

      if (label) {
        label.style.filter = 'none';
        label.style.opacity = isActive ? '1' : '0.75';
      }
    });

    // Update dots
    dots.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle('pc-dot--active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    // Update counter
    if (counter) {
      counter.textContent = String(currentIndex + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
    }

    // Update button states
    if (!loop) {
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === total - 1;
    }
  }

  function selectSlide(nextIndex) {
    if (loop) {
      currentIndex = ((nextIndex % total) + total) % total;
    } else {
      currentIndex = Math.max(0, Math.min(nextIndex, total - 1));
    }
    update();
  }

  if (prevBtn) prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectSlide(currentIndex - 1);
  });
  
  if (nextBtn) nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectSlide(currentIndex + 1);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      selectSlide(index);
    });
  });

  slides.forEach((slide, index) => {
    slide.addEventListener('click', (e) => {
      // Don't intercept clicks on links or buttons inside active slide
      if (e.target.closest('a') || e.target.closest('button')) {
        return;
      }
      if (currentIndex !== index) {
        e.preventDefault();
        selectSlide(index);
      }
    });
  });

  // Touch Swipe with deliberate horizontal threshold to avoid accidental triggers
  let sx = 0, sy = 0, isTouching = false;
  carousel.addEventListener('touchstart', (e) => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
    isTouching = true;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    if (!isTouching) return;
    isTouching = false;
    const dx = sx - e.changedTouches[0].clientX;
    const dy = Math.abs(sy - e.changedTouches[0].clientY);
    // Only slide if horizontal swipe is clearly dominant and exceeds 55px
    if (Math.abs(dx) > 55 && Math.abs(dx) > dy * 1.5) {
      selectSlide(dx > 0 ? currentIndex + 1 : currentIndex - 1);
    }
  }, { passive: true });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const rect = carousel.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      selectSlide(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      selectSlide(currentIndex + 1);
    }
  });

  window.addEventListener('resize', update, { passive: true });

  // Initial render
  update();
})();

// ── WORK (PORTFOLIO) 3D PERSPECTIVE CAROUSEL CONTROLLER ──
(function () {
  const carousel = document.getElementById('work-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('#work-pc-track');
  const slides = Array.from(carousel.querySelectorAll('.work-pc-slide'));
  const prevBtn = carousel.querySelector('.work-pc-btn--prev');
  const nextBtn = carousel.querySelector('.work-pc-btn--next');
  const dots = Array.from(carousel.querySelectorAll('.work-pc-dot'));
  const counter = carousel.querySelector('#work-pc-counter');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const total = slides.length;
  const loop = false;

  function getSlideWidth() {
    return slides[0].getBoundingClientRect().width || (window.innerWidth <= 480 ? 290 : window.innerWidth <= 768 ? 360 : 530);
  }

  function getRotationStep() {
    if (window.innerWidth <= 480) return 20;
    if (window.innerWidth <= 768) return 28;
    return 36;
  }

  function update() {
    const slideWidth = getSlideWidth();
    const rotationStep = getRotationStep();
    const inactiveScale = window.innerWidth <= 480 ? 0.90 : 0.86;

    // Center active slide horizontally via CSS variable --wtx
    const translateX = -(currentIndex * slideWidth + slideWidth / 2);
    track.style.setProperty('--wtx', `${translateX}px`);

    slides.forEach((slide, index) => {
      const inner = slide.querySelector('.work-pc-card-wrap');
      const label = slide.querySelector('.work-pc-label');
      const isActive = index === currentIndex;
      const diff = currentIndex - index;
      const rotateY = diff * rotationStep;
      const scale = isActive ? 1 : inactiveScale;
      const zIndex = 10 - Math.abs(diff);
      const opacity = isActive ? 1 : Math.max(0.70, 1 - Math.abs(diff) * 0.20);

      slide.classList.toggle('pc-active', isActive);

      if (inner) {
        inner.style.transform = `rotateY(${rotateY}deg) scale(${scale})`;
        inner.style.zIndex = zIndex;
        inner.style.opacity = opacity;
      }

      if (label) {
        label.style.filter = isActive ? 'blur(0px)' : 'blur(2px)';
        label.style.opacity = isActive ? '1' : '0';
      }
    });

    // Update dots
    dots.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle('work-pc-dot--active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    // Update counter
    if (counter) {
      counter.textContent = String(currentIndex + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
    }

    // Update button states
    if (!loop) {
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === total - 1;
    }
  }

  function selectSlide(nextIndex) {
    if (loop) {
      currentIndex = ((nextIndex % total) + total) % total;
    } else {
      currentIndex = Math.max(0, Math.min(nextIndex, total - 1));
    }
    update();
  }

  if (prevBtn) prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectSlide(currentIndex - 1);
  });

  if (nextBtn) nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectSlide(currentIndex + 1);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      selectSlide(index);
    });
  });

  slides.forEach((slide, index) => {
    slide.addEventListener('click', (e) => {
      if (currentIndex !== index) {
        e.preventDefault();
        selectSlide(index);
      }
    });
  });

  // Touch Swipe with deliberate horizontal threshold
  let sx = 0, sy = 0, isTouching = false;
  carousel.addEventListener('touchstart', (e) => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
    isTouching = true;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    if (!isTouching) return;
    isTouching = false;
    const dx = sx - e.changedTouches[0].clientX;
    const dy = Math.abs(sy - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 55 && Math.abs(dx) > dy * 1.5) {
      selectSlide(dx > 0 ? currentIndex + 1 : currentIndex - 1);
    }
  }, { passive: true });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const rect = carousel.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      selectSlide(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      selectSlide(currentIndex + 1);
    }
  });

  window.addEventListener('resize', update, { passive: true });

  // Initial render
  update();
})();
