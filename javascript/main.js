


// Configuration
const CONFIG = {
    basePath: '../HTML/',
    defaultPage: 'home.html',
    maxRetries: 3,
    components: ['nav.html', 'foot.html'],
    contentContainers: {
        nav: 'nav-container',
        content: 'content-container',
        footer: 'foot-container',
    },
    productsPath: '../data/products.json'
};

// State management
const appState = {
    componentsLoaded: false,
    loadAttempts: 0,
    currentPage: null,
    products: null
};

// DOM Utilities
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

// Content Loader
const ContentLoader = {
    fetchComponent: async (path) => {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();
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
                content = feedbackContent.innerHTML;
            }
    
            await DOM.safeInnerHTML(contentContainer, content);
            appState.currentPage = page;
    
            if (!isHistoryNavigation) {
                history.pushState({ page }, '', page.split('/').pop());
            }
    
            if (page.includes('feedback.html') && !window.feedbackJSLoaded) {
                const script = document.createElement('script');
                script.src = '../javascript/feedback.js';
                script.onload = () => window.feedbackJSLoaded = true;
                document.body.appendChild(script);
            }

            if (page.includes('products')) {
                document.dispatchEvent(new CustomEvent('contentLoaded', { detail: { page } }));
            }
             if (page.includes('order.html') && typeof initOrderPopup === 'function') {
            initOrderPopup();
        }
            if (page.includes('cart.html') && typeof initCart === 'function') {
            initCart();
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

// Event Management
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



// Initialization
(async function init() {
    try {
        Object.values(CONFIG.contentContainers).forEach(id => DOM.getOrCreate(id));
        await ContentLoader.loadComponents();
        window.updateCartCount();
        
        let initialPage = window.location.pathname.split('/').pop();
        if (!initialPage || initialPage === 'home.html') {
            initialPage = CONFIG.defaultPage;
        }
        
        await ContentLoader.loadPageContent(initialPage);
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

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(span => {
        span.textContent = totalItems;
    });
};


window.toggleMenu = function() {
    console.log("Toggling menu...");
    const mobileNav = document.getElementById('mobileNav');
    
    if (!mobileNav) {
        console.error("Mobile nav element not found");
        return;
    }
    
    mobileNav.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') 
        ? 'hidden' 
        : 'auto';
};
