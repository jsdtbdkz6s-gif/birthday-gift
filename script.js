const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const typedText = document.getElementById('typed-text');
const openGiftButton = document.getElementById('open-gift');
const wishButton = document.getElementById('wish-button');
const finaleMessage = document.getElementById('finale-message');
const heroArt = document.getElementById('hero-art');
const petals = document.querySelector('.petals');
const birthdayMusic = document.getElementById('birthday-music');
const musicToggle = document.getElementById('music-toggle');

function updateMusicToggle() {
  if (!birthdayMusic || !musicToggle) return;

  const isMuted = birthdayMusic.muted;
  musicToggle.textContent = isMuted ? '🔇' : '🔊';
  musicToggle.setAttribute('aria-label', isMuted ? 'Включить музыку' : 'Выключить музыку');
  musicToggle.setAttribute('aria-pressed', String(!isMuted));
  musicToggle.title = isMuted ? 'Включить музыку' : 'Выключить музыку';
}

musicToggle?.addEventListener('click', () => {
  if (!birthdayMusic || birthdayMusic.paused) return;

  birthdayMusic.muted = !birthdayMusic.muted;
  updateMusicToggle();
});

function typeHeroLine() {
  const message = 'Небольшой подарок, сделанный с теплом.';

  if (reducedMotion) {
    typedText.textContent = message;
    return;
  }

  let index = 0;
  const typeNextCharacter = () => {
    typedText.textContent = message.slice(0, index);
    index += 1;

    if (index <= message.length) {
      window.setTimeout(typeNextCharacter, 42);
    }
  };

  window.setTimeout(typeNextCharacter, 450);
}

function createPetals() {
  if (reducedMotion || !petals) return;

  for (let index = 0; index < 14; index += 1) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.style.setProperty('--left', `${Math.random() * 100}%`);
    petal.style.setProperty('--size', `${12 + Math.random() * 12}px`);
    petal.style.setProperty('--duration', `${17 + Math.random() * 17}s`);
    petal.style.setProperty('--delay', `${-Math.random() * 28}s`);
    petal.style.setProperty('--sway', `${-100 + Math.random() * 200}px`);
    petals.appendChild(petal);
  }
}

function setupRevealAnimations() {
  const revealItems = document.querySelectorAll('.reveal');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -35px 0px',
  });

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 3, 2) * 90}ms`;
    observer.observe(item);
  });
}

function celebrate(options) {
  if (typeof window.confetti !== 'function') {
    console.warn('canvas-confetti did not load; celebration animation is unavailable.');
    return false;
  }

  window.confetti({
    particleCount: options.particleCount,
    spread: options.spread,
    startVelocity: options.startVelocity,
    gravity: options.gravity ?? 0.9,
    scalar: options.scalar ?? 1,
    origin: options.origin ?? { x: 0.5, y: 0.68 },
    colors: options.colors ?? ['#ffb6c1', '#d4af37', '#fffefa', '#a8b7d8'],
    ...(options.shapes ? { shapes: options.shapes } : {}),
    ...(options.ticks ? { ticks: options.ticks } : {}),
  });

  return true;
}

function requestDeviceTilt() {
  if (!('DeviceOrientationEvent' in window)) return;

  const addOrientationListener = () => {
    window.addEventListener('deviceorientation', (event) => {
      if (event.beta === null || event.gamma === null) return;
      const tiltX = Math.max(-6, Math.min(6, event.beta / 12));
      const tiltY = Math.max(-6, Math.min(6, event.gamma / 12));
      heroArt?.style.setProperty('--tilt-x', `${tiltX}deg`);
      heroArt?.style.setProperty('--tilt-y', `${tiltY}deg`);
    }, { passive: true });
  };

  if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
    window.DeviceOrientationEvent.requestPermission()
      .then((permission) => {
        if (permission === 'granted') addOrientationListener();
      })
      .catch(() => {
        // The pointer-based parallax remains available if permission is declined.
      });
    return;
  }

  addOrientationListener();
}

function setupParallax() {
  if (!heroArt || reducedMotion) return;

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    heroArt.addEventListener('pointermove', (event) => {
      const bounds = heroArt.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      heroArt.style.setProperty('--tilt-x', `${-y * 5}deg`);
      heroArt.style.setProperty('--tilt-y', `${x * 5}deg`);
    });

    heroArt.addEventListener('pointerleave', () => {
      heroArt.style.setProperty('--tilt-x', '0deg');
      heroArt.style.setProperty('--tilt-y', '0deg');
    });
  }

  openGiftButton?.addEventListener('click', requestDeviceTilt, { once: true });
}

function setupPetMessages() {
  document.querySelectorAll('.pet-card').forEach((card) => {
    const message = card.querySelector('.pet-message');

    card.addEventListener('click', () => {
      const isExpanded = card.getAttribute('aria-expanded') === 'true';
      card.setAttribute('aria-expanded', String(!isExpanded));
      message.textContent = isExpanded ? '' : card.dataset.message;
    });
  });
}

function setupCelebrations() {
  openGiftButton?.addEventListener('click', () => {
    if (birthdayMusic) {
      birthdayMusic.volume = 0.2;
      birthdayMusic.play()
        .then(() => {
          if (musicToggle) musicToggle.disabled = false;
          updateMusicToggle();
        })
        .catch((error) => {
          console.warn('Не удалось запустить фоновую музыку:', error);
        });
    }

    if (reducedMotion) {
      celebrate({ particleCount: 34, spread: 72, startVelocity: 35, ticks: 110 });
      return;
    }

    celebrate({ particleCount: 80, spread: 92, startVelocity: 42, origin: { x: 0.5, y: 0.55 } });
  });

  wishButton?.addEventListener('click', () => {
    wishButton.disabled = true;
    finaleMessage.textContent = 'Пусть оно обязательно найдёт дорогу к тебе.';

    if (reducedMotion) {
      celebrate({
        particleCount: 55,
        spread: 105,
        startVelocity: 40,
        shapes: ['circle', 'heart'],
        ticks: 130,
      });
      window.setTimeout(() => {
        wishButton.disabled = false;
      }, 1200);
      return;
    }

    const heart = window.confetti?.shapeFromText({ text: '♥', scalar: 2 });
    const shapes = heart ? ['circle', heart] : ['circle'];

    celebrate({
      particleCount: 115,
      spread: 100,
      startVelocity: 48,
      gravity: 0.75,
      scalar: 1.15,
      shapes,
      ticks: 250,
      origin: { x: 0.5, y: 0.65 },
    });

    let burstsLeft = 5;
    const burstTimer = window.setInterval(() => {
      if (burstsLeft === 0) {
        window.clearInterval(burstTimer);
        wishButton.disabled = false;
        return;
      }

      const x = 0.12 + Math.random() * 0.76;
      celebrate({
        particleCount: 45,
        spread: 80,
        startVelocity: 34,
        gravity: 0.8,
        scalar: 0.95,
        shapes,
        ticks: 210,
        origin: { x, y: 0.7 },
      });
      burstsLeft -= 1;
    }, 420);
  });
}

typeHeroLine();
createPetals();
setupRevealAnimations();
setupParallax();
setupPetMessages();
setupCelebrations();
