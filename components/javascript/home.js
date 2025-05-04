document.addEventListener('DOMContentLoaded', function() {
    // Initialize carousel
    const carousel = new bootstrap.Carousel(document.getElementById('heroCarousel'), {
        interval: 5000,
        pause: 'hover'
    });
    
    // Cart count update (example)
    const cartCount = document.querySelector('.badge');
    let count = 0;
    
    // This would be replaced with actual cart functionality
    document.querySelectorAll('.product-card button').forEach(button => {
        button.addEventListener('click', function() {
            count++;
            cartCount.textContent = count;
            
            // Show a toast notification
            const toast = new bootstrap.Toast(document.getElementById('addedToCartToast'));
            toast.show();
        });
    });
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('footer form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            // Here you would typically send this to your backend
            alert('Thank you for subscribing with ' + email);
            this.reset();
        });
    }
});