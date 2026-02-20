document.documentElement.classList.add('js-enabled');

const reveals = document.querySelectorAll('.reveal');
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

function setupRevealAnimations() {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.15 }
    );

    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('active'));
  }
}

function setupMobileNavigation() {
  const header = document.querySelector('.header .container');
  const nav = document.querySelector('.nav');
  if (!header || !nav) {
    return;
  }

  const actions = document.createElement('div');
  actions.className = 'header-actions';

  const themeToggle = document.createElement('button');
  themeToggle.type = 'button';
  themeToggle.className = 'theme-toggle';
  themeToggle.setAttribute('aria-label', 'Toggle color theme');

  const menuToggle = document.createElement('button');
  menuToggle.type = 'button';
  menuToggle.className = 'menu-toggle';
  menuToggle.textContent = 'Menu';
  menuToggle.setAttribute('aria-label', 'Toggle menu');
  menuToggle.setAttribute('aria-expanded', 'false');

  actions.append(themeToggle, menuToggle);
  header.insertBefore(actions, nav);

  const savedTheme = localStorage.getItem('site-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('site-theme', theme);
    themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
  }

  setTheme(initialTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function setupActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === path) {
      link.classList.add('active');
    }
  });
}

function setupTypedHero() {
  const typedTarget = document.querySelector('.typed-text');
  if (!typedTarget) {
    return;
  }

  const phrases = (typedTarget.getAttribute('data-typed') || '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

  if (!phrases.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    typedTarget.textContent = phrases[0];
    return;
  }

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const current = phrases[phraseIndex];
    const visible = deleting
      ? current.slice(0, Math.max(charIndex - 1, 0))
      : current.slice(0, Math.min(charIndex + 1, current.length));

    typedTarget.textContent = visible;
    charIndex = visible.length;

    let delay = deleting ? 45 : 85;

    if (!deleting && charIndex === current.length) {
      deleting = true;
      delay = 1100;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 220;
    }

    window.setTimeout(tick, delay);
  };

  tick();
}

function setupContactForm() {
  if (!contactForm || !formMessage) {
    return;
  }

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());
    const submitButton = contactForm.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const res = await fetch('/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload.error || 'Server error');
      }

      formMessage.style.color = '#0b8f5a';
      formMessage.textContent = payload.message || 'Your request has been sent successfully!';
      formMessage.classList.add('show');
      contactForm.reset();

      setTimeout(() => {
        formMessage.classList.remove('show');
      }, 4000);
    } catch (err) {
      formMessage.style.color = '#cc2f3f';
      formMessage.textContent = err.message || 'There was an error sending your request. Please try again.';
      formMessage.classList.add('show');

      setTimeout(() => {
        formMessage.classList.remove('show');
      }, 4500);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}

function setupCaseStudySlider() {
  const slider = document.querySelector('[data-case-slider]');
  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll('[data-slide]'));
  const prevBtn = slider.querySelector('[data-slide-prev]');
  const nextBtn = slider.querySelector('[data-slide-next]');

  if (!slides.length || !prevBtn || !nextBtn) {
    return;
  }

  let activeIndex = 0;
  let autoTimer = null;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => {
      slide.classList.toggle('is-active', idx === activeIndex);
    });
  };

  const restartAutoRotate = () => {
    window.clearInterval(autoTimer);
    autoTimer = window.setInterval(() => {
      showSlide(activeIndex + 1);
    }, 5000);
  };

  prevBtn.addEventListener('click', () => {
    showSlide(activeIndex - 1);
    restartAutoRotate();
  });

  nextBtn.addEventListener('click', () => {
    showSlide(activeIndex + 1);
    restartAutoRotate();
  });

  showSlide(0);
  restartAutoRotate();
}

function setupStatsCounters() {
  const counters = Array.from(document.querySelectorAll('[data-counter]'));
  if (!counters.length) {
    return;
  }

  const animateCounter = (el) => {
    const target = Number(el.getAttribute('data-target') || '0');
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';

    if (!Number.isFinite(target) || target <= 0) {
      el.textContent = `${prefix}0${suffix}`;
      return;
    }

    const duration = 1300;
    const start = performance.now();

    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const value = Math.round(target * eased);
      el.textContent = `${prefix}${value}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    counters.forEach((counter) => observer.observe(counter));
  } else {
    counters.forEach((counter) => animateCounter(counter));
  }
}

function setupScrollUi() {
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.textContent = '↑';
  document.body.appendChild(backToTop);

  const updateScrollUi = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    progress.style.width = `${ratio}%`;

    if (window.scrollY > 320) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  };

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', updateScrollUi, { passive: true });
  updateScrollUi();
}

setupRevealAnimations();
setupMobileNavigation();
setupActiveNav();
setupTypedHero();
setupContactForm();
setupCaseStudySlider();
setupStatsCounters();
setupScrollUi();
