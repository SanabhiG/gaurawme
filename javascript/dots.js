document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('dots-canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size to match banner
  function resizeCanvas() {
    const banner = document.querySelector('.banner');
    canvas.width = banner.offsetWidth;
    canvas.height = banner.offsetHeight;
  }
  
  // Dot class
  class Dot {
    constructor() {
      this.reset();
      this.size = Math.random() * 3 + 1;
      this.baseSize = this.size;
      this.color = '#413841'; 
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = Math.random() * 2 - 1;
      this.vy = Math.random() * 2 - 1;
    }
    
    update(mouse) {
      // Move dot
      this.x += this.vx;
      this.y += this.vy;
      
      // Bounce off edges
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      
      // Mouse interaction - only if mouse is in canvas
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Connection threshold (100 pixels)
        const connectThreshold = 100;
        
        if (distance < connectThreshold) {
          // Draw line to mouse
          ctx.beginPath();
          ctx.strokeStyle = this.color;
          ctx.globalAlpha = 1 - (distance / connectThreshold); // Fade out with distance
          ctx.lineWidth = 0.8;
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          ctx.globalAlpha = 1; // Reset alpha
          
          // Make dot grow slightly when near mouse
          this.size = this.baseSize * (10 - 10 * distance/connectThreshold);
        } else {
          this.size = this.baseSize;
        }
      }
    }
    
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Initialize
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  const dots = [];
  const dotCount = 50;
  const mouse = { x: 0, y: 0, active: false };
  
  // Create dots
  for (let i = 0; i < dotCount; i++) {
    dots.push(new Dot());
  }
  
  // Mouse tracking
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  
  canvas.addEventListener('mouseout', () => {
    mouse.active = false;
  });
  
  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all dots first
    dots.forEach(dot => dot.draw());
    
    // Then draw connections (so lines appear under dots)
    dots.forEach(dot => dot.update(mouse));
    
    requestAnimationFrame(animate);
  }
  
  animate();
});