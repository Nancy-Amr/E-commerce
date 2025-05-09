// Get cart data from localStorage
function getCart() {
    try {
        const cartData = localStorage.getItem('cart');
        if (!cartData) {
            console.log('No cart data found in localStorage');
            window.location.href = 'cart.html'; // Redirect to cart if no data
            return null;
        }

        const parsedData = JSON.parse(cartData);
        console.log('Parsed cart data:', parsedData);

        if (!parsedData || !parsedData.items || parsedData.items.length === 0) {
            console.log('Cart data is empty or invalid');
            window.location.href = 'cart.html'; // Redirect if cart is empty
            return null;
        }

        return parsedData;
    } catch (error) {
        console.error('Failed to retrieve cart:', error);
        window.location.href = 'cart.html'; // Redirect on error
        return null;
    }
}

let couponDiscount = 0;

// Calculate shipping cost based on address and method
function calculateShipping() {
    const address = document.getElementById("customer-address").textContent;
    const method = document.getElementById("shipping-method").value;

    let baseCost = 50; // Default Cairo

    if (address.includes("Giza")) baseCost = 70;
    else if (!address.includes("Cairo")) baseCost = 100;
    return method === "fast" ? baseCost * 1.09 : baseCost;
}

// Apply coupon (sample logic)
function applyCoupon() {
    const code = document.getElementById("coupon-code").value;
    const cart = getCart();
    if (!cart) return;

    if (code === "SAVE10") {
        couponDiscount = cart.subtotal * 0.10; // 10% discount
        document.getElementById("coupon-status").textContent = "Coupon applied successfully!";
    } else {
        couponDiscount = 0;
        document.getElementById("coupon-status").textContent = "Invalid coupon code.";
    }
    updateSummary();
}

// Update price summary
function updateSummary() {
    const cart = getCart();
    if (!cart) return;

    const subtotal = cart.subtotal || 0;
    const shipping = calculateShipping();
    const paymentFee = document.getElementById("payment-method").value === "cash" ? subtotal * 0.01 : 0;
    const tax = subtotal * 0.10; // 10% tax
    const promoDiscount = 0; // Placeholder for promotions

    const total = subtotal + shipping + paymentFee + tax - promoDiscount - couponDiscount;

    // Update all price displays
    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    document.getElementById("summary-shipping").textContent = shipping.toFixed(2);
    document.getElementById("shipping-cost").textContent = shipping.toFixed(2);
    document.getElementById("promo-discount").textContent = promoDiscount.toFixed(2);
    document.getElementById("coupon-discount").textContent = couponDiscount.toFixed(2);
    document.getElementById("tax").textContent = tax.toFixed(2);
    document.getElementById("total").textContent = total.toFixed(2);
}

// Display cart items in the order summary
function displayCartItems() {
    const cart = getCart();
    if (!cart) return;

    const orderItemsContainer = document.querySelector('.order-items');
    if (!orderItemsContainer) {
        console.error('Order items container not found');
        return;
    }

    orderItemsContainer.innerHTML = ''; // Clear existing items

    if (cart.items && cart.items.length > 0) {
        cart.items.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <small>${item.product_colors ? `Color: ${item.product_colors[0].colour_name}` : ''}</small>
                </div>
                <div class="item-quantity">Quantity: <span id="quantity-${index}">${item.quantity}</span></div>
                <div class="item-price">${item.price_sign || '$'}${parseFloat(item.price).toFixed(2)}</div>
            `;
            orderItemsContainer.appendChild(itemElement);
        });
    } else {
        orderItemsContainer.innerHTML = '<p>Your cart is empty. Please add items to your cart before checkout.</p>';
    }
}

// Place order action
async function placeOrder() {
    const cart = getCart();
    if (!cart || !cart.items || cart.items.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    try {
        // Here you would typically send the order data to your backend
        // For now, we'll just clear the cart and show a success message
        localStorage.removeItem('cart');
        alert("Order placed successfully!");
        window.location.href = '/'; // Redirect to home page
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again.');
    }
}

// Initialize checkout page
document.addEventListener("DOMContentLoaded", () => {
    console.log('Checkout page initialized');
    
    // Add a small delay to ensure localStorage is ready
    setTimeout(() => {
        const cart = getCart();
        if (!cart) return;

        console.log('Cart data loaded:', cart);
        displayCartItems();
        updateSummary();
        
        // Add event listeners for dynamic updates
        document.getElementById("shipping-method").addEventListener("change", updateSummary);
        document.getElementById("payment-method").addEventListener("change", updateSummary);
        
        // Add coupon form submit handler
        const couponForm = document.querySelector('.coupon-input-group');
        if (couponForm) {
            couponForm.addEventListener('submit', (e) => {
                e.preventDefault();
                applyCoupon();
            });
        }
    }, 100);
});