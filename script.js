document.addEventListener('DOMContentLoaded', function() {
  const header = document.getElementById('main-header');
  let lastScroll = 0;
  let hideTimeout = null;
  
  // Make sure the header exists
  if (!header) return;
  
  // Get header height for offset calculations
  const headerHeight = header.offsetHeight;
  
  // Handle scroll behavior for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const targetPosition = targetElement.offsetTop - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Show header when clicking navigation
        header.classList.remove('hidden');
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
      }
    });
  });
  
  // Original scroll hide/show logic
  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Clear any existing timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    
    // If scrolling down and past header height, hide after 1.5s
    if (currentScroll > lastScroll && currentScroll > headerHeight) {
      hideTimeout = setTimeout(function() {
        header.classList.add('hidden');
      }, 1500);
    } 
    // If scrolling up, show header immediately
    else if (currentScroll < lastScroll) {
      header.classList.remove('hidden');
      // Reset timeout when showing
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    }
    
    lastScroll = currentScroll <= 0 ? 0 : currentScroll;
  });
});