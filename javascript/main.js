// Path configuration
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
        componentsLoaded = false;
        throw error;
    }
}

async function loadContent(page, isPopState = false) {
    try {
        if (isPopState) await loadComponents();
        
        const response = await fetch(`${PATHS.content}${page}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        document.getElementById('content-container').innerHTML = await response.text();
        history.pushState({ page }, '', page);
    } catch (error) {
        console.error(`Failed to load ${page}:`, error);
        if (page !== 'home.html') loadContent('home.html', isPopState);
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
        loadContent(e.state?.page || 'home.html', true);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadComponents().then(() => {
        const urlParams = new URLSearchParams(window.location.search);
        loadContent(urlParams.get('page') || 'home.html');
    });
});