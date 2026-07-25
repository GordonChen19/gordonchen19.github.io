'use strict';

const profileRotator = document.querySelector('[data-profile-rotator]');

if (profileRotator) {
  const profilePictures = [
    {
      src: './assets/images/Profile_Pictures/profile-pic-1.jpeg',
      position: '50% 38%',
    },
    {
      src: './assets/images/Profile_Pictures/profile-pic-2.JPG',
      position: '50% 45%',
    },
    {
      src: './assets/images/Profile_Pictures/profile-pic-3.jpg',
      position: '50% 68%',
    },
    {
      src: './assets/images/Profile_Pictures/profile-pic-4.jpeg',
      position: '45% 42%',
    },
  ];
  const profileLayers = [...profileRotator.querySelectorAll('.profile-photo')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentPicture = 0;

  profileLayers[0].style.objectPosition = profilePictures[0].position;
  profilePictures.forEach(({ src }) => {
    const image = new Image();
    image.src = src;
  });

  if (!reduceMotion.matches && profileLayers.length === 2) {
    window.setInterval(() => {
      if (document.hidden) {
        return;
      }

      const outgoingLayer = profileRotator.querySelector('.profile-photo.is-active');
      const incomingLayer = profileLayers.find((layer) => layer !== outgoingLayer);
      const nextPicture = (currentPicture + 1) % profilePictures.length;
      const nextProfile = profilePictures[nextPicture];

      const revealNextProfile = () => {
        window.requestAnimationFrame(() => {
          outgoingLayer.classList.remove('is-active');
          incomingLayer.classList.add('is-active');
          currentPicture = nextPicture;
        });
      };

      incomingLayer.src = nextProfile.src;
      incomingLayer.style.objectPosition = nextProfile.position;

      if (incomingLayer.complete) {
        revealNextProfile();
      } else {
        incomingLayer.addEventListener('load', revealNextProfile, { once: true });
      }
    }, 7000);
  }
}

const newsMarkers = [...document.querySelectorAll('.news-marker')];
const reduceNewsMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (newsMarkers.length && !reduceNewsMotion.matches) {
  const randomDelay = (minimum, maximum) =>
    Math.round(minimum + Math.random() * (maximum - minimum));

  const scheduleRipple = (marker, isInitial = false) => {
    const delay = isInitial ? randomDelay(700, 6000) : randomDelay(4000, 11000);

    window.setTimeout(() => {
      if (document.hidden) {
        scheduleRipple(marker);
        return;
      }

      marker.classList.add('is-rippling');

      window.setTimeout(() => {
        marker.classList.remove('is-rippling');
        scheduleRipple(marker);
      }, 1950);
    }, delay);
  };

  newsMarkers.forEach((marker) => scheduleRipple(marker, true));
}

const awardsList = document.querySelector('.awards-list');

if (awardsList) {
  const visibleAwardCount = 5;

  const updateAwardsHeight = () => {
    const visibleAwards = [...awardsList.children].slice(0, visibleAwardCount);
    const rowGap = Number.parseFloat(window.getComputedStyle(awardsList).rowGap) || 0;
    const visibleHeight = visibleAwards.reduce(
      (total, award) => total + award.getBoundingClientRect().height,
      rowGap * Math.max(visibleAwards.length - 1, 0),
    );

    awardsList.style.setProperty(
      '--awards-window-height',
      `${Math.ceil(visibleHeight)}px`,
    );
  };

  window.requestAnimationFrame(updateAwardsHeight);
  window.addEventListener('resize', updateAwardsHeight);
  document.fonts?.ready.then(updateAwardsHeight);
}

const reduceScrollMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollFloatElements = [
  ...document.querySelectorAll(
    '.section-title, .about-text > p, .news-item, .project-item > a, .experience-carousel .carousel, .showcase-heading, .detail-card',
  ),
];

if (
  scrollFloatElements.length &&
  !reduceScrollMotion.matches &&
  'IntersectionObserver' in window
) {
  const floatObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) =>
          first.boundingClientRect.top - second.boundingClientRect.top,
        );

      visibleEntries.forEach((entry, index) => {
        entry.target.style.setProperty('--float-delay', `${index * 75}ms`);
        entry.target.classList.add('is-visible');
        floatObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    },
  );

  scrollFloatElements.forEach((element) => {
    element.classList.add('scroll-float');
  });

  window.requestAnimationFrame(() => {
    scrollFloatElements.forEach((element) => floatObserver.observe(element));
  });
}

const toggleActive = (element) => {
  element.classList.toggle('active');
};

