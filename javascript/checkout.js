// Sample cart data 
const cart = [
    { name: "Mac blusher", price: 100.00, quantity: 1 },
    { name: "Foundation", price: 150.00, quantity: 2 }
];
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
    let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
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

// Place order action (placeholder)
function placeOrder() {
    alert("Order placed successfully!");
    // Add logic to send order data to backend
}

// Initialize summary on page load
document.addEventListener("DOMContentLoaded", () => {
    updateSummary();
});