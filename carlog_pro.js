// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));

// Nav scroll style
window.addEventListener('scroll', () => {
  document.querySelector('nav').style.borderBottomColor =
    window.scrollY > 10 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.07)';
});

// Animate bars on load
window.addEventListener('load', () => {
  const bars = document.querySelectorAll('.mock-bar');
  bars.forEach((b, i) => {
    const h = b.style.height;
    b.style.height = '0';
    setTimeout(() => { b.style.height = h; }, 800 + i * 80);
  });
});