const sidebar = document.querySelector('[data-sidebar]');
const sidebarBtn = document.querySelector('[data-sidebar-btn]');

if (sidebar && sidebarBtn) {
  const syncSidebar = () => {
    if (window.innerWidth >= 992) {
      sidebar.classList.remove('active');
    }
  };

  sidebarBtn.addEventListener('click', () => {
    toggleActive(sidebar);
  });

  window.addEventListener('resize', syncSidebar);
  syncSidebar();
}

const select = document.querySelector('[data-select]');
const selectItems = document.querySelectorAll('[data-select-item]');
const selectValue = document.querySelector('[data-select-value]');
const filterButtons = document.querySelectorAll('[data-filter-btn]');
const filterItems = document.querySelectorAll('[data-filter-item]');

const filterProjects = (selectedValue) => {
  filterItems.forEach((item) => {
    const matches =
      selectedValue === 'all' || selectedValue === item.dataset.category;
    item.classList.toggle('active', matches);
  });
};

if (select && selectValue) {
  select.addEventListener('click', () => {
    toggleActive(select);
  });
}

selectItems.forEach((item) => {
  item.addEventListener('click', () => {
    const selectedValue = item.innerText.toLowerCase();
    if (selectValue) {
      selectValue.innerText = item.innerText;
    }
    select?.classList.remove('active');
    filterProjects(selectedValue);
  });
});

let activeFilterButton = filterButtons[0];

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedValue = button.innerText.toLowerCase();
    if (selectValue) {
      selectValue.innerText = button.innerText;
    }
    filterProjects(selectedValue);

    activeFilterButton?.classList.remove('active');
    button.classList.add('active');
    activeFilterButton = button;
  });
});

const activeButtonLabel = activeFilterButton?.innerText.toLowerCase();
if (activeButtonLabel) {
  filterProjects(activeButtonLabel);
}

const wrapOffset = (position, loopWidth) => {
  if (!loopWidth) {
    return position;
  }

  while (position <= -loopWidth) {
    position += loopWidth;
  }

  while (position > 0) {
    position -= loopWidth;
  }

  return position;
};

const initializeCarousel = (carousel) => {
  const track = carousel.querySelector('.carousel-track');
  if (!track) {
    return;
  }

  const autoScrollSpeed = 60;
  const images = track.querySelectorAll('img');

  let loopWidth = 0;
  let position = 0;
  let previousFrameTime = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartPosition = 0;

  const applyPosition = () => {
    position = wrapOffset(position, loopWidth);
    track.style.transform = `translate3d(${position}px, 0, 0)`;
  };

  const refreshMeasurements = () => {
    loopWidth = track.scrollWidth / 2;
    applyPosition();
  };

  const tick = (timestamp) => {
    if (!previousFrameTime) {
      previousFrameTime = timestamp;
    }

    const deltaTime = timestamp - previousFrameTime;
    previousFrameTime = timestamp;

    if (!isDragging && loopWidth > 0) {
      position -= (autoScrollSpeed * deltaTime) / 1000;
      applyPosition();
    }

    window.requestAnimationFrame(tick);
  };

  const stopDragging = (pointerId) => {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    carousel.classList.remove('is-dragging');

    if (
      pointerId !== undefined &&
      carousel.hasPointerCapture &&
      carousel.hasPointerCapture(pointerId)
    ) {
      carousel.releasePointerCapture(pointerId);
    }

    previousFrameTime = 0;
  };

  carousel.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    isDragging = true;
    dragStartX = event.clientX;
    dragStartPosition = position;
    previousFrameTime = 0;

    carousel.classList.add('is-dragging');
    carousel.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  carousel.addEventListener('pointermove', (event) => {
    if (!isDragging) {
      return;
    }

    position = dragStartPosition + (event.clientX - dragStartX);
    applyPosition();
  });

  carousel.addEventListener('pointerup', (event) => {
    stopDragging(event.pointerId);
  });

  carousel.addEventListener('pointercancel', (event) => {
    stopDragging(event.pointerId);
  });

  carousel.addEventListener('lostpointercapture', () => {
    stopDragging();
  });

  images.forEach((image) => {
    image.draggable = false;
    image.addEventListener('load', refreshMeasurements, { once: true });
  });

  window.addEventListener('load', refreshMeasurements);
  window.addEventListener('resize', refreshMeasurements);

  refreshMeasurements();
  window.requestAnimationFrame(tick);
};

document.querySelectorAll('.carousel').forEach(initializeCarousel);
