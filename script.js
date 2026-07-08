/**
 * Dominic Savio — Portfolio Website Script
 * Version: 4.0 Final Production Edition
 * All code wrapped in DOMContentLoaded. No var. No console.log.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initNavScrollSpy();
  initTypewriter();
  initCounters();
  initScrollReveal();
  initContactForm();
  initBackToTop();
  initMobileNavCollapse();
  initSmoothScroll();
  initHeatmap();
});

/* ─────────────────────────────────────────────
   initSmoothScroll
   Intercepts all internal anchor clicks and
   smoothly scrolls to the target section,
   offsetting for the sticky navbar height.
───────────────────────────────────────────── */
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navbarHeight = document.querySelector('.navbar')?.offsetHeight ?? 70;
      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
};

/* ─────────────────────────────────────────────
   initNavbarScroll
   Adds .scrolled class to navbar after 50px.
───────────────────────────────────────────── */
const initNavbarScroll = () => {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
};

/* ─────────────────────────────────────────────
   initNavScrollSpy
   Highlights the matching nav link whenever a
   section crosses 30% into the viewport.
───────────────────────────────────────────── */
const initNavScrollSpy = () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.btn)');
  if (!sections.length || !navLinks.length) return;

  // IntersectionObserver: fires when section enters the middle third of the viewport
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
  );

  sections.forEach(s => spy.observe(s));
};

/* ─────────────────────────────────────────────
   initTypewriter
   Cycles role strings with type / delete effect.
   Respects prefers-reduced-motion.
───────────────────────────────────────────── */
const initTypewriter = () => {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const roles = [
    'Full-Stack Developer',
    'Django Engineer',
    'AI Application Builder'
  ];

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = roles[0];
    return;
  }

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const tick = () => {
    const current = roles[roleIndex];
    if (isDeleting) {
      charIndex--;
      el.textContent = current.substring(0, charIndex);
    } else {
      charIndex++;
      el.textContent = current.substring(0, charIndex);
    }

    let delay = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === current.length) {
      delay = 2000; // pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 400;
    }

    setTimeout(tick, delay);
  };

  setTimeout(tick, 600);
};

/* ─────────────────────────────────────────────
   initCounters
   Animates stat counters when #stats enters view.
   Fires once then disconnects the observer.
───────────────────────────────────────────── */
const initCounters = () => {
  const section = document.getElementById('stats');
  if (!section) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // IntersectionObserver: triggers counter animation when stats band is 30% visible
  const obs = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        section.querySelectorAll('[data-counter]').forEach(el => {
          const target = parseInt(el.getAttribute('data-target'), 10);
          const suffix = el.getAttribute('data-suffix') ?? '';
          if (reduced) {
            el.textContent = target + suffix;
          } else {
            runCounter(el, target, suffix);
          }
        });
      });
    },
    { threshold: 0.3 }
  );

  obs.observe(section);
};

/* easeOutQuart counter driven by requestAnimationFrame */
const runCounter = (el, target, suffix) => {
  const DURATION = 1500;
  let start = null;

  const frame = (ts) => {
    if (!start) start = ts;
    const t = Math.min((ts - start) / DURATION, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    el.textContent = Math.floor(ease * target) + suffix;
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = target + suffix;
  };

  requestAnimationFrame(frame);
};

/* ─────────────────────────────────────────────
   initScrollReveal
   Fades + slides elements up when they enter
   view. Staggered for [data-reveal-group] items.
───────────────────────────────────────────── */
const initScrollReveal = () => {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }

  // Stagger siblings inside a reveal group
  document.querySelectorAll('[data-reveal-group]').forEach(group => {
    group.querySelectorAll('[data-reveal]').forEach((el, i) => {
      el.style.transitionDelay = `${i * 80}ms`;
    });
  });

  // IntersectionObserver: reveals element when 12% of it enters the viewport
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target); // reveal once only
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach(el => obs.observe(el));
};

