
  const track = document.getElementById('carousel-track');
  const container = document.getElementById('carousel-container');
  const btnLeft = document.querySelector('.carousel-btn.left');
  const btnRight = document.querySelector('.carousel-btn.right');

  let scrollAmount = 0;
  const scrollStep = 1;
  const scrollInterval = 30;
  let autoScroll;
  let isHovering = false;

  // Clone carousel content for infinite effect
  track.innerHTML += track.innerHTML;

  function updateScroll() {
    scrollAmount += scrollStep;
    if (scrollAmount >= track.scrollWidth / 2) {
      scrollAmount = 0;
    }
    track.style.transform = `translateX(-${scrollAmount}px)`;
  }

  function startAutoScroll() {
    isHovering = true;
    if (!autoScroll) {
      autoScroll = setInterval(updateScroll, scrollInterval);
    }
  }

  function stopAutoScroll() {
    isHovering = false;
    clearInterval(autoScroll);
    autoScroll = null;
  }

  container.addEventListener('mouseenter', startAutoScroll);
  container.addEventListener('mouseleave', stopAutoScroll);

  btnLeft.addEventListener('click', () => {
    scrollAmount = Math.max(0, scrollAmount - 300);
    track.style.transform = `translateX(-${scrollAmount}px)`;
  });

  btnRight.addEventListener('click', () => {
    scrollAmount += 300;
    if (scrollAmount >= track.scrollWidth / 2) {
      scrollAmount = 0;
    }
    track.style.transform = `translateX(-${scrollAmount}px)`;
  });

  // Swipe gestures (touch support)
  let startX = 0;
  container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  container.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // swipe left
        btnRight.click();
      } else {
        // swipe right
        btnLeft.click();
      }
    }
  });
