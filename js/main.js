// Header scroll state
const header = document.querySelector('.site-header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll);
}

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => navLinks.classList.remove('open'))
  );
}

// Grid rendering
function renderGrid(container, photos) {
  container.innerHTML = photos
    .map(
      (photo) => `
      <div class="grid-item" data-id="${photo.id}">
        <img src="${photo.src}" alt="${photo.title} — ${CATEGORY_LABELS[photo.category]}" loading="lazy" />
        <div class="overlay">
          <div>
            <p class="cap-title">${photo.title}</p>
            <p class="cap-cat">${CATEGORY_LABELS[photo.category]}</p>
          </div>
        </div>
      </div>`
    )
    .join('');
}

// Lightbox
function initLightbox(getPhotos) {
  const lightbox = document.querySelector('.lightbox');
  if (!lightbox) return null;

  const imgEl = lightbox.querySelector('img');
  const titleEl = lightbox.querySelector('.lightbox-caption strong');
  const catEl = lightbox.querySelector('.lightbox-caption span');
  let currentIndex = 0;

  function show(index) {
    const photos = getPhotos();
    if (photos.length === 0) return;
    currentIndex = (index + photos.length) % photos.length;
    const photo = photos[currentIndex];
    imgEl.src = photo.src;
    imgEl.alt = photo.title;
    titleEl.textContent = photo.title;
    catEl.textContent = CATEGORY_LABELS[photo.category];
  }

  function open(index) {
    show(index);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  lightbox.querySelector('.lightbox-close').addEventListener('click', close);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => show(currentIndex - 1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => show(currentIndex + 1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(currentIndex - 1);
    if (e.key === 'ArrowRight') show(currentIndex + 1);
  });

  return { open };
}
