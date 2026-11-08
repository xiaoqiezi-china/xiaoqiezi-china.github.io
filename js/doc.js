
  /* ---------- 顶栏滚动 ---------- */
  const nav = document.querySelector('[data-nav]');
  function navScroll() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 6);
  }
  window.addEventListener('scroll', navScroll, { passive: true });
  navScroll();

/* DPCL 教程页 · 目录高亮、阅读进度、图片灯箱、复制代码（零依赖） */
'use strict';

(function () {

(function () {
  /* ---------- 主题切换 ---------- */
  var root = document.documentElement;
  var toggle = document.querySelector('[data-theme-toggle]');
  var icon = document.querySelector('[data-theme-icon]');
  var SUN = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 2.8v2.2M12 19v2.2M2.8 12H5M19 12h2.2M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" stroke="currentColor" stroke-width="1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8a8.6 8.6 0 1 0 10.8 10.8Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  function paint() {
    var dark = root.getAttribute('data-theme') === 'dark';
    if (icon) icon.innerHTML = dark ? SUN : MOON;
    if (toggle) toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
  }
  paint();
  if (toggle) toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('dst-theme', next); } catch (e) {}
    paint();
  });

  /* ---------- 滚动入场 ---------- */
  var items = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: .1 });
  items.forEach(function (el) { io.observe(el); });
})();

  /* ---------- 阅读进度 ---------- */
  const bar = document.querySelector('[data-read-progress]');
  function onScroll() {
    if (!bar) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- 目录高亮 ---------- */
  const links = Array.prototype.slice.call(document.querySelectorAll('[data-toc-link]'));
  const sections = links
    .map(function (a) {
      const id = (a.getAttribute('href') || '').slice(1);
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  function setActive(id) {
    links.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    const visible = new Map();
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) visible.set(en.target.id, en.intersectionRatio);
        else visible.delete(en.target.id);
      });
      if (!visible.size) return;
      let best = null, bestRatio = -1;
      visible.forEach(function (ratio, id) {
        if (ratio > bestRatio) { bestRatio = ratio; best = id; }
      });
      if (best) setActive(best);
    }, {
      rootMargin: '-84px 0px -62% 0px',
      threshold: [0.05, 0.25, 0.5, 0.75]
    });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- 灯箱 ---------- */
  const box = document.querySelector('[data-lightbox]');
  const boxImg = document.querySelector('[data-lightbox-img]');
  const closeBtn = document.querySelector('[data-lightbox-close]');
  let lastFocus = null;

  function openBox(src, alt) {
    if (!box || !boxImg) return;
    lastFocus = document.activeElement;
    boxImg.src = src;
    boxImg.alt = alt || '';
    box.hidden = false;
    requestAnimationFrame(function () { box.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }
  function closeBox() {
    if (!box) return;
    box.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { box.hidden = true; boxImg.removeAttribute('src'); }, 250);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('[data-zoom]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const img = btn.querySelector('img');
      if (img) openBox(img.src, img.alt);
    });
  });
  if (closeBtn) closeBtn.addEventListener('click', closeBox);
  if (box) box.addEventListener('click', function (e) {
    if (e.target === box) closeBox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && box && !box.hidden) closeBox();
  });

  /* ---------- 复制 ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const pre = btn.closest('.code') && btn.closest('.code').querySelector('pre');
      if (!pre) return;
      const text = pre.textContent;
      const done = function () {
        const old = btn.textContent;
        btn.textContent = '已复制';
        setTimeout(function () { btn.textContent = old; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
      function fallback() {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* 忽略 */ }
        document.body.removeChild(ta);
      }
    });
  });
})();
