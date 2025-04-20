
window.toggleMenu = function() {
    console.log("Toggling menu...");
    const mobileNav = document.getElementById('mobileNav');
    
    if (!mobileNav) {
        console.error("Mobile nav element not found");
        return;
    }
    
    mobileNav.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') 
        ? 'hidden' 
        : 'auto';
};

document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('#mobileNav .nav-link')) {
            toggleMenu();
        }
    });
});
document.addEventListener('click', (e) => {
    if (e.target.closest('[data-nav]')) {
      e.preventDefault();
      const page = e.target.getAttribute('href');
      loadPageContent(page);
    }
  });
  
