(() => {
  'use strict';

  const d = document;
  const w = window;
  const $ = s => d.querySelector(s);
  const $$ = s => Array.from(d.querySelectorAll(s));

  const header = $('#site-header');
  const headerLogo = $('#headerLogo');
  const messageBtn = $('#messageBtn');
  const chatPopup = $('#chatPopup');
  const chatClose = $('#chatClose');
  const chatSend = $('#chatSend');
  const chatField = $('#chatField');
  const chatBody = $('#chatBody');

  // Sticky header
  if (header) {
    w.addEventListener('scroll', () => {
      header.classList.toggle('header--shrink', w.scrollY > 20);
    }, { passive: true });
  }

  // Prevent spacebar scrolling unless typing
  w.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault();
    }
  }, { passive: false });

  // Entrance animations (IntersectionObserver)
  (function entranceObserver() {
    const items = $$('.fade-in, .fade-up, .text-left, .text-right, .icon-left, .icon-right, .section-title, .work-card, .track-card, .service-card, .social-card, .mani-img');
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

  // Set runner logo from header logo (ensures same asset used)
  (function syncRunnerLogo() {
    const runner = $('#runner');
    if (!runner || !headerLogo) return;
    // prefer webp if headerLogo has it; use computed src
    const logoSrc = headerLogo.currentSrc || headerLogo.src || headerLogo.getAttribute('src');
    if (logoSrc) {
      runner.style.backgroundImage = `url('${logoSrc}')`;
    }
  })();

  // Runner game
  (function runnerGame() {
    const runner = $('#runner');
    const obstacle = $('#obstacle');
    const wrap = document.querySelector('.runner-wrap');
    const progressBar = $('#progressBar');
    const gameList = $('#gameList');

    if (!runner || !obstacle || !wrap || !progressBar) return;

    let jumping = false;
    let score = 0;
    let unlocked = false;

    const JUMP_UP = -140; // tuneable

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
    w.addEventListener('keydown', (e) => { if (e.code === 'Space') jump(); }, { passive: true });
    wrap.addEventListener('click', jump, { passive: true });
    wrap.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); }, { passive: false });

    // Score on obstacle cycle
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

  // Chat logic
  (function chatLogic() {
    if (!messageBtn || !chatPopup) return;

    chatPopup.classList.add('hidden');
    messageBtn.setAttribute('aria-expanded', 'false');

    const openChat = () => {
      chatPopup.classList.remove('hidden');
      chatPopup.classList.add('visible');
      messageBtn.setAttribute('aria-expanded', 'true');
      setTimeout(() => chatField && chatField.focus(), 120);
    };

    const closeChat = () => {
      chatPopup.classList.add('hidden');
      chatPopup.classList.remove('visible');
      messageBtn.setAttribute('aria-expanded', 'false');
      messageBtn.focus();
    };

    messageBtn.addEventListener('click', openChat, { passive: true });
    chatClose && chatClose.addEventListener('click', closeChat, { passive: true });

    chatPopup.addEventListener('click', (e) => {
      if (e.target === chatPopup) closeChat();
    }, { passive: true });

    w.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !chatPopup.classList.contains('hidden')) closeChat();
    }, { passive: true });

    const appendUser = (text) => {
      const d = document.createElement('div');
      d.className = 'chat-msg chat-msg--user';
      d.textContent = text;
      chatBody.appendChild(d);
      chatBody.scrollTop = chatBody.scrollHeight;
    };
    const appendBot = (text) => {
      const d = document.createElement('div');
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

  // Respect reduced motion
  if (w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduce-motion');
  }

})();
