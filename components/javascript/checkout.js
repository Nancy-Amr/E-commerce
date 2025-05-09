// Get cart data from localStorage
function getCart() {
    try {
        const cartData = localStorage.getItem('cart');
        return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
        console.error('Failed to retrieve cart:', error);
        return [];
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
    if (code === "SAVE10") {
        couponDiscount = 10; // Flat 10 EGP discount
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
    let subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    let shipping = calculateShipping();
    let paymentFee = document.getElementById("payment-method").value === "cash" ? subtotal * 0.01 : 0;
    let tax = subtotal * 0.10; // 10% tax
    let promoDiscount = 0; // Placeholder for promotions

    let total = subtotal + shipping + paymentFee + tax - promoDiscount - couponDiscount;

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
    const orderItemsContainer = document.querySelector('.order-items');
    orderItemsContainer.innerHTML = ''; // Clear existing items

    cart.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <small>${item.product_colors ? `Color: ${item.product_colors[0].colour_name}` : ''}</small>
            </div>
            <div class="item-quantity">Quantity: <span id="quantity-${index}">${item.quantity}</span></div>
            <div class="item-price">${item.price_sign || ''}${parseFloat(item.price).toFixed(2)} EGP</div>
        `;
        orderItemsContainer.appendChild(itemElement);
    });
}

// Place order action
function placeOrder() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // Here you would typically send the order data to your backend
    // For now, we'll just clear the cart and show a success message
    localStorage.removeItem('cart');
    alert("Order placed successfully!");
    window.location.href = '/'; // Redirect to home page
}

// Initialize checkout page
document.addEventListener("DOMContentLoaded", () => {
    displayCartItems();
    updateSummary();
});