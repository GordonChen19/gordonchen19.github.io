'use strict';

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
