/**
 * Header Behavior Controller
 * Manages show/hide behavior of fixed header based on scroll direction and user interaction
 */

document.addEventListener('DOMContentLoaded', function() {
  // ======================
  // === INITIAL SETUP ===
  // ======================
  const header = document.getElementById('main-header');
  let lastScroll = 0;
  let hideTimeout = null;
  const scrollDelay = 1500; // 1.5 seconds delay before hiding
  
  // Exit if header element doesn't exist
  if (!header) return;
  
  // ======================
  // === HEADER CONFIG ===
  // ======================
  
  // Set initial header state (visible)
  header.classList.remove('hidden');
  
  // Calculate total header height including padding
  const headerHeight = header.offsetHeight;
  
  // Add padding to body to prevent content from being hidden behind fixed header
  document.body.style.paddingTop = `${headerHeight}px`;
  
  // ======================
  // === SMOOTH SCROLL ===
  // ======================
  
  // Configure smooth scrolling for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Calculate target position accounting for header height
        const targetPosition = targetElement.getBoundingClientRect().top + 
                              window.pageYOffset - 
                              headerHeight;
        
        // Smooth scroll to target
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Ensure header is visible when navigating
        showHeader();
      }
    });
  });
  
  // ======================
  // === HEADER CONTROL ===
  // ======================
  
  /**
   * Shows the header and cancels any pending hide operations
   */
  function showHeader() {
    header.classList.remove('hidden');
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }
  
  // ======================
  // === SCROLL HANDLER ===
  // ======================
  
  window.addEventListener('scroll', function() {
    // Get current scroll position (cross-browser compatible)
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Clear any pending hide operation
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    
    // Determine scroll direction
    const scrollingDown = currentScroll > lastScroll;
    
    // Behavior at top of page
    if (currentScroll <= 0) {
      showHeader();
    } 
    // Behavior when scrolling down past header
    else if (scrollingDown && currentScroll > headerHeight) {
      // Schedule header to hide after delay
      hideTimeout = setTimeout(() => {
        header.classList.add('hidden');
      }, scrollDelay);
    } 
    // Behavior when scrolling up
    else if (!scrollingDown) {
      showHeader();
    }
    
    // Update last scroll position (with boundary check)
    lastScroll = currentScroll <= 0 ? 0 : currentScroll;
  });
  
  // ======================
  // === USER INTERACTION ===
  // ======================
  
  // Show header when mouse enters header area
  header.addEventListener('mouseenter', showHeader);
  
  // Optional: Add touch support for mobile devices
  header.addEventListener('touchstart', showHeader);
});