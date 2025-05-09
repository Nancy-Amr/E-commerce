// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// State
let cartData = null;
let couponDiscount = 0;

// DOM Elements
const elements = {
    loading: document.getElementById('checkout-loading'),
    error: document.getElementById('checkout-error'),
    emptyCart: document.getElementById('empty-cart'),
    content: document.getElementById('checkout-content'),
    orderItems: document.getElementById('order-items'),
    addressForm: document.getElementById('address-form'),
    placeOrderBtn: document.getElementById('place-order-btn'),
    shippingMethod: document.getElementById('shipping-method'),
    paymentMethod: document.getElementById('payment-method'),
    couponCode: document.getElementById('coupon-code'),
    couponStatus: document.getElementById('coupon-status')
};

// Utility Functions
function showLoading() {
    elements.loading.style.display = 'block';
    elements.error.style.display = 'none';
    elements.emptyCart.style.display = 'none';
    elements.content.style.display = 'none';
}

function showError(message) {
    elements.loading.style.display = 'none';
    elements.error.style.display = 'block';
    elements.emptyCart.style.display = 'none';
    elements.content.style.display = 'none';
    elements.error.querySelector('p').textContent = message;
}

function showEmptyCart() {
    elements.loading.style.display = 'none';
    elements.error.style.display = 'none';
    elements.emptyCart.style.display = 'block';
    elements.content.style.display = 'none';
}

function showContent() {
    elements.loading.style.display = 'none';
    elements.error.style.display = 'none';
    elements.emptyCart.style.display = 'none';
    elements.content.style.display = 'block';
}

function getAuthHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Cart Functions
async function fetchCart() {
    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cart');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch cart');
        }

        return data.cart;
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error;
    }
}

// Render Functions
function renderOrderItem(item) {
    return `
        <div class="order-item" data-product-id="${item.product._id}">
            <div class="item-info">
                <div class="item-name">${item.product.name}</div>
                <small>${item.product.brand || ''}</small>
            </div>
            <div class="item-quantity">Quantity: ${item.quantity}</div>
            <div class="item-price">${(item.product.price * item.quantity).toFixed(2)} EGP</div>
        </div>
    `;
}

function updateOrderSummary() {
    if (!cartData || !cartData.items) return;

    elements.orderItems.innerHTML = cartData.items.map(renderOrderItem).join('');
    updatePriceSummary();
}

// Price Calculation Functions
function calculateShipping() {
    const method = elements.shippingMethod.value;
    const city = document.getElementById('city').value;
    
    let baseCost = 50; // Default for Cairo
    
    if (city.toLowerCase() === 'giza') baseCost = 70;
    else if (!city.toLowerCase().includes('cairo')) baseCost = 100;
    
    return method === 'fast' ? baseCost * 1.09 : baseCost;
}

function calculateSubtotal() {
    if (!cartData || !cartData.items) return 0;
    return cartData.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
}

function calculateTax(subtotal) {
    return subtotal * 0.10; // 10% tax
}

function updatePriceSummary() {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const tax = calculateTax(subtotal);
    const paymentFee = elements.paymentMethod.value === 'cash' ? subtotal * 0.01 : 0;
    
    const total = subtotal + shipping + tax + paymentFee - couponDiscount;

    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('summary-shipping').textContent = shipping.toFixed(2);
    document.getElementById('shipping-cost').textContent = shipping.toFixed(2);
    document.getElementById('tax').textContent = tax.toFixed(2);
    document.getElementById('total').textContent = total.toFixed(2);
}

// Form Validation
function validateForm() {
    const form = elements.addressForm;
    const isValid = form.checkValidity();
    elements.placeOrderBtn.disabled = !isValid;
    return isValid;
}

// Event Handlers
function handleShippingMethodChange() {
    updatePriceSummary();
}

function handlePaymentMethodChange() {
    updatePriceSummary();
}

function handleFormInput() {
    validateForm();
    updatePriceSummary();
}

async function handlePlaceOrder(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        alert('Please fill in all required fields');
        return;
    }

    const formData = new FormData(elements.addressForm);
    const address = {
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        postalCode: formData.get('postalCode')
    };

    const orderData = {
        items: cartData.items,
        shippingAddress: address,
        shippingMethod: elements.shippingMethod.value,
        paymentMethod: elements.paymentMethod.value,
        subtotal: calculateSubtotal(),
        shipping: calculateShipping(),
        tax: calculateTax(calculateSubtotal()),
        total: parseFloat(document.getElementById('total').textContent)
    };

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(orderData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to place order');
        }

        // Clear cart and redirect to success page
        localStorage.removeItem('cart');
        window.location.href = '/order-success.html';
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again.');
    }
}

// Initialize
async function initCheckout() {
    showLoading();
    
    try {
        cartData = await fetchCart();
        
        if (!cartData || !cartData.items || cartData.items.length === 0) {
            showEmptyCart();
            return;
        }

        showContent();
        updateOrderSummary();
        
        // Attach event listeners
        elements.shippingMethod.addEventListener('change', handleShippingMethodChange);
        elements.paymentMethod.addEventListener('change', handlePaymentMethodChange);
        elements.addressForm.addEventListener('input', handleFormInput);
        elements.placeOrderBtn.addEventListener('click', handlePlaceOrder);
        
        // Initial form validation
        validateForm();
    } catch (error) {
        showError('Failed to load checkout information. Please try again.');
    }
}

// Start initialization when DOM is ready
document.addEventListener('DOMContentLoaded', initCheckout);