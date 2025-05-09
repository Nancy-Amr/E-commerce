// cart.js - Updated SPA-compatible version

// API Configuration
const API_ENDPOINTS = {
    cart: '/api/Cart',
    addToCart: '/api/Cart/add',
    updateCart: '/api/Cart/update',
    removeFromCart: '/api/Cart/remove'
};

// State Management
let cartState = {
    items: [],
    loading: true,
    error: null
};

// Utility Functions
const formatPrice = (price) => `$${parseFloat(price).toFixed(2)}`;

const getAuthHeaders = () => {
    // Try both token keys for backward compatibility
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

const isAuthenticated = () => {
    // Check both token keys
    return !!(localStorage.getItem('token') || localStorage.getItem('authToken'));
};

// API Functions
async function fetchCart() {
    try {
        console.log('Fetching cart from:', API_ENDPOINTS.cart);
        const response = await fetch(API_ENDPOINTS.cart, {
            headers: getAuthHeaders()
        });

        console.log('Cart response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 401) {
                console.log('User not authenticated');
                showEmptyCart();
                return;
            }
            throw new Error('Failed to fetch cart');
        }

        const responseData = await response.json();
        console.log('Raw cart data:', responseData);
        
        // Check if we have the expected data structure
        if (!responseData.success || !responseData.data) {
            console.error('Unexpected cart data structure:', responseData);
            return null;
        }

        // Log the items array structure
        if (responseData.data.items) {
            console.log('Cart items structure:', responseData.data.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                product: item.product ? {
                    _id: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    image_link: item.product.image_link
                } : 'No product data'
            })));
        }

        return responseData.data;
    } catch (error) {
        console.error('Error fetching cart:', error);
        showError('Failed to load cart. Please try again later.');
        return null;
    }
}

async function addToCart(productId, quantity) {
    try {
        const response = await fetch(API_ENDPOINTS.addToCart, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productId, quantity })
        });

        if (!response.ok) {
            throw new Error('Failed to add item to cart');
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding to cart:', error);
        showError('Failed to add item to cart. Please try again.');
        return null;
    }
}

async function updateCartItem(productId, quantity) {
    try {
        const response = await fetch(API_ENDPOINTS.updateCart, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productId, quantity })
        });

        if (!response.ok) {
            throw new Error('Failed to update cart');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating cart:', error);
        showError('Failed to update item quantity. Please try again.');
        return null;
    }
}

