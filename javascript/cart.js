// cart.js - Complete implementation with retry logic
function initCart() {
    const cartItems = document.querySelectorAll('.cart-item');
    const couponInput = document.getElementById('coupon-code');
    
    // Retry if cart elements aren't loaded yet
    if (!cartItems.length || !document.getElementById('cart-subtotal')) {
        console.log("Cart elements not found, retrying...");
        setTimeout(initCart, 100);
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

    // Set up quantity change listeners
    document.querySelectorAll('.item-qty').forEach(input => {
        input.addEventListener('change', updateCartTotals);
    });

    // Set up remove item listeners
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.cart-item').remove();
            updateCartTotals();
        });
    });

    // Set up coupon application
    const applyCouponBtn = document.getElementById('apply-coupon');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', updateCartTotals);
        
        // Allow Enter key in coupon field
        couponInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                updateCartTotals();
            }
        });
    }

    // Initial calculation
    updateCartTotals();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCart);

// Make available for reinitialization after dynamic loads
window.initCart = initCart;