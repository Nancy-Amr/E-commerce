const PATHS = {
    components: '../HTML/',
    content: '../HTML/'
};

let componentsLoaded = false;

async function loadComponents() {
    if (componentsLoaded) return;
    
    try {
        const [nav, foot] = await Promise.all([
            fetch(`${PATHS.components}nav.html`),
            fetch(`${PATHS.components}foot.html`)
        ]);
        
        document.getElementById('nav-container').innerHTML = await nav.text();
        document.getElementById('foot-container').innerHTML = await foot.text();
        componentsLoaded = true;
        
        setupNavigation();
    } catch (error) {
        console.error('Component loading failed:', error);
        throw error;
    }
}

async function loadContent(page, isPopState = false) {
    try {
        if (isPopState) await loadComponents();
        
        const pageFile = page.endsWith('.html') ? page : `${page}.html`;
        const response = await fetch(`${PATHS.content}${pageFile}`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        document.getElementById('content-container').innerHTML = await response.text();
        history.pushState({ page }, '', page.replace('.html', ''));
        
        // Reinitialize popups for order page
        if (page.includes('order') && window.initOrderPopup) {
            initOrderPopup();
        }
        if (page.includes('cart') && window.initCart) {
            initCart();
        }
    } catch (error) {
        console.error(`Failed to load ${page}:`, error);
        loadContent('home', isPopState);
    }
}

function setupNavigation() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('nav a')) {
            e.preventDefault();
            const page = e.target.getAttribute('href');
            loadContent(page);
        }
    });
    
    window.addEventListener('popstate', (e) => {
        loadContent(e.state?.page || 'home', true);
    });
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadComponents().then(() => {
        const urlParams = new URLSearchParams(window.location.search);
        loadContent(urlParams.get('page') || 'home');
    });
});
