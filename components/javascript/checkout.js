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

// Get user information
async function getUserInfo() {
    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }

        const result = await response.json();
        if (!result.success || !result.data) {
            throw new Error('Invalid user data');
        }

        // Update the display with user information
        const userInfo = result.data;
        document.getElementById('customer-name').textContent = userInfo.fullname || 'Not provided';
        
        // Get the first phone number from the array, or use a default message
        const phoneNumber = userInfo.phoneNumbers && userInfo.phoneNumbers.length > 0 
            ? userInfo.phoneNumbers[0] 
            : 'Not provided';
        document.getElementById('customer-phone').textContent = phoneNumber;

        return userInfo;
    } catch (error) {
        console.error('Error fetching user info:', error);
        // Set default values if fetch fails
        document.getElementById('customer-name').textContent = 'Not available';
        document.getElementById('customer-phone').textContent = 'Not available';
        return null;
    }
}

// Calculate shipping cost based on city and method
function calculateShipping() {
    const city = document.getElementById("shipping-city").value.toLowerCase();
    const method = document.getElementById("shipping-method").value;

    let baseCost = 50; // Default Cairo

    if (city.includes("giza")) baseCost = 70;
    else if (!city.includes("cairo")) baseCost = 100;

    return method === "fast" ? baseCost * 1.09 : baseCost;
}

// Validate shipping address
function validateShippingAddress() {
    const city = document.getElementById("shipping-city").value.trim();
    const street = document.getElementById("shipping-street").value.trim();
    const building = document.getElementById("shipping-building").value.trim();
    const floor = document.getElementById("shipping-floor").value.trim();
    const apartment = document.getElementById("shipping-apartment").value.trim();

    if (!city) {
        alert("Please enter your city");
        return false;
    }
    if (!street) {
        alert("Please enter your street");
        return false;
    }
    if (!building) {
        alert("Please enter your building number/name");
        return false;
    }
    if (!floor) {
        alert("Please enter your floor number");
        return false;
    }
    if (!apartment) {
        alert("Please enter your apartment number");
        return false;
    }

    return true;
}

// Get complete shipping address
function getCompleteAddress() {
    const city = document.getElementById("shipping-city").value.trim();
    const street = document.getElementById("shipping-street").value.trim();
    const building = document.getElementById("shipping-building").value.trim();
    const floor = document.getElementById("shipping-floor").value.trim();
    const apartment = document.getElementById("shipping-apartment").value.trim();

    return `${street}, Building ${building}, Floor ${floor}, Apartment ${apartment}, ${city}`;
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

    if (!validateShippingAddress()) {
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

// Validate and confirm a single field
function validateAndConfirmField(input) {
    const value = input.value.trim();
    const statusDiv = input.nextElementSibling;
    
    // Remove existing classes
    input.classList.remove('confirmed', 'error');
    statusDiv.classList.remove('confirmed', 'error');
    
    if (!value) {
        input.classList.add('error');
        statusDiv.classList.add('error');
        statusDiv.innerHTML = 'This field is required';
        return false;
    }

    // Special validation for floor and apartment (should be numbers)
    if (input.id === 'shipping-floor' || input.id === 'shipping-apartment') {
        if (!/^\d+$/.test(value)) {
            input.classList.add('error');
            statusDiv.classList.add('error');
            statusDiv.innerHTML = 'Please enter a valid number';
            return false;
        }
    }

    // If it's the city field, update shipping cost
    if (input.id === 'shipping-city') {
        updateSummary();
    }

    // Mark as confirmed
    input.classList.add('confirmed');
    statusDiv.classList.add('confirmed');
    statusDiv.innerHTML = '✓ Confirmed';
    
    // Save to localStorage
    saveAddressField(input.id, value);
    
    return true;
}

// Save address field to localStorage
function saveAddressField(fieldId, value) {
    const savedAddress = JSON.parse(localStorage.getItem('shippingAddress') || '{}');
    savedAddress[fieldId] = value;
    localStorage.setItem('shippingAddress', JSON.stringify(savedAddress));
}

// Load saved address fields
function loadSavedAddress() {
    const savedAddress = JSON.parse(localStorage.getItem('shippingAddress') || '{}');
    
    Object.entries(savedAddress).forEach(([fieldId, value]) => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.value = value;
            validateAndConfirmField(input);
        }
    });
}

// Initialize checkout page
document.addEventListener("DOMContentLoaded", async () => {
    console.log('Checkout page initialized');
    
    // Add a small delay to ensure localStorage is ready
    setTimeout(async () => {
        const cart = getCart();
        if (!cart) return;

        // Fetch and display user information first
        await getUserInfo();

        // Load saved address
        loadSavedAddress();

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