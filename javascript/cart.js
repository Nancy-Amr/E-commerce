// cart.js - Updated SPA-compatible version
function initCart() {
    const cartItems = document.querySelectorAll('.cart-item');
    const couponInput = document.getElementById('coupon-code');
    
    // Retry if cart elements aren't loaded yet
    if (!cartItems.length || !document.getElementById('cart-subtotal')) {
        console.log("Cart elements not found, will initialize when content changes");
        return;
    }

    function updateCartTotals() {
        let subtotal = 0;

        // Calculate item totals
        document.querySelectorAll('.cart-item').forEach(item => {
            const price = parseFloat(item.querySelector('.item-price').textContent.replace('$', ''));
            const qty = parseInt(item.querySelector('.item-qty').value);
            const total = price * qty;

            item.querySelector('.item-total').textContent = `$${total.toFixed(2)}`;
            subtotal += total;
        });

        // Calculate order totals
        const shipping = 5.99;
        const tax = subtotal * 0.0833; // 8.33% tax
        const couponCode = couponInput ? couponInput.value.trim().toUpperCase() : '';
        const discount = couponCode === 'SAVE10' ? subtotal * 0.1 : 0;

        // Update display
        document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('cart-tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('cart-discount').textContent = `-$${discount.toFixed(2)}`;
        document.getElementById('cart-total').textContent = `$${(subtotal + shipping + tax - discount).toFixed(2)}`;
    }

    // Clean up existing event listeners to prevent duplicates
    document.querySelectorAll('.item-qty').forEach(input => {
        input.removeEventListener('change', updateCartTotals);
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.removeEventListener('click', removeItemHandler);
    });

    if (document.getElementById('apply-coupon')) {
        document.getElementById('apply-coupon').removeEventListener('click', updateCartTotals);
    }

    if (couponInput) {
        couponInput.removeEventListener('keypress', couponKeypressHandler);
    }

    // Set up quantity change listeners
    document.querySelectorAll('.item-qty').forEach(input => {
        input.addEventListener('change', updateCartTotals);
    });

    // Set up remove item listeners
    function removeItemHandler(e) {
        e.target.closest('.cart-item').remove();
        updateCartTotals();
    }
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', removeItemHandler);
    });

    // Set up coupon application
    function couponKeypressHandler(e) {
        if (e.key === 'Enter') {
            updateCartTotals();
        }
    }
    
    const applyCouponBtn = document.getElementById('apply-coupon');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', updateCartTotals);
        couponInput.addEventListener('keypress', couponKeypressHandler);
    }
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.checkout-btn');
        if (btn) {
            e.preventDefault();
            ContentLoader.loadPageContent('checkout.html');
        }
    });

    // Initial calculation
    updateCartTotals();
}

// Export function for main.js to call
window.initCart = initCart;

// Initialize if DOM is already loaded and content is present
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initCart, 0);
} else {
    document.addEventListener('DOMContentLoaded', initCart);
}
