const CONFIG = {
    basePath: '/', // Adjust if nav.html and foot.html are in components/
    defaultPage: 'components/HTML/products.html',
    maxRetries: 3,
    components: ['nav.html', 'foot.html'],
    contentContainers: {
        nav: 'nav-container',
        content: 'content-container',
        footer: 'foot-container',
    },
    apiEndpoints: {
        products: '/api/products',
        cart: '/api/Cart',
        cartAdd: '/api/Cart/add',
        cartUpdate: '/api/Cart/update',
        cartRemove: '/api/Cart/remove'
    },
    staticPages: ['feedback_admin.html'] // Pages that don't need content reloading
};

const appState = {
    componentsLoaded: false,
    loadAttempts: 0,
    currentPage: null,
    products: null
};

const DOM = {
    getOrCreate: (id) => {
        let element = document.getElementById(id);
        if (!element) {
            element = document.createElement('div');
            element.id = id;
            document.body.appendChild(element);
            console.warn(`Created fallback container #${id}`);
        }
        return element;
    },
    safeInnerHTML: async (element, content) => {
        try {
            element.innerHTML = '';
            element.innerHTML = content;
            await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
            console.error(`DOM update failed for #${element.id}:`, error);
            throw error;
        }
    }
};

const ContentLoader = {
    fetchComponent: async (path) => {
        console.log(`Fetching component: ${path}`);
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }
        return await response.text();
    },

    fetchProducts: async () => {
        console.log(`Fetching products from: ${CONFIG.apiEndpoints.products}`);
        try {
            const response = await fetch(CONFIG.apiEndpoints.products);
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} - ${response.statusText}`);
            }
            const products = await response.json();
            console.log('Products received:', products);
            appState.products = products;
            return products;
        } catch (error) {
            console.error('Failed to fetch products:', error);
            appState.products = [];
            return [];
        }
    },

    loadComponents: async () => {
        if (appState.componentsLoaded) return;
        try {
            const [navContent, footerContent] = await Promise.all(
                CONFIG.components.map(comp => 
                    ContentLoader.fetchComponent(`${CONFIG.basePath}${comp}`)
                )
            );

            await Promise.all([
                DOM.safeInnerHTML(DOM.getOrCreate(CONFIG.contentContainers.nav), navContent),
                DOM.safeInnerHTML(DOM.getOrCreate(CONFIG.contentContainers.footer), footerContent)
            ]);

            appState.componentsLoaded = true;
            EventRouter.setup();
        } catch (error) {
            console.error('Component loading failed:', error);
            throw error;
        }
    },

    loadPageContent: async (page, isHistoryNavigation = false) => {
        if (window.currentlyLoading === page) return;
        window.currentlyLoading = page;

        try {
            const contentContainer = DOM.getOrCreate(CONFIG.contentContainers.content);
            contentContainer.innerHTML = '<div class="loading-spinner">Loading...</div>';

            const response = await fetch(`${CONFIG.basePath}${page}`);
            let content = await response.text();

            if (content.includes('<div id="feedback-content-only">')) {
                const temp = document.createElement('div');
                temp.innerHTML = content;
                const feedbackContent = temp.querySelector('#feedback-content-only');
                content = feedbackContent ? feedbackContent.innerHTML : content;
            }

            await DOM.safeInnerHTML(contentContainer, content);
            appState.currentPage = page;

            if (!isHistoryNavigation) {
                history.pushState({ page }, '', page.split('/').pop());
            }

            if (page.includes('feedback.html') && !window.feedbackJSLoaded) {
                const script = document.createElement('script');
                script.src = '/javascript/feedback.js';
                script.onload = () => window.feedbackJSLoaded = true;
                document.body.appendChild(script);
            }

            if (page.includes('products')) {
                await ContentLoader.fetchProducts();
                document.dispatchEvent(new CustomEvent('contentLoaded', { detail: { page, products: appState.products } }));
            }
            if (page.includes('order.html') && typeof initOrderPopup === 'function') {
                initOrderPopup();
            }
            if (page.includes('cart.html')) {
                try {
                    if (!AuthManager.isAuthenticated()) {
                        console.log('User not authenticated');
                        window.location.href = 'login.html';
                        return;
                    }

                    const cart = await API.getCart();
                    console.log('Cart data received:', cart);
                    
                    if (cart.success && cart.data) {
                        if (typeof initCart === 'function') {
                            console.log('Initializing cart with data');
                            initCart(cart.data);
                        } else {
                            console.error('initCart function not found');
                        }
                    } else {
                        console.error('Invalid cart data received:', cart);
                        const contentContainer = DOM.getOrCreate(CONFIG.contentContainers.content);
                        contentContainer.innerHTML = `
                            <div class="error-state">
                                <h2>Error Loading Cart</h2>
                                <p>Invalid cart data received</p>
                                <button onclick="window.location.reload()">Try Again</button>
                            </div>
                        `;
                    }
                } catch (error) {
                    console.error('Error loading cart:', error);
                    const contentContainer = DOM.getOrCreate(CONFIG.contentContainers.content);
                    contentContainer.innerHTML = `
                        <div class="error-state">
                            <h2>Error Loading Cart</h2>
                            <p>${error.message}</p>
                            <button onclick="window.location.reload()">Try Again</button>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error(`Failed to load ${page}:`, error);
            if (page !== CONFIG.defaultPage) {
                await ContentLoader.loadPageContent(CONFIG.defaultPage, isHistoryNavigation);
            }
        } finally {
            window.currentlyLoading = null;
        }
    }
};