/* ─────────────────────────────────────────────
   initContactForm
   Client-side validation with inline error
   messages and a success banner.
───────────────────────────────────────────── */
const initContactForm = () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    name:    document.getElementById('contact-name'),
    email:   document.getElementById('contact-email'),
    subject: document.getElementById('contact-subject'),
    message: document.getElementById('contact-message'),
  };
  const banner = document.getElementById('contact-success-banner');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setError = (input, msg) => {
    input.classList.add('is-invalid');
    const span = input.nextElementSibling;
    if (span?.classList.contains('error-feedback')) span.textContent = msg;
  };

  const clearErrors = () => {
    Object.values(fields).forEach(input => {
      input.classList.remove('is-invalid');
      const span = input.nextElementSibling;
      if (span?.classList.contains('error-feedback')) span.textContent = '';
    });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    let valid = true;

    if (!fields.name.value.trim()) {
      setError(fields.name, 'Please enter your name.');
      valid = false;
    }

    if (!fields.email.value.trim()) {
      setError(fields.email, 'Email address is required.');
      valid = false;
    } else if (!EMAIL_RE.test(fields.email.value.trim())) {
      setError(fields.email, 'Please enter a valid email address.');
      valid = false;
    }

    if (!fields.subject.value.trim()) {
      setError(fields.subject, 'Please add a subject.');
      valid = false;
    }

    if (!fields.message.value.trim()) {
      setError(fields.message, 'Please write a message.');
      valid = false;
    }

    if (!valid) return;

    // Disable submit button and change text to indicate sending
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // Submit data using Fetch
    const formData = new FormData(form);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;

      if (banner) {
        if (data.success) {
          banner.textContent = "Message received! I'll get back to you within 24 hours.";
          banner.className = 'success-banner d-block'; // success styled
          form.reset();
        } else {
          banner.textContent = data.message || "Failed to send message. Please email me directly at 7dsavio@gmail.com.";
          banner.className = 'success-banner error d-block'; // error styled
        }
        banner.classList.remove('d-none');
      }
    })
    .catch(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;

      if (banner) {
        banner.textContent = "Something went wrong. Please try again or email me directly at 7dsavio@gmail.com.";
        banner.className = 'success-banner error d-block';
        banner.classList.remove('d-none');
      }
    })
    .finally(() => {
      setTimeout(() => {
        if (banner) {
          banner.classList.add('d-none');
          banner.classList.remove('d-block');
          banner.classList.remove('error');
        }
      }, 6000);
    });
  });
};

/* ─────────────────────────────────────────────
   initBackToTop
   Shows a fixed button after 300 px scroll and
   smoothly scrolls back to #hero on click.
───────────────────────────────────────────── */
const initBackToTop = () => {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};
/* ─────────────────────────────────────────────
   initMobileNavCollapse
   Auto-closes the hamburger drawer after a link
   is tapped on small screens.
───────────────────────────────────────────── */
const initMobileNavCollapse = () => {
  const collapse = document.querySelector('.navbar-collapse');
  const toggler  = document.querySelector('.navbar-toggler');
  if (!collapse || !toggler) return;

  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (collapse.classList.contains('show')) toggler.click();
    });
  });
};

/* ─────────────────────────────────────────────
   initHeatmap
   Dynamically populates the GitHub mock grid
   with randomized green activity shades and date tooltips.
───────────────────────────────────────────── */
const initHeatmap = () => {
  const heatmapGrid = document.querySelector('.heatmap-grid');
  if (!heatmapGrid) return;

  // Realistic weight distribution (mostly low or zero, occasionally high)
  const levels = [0, 0, 0, 0, 1, 1, 1, 2, 2, 3, 4];
  
  for (let i = 0; i < 364; i++) {
    const square = document.createElement('div');
    const level = levels[Math.floor(Math.random() * levels.length)];
    square.className = `heatmap-square lvl-${level}`;
    
    // Add realistic tooltip detailing the mock contribution count and date
    const dateStr = getMockDateString(i);
    const contributionCount = level === 0 ? 'No' : level * 2 + Math.floor(Math.random() * 2);
    square.setAttribute('title', `${contributionCount} contributions on ${dateStr}`);
    
    heatmapGrid.appendChild(square);
  }
};

/* Helper for mock dates in the heatmap tooltips */
const getMockDateString = (dayIndex) => {
  const date = new Date();
  date.setDate(date.getDate() - (364 - dayIndex));
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

