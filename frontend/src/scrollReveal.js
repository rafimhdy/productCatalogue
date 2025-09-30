// filepath: src/scrollReveal.js
// Simple IntersectionObserver based reveal system
const DEFAULT_OPTIONS = {
  root: null,
  rootMargin: '0px',
  threshold: 0.12
};

function markVisible(el){
  if(!el.classList.contains('visible')) el.classList.add('visible');
}

export function initScrollReveal() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback: just show all
    document.querySelectorAll('.reveal').forEach(el=>markVisible(el));
    return;
  }
  document.documentElement.classList.add('js-enabled');
  const elements = Array.from(document.querySelectorAll('.reveal'));
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        markVisible(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, DEFAULT_OPTIONS);

  // Observe & immediately show those already in (or near) viewport
  const vh = window.innerHeight;
  elements.forEach(el => {
    observer.observe(el);
    const rect = el.getBoundingClientRect();
    if (rect.top < vh * 0.85) {
      markVisible(el);
      observer.unobserve(el);
    }
  });

  // Safety fallback: after 1500ms reveal any still hidden (prevents opacity:0 if observer fails)
  setTimeout(() => {
    elements.forEach(el => { if(!el.classList.contains('visible')) markVisible(el); });
  }, 1500);
}

// Optional: re-scan if dynamic content loaded
export function rescanReveal() {
  const notObserved = Array.from(document.querySelectorAll('.reveal:not(.visible)'));
  notObserved.forEach(el => el.classList.remove('pre-reveal'));
  initScrollReveal();
}
