document.addEventListener('DOMContentLoaded', function() {
  const track = document.getElementById('carousel-track');
  const wrapper = document.querySelector('.carousel-wrapper');
  const btnLeft = document.querySelector('.carousel-btn.left');
  const btnRight = document.querySelector('.carousel-btn.right');
  const items = Array.from(track.querySelectorAll('.carousel-item'));
  const itemCount = items.length;

  // Clone items for infinite scroll
  const cloneCount = 3; // Number of items to clone at each end
  for (let i = 0; i < cloneCount; i++) {
    // Clone and prepend last items
    const clone = items[itemCount - 1 - i].cloneNode(true);
    clone.classList.add('clone');
    track.insertBefore(clone, track.firstChild);
    
    // Clone and append first items
    const cloneEnd = items[i].cloneNode(true);
    cloneEnd.classList.add('clone');
    track.appendChild(cloneEnd);
  }

  // Re-select all items including clones
  const allItems = Array.from(track.querySelectorAll('.carousel-item'));
  const totalItems = allItems.length;
  let currentIndex = cloneCount; // Start at first original item

  // Set initial position
  updateCarousel(false);

  // Navigation functions
  function moveToIndex(index, animate = true) {
    currentIndex = index;
    updateCarousel(animate);
  }

  function nextSlide() {
    if (currentIndex >= itemCount + cloneCount - 1) {
      // Jump to clone without animation
      moveToIndex(cloneCount, false);
    } else {
      moveToIndex(currentIndex + 1);
    }
  }

  function prevSlide() {
    if (currentIndex <= 0) {
      // Jump to clone without animation
      moveToIndex(itemCount + cloneCount - 1, false);
    } else {
      moveToIndex(currentIndex - 1);
    }
  }

  function updateCarousel(animate = true) {
    const itemWidth = allItems[0].offsetWidth;
    const offset = -currentIndex * itemWidth;
    
    track.style.transition = animate ? 'transform 0.5s ease' : 'none';
    track.style.transform = `translateX(${offset}px)`;
  }

  // Event listeners
  btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide);

  // Auto-scroll
  let autoScroll = setInterval(nextSlide, 3000);
  
  wrapper.addEventListener('mouseenter', () => clearInterval(autoScroll));
  wrapper.addEventListener('mouseleave', () => {
    autoScroll = setInterval(nextSlide, 3000);
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    updateCarousel(false);
  });
});