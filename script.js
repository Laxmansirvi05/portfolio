/* ═══════════════════════════════════════════════════════════
   LAXMAN SIRVI — PREMIUM FUTURISTIC PORTFOLIO
   Complete JavaScript — All Interactions & Animations v2
═══════════════════════════════════════════════════════════ */
'use strict';

/* ─── EmailJS Init ──────────────────────────────────────── */
// REPLACE with your actual EmailJS credentials from emailjs.com
const EMAILJS_PUBLIC_KEY   = 'YOUR_EMAILJS_PUBLIC_KEY';   // e.g. 'abc123XYZ'
const EMAILJS_SERVICE_ID   = 'YOUR_SERVICE_ID';            // e.g. 'service_xxxxxxx'
const EMAILJS_TEMPLATE_ID  = 'YOUR_TEMPLATE_ID';           // e.g. 'template_xxxxxxx'

emailjs.init(EMAILJS_PUBLIC_KEY);

/* ─── DOM Refs ──────────────────────────────────────────── */
const cursorOrb     = document.getElementById('cursor-orb');
const cursorTrail   = document.getElementById('cursor-trail');
const navbar        = document.getElementById('navbar');
const navToggle     = document.getElementById('nav-toggle');
const navLinks      = document.getElementById('nav-links');
const starCanvas    = document.getElementById('star-canvas');
const certExpandBtn = document.getElementById('cert-expand-btn');
const contactForm   = document.getElementById('contact-form');
const footerYear    = document.getElementById('footer-year');
if (footerYear) footerYear.textContent = new Date().getFullYear();

/* ══════════════════════════════════════════════════════════
   1. CUSTOM CURSOR
══════════════════════════════════════════════════════════ */
let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;
let isPointer = false;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursorOrb) {
    cursorOrb.style.left = mouseX + 'px';
    cursorOrb.style.top  = mouseY + 'px';
  }
});

document.addEventListener('mouseover', e => {
  const tag = e.target.tagName;
  isPointer = ['A','BUTTON','INPUT','TEXTAREA','SELECT'].includes(tag)
           || e.target.classList.contains('skill-tag')
           || e.target.hasAttribute('data-tilt');
  if (cursorOrb) {
    cursorOrb.style.width  = isPointer ? '28px' : '20px';
    cursorOrb.style.height = isPointer ? '28px' : '20px';
  }
});

(function trailLoop() {
  trailX += (mouseX - trailX) * 0.1;
  trailY += (mouseY - trailY) * 0.1;
  if (cursorTrail) {
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top  = trailY + 'px';
    cursorTrail.style.width  = isPointer ? '54px' : '40px';
    cursorTrail.style.height = isPointer ? '54px' : '40px';
  }
  requestAnimationFrame(trailLoop);
})();

