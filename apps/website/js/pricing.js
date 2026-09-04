/* Zentrio AI - Pricing Cards Interactive Dynamics */

document.addEventListener('DOMContentLoaded', () => {
  initPricingTiltCards();
});

// Hover Tilt Effect for Pricing Cards
function initPricingTiltCards() {
  const cards = document.querySelectorAll('.pricing-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element.
      const y = e.clientY - rect.top;  // y position within the element.
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation based on cursor proximity to corners (max 8 degrees tilt)
      const rotateX = ((centerY - y) / centerY) * 8;
      const rotateY = ((x - centerX) / centerX) * 8;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      
      // Dynamic cursor positioning for background radial highlights
      const glow = card.querySelector('.pricing-card-glow');
      if (glow) {
        glow.style.opacity = '1';
        glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(139, 92, 246, 0.16), transparent 50%)`;
      }
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      
      const glow = card.querySelector('.pricing-card-glow');
      if (glow) {
        glow.style.opacity = '0';
      }
    });
  });
}
