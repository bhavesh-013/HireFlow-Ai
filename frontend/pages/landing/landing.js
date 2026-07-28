// Scroll-triggered reveal (fires once per element)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('.reveal, .reveal-kicker, .reveal-heading, .section-title-divider');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  // Scroll progress indicator
  const progressSections = ['profile', 'skills', 'experience', 'projects', 'workflow', 'contact'];
  const progressItems = document.querySelectorAll('.scroll-progress-item');

  function updateScrollProgress() {
    const scrollPos = window.scrollY + window.innerHeight / 2;
    let currentIndex = 0;
    progressSections.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollPos) currentIndex = i;
    });
    progressItems.forEach((item, i) => {
      item.classList.toggle('active', i === currentIndex);
      item.classList.toggle('passed', i < currentIndex);
    });
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('load', updateScrollProgress);
  updateScrollProgress();