/* ══════════════════════════════════════════════════════════
   2. IMMERSIVE 3D ANIMATED BACKGROUND CANVAS
══════════════════════════════════════════════════════════ */
(function initBackground() {
  if (!starCanvas) return;
  const ctx = starCanvas.getContext('2d');
  let W, H, raf;
  let mx = 0.5, my = 0.5;
  let t = 0;

  let nodes = [], particles = [];

  function resize() {
    W = starCanvas.width  = window.innerWidth;
    H = starCanvas.height = window.innerHeight;
    build();
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function build() {
    // Nodes (neural network dots)
    const NODE_COUNT = Math.floor((W * H) / 9000); // responsive count
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: rand(0, W), y: rand(0, H),
      vx: rand(-0.25, 0.25), vy: rand(-0.25, 0.25),
      r: rand(1, 2.5),
      a: rand(0.3, 0.8),
      hue: Math.random() > 0.5 ? rand(210, 240) : rand(260, 290), // blue and purple
      pulse: rand(0, Math.PI * 2),
      depth: rand(0.5, 1) // parallax depth
    }));

    // Floating glow particles
    const PARTICLE_COUNT = Math.floor((W * H) / 15000);
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: rand(0, W), y: rand(0, H),
      vx: rand(-0.15, 0.15), vy: rand(-0.15, 0.15),
      r: rand(0.5, 2),
      a: rand(0.1, 0.4),
      hue: Math.random() > 0.5 ? rand(260, 290) : rand(195, 220),
      depth: rand(0.3, 0.8)
    }));
  }

  document.addEventListener('mousemove', e => {
    mx = e.clientX / W;
    my = e.clientY / H;
  });

  function draw() {
    t++;
    ctx.clearRect(0, 0, W, H);

    // Deep background gradient
    const bg = ctx.createLinearGradient(0, 0, W * 0.5, H);
    bg.addColorStop(0, '#020510');
    bg.addColorStop(0.5, '#030814');
    bg.addColorStop(1, '#010308');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle ambient haze blobs
    const blobs = [
      { x: W * (0.2 + mx * 0.05), y: H * (0.3 + my * 0.05), r: W * 0.35, hue: 210, a: 0.03 },
      { x: W * (0.8 - mx * 0.05), y: H * (0.7 - my * 0.05), r: W * 0.3, hue: 270, a: 0.025 }
    ];
    blobs.forEach(b => {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, `hsla(${b.hue},90%,55%,${b.a})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    const parallaxX = (mx - 0.5) * 40;
    const parallaxY = (my - 0.5) * 30;

    // Update and draw nodes
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += 0.02;
      if (n.x < -10) n.x = W + 10;
      if (n.x > W + 10) n.x = -10;
      if (n.y < -10) n.y = H + 10;
      if (n.y > H + 10) n.y = -10;
    });

    // Draw lines between nearby nodes
    const maxDist = 140;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const ni = nodes[i], nj = nodes[j];
        const px1 = ni.x + parallaxX * ni.depth;
        const py1 = ni.y + parallaxY * ni.depth;
        const px2 = nj.x + parallaxX * nj.depth;
        const py2 = nj.y + parallaxY * nj.depth;
        const dx = px1 - px2, dy = py1 - py2;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.15;
          ctx.beginPath();
          ctx.moveTo(px1, py1);
          ctx.lineTo(px2, py2);
          ctx.strokeStyle = `hsla(${ni.hue}, 80%, 70%, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw the nodes themselves
    nodes.forEach(n => {
      const px = n.x + parallaxX * n.depth;
      const py = n.y + parallaxY * n.depth;
      const glow = Math.sin(n.pulse) * 0.3 + 0.7; // 0.4 to 1.0
      
      const g = ctx.createRadialGradient(px, py, 0, px, py, n.r * 4);
      g.addColorStop(0, `hsla(${n.hue}, 90%, 70%, ${n.a * glow * 0.8})`);
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(px, py, n.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${n.hue}, 90%, 85%, ${n.a * glow})`;
      ctx.fill();
    });

    // Draw floating particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
      
      const px = p.x + parallaxX * p.depth * 1.5;
      const py = p.y + parallaxY * p.depth * 1.5;

      const g = ctx.createRadialGradient(px, py, 0, px, py, p.r * 3);
      g.addColorStop(0, `hsla(${p.hue}, 90%, 70%, ${p.a})`);
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(px, py, p.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    resize();
    draw();
  });

  resize();
  draw();
})();

/* ══════════════════════════════════════════════════════════
   3. PARALLAX HERO LAYERS ON MOUSE MOVE
══════════════════════════════════════════════════════════ */
(function initParallax() {
  let tX = 0, tY = 0, cX = 0, cY = 0;
  document.addEventListener('mousemove', e => {
    tX = (e.clientX / window.innerWidth  - 0.5) * 22;
    tY = (e.clientY / window.innerHeight - 0.5) * 16;
  });

  (function loop() {
    cX += (tX - cX) * 0.055;
    cY += (tY - cY) * 0.055;

    document.querySelectorAll('.hero-glow').forEach((g, i) => {
      const d = (i + 1) * 0.4;
      g.style.transform = `translate(${cX * d}px, ${cY * d}px)`;
    });

    requestAnimationFrame(loop);
  })();
})();

/* ══════════════════════════════════════════════════════════
   4. NAVBAR
══════════════════════════════════════════════════════════ */
(function initNavbar() {
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    highlightActive();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      const s = navToggle.querySelectorAll('span');
      if (open) {
        s[0].style.transform = 'rotate(45deg) translate(5px,5px)';
        s[1].style.opacity = '0';
        s[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
      } else {
        s.forEach(sp => { sp.style.transform = ''; sp.style.opacity = ''; });
      }
    });
    navLinks.querySelectorAll('.nav-link').forEach(l => {
      l.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.querySelectorAll('span').forEach(sp => { sp.style.transform=''; sp.style.opacity=''; });
      });
    });
  }

  function highlightActive() {
    const sections = document.querySelectorAll('section[id]');
    let cur = '';
    sections.forEach(s => { if (s.getBoundingClientRect().top <= 100) cur = s.id; });
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + cur);
    });
  }
})();

/* ══════════════════════════════════════════════════════════
   5. SCROLL REVEAL
══════════════════════════════════════════════════════════ */
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = getComputedStyle(e.target).getPropertyValue('--delay').trim() || '0s';
        e.target.style.transitionDelay = delay;
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => obs.observe(el));
})();

/* ══════════════════════════════════════════════════════════
   6. GRADE BAR ANIMATIONS
══════════════════════════════════════════════════════════ */
(function initGradeBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => { e.target.style.width = e.target.dataset.width + '%'; }, 250);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.grade-bar-fill').forEach(b => obs.observe(b));
})();

/* ══════════════════════════════════════════════════════════
   7. 3D CARD TILT
══════════════════════════════════════════════════════════ */
(function initTilt() {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    let raf;
    card.addEventListener('mousemove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const isProject = card.classList.contains('project-card');
        const r = card.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const mult = isProject ? 1.8 : 1;
        const scale = isProject ? 1.05 : 1.02;
        const tX = ((e.clientY - cy) / (r.height / 2)) * -10 * mult;
        const tY = ((e.clientX - cx) / (r.width  / 2)) *  10 * mult;
        const gx = ((e.clientX - r.left) / r.width)  * 100;
        const gy = ((e.clientY - r.top)  / r.height) * 100;
        card.style.transform = `perspective(${isProject ? 800 : 1000}px) rotateX(${tX}deg) rotateY(${tY}deg) scale3d(${scale},${scale},${scale})`;
        card.style.transition = 'transform 0.15s ease-out';
        card.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(56,189,248,${isProject ? 0.18 : 0.12}) 0%, transparent ${isProject ? 75 : 65}%), rgba(4, 12, 30, 0.4)`;
        if (isProject) {
          card.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(56, 189, 248, 0.15)`;
          card.style.zIndex = '10';
        }
      });
    });
    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      card.style.transform = '';
      card.style.background = '';
      card.style.boxShadow = '';
      card.style.zIndex = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1), background 0.4s ease, box-shadow 0.4s ease';
    });
  });
})();

/* ══════════════════════════════════════════════════════════
   8. CERTIFICATE EXPAND / COLLAPSE
══════════════════════════════════════════════════════════ */
(function initCertExpand() {
  if (!certExpandBtn) return;
  const hidden = document.querySelectorAll('.cert-hidden');
  let expanded = false;

  certExpandBtn.addEventListener('click', () => {
    expanded = !expanded;
    hidden.forEach((c, i) => {
      if (expanded) {
        c.classList.add('cert-visible');
        setTimeout(() => c.classList.add('revealed'), i * 90 + 60);
      } else {
        c.classList.remove('cert-visible', 'revealed');
        c.style.transitionDelay = '';
      }
    });
    certExpandBtn.setAttribute('aria-expanded', String(expanded));
    certExpandBtn.innerHTML = expanded
      ? '<i data-lucide="chevrons-up"></i> Show Less'
      : '<i data-lucide="chevrons-down"></i> View All Certificates';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });
})();

/* ══════════════════════════════════════════════════════════
   9. CONTACT FORM — EMAILJS
══════════════════════════════════════════════════════════ */
(function initContactForm() {
  if (!contactForm) return;

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    const btn      = document.getElementById('contact-submit');
    const btnText  = btn.querySelector('.btn-text');
    const btnLoad  = btn.querySelector('.btn-loading');

    // Validate
    const name    = contactForm.from_name.value.trim();
    const email   = contactForm.from_email.value.trim();
    const subject = contactForm.subject.value.trim();
    const message = contactForm.message.value.trim();

    if (!name || !email || !subject || !message) {
      showToast('⚠ Please fill in all fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('⚠ Please enter a valid email address.', 'error');
      return;
    }

    btnText.hidden = true;
    btnLoad.hidden = false;
    btn.disabled   = true;

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name:  name,
        from_email: email,
        subject:    subject,
        message:    message,
        to_email:   'laxmansirvi2203@gmail.com',
        reply_to:   email,
        date_time:  new Date().toLocaleString()
      });
      showToast('Message sent successfully. Thanks for reaching out!', 'success');
      contactForm.reset();
    } catch (err) {
      console.error('EmailJS error:', err);
      // Fallback: open mail client
      const mailtoLink = `mailto:laxmansirvi2203@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
      window.open(mailtoLink);
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      btnText.hidden = false;
      btnLoad.hidden = true;
      btn.disabled   = false;
    }
  });
})();

/* ══════════════════════════════════════════════════════════
   10. TOAST
══════════════════════════════════════════════════════════ */
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.className = `toast toast-${type}`;
  toast.hidden = false;
  toast.style.opacity = '1';
  toast.style.transform = '';
  toast.style.transition = '';

  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    setTimeout(() => { toast.hidden = true; }, 440);
  }, 5000);
}