const EventRouter = {
    setup: () => {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-navigation]');
            if (link && !e.defaultPrevented) {
                e.preventDefault();
                const targetPage = link.getAttribute('href');
                if (targetPage !== appState.currentPage) {
                    const pageName = targetPage.split('/').pop();
                    ContentLoader.loadPageContent(pageName);
                }
            }
        });

        window.addEventListener('popstate', (e) => {
            const targetPage = e.state?.page || CONFIG.defaultPage;
            if (targetPage !== appState.currentPage) {
                ContentLoader.loadPageContent(targetPage, true);
            }
        });
    }
};

document.addEventListener('contentLoaded', async (event) => {
    const { page } = event.detail;
    
    if (page.includes('products')) {
        console.log('Loading products page');
        if (!appState.products || appState.products.length === 0) {
            console.log('No products available');
            const mainSection = document.querySelector("main");
            if (mainSection) {
                mainSection.innerHTML = '<p>No products available.</p>';
            }
            return;
        }
        console.log('Products loaded:', appState.products.length);
    }
    
    if (page.includes('cart.html')) {
        try {
            if (!AuthManager.isAuthenticated()) {
                console.log('User not authenticated');
                window.location.href = 'login.html';
                return;
            }

            const cart = await API.getCart();
            if (typeof initCart === 'function') {
                initCart(cart.data);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            const contentContainer = DOM.getOrCreate(CONFIG.contentContainers.content);
            contentContainer.innerHTML = `
                <div class="error-state">
                    <h2>Error Loading Cart</h2>
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()">Try Again</button>
                </div>
            `;
        }
    }
});

const AuthManager = {
    getToken: () => {
        return localStorage.getItem('token') || localStorage.getItem('authToken');
    },
    setToken: (token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('authToken', token);
    },
    removeToken: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
    },
    isAuthenticated: () => {
        return !!(localStorage.getItem('token') || localStorage.getItem('authToken'));
    },
    handleAuthError: () => {
        AuthManager.removeToken();
        window.location.href = 'login.html';
    }
};

const API = {
    async request(endpoint, options = {}) {
        const token = AuthManager.getToken();
        console.log('Making API request to:', endpoint);
        console.log('Token present:', !!token);
        
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };
        console.log('Request headers:', headers);

        try {
            const response = await fetch(endpoint, { ...options, headers });
            console.log('Response status:', response.status);
            
            if (response.status === 401) {
                console.log('Authentication failed');
                AuthManager.handleAuthError();
                throw new Error('Authentication required');
            }

            if (!response.ok) {
                const error = await response.json();
                console.error('API error:', error);
                throw new Error(error.message || 'API request failed');
            }

            const data = await response.json();
            console.log('API response:', data);
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    async getCart() {
        return API.request(CONFIG.apiEndpoints.cart);
    },

    async addToCart(productId, quantity = 1) {
        return API.request(CONFIG.apiEndpoints.cartAdd, {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
    },

    async updateCartItem(productId, quantity) {
        return API.request(CONFIG.apiEndpoints.cartUpdate, {
            method: 'PUT',
            body: JSON.stringify({ productId, quantity })
        });
    },

    async removeFromCart(productId) {
        return API.request(CONFIG.apiEndpoints.cartRemove, {
            method: 'DELETE',
            body: JSON.stringify({ productId })
        });
    }
};

(async function init() {
    try {
        Object.values(CONFIG.contentContainers).forEach(id => DOM.getOrCreate(id));
        await ContentLoader.loadComponents();

        let initialPage = window.location.pathname.split('/').pop() || CONFIG.defaultPage;
        if (!CONFIG.staticPages.includes(initialPage)) {
            await ContentLoader.loadPageContent(initialPage);
        } else {
            console.log(`Skipping content load for static page: ${initialPage}`);
            appState.currentPage = initialPage;
            // Trigger contentLoaded event for static pages
            document.dispatchEvent(new CustomEvent('contentLoaded', { detail: { page: initialPage } }));
        }

        window.updateCartCount();
    } catch (error) {
        console.error('Application initialization failed:', error);
        DOM.getOrCreate(CONFIG.contentContainers.content).innerHTML = `
            <div class="error-state">
                <h2>Application Error</h2>
                <p>${error.message}</p>
                <button onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
    }
})();

async function updateCartCount() {
    console.log('Updating cart count...');
    try {
        if (!AuthManager.isAuthenticated()) {
            console.log('User not authenticated');
            document.querySelectorAll('.cart-count').forEach(span => {
                span.textContent = '0';
            });
            return;
        }

        console.log('Fetching cart data...');
        const cart = await API.getCart();
        console.log('Cart data received:', cart);
        
        const totalItems = cart.data?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        console.log('Total items calculated:', totalItems);
        
        document.querySelectorAll('.cart-count').forEach(span => {
            span.textContent = totalItems;
        });
    } catch (error) {
        console.error('Error updating cart count:', error);
        document.querySelectorAll('.cart-count').forEach(span => {
            span.textContent = '0';
        });
    }
}

window.toggleMenu = function() {
    console.log("Toggling menu...");
    const mobileNav = document.getElementById('mobileNav');
    if (!mobileNav) {
        console.error("Mobile nav element not found");
        return;
    }
    mobileNav.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : 'auto';
};