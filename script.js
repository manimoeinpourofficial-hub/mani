/* script.js — final tuned version
   - hero & social sections have no color overlay (handled in CSS)
   - hover effects applied globally in CSS
   - runner smaller and jump stronger (tunable JUMP_UP)
   - chat no longer auto-opens; close works; overlay & Escape close
   - entrance animations via IntersectionObserver
*/

(() => {
  'use strict';

  const doc = document;
  const win = window;

  /* Cached selectors */
  const header = doc.getElementById('site-header');
  const messageBtn = doc.getElementById('messageBtn');
  const chatPopup = doc.getElementById('chatPopup');
  const chatClose = doc.getElementById('chatClose');
  const chatSend = doc.getElementById('chatSend');
  const chatField = doc.getElementById('chatField');
  const chatBody = doc.getElementById('chatBody');

  /* Helpers */
  const addClass = (el, c) => el && el.classList.add(c);
  const removeClass = (el, c) => el && el.classList.remove(c);
  const setAttr = (el, k, v) => el && el.setAttribute(k, v);

  /* Sticky header */
  if (header) {
    win.addEventListener('scroll', () => {
      header.classList.toggle('header--shrink', win.scrollY > 20);
    }, { passive: true });
  }

  /* Prevent spacebar scroll unless typing */
  win.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault();
    }
  }, { passive: false });

  /* Event delegation for card press feedback */
  doc.addEventListener('pointerdown', (e) => {
    const c = e.target.closest && e.target.closest('.work-card');
    if (c) c.style.transform = 'scale(0.97)';
  });
  doc.addEventListener('pointerup', (e) => {
    const c = e.target.closest && e.target.closest('.work-card');
    if (c) c.style.transform = '';
  });

  /* IntersectionObserver for entrance animations */
  (function entranceObserver() {
    const items = doc.querySelectorAll('.fade-in, .fade-up, .text-left, .text-right, .icon-left, .icon-right, .section-title, .work-card, .track-card, .service-card, .social-card, .mani-img');
    if (!items.length) return;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    items.forEach(i => io.observe(i));
  })();

  /* Runner game: smaller runner, stronger jump (tunable) */
  (function runnerGame() {
    const runner = doc.getElementById('runner');
    const obstacle = doc.getElementById('obstacle');
    const wrap = doc.querySelector('.runner-wrap');
    const progressBar = doc.getElementById('progressBar');
    const gameList = doc.getElementById('gameList');

    if (!runner || !obstacle || !wrap || !progressBar) return;

    let jumping = false;
    let score = 0;
    let unlocked = false;

    // tuning: stronger jump
    const JUMP_UP = -140;

    const updateProgress = () => {
      const pct = Math.max(0, Math.min(100, score));
      progressBar.style.width = pct + '%';
      progressBar.setAttribute('aria-valuenow', String(pct));
    };

    const jump = () => {
      if (jumping || unlocked) return;
      jumping = true;
      runner.style.transition = 'transform .26s cubic-bezier(.2,.9,.2,1)';
      runner.style.transform = `translateY(${JUMP_UP}px)`;
      setTimeout(() => {
        runner.style.transition = 'transform .22s ease-in';
        runner.style.transform = 'translateY(0)';
        setTimeout(() => { jumping = false; }, 240);
      }, 260);
    };

    // Controls
    win.addEventListener('keydown', (e) => { if (e.code === 'Space') jump(); }, { passive: true });
    wrap.addEventListener('click', jump, { passive: true });
    wrap.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); }, { passive: false });

    // Score increase on obstacle cycle
    obstacle.addEventListener('animationiteration', () => {
      if (unlocked) return;
      score = Math.min(100, score + 10);
      updateProgress();
      if (score >= 100) {
        unlocked = true;
        gameList.classList.remove('hidden');
        gameList.setAttribute('aria-hidden', 'false');
        const cards = gameList.querySelectorAll('.work-card');
        cards.forEach((c, i) => {
          c.style.opacity = '0';
          c.style.transform = 'translateY(20px)';
          setTimeout(() => {
            c.style.transition = 'opacity .4s ease, transform .4s ease';
            c.style.opacity = '1';
            c.style.transform = 'translateY(0)';
          }, 120 * i);
        });
      }
    });

    // Collision detection via RAF
    let rafId = null;
    const checkCollision = () => {
      if (unlocked) {
        if (rafId) cancelAnimationFrame(rafId);
        return;
      }
      const r = runner.getBoundingClientRect();
      const o = obstacle.getBoundingClientRect();
      const hit = !(r.right < o.left || r.left > o.right || r.bottom < o.top || r.top > o.bottom);
      if (hit) {
        score = 0;
        updateProgress();
        wrap.style.transition = 'filter .15s ease';
        wrap.style.filter = 'contrast(1.4)';
        runner.style.transition = 'transform .12s ease';
        runner.style.transform = 'translateY(-6px)';
        setTimeout(() => {
          wrap.style.filter = 'contrast(1)';
          runner.style.transform = 'translateY(0)';
        }, 180);
      }
      rafId = requestAnimationFrame(checkCollision);
    };
    rafId = requestAnimationFrame(checkCollision);
  })();

  /* Chat popup logic (fixed auto-open & close) */
  (function chatLogic() {
    if (!messageBtn || !chatPopup) return;

    // ensure hidden on load
    removeClass(chatPopup, 'visible');
    addClass(chatPopup, 'hidden');
    setAttr(messageBtn, 'aria-expanded', 'false');

    const openChat = () => {
      removeClass(chatPopup, 'hidden');
      addClass(chatPopup, 'visible');
      setAttr(messageBtn, 'aria-expanded', 'true');
      setTimeout(() => chatField && chatField.focus(), 120);
    };

    const closeChat = () => {
      addClass(chatPopup, 'hidden');
      removeClass(chatPopup, 'visible');
      setAttr(messageBtn, 'aria-expanded', 'false');
      messageBtn.focus();
    };

    messageBtn.addEventListener('click', openChat, { passive: true });
    chatClose && chatClose.addEventListener('click', closeChat, { passive: true });

    // click outside to close
    chatPopup.addEventListener('click', (e) => {
      if (e.target === chatPopup) closeChat();
    }, { passive: true });

    // Escape to close
    win.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !chatPopup.classList.contains('hidden')) closeChat();
    }, { passive: true });

    // send message
    const appendUser = (text) => {
      const d = doc.createElement('div');
      d.className = 'chat-msg chat-msg--user';
      d.textContent = text;
      chatBody.appendChild(d);
      chatBody.scrollTop = chatBody.scrollHeight;
    };
    const appendBot = (text) => {
      const d = doc.createElement('div');
      d.className = 'chat-msg chat-msg--bot';
      d.textContent = text;
      chatBody.appendChild(d);
      chatBody.scrollTop = chatBody.scrollHeight;
    };

    if (chatSend && chatField) {
      chatSend.addEventListener('click', () => {
        const text = chatField.value.trim();
        if (!text) return;
        appendUser(text);
        chatField.value = '';
        setTimeout(() => appendBot("Got it — I'll get back to you soon."), 450);
      }, { passive: true });

      chatField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          chatSend.click();
        }
      });
    }
  })();

  /* prefers-reduced-motion */
  if (win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    doc.documentElement.classList.add('reduce-motion');
  }

})();