/* ══════════════════════════════════════════════════════════
   11. BUTTON RIPPLE
══════════════════════════════════════════════════════════ */
(function initRipple() {
  if (!document.getElementById('ripple-style')) {
    const s = document.createElement('style');
    s.id = 'ripple-style';
    s.textContent = `@keyframes ripple-grow { to { transform: translate(-50%,-50%) scale(60); opacity:0; } }`;
    document.head.appendChild(s);
  }
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const r = btn.getBoundingClientRect();
      const rip = document.createElement('span');
      Object.assign(rip.style, {
        position:'absolute', width:'4px', height:'4px',
        background:'rgba(255,255,255,0.28)', borderRadius:'50%',
        left: (e.clientX - r.left) + 'px', top: (e.clientY - r.top) + 'px',
        transform:'translate(-50%,-50%) scale(0)',
        animation:'ripple-grow 0.65s ease-out forwards',
        pointerEvents:'none',
      });
      btn.style.overflow = 'hidden';
      btn.appendChild(rip);
      setTimeout(() => rip.remove(), 700);
    });
  });
})();

/* ══════════════════════════════════════════════════════════
   12. CONTACT ICON COLORS
══════════════════════════════════════════════════════════ */
(function colorContactIcons() {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .contact-detail-icon--phone   { background: rgba(74,222,128,0.12) !important; border-color: rgba(74,222,128,0.3) !important; color: #4ade80 !important; }
    .contact-detail-icon--location{ background: rgba(251,146,60,0.12) !important; border-color: rgba(251,146,60,0.3) !important; color: #fb923c !important; }
    .contact-detail-icon--linkedin{ background: rgba(14,118,232,0.15) !important; border-color: rgba(14,118,232,0.35) !important; color: #60a5fa !important; }
    .contact-detail-icon--github  { background: rgba(148,163,184,0.1) !important; border-color: rgba(148,163,184,0.25) !important; color: #e2e8f0 !important; }
    .contact-detail-item:hover .contact-detail-icon--phone    { box-shadow: 0 0 16px rgba(74,222,128,0.3); }
    .contact-detail-item:hover .contact-detail-icon--location { box-shadow: 0 0 16px rgba(251,146,60,0.3); }
    .contact-detail-item:hover .contact-detail-icon--linkedin { box-shadow: 0 0 16px rgba(14,118,232,0.3); }
    .contact-detail-item:hover .contact-detail-icon--github   { box-shadow: 0 0 16px rgba(148,163,184,0.3); }
  `;
  document.head.appendChild(styleEl);
})();

/* ══════════════════════════════════════════════════════════
   13. SKILL TAGS INTERACTIVE
══════════════════════════════════════════════════════════ */
document.querySelectorAll('.skill-tag').forEach(tag => {
  tag.addEventListener('click', () => {
    tag.style.cssText = 'transform:scale(1.18);background:rgba(14,165,233,0.2);border-color:rgba(56,189,248,0.65);color:#7dd3fc;';
    setTimeout(() => { tag.style.cssText = ''; }, 380);
  });
});

/* ══════════════════════════════════════════════════════════
   14. PAGE ENTRANCE FADE-IN
══════════════════════════════════════════════════════════ */
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.7s ease';
window.addEventListener('load', () => {
  requestAnimationFrame(() => { document.body.style.opacity = '1'; });
  // Init Lucide icons after DOM is ready
  if (typeof lucide !== 'undefined') lucide.createIcons();
});

/* ══════════════════════════════════════════════════════════
   15. TROPHY FLOAT STAGGER
══════════════════════════════════════════════════════════ */
document.querySelectorAll('.award-trophy').forEach((t, i) => {
  t.style.animationDelay = `${i * 0.45}s`;
});

console.log(
  '%c LS — Laxman Sirvi Portfolio ⚡ ',
  'background: linear-gradient(135deg,#0284c7,#7c3aed); color:#fff; font-family:monospace; padding:4px 12px; border-radius:4px; font-size:14px;'
);
