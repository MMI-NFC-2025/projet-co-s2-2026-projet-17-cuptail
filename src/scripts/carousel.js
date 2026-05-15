export function createCarousel({ track, dots, prevButton, nextButton, section }) {
  let currentSlide = 0;
  let totalSlides = 0;
  let timer = null;
  let userInteracted = false;
  let startX = 0;

  function update() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.innerHTML = Array.from({ length: totalSlides }).map((_, index) => `
      <button
        class="h-2 rounded-full transition-all ${index === currentSlide ? 'w-6 bg-brand-turquoise' : 'w-2 bg-neutral-300'}"
        data-dot="${index}"
        aria-label="Aller à la recommandation ${index + 1}"
      ></button>
    `).join('');

    dots.querySelectorAll('[data-dot]').forEach((dot) => {
      dot.addEventListener('click', () => {
        userInteracted = true;
        stopAutoplay();
        currentSlide = Number(dot.dataset.dot);
        update();
      });
    });
  }

  function next() {
    if (!totalSlides) return;
    currentSlide = (currentSlide + 1) % totalSlides;
    update();
  }

  function prev() {
    if (!totalSlides) return;
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    update();
  }

  function startAutoplay() {
    stopAutoplay();

    if (userInteracted) return;

    timer = setInterval(next, 7000);
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
  }

  function init(count) {
    totalSlides = count;
    currentSlide = 0;
    userInteracted = false;
    update();
    startAutoplay();
  }

  nextButton.addEventListener('click', () => {
    userInteracted = true;
    stopAutoplay();
    next();
  });

  prevButton.addEventListener('click', () => {
    userInteracted = true;
    stopAutoplay();
    prev();
  });

  track.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
    stopAutoplay();
  });

  track.addEventListener('pointerup', (event) => {
    const diff = event.clientX - startX;

    if (Math.abs(diff) > 45) {
      userInteracted = true;
      diff < 0 ? next() : prev();
    } else {
      startAutoplay();
    }
  });

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];

    if (entry.isIntersecting) {
      userInteracted = false;
      startAutoplay();
    } else {
      stopAutoplay();
    }
  }, { threshold: 0.35 });

  observer.observe(section);

  return { init };
}