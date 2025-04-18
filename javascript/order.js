// Initialize with retry logic for dynamic content
function initOrderPopup() {
    const orderHeaders = document.querySelectorAll('.order-header');
    const overlay = document.getElementById('overlay');
    
    if (!orderHeaders.length || !overlay) {
        console.log("Popup elements not found, retrying...");
        setTimeout(initOrderPopup, 100);
        return;
    }

    function closeAllDetails() {
        document.querySelectorAll('.order-details').forEach(detail => {
            detail.classList.remove('active');
        });
        overlay.classList.remove('active');
    }

    orderHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            const detailsPopup = document.getElementById('details-' + orderId);
            if (detailsPopup) {
                closeAllDetails();
                detailsPopup.classList.add('active');
                overlay.classList.add('active');
            }
        });
    });

    document.querySelectorAll('.close-details').forEach(button => {
        button.addEventListener('click', closeAllDetails);
    });

    overlay.addEventListener('click', closeAllDetails);
}

// Start when DOM is ready and after dynamic loads
document.addEventListener('DOMContentLoaded', initOrderPopup);

// Make function available for reinitialization
window.initOrderPopup = initOrderPopup;
