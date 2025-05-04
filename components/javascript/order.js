// Initialize with retry logic for dynamic content
// order.js - Updated version
function initOrderPopup() {
    const orderHeaders = document.querySelectorAll('.order-header');
    const overlay = document.getElementById('overlay');
    
    if (!orderHeaders.length || !overlay) {
        console.log("Popup elements not found, will retry when content changes");
        return;
    }

    function closeAllDetails() {
        document.querySelectorAll('.order-details').forEach(detail => {
            detail.classList.remove('active');
        });
        overlay.classList.remove('active');
    }

    // Remove existing event listeners to prevent duplicates
    orderHeaders.forEach(header => {
        header.removeEventListener('click', handleHeaderClick);
    });

    document.querySelectorAll('.close-details').forEach(button => {
        button.removeEventListener('click', closeAllDetails);
    });

    overlay.removeEventListener('click', closeAllDetails);

    // Add new event listeners
    function handleHeaderClick() {
        const orderId = this.getAttribute('data-order-id');
        const detailsPopup = document.getElementById('details-' + orderId);
        if (detailsPopup) {
            closeAllDetails();
            detailsPopup.classList.add('active');
            overlay.classList.add('active');
        }
    }

    orderHeaders.forEach(header => {
        header.addEventListener('click', handleHeaderClick);
    });

    document.querySelectorAll('.close-details').forEach(button => {
        button.addEventListener('click', closeAllDetails);
    });

    overlay.addEventListener('click', closeAllDetails);
}

// Export function for main.js to call
window.initOrderPopup = initOrderPopup;

// Initialize if DOM is already loaded and content is present
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initOrderPopup, 0);
} else {
    document.addEventListener('DOMContentLoaded', initOrderPopup);
}

// Start when DOM is ready and after dynamic loads
document.addEventListener('DOMContentLoaded', initOrderPopup);

// Make function available for reinitialization
window.initOrderPopup = initOrderPopup;
