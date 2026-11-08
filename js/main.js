/* DST 首页 · 打字机（零依赖）
 * 三通道：
 *   A  单项池，按给定顺序循环
 *   B  六句序列，命中一次后从第一句顺序播完（播放期间不会被打断）
 *   C  低权重短句（出现频率更低）
 */
'use strict';

const TYPE_POOL = [
  // A —— 按给定顺序
  '开源，体验，AI',
  '老大，看不懂代码真的不会石山吗',
  'XiaoQie',
  '帝释天的名字来源于 trop 的奇思妙想',
  '快去试试 SimpleQuickKeys',
  '老大，为什么我们没有 stars',
  '方块树上方块果，方块树下你和我',
  'Minecraft',
  '玩一辈子我的世界',
  '贡献者可以只放 deepseek 了...',
  'qiegent 是我手写的快去 star',
  // B —— 六句序列
  'Java 是世界上最好的语言.cpp',
  'C++ 是世界上最好的语言.py',
  'Python 是世界上最好的语言.js',
  'JavaScript 是世界上最好的语言.lua',
  'lua 是世界上的最好的语言.php',
  'php 是世界上最好的语言.java',
  // A' —— 其余单项
  'main.c',
  '2147483647',
  'Trop!!!!!!!',
  '为什么不试试 DPCL 呢？',
  'DPCL 使用 PCL 开源版开发',
  'DSTv1 是真正意义上的石山',
  '真的有人用吗'
];

const SEQ_START = 11;          // 序列池起点
const SEQ_LEN = 6;             // 序列长度
const LOW_WEIGHT = new Set(['main.c', '2147483647', '真的有人用吗', 'Trop!!!!!!!']);

(function () {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 主题 ---------- */
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  const icon = document.querySelector('[data-theme-icon]');
  const SUN = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 2.8v2.2M12 19v2.2M2.8 12H5M19 12h2.2M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" stroke="currentColor" stroke-width="1.4"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8a8.6 8.6 0 1 0 10.8 10.8Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  function paint() {
    const dark = root.getAttribute('data-theme') === 'dark';
    if (icon) icon.innerHTML = dark ? SUN : MOON;
    if (toggle) toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
  }
  paint();
  if (toggle) toggle.addEventListener('click', function () {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('dst-theme', next);
    paint();
  });

  /* ---------- 打字机 ---------- */
  const el = document.querySelector('[data-typer]');
  const title = document.querySelector('.typer');
  if (!el) return;

  const SINGLES = TYPE_POOL.filter(function (_, i) { return i < SEQ_START || i >= SEQ_START + SEQ_LEN; });
  const SEQUENCE = TYPE_POOL.slice(SEQ_START, SEQ_START + SEQ_LEN);

  if (reduce) { el.textContent = TYPE_POOL[0]; document.body.classList.add('is-ready'); return; }

  function shuffled(list) {
    // 按权重不放回抽取：每轮保证每句都会出现，权重低的出现得更晚
    const items = list.slice(), out = [];
    while (items.length) {
      const total = items.reduce(function (s, t) { return s + (LOW_WEIGHT.has(t) ? .45 : 1); }, 0);
      let r = Math.random() * total;
      for (let i = 0; i < items.length; i++) {
        r -= LOW_WEIGHT.has(items[i]) ? .45 : 1;
        if (r <= 0 || i === items.length - 1) { out.push(items.splice(i, 1)[0]); break; }
      }
    }
    return out;
  }

  let queue = shuffled(SINGLES);
  let seq = null;
  let target = '';
  let index = 0;
  let typing = true;

  function nextText() {
    if (seq) {
      const t = seq.shift();
      if (!seq.length) seq = null;
      return t;
    }
    if (Math.random() < .2) {
      seq = SEQUENCE.slice();
      return seq.shift();
    }
    if (!queue.length) queue = shuffled(SINGLES);
    return queue.shift();
  }

  function dwell(text) {
    return 1500 + Math.min(text.length, 24) * 95;
  }

  function breathe() {
    if (!title) return;
    title.classList.remove('is-switching');
    void title.offsetWidth;
    title.classList.add('is-switching');
  }

  function step() {
    if (typing) {
      index++;
      el.textContent = target.slice(0, index);
      if (index >= target.length) {
        typing = false;
        setTimeout(step, dwell(target));
        return;
      }
      setTimeout(step, 42 + Math.random() * 46);
    } else {
      index--;
      el.textContent = target.slice(0, Math.max(index, 0));
      if (index <= 0) {
        typing = true;
        target = nextText();
        index = 0;
        breathe();
        setTimeout(step, 320);
        return;
      }
      setTimeout(step, 24 + Math.random() * 24);
    }
  }

  // 入场：稍等一拍再开始，让页面先稳住
  target = nextText();
  setTimeout(function () {
    document.body.classList.add('is-ready');
    breathe();
    step();
  }, 420);
})();