async function removeCartItem(productId) {
    try {
        const response = await fetch(`${API_ENDPOINTS.removeFromCart}/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to remove item from cart');
        }

        return await response.json();
    } catch (error) {
        console.error('Error removing from cart:', error);
        showError('Failed to remove item. Please try again.');
        return null;
    }
}

// UI Functions
function showLoading() {
    const loadingEl = document.getElementById('cart-loading');
    const emptyEl = document.getElementById('empty-cart');
    const contentEl = document.getElementById('cart-content');
    
    if (loadingEl) loadingEl.style.display = 'flex';
    if (emptyEl) emptyEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
}

function showEmptyCart() {
    const loadingEl = document.getElementById('cart-loading');
    const emptyEl = document.getElementById('empty-cart');
    const contentEl = document.getElementById('cart-content');
    
    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    if (contentEl) contentEl.style.display = 'none';
}

function showCartContent() {
    const loadingEl = document.getElementById('cart-loading');
    const emptyEl = document.getElementById('empty-cart');
    const contentEl = document.getElementById('cart-content');
    
    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'flex';
}

function showError(message) {
    // You can implement a toast or alert system here
    alert(message);
}

function renderCartItem(item) {
    console.log('Rendering cart item:', item);
    
    // Ensure we have the required data
    if (!item || !item.product) {
        console.error('Invalid cart item data:', item);
        return '';
    }

    const product = item.product;
    console.log('Product data for rendering:', {
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image_link
    });

    return `
        <div class="cart-item" data-product-id="${product._id}">
            <div class="item-info">
                <img src="${product.image_link || ''}" alt="${product.name || 'Product'}" class="item-image">
                <div class="item-details">
                    <div class="item-name">${product.name || 'Unnamed Product'}</div>
                    <div class="item-brand">${product.brand || 'No Brand'}</div>
                </div>
            </div>
            <div class="item-price">${formatPrice(product.price || 0)}</div>
            <div class="item-controls">
                <button class="qty-btn minus">-</button>
                <input type="number" min="1" value="${item.quantity || 1}" class="item-qty">
                <button class="qty-btn plus">+</button>
            </div>
            <div class="item-total">${formatPrice((product.price || 0) * (item.quantity || 1))}</div>
            <button class="remove-btn" aria-label="Remove item">&times;</button>
        </div>
    `;
}

function updateCartTotals(cart) {
    console.log('Updating cart totals with:', cart);
    if (!cart || !cart.items) {
        console.error('Invalid cart data for totals:', cart);
        return;
    }

    const subtotal = cart.items.reduce((sum, item) => {
        const price = item.product?.price || 0;
        const quantity = item.quantity || 0;
        return sum + (price * quantity);
    }, 0);

    const shipping = subtotal > 0 ? 5.99 : 0;
    const tax = subtotal * 0.0833; // 8.33% tax
    const discount = 0; // Implement discount logic if needed
    const total = subtotal + shipping + tax - discount;

    document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);
    document.getElementById('cart-shipping').textContent = formatPrice(shipping);
    document.getElementById('cart-tax').textContent = formatPrice(tax);
    document.getElementById('cart-discount').textContent = formatPrice(-discount);
    document.getElementById('cart-total').textContent = formatPrice(total);
}

// Event Handlers
async function handleQuantityChange(e) {
    const input = e.target;
    const cartItem = input.closest('.cart-item');
    const productId = cartItem.dataset.productId;
    let quantity = parseInt(input.value);

    if (quantity < 1) {
        input.value = 1;
        quantity = 1;
    }

    const result = await updateCartItem(productId, quantity);
    if (result) {
        await loadCart();
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        }
    }
}

async function handlePlusMinus(e) {
    const button = e.target;
    const cartItem = button.closest('.cart-item');
    const input = cartItem.querySelector('.item-qty');
    const productId = cartItem.dataset.productId;
    let quantity = parseInt(input.value);

    if (button.classList.contains('plus')) {
        quantity += 1;
    } else if (button.classList.contains('minus')) {
        quantity = Math.max(1, quantity - 1);
    }

    input.value = quantity;
    const result = await updateCartItem(productId, quantity);
    if (result) {
        await loadCart();
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        }
    }
}

async function handleRemoveItem(e) {
    const button = e.target;
    const cartItem = button.closest('.cart-item');
    const productId = cartItem.dataset.productId;

    const result = await removeCartItem(productId);
    if (result) {
        await loadCart();
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        }
    }
}

// Main Cart Functions
async function loadCart() {
    console.log('Loading cart...');
    showLoading();
    
    const cart = await fetchCart();
    console.log('Fetched cart data:', cart);
    
    if (!cart) {
        console.log('No cart data received');
        showEmptyCart();
        return;
    }

    // Check if we have items
    if (!cart.items || !Array.isArray(cart.items) || cart.items.length === 0) {
        console.log('Cart is empty or has no items array');
        showEmptyCart();
        return;
    }

    // Log each item's structure before rendering
    cart.items.forEach((item, index) => {
        console.log(`Item ${index + 1} structure:`, {
            productId: item.productId,
            quantity: item.quantity,
            product: item.product ? {
                _id: item.product._id,
                name: item.product.name,
                price: item.product.price,
                image_link: item.product.image_link
            } : 'No product data'
        });
    });

    console.log('Rendering cart items:', cart.items);
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) {
        console.error('Cart items container not found in DOM');
        return;
    }

    try {
        cartItemsContainer.innerHTML = cart.items.map(item => {
            console.log('Processing cart item:', item);
            return renderCartItem(item);
        }).join('');
        
        updateCartTotals(cart);
        showCartContent();
        attachEventListeners();
    } catch (error) {
        console.error('Error rendering cart:', error);
        showError('Error displaying cart items. Please try again.');
    }
}

function attachEventListeners() {
    // Quantity change listeners
    document.querySelectorAll('.item-qty').forEach(input => {
        input.removeEventListener('change', handleQuantityChange);
        input.addEventListener('change', handleQuantityChange);
    });

    // Plus/Minus button listeners
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.removeEventListener('click', handlePlusMinus);
        btn.addEventListener('click', handlePlusMinus);
    });

    // Remove button listeners
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.removeEventListener('click', handleRemoveItem);
        btn.addEventListener('click', handleRemoveItem);
    });

    // Coupon code listeners
    const applyCouponBtn = document.getElementById('apply-coupon');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', () => {
            // Implement coupon logic here
            alert('Coupon functionality coming soon!');
        });
    }

    // Checkout button listener
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'checkout.html';
        });
    }
}

// Initialize cart when the page loads
function initCart(cartData = null) {
    console.log('initCart called with data:', cartData);
    
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        console.log('DOM still loading, waiting for DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded fired');
            if (!isAuthenticated()) {
                console.log('No token found, showing empty cart');
                showEmptyCart();
                return;
            }
            if (cartData) {
                console.log('Using provided cart data');
                loadCartWithData(cartData);
            } else {
                console.log('No cart data provided, fetching from API');
                loadCart();
            }
        });
    } else {
        console.log('DOM already loaded');
        if (!isAuthenticated()) {
            console.log('No token found, showing empty cart');
            showEmptyCart();
            return;
        }
        if (cartData) {
            console.log('Using provided cart data');
            loadCartWithData(cartData);
        } else {
            console.log('No cart data provided, fetching from API');
            loadCart();
        }
    }
}

// New function to handle direct cart data
async function loadCartWithData(cartData) {
    console.log('loadCartWithData called with:', cartData);
    showLoading();
    
    if (!cartData) {
        console.log('No cart data provided');
        showEmptyCart();
        return;
    }

    // Check if we have items
    if (!cartData.items || !Array.isArray(cartData.items) || cartData.items.length === 0) {
        console.log('Cart is empty or has no items array');
        showEmptyCart();
        return;
    }

    console.log('Rendering cart items:', cartData.items);
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) {
        console.error('Cart items container not found in DOM');
        return;
    }

    try {
        cartItemsContainer.innerHTML = cartData.items.map(item => {
            console.log('Processing cart item:', item);
            return renderCartItem(item);
        }).join('');
        
        updateCartTotals(cartData);
        showCartContent();
        attachEventListeners();
        
        // Update cart count in header
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        }
    } catch (error) {
        console.error('Error rendering cart:', error);
        showError('Error displaying cart items. Please try again.');
    }
}

// Export for use in other files
window.initCart = initCart;
window.loadCartWithData = loadCartWithData;

// Initialize if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Document already loaded, initializing cart');
    setTimeout(() => initCart(), 0);
} else {
    console.log('Waiting for DOMContentLoaded to initialize cart');
    document.addEventListener('DOMContentLoaded', () => initCart());
}
