/* ============================================================
   phone.js — OS Switcher, Theme Toggle, Clock, Navigation
   Space Observatory Portfolio
   ============================================================ */

(function () {
  'use strict';

  /* ── Theme ─────────────────────────────────────────────── */
  function initTheme() {
    const btn  = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const saved = localStorage.getItem('portfolio-theme') || 'dark';
    html.setAttribute('data-theme', saved);
    updateThemeIcon(saved);

    if (!btn) return;
    btn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next    = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('portfolio-theme', next);
      updateThemeIcon(next);
    });
  }

  function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  /* ── OS Switcher ────────────────────────────────────────── */
  function initOSSwitcher() {
    const phone  = document.getElementById('phone');
    const btns   = document.querySelectorAll('.os-btn');
    if (!phone) return;

    const saved = localStorage.getItem('portfolio-os') || 'android';
    setOS(saved);

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const os = btn.dataset.os;
        setOS(os);
        localStorage.setItem('portfolio-os', os);
      });
    });

    function setOS(os) {
      phone.className = 'phone ' + os;
      btns.forEach(b => b.classList.toggle('active', b.dataset.os === os));
      updateStatusBar(os);
    }
  }

  /* ── Status Bar clock & icons ───────────────────────────── */
  function initClock() {
    const timeEl = document.getElementById('status-time');
    if (!timeEl) return;
    function tick() {
      const now = new Date();
      let h = now.getHours(), m = now.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      timeEl.textContent = `${h}:${m.toString().padStart(2,'0')} ${ampm}`;
    }
    tick();
    setInterval(tick, 15000);
  }

  function updateStatusBar(os) {
    const dateEl = document.getElementById('status-date');
    if (!dateEl) return;
    const now  = new Date();
    const opts = { month: 'short', day: 'numeric' };
    if (os === 'windows') {
      dateEl.textContent = now.toLocaleDateString('en-US', opts);
    } else if (os === 'ios') {
      dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      dateEl.textContent = now.toLocaleDateString('en-US', opts);
    }
  }

  /* ── In-phone Navigation ────────────────────────────────── */
  // Screen management: show/hide screens within the phone
  function initNavigation() {
    // App icon clicks
    document.querySelectorAll('[data-app]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const app = el.dataset.app;
        showApp(app);
      });
    });

    // Back buttons — only .back-btn class, not .game-btn
    document.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showHome();
      });
    });

    // Android back
    const androidBack = document.getElementById('android-back');
    if (androidBack) androidBack.addEventListener('click', () => showHome());

    // Android home
    const androidHome = document.getElementById('android-home');
    if (androidHome) androidHome.addEventListener('click', () => showHome());
  }

  function showHome() {
    const homeScreen = document.getElementById('home-screen');
    const appScreens = document.querySelectorAll('.app-screen');

    appScreens.forEach(s => {
      s.style.display = 'none';
    });
    if (homeScreen) {
      homeScreen.style.display = 'flex';
      homeScreen.classList.add('page-fade');
    }
  }

  function showApp(appId) {
    const homeScreen = document.getElementById('home-screen');
    const appScreens = document.querySelectorAll('.app-screen');

    if (homeScreen) homeScreen.style.display = 'none';
    appScreens.forEach(s => {
      s.style.display = s.id === `app-${appId}` ? 'block' : 'none';
      if (s.id === `app-${appId}`) {
        s.classList.add('page-fade');
        s.scrollTop = 0;
      }
    });
  }

  /* ── Skill bar animation ────────────────────────────────── */
  function initSkillBars() {
    const bars = document.querySelectorAll('.skill-bar-fill');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target.dataset.width;
          entry.target.style.width = target;
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    bars.forEach(bar => {
      const width = bar.dataset.width;
      bar.style.width = '0%';
      observer.observe(bar);
    });
  }

  /* ── Dock icon glow on hover ────────────────────────────── */
  function initIconEffects() {
    document.querySelectorAll('.app-icon').forEach(icon => {
      icon.addEventListener('mouseenter', () => {
        const img = icon.querySelector('.app-icon-img');
        if (img) img.style.animation = 'iconGlow 1.5s ease infinite';
      });
      icon.addEventListener('mouseleave', () => {
        const img = icon.querySelector('.app-icon-img');
        if (img) img.style.animation = '';
      });
    });
  }

  /* ── Boot ───────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initOSSwitcher();
    initClock();
    initNavigation();
    initSkillBars();
    initIconEffects();
  });

  // Expose for chatbot.js
  window.PortfolioNav = { showApp, showHome };

})();