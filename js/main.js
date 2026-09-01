(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Smooth scroll (Lenis) ---------------- */
  let lenis = null;
  if (!reduceMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { offset: 0 });
    else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------------- Preloader ---------------- */
  function runPreloader() {
    const pre = document.querySelector('.preloader');
    const letters = pre.querySelectorAll('.preloader-mark span');
    const countEl = pre.querySelector('.count-num');
    const bar = pre.querySelector('.preloader-bar span');
    const counter = { val: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        pre.style.pointerEvents = 'none';
        document.body.classList.add('is-loaded');
        playIntro();
      }
    });

    tl.to(letters, { opacity: 1, y: 0, duration: .7, stagger: .08, ease: 'power3.out' })
      .to(counter, {
        val: 100, duration: 1.4, ease: 'power2.inOut',
        onUpdate: () => { countEl.textContent = Math.round(counter.val); }
      }, .2)
      .to(bar, { width: '100%', duration: 1.4, ease: 'power2.inOut' }, .2)
      .to(pre, { yPercent: -100, duration: .9, ease: 'power4.inOut' }, '+=.15');
  }

  /* ---------------- Hero intro ---------------- */
  function playIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.hero-title .line-inner', { y: '0%', duration: 1.1, stagger: .1 })
      .to('.hero-eyebrow span', { opacity: 1, y: 0, duration: .8 }, .3)
      .to('.hero-desc span', { opacity: 1, y: 0, duration: .8, stagger: .1 }, .5)
      .to('.scroll-cue', { opacity: 1, duration: .8 }, .9);

    gsap.set('.scroll-cue', { opacity: 0 });
  }

  /* ---------------- Header on scroll ---------------- */
  function initHeader() {
    const header = document.querySelector('[data-header]');
    ScrollTrigger.create({
      start: 'top -60',
      end: 99999,
      toggleClass: { targets: header, className: 'is-scrolled' }
    });
  }

  /* ---------------- Mobile menu ---------------- */
  function initMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const overlay = document.querySelector('[data-menu-overlay]');
    const links = overlay.querySelectorAll('[data-menu-link]');
    let open = false;

    function setState(next) {
      open = next;
      toggle.setAttribute('aria-expanded', String(open));
      overlay.classList.toggle('is-open', open);
      document.documentElement.style.overflow = open ? 'hidden' : '';
      if (open) {
        gsap.to(links, { opacity: 1, y: 0, duration: .7, stagger: .06, delay: .25, ease: 'power3.out' });
      } else {
        gsap.set(links, { opacity: 0, y: 30 });
      }
    }

    toggle.addEventListener('click', () => setState(!open));
    links.forEach(link => link.addEventListener('click', (e) => {
      e.preventDefault();
      setState(false);
      setTimeout(() => scrollToTarget(link.getAttribute('href')), 400);
    }));
  }

  /* ---------------- Nav smooth-scroll links ---------------- */
  function initAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href.length > 1 && document.querySelector(href)) {
          e.preventDefault();
          scrollToTarget(href);
        }
      });
    });
  }

  /* ---------------- Custom cursor ---------------- */
  function initCursor() {
    if (!isFinePointer || reduceMotion) return;
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    const setDot = gsap.quickTo(dot, 'x', { duration: .05, ease: 'none' });
    const setDotY = gsap.quickTo(dot, 'y', { duration: .05, ease: 'none' });
    const setRing = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3.out' });
    const setRingY = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3.out' });

    window.addEventListener('mousemove', (e) => {
      setDot(e.clientX); setDotY(e.clientY);
      setRing(e.clientX); setRingY(e.clientY);
      dot.classList.add('is-visible');
      ring.classList.add('is-visible');
    }, { once: false });

    document.querySelectorAll('[data-hover], a, button').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
  function initMagnetic() {
    if (!isFinePointer || reduceMotion) return;
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      const strength = 26;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(el, { x: (x / r.width) * strength, y: (y / r.height) * strength, duration: .4, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
    });
  }

  /* ---------------- Hero blob parallax (mouse drives x, scroll drives y) ---------------- */
  function initHeroBlob() {
    const blob = document.querySelector('[data-blob]');
    if (!blob || reduceMotion) return;

    if (isFinePointer) {
      const moveX = gsap.quickTo(blob, 'x', { duration: 1.2, ease: 'power3.out' });
      window.addEventListener('mousemove', (e) => {
        const relX = (e.clientX / window.innerWidth - .5) * 80;
        moveX(relX);
      });
    }

    gsap.to(blob, {
      y: 220,
      scale: 1.15,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---------------- Full-page layered parallax ---------------- */
  function initParallax() {
    if (reduceMotion) return;
    gsap.utils.toArray('[data-parallax]').forEach((el) => {
      const speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
      const section = el.closest('section') || el.parentElement;
      gsap.fromTo(el,
        { y: () => Math.min(window.innerHeight, 900) * speed * 0.5 },
        {
          y: () => -Math.min(window.innerHeight, 900) * speed * 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: .5
          }
        }
      );
    });
  }

  /* ---------------- Marquee reacting to scroll velocity ---------------- */
  function initMarquee() {
    const wrap = document.querySelector('.marquee');
    const track = document.querySelector('.marquee-track');
    if (!wrap || !track) return;

    if (reduceMotion) return;

    const loop = gsap.to(track, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
    const setSkew = gsap.quickTo(track, 'skewX', { duration: .5, ease: 'power3.out' });

    ScrollTrigger.create({
      onUpdate: (self) => {
        const v = gsap.utils.clamp(-10, 10, self.getVelocity() / -250);
        setSkew(v);
        loop.timeScale(1 + Math.min(Math.abs(v) * .18, 2.2));
      }
    });

    wrap.addEventListener('mouseenter', () => loop.pause());
    wrap.addEventListener('mouseleave', () => loop.play());
  }

  /* ---------------- Generic scroll reveals ---------------- */
  function initReveals() {
    const items = gsap.utils.toArray('.reveal');
    items.forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
  }

  /* ---------------- Founder blocks + photo entrance ---------------- */
  function initFounderCards() {
    const blocks = gsap.utils.toArray('.founder-block');
    const photo = document.querySelector('.about-photo');
    if (!blocks.length) return;

    if (photo) {
      gsap.set(photo, { clipPath: 'inset(0 0 100% 0)' });
      ScrollTrigger.create({
        trigger: '.about-grid',
        start: 'top 78%',
        onEnter: () => gsap.to(photo, { clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'power4.out' }),
        once: true
      });
    }

    ScrollTrigger.create({
      trigger: '.founders-text',
      start: 'top 80%',
      onEnter: () => gsap.to(blocks, { opacity: 1, y: 0, duration: 1, stagger: .18, ease: 'power3.out' }),
      once: true
    });
  }

  /* ---------------- Pull-quote word scrub ---------------- */
  function initQuoteScrub() {
    const p = document.querySelector('[data-split-text]');
    if (!p) return;
    const words = p.textContent.trim().split(/\s+/);
    p.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');
    const spans = p.querySelectorAll('.word');

    gsap.to(spans, {
      opacity: 1, color: 'var(--ink)', ease: 'none', stagger: .04,
      scrollTrigger: {
        trigger: p, start: 'top 85%', end: 'bottom 55%', scrub: .5
      }
    });
  }

  /* ---------------- Accordion ---------------- */
  function initAccordion() {
    const items = document.querySelectorAll('[data-accordion-item]');
    items.forEach(item => {
      const trigger = item.querySelector('[data-accordion-trigger]');
      const panel = item.querySelector('[data-accordion-panel]');
      const inner = panel.querySelector('.accordion-panel-inner');

      gsap.set(panel, { height: item.classList.contains('is-open') ? 'auto' : 0 });

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        items.forEach(other => {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            gsap.to(other.querySelector('[data-accordion-panel]'), { height: 0, duration: .6, ease: 'power3.inOut' });
          }
        });

        if (isOpen) {
          item.classList.remove('is-open');
          gsap.to(panel, { height: 0, duration: .6, ease: 'power3.inOut' });
        } else {
          item.classList.add('is-open');
          gsap.set(panel, { height: 'auto' });
          const h = panel.offsetHeight;
          gsap.fromTo(panel, { height: 0 }, { height: h, duration: .6, ease: 'power3.inOut', onComplete: () => ScrollTrigger.refresh() });
        }
      });
    });
  }

  /* ---------------- Duo sticky + parallax reveal ---------------- */
  function initDuo() {
    const wrap = document.querySelector('.duo-sticky');
    const frames = gsap.utils.toArray('[data-duo-frame]');
    if (!wrap || !frames.length) return;

    gsap.set(frames, { clipPath: 'inset(0 0 100% 0)' });
    ScrollTrigger.create({
      trigger: wrap,
      start: 'top 75%',
      onEnter: () => gsap.to(frames, { clipPath: 'inset(0 0 0% 0)', duration: 1.2, stagger: .15, ease: 'power4.out' }),
      once: true
    });

    if (reduceMotion) return;

    frames.forEach((frame) => {
      const speed = parseFloat(frame.getAttribute('data-speed')) || 1;
      gsap.to(frame, {
        yPercent: () => speed * 16,
        ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: .6 }
      });
    });
  }

  /* ---------------- Horizontal process scroll ---------------- */
  function initProcess() {
    const track = document.querySelector('[data-process-track]');
    if (!track) return;
    const panels = gsap.utils.toArray('.process-panel');

    ScrollTrigger.matchMedia({
      '(min-width: 901px)': function () {
        const distance = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: '.process-sticky',
            start: 'top top',
            end: () => '+=' + (distance() + window.innerHeight * .6),
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });
        return () => tween.scrollTrigger && tween.scrollTrigger.kill();
      }
    });
  }

  /* ---------------- Back to top ---------------- */
  function initBackToTop() {
    document.querySelector('[data-back-to-top]')?.addEventListener('click', () => scrollToTarget('#top'));
  }

  /* ---------------- Boot ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMenu();
    initAnchorLinks();
    initCursor();
    initMagnetic();
    initHeroBlob();
    initParallax();
    initReveals();
    initFounderCards();
    initQuoteScrub();
    initDuo();
    initAccordion();
    initMarquee();
    initProcess();
    initBackToTop();

    if (reduceMotion) {
      document.querySelector('.preloader').style.display = 'none';
      gsap.set('.hero-title .line-inner, .hero-eyebrow span, .hero-desc span, .scroll-cue', { opacity: 1, y: 0 });
    } else {
      runPreloader();
    }
  });
})();
