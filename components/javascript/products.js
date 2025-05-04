

// function showToast(message) {
//     const toast = document.createElement('div');
//     toast.className = 'toast';
//     toast.setAttribute('aria-live', 'polite');
//     toast.textContent = message;
//     document.body.appendCahild(toast);
//     setTimeout(() => toast.remove(), 3000);
// }

// function getCart() {
//     try {
//         const cartData = localStorage.getItem('cart');
//         return cartData ? JSON.parse(cartData) : [];
//     } catch (error) {
//         console.error('Failed to retrieve cart:', error);
//         return [];
//     }
// }

// function saveCart(cart) {
//     try {
//         localStorage.setItem('cart', JSON.stringify(cart));
//         return true;
//     } catch (error) {
//         console.error('Failed to save cart:', error);
//         return false;
//     }
// }

// function addToCart(product) {
//     if (!product || !product.id) {
//         console.error('Invalid product data');
//         showToast('Error adding item to cart');
//         return false;
//     }

//     let cart = getCart();

//     const stock = product.stock ?? 0;
//     if (stock <= 0) {
//         showToast(`${product.name} is out of stock`);
//         return false;
//     }

//     const existing = cart.find(item => item.id === product.id);
//     if (existing) {
//         if (existing.quantity >= stock) {
//             showToast(`${product.name} has reached stock limit`);
//             return false;
//         }
//         existing.quantity += 1;
//     } else {
//         cart.push({ ...product, quantity: 1 });
//     }

//     const saved = saveCart(cart);
//     if (saved) {
//         if (typeof window.updateCartCount === 'function') {
//             window.updateCartCount();
//         }
//         showToast(`${product.name} added to cart!`);
//         return true;
//     }
//     return false;
// }

// const fallbackProducts = [
//     {
//         id: 1,
//         name: "Sample Lipstick",
//         image_link: "https://via.placeholder.com/150",
//         price_sign: "$",
//         price: "9.99",
//         rating: 4.5,
//         stock: 10,
//         product_colors: [{ hex_value: "#f00", colour_name: "Red" }]
//     }
// ];

// // Products page setup
// document.addEventListener("contentLoaded", (e) => {
//     const page = e.detail.page ;
//     if(page.includes('products')) {
//         const mainSection = document.querySelector("main") || document.createElement('main');
//     if (!e.detail.page.includes('products')) return;

//     const mainSection = document.querySelector("main") || document.createElement('main');

//     // Heading
//     const heading = document.createElement('h1');
//     heading.textContent = "Our Products";
//     heading.className = "page-heading";
//     mainSection.insertBefore(heading, mainSection.firstChild);

//     // Search Input
//     const searchInput = document.createElement('input');
//     searchInput.type = 'text';
//     searchInput.placeholder = 'Search for a product...';
//     searchInput.setAttribute('aria-label', 'Search products by name');
//     mainSection.insertBefore(searchInput, heading.nextSibling);

//     let products = [];

//     function renderProducts(productsToRender) {
//         const grid = document.createElement("section");
//         grid.className = "product-grid";

//         productsToRender.forEach(product => {
//             const card = document.createElement("div");
//             card.className = "product-card";

//             const stock = product.stock ?? 0;
//             let stockMessage = "In Stock ✅";
//             let disabled = "";

//             if (stock === 0) {
//                 stockMessage = "Out of Stock ❌";
//                 disabled = "disabled";
//             } else if (stock < 5) {
//                 stockMessage = "Low Stock ⚠️";
//             }

//             const color = product.product_colors?.[0] || { hex_value: '#000', colour_name: 'N/A' };

//             card.innerHTML = `
//                 <img src="${product.image_link}" alt="${product.name}" loading="lazy">
//                 <h2>${product.name}</h2>
//                 <p class="price">${product.price_sign}${parseFloat(product.price).toFixed(2)}</p>
//                 <p class="rating">⭐ Rating: ${product.rating ?? "N/A"}</p>
//                 <p class="colour" style="color:${color.hex_value}">${color.colour_name}</p>
//                 <p class="stock">${stockMessage}</p>
//                 <button class="add-to-cart" ${disabled} aria-label="Add ${product.name} to cart">Add to Cart</button>
//             `;

//             card.querySelector('.add-to-cart').addEventListener('click', () => addToCart(product));
//             grid.appendChild(card);
//         });

//         const existing = mainSection.querySelector(".product-grid");
//         if (existing) existing.remove();
//         mainSection.appendChild(grid);
//     }

//     function setupSearch() {
//         searchInput.addEventListener('input', () => {
//             const query = searchInput.value.toLowerCase();
//             const filtered = products.filter(p => p.name.toLowerCase().includes(query));
//             renderProducts(filtered);
//         });
//     }

//     const localProducts = JSON.parse(localStorage.getItem('products'));
//     if (localProducts && localProducts.length > 0) {
//         products = localProducts;
//         renderProducts(products);
//         setupSearch();
//     } else {
//         fetch('../data/products.json')
//             .then(res => {
//                 if (!res.ok) throw new Error(`Status: ${res.status}`);
//                 return res.json();
//             })
//             .then(data => {
//                 products = data;
//                 localStorage.setItem('products', JSON.stringify(data));
//                 renderProducts(products);
//                 setupSearch();
//             })
//             .catch(error => {
//                 console.error("Error loading products:", error);
//                 const errorMsg = document.createElement('p');
//                 errorMsg.className = 'error-message';
//                 errorMsg.textContent = 'Failed to load products. Showing fallback data.';
//                 mainSection.appendChild(errorMsg);
//                 products = fallbackProducts;
//                 renderProducts(products);
//                 setupSearch();
//             });
//     }
// });


// Cart Utilities
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function getCart() {
    try {
        const cartData = localStorage.getItem('cart');
        return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
        console.error('Failed to retrieve cart:', error);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        return true;
    } catch (error) {
        console.error('Failed to save cart:', error);
        return false;
    }
}

async function addToCart(product) {
    if (!product || !product.id) {
        console.error('Invalid product data');
        showToast('Error adding item to cart');
        return false;
    }

    let cart = getCart();

    // Server-side inventory check (if implemented)
    try {
        const response = await fetch('/api/products/check-stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id })
        });
        const data = await response.json();
        if (!data.inStock) {
            showToast(`${product.name} is out of stock`);
            return false;
        }
    } catch (err) {
        console.warn('Stock check failed, falling back to client-side check');
    }

    const stock = product.stock ?? 0;
    if (stock <= 0) {
        showToast(`${product.name} is out of stock`);
        return false;
    }

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        if (existing.quantity >= stock) {
            showToast(`${product.name} has reached stock limit`);
            return false;
        }
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    const saved = saveCart(cart);
    if (saved) {
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        }
        showToast(`${product.name} added to cart!`);
        return true;
    }
    return false;
}

// Product Rendering
document.addEventListener('contentLoaded', (event) => {
    const { page } = event.detail;
    
    if (page.includes('products')) {
        const mainSection = document.querySelector("main") || document.createElement('main');
        const heading = document.createElement('h1');
        heading.textContent = "Our Products";
        heading.className = "page-heading";
        mainSection.insertBefore(heading, mainSection.firstChild);

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search for a product...';
        searchInput.setAttribute('aria-label', 'Search products by name');
        mainSection.insertBefore(searchInput, heading.nextSibling);

    function renderProducts(productsToRender) {
        const grid = document.createElement("section");
        grid.className = "product-grid";

        productsToRender.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card";

            const stock = product.stock ?? 0;
            let stockMessage = "In Stock ✅";
            let disabled = "";

            if (stock === 0) {
                stockMessage = "Out of Stock ❌";
                disabled = "disabled";
            } else if (stock < 5) {
                stockMessage = "Low Stock ⚠️";
            }

            const color = product.product_colors?.[0] || { hex_value: '#000', colour_name: 'N/A' };

            card.innerHTML = `
                <img src="${product.image_link}" alt="${product.name}" loading="lazy">
                <h2>${product.name}</h2>
                <p class="price">${product.price_sign}${parseFloat(product.price).toFixed(2)}</p>
                <p class="rating">⭐ Rating: ${product.rating ?? "N/A"}</p>
                <p class="colour" style="color:${color.hex_value}">${color.colour_name}</p>
                <p class="stock">${stockMessage}</p>
                <button class="add-to-cart" ${disabled} aria-label="Add ${product.name} to cart">Add to Cart</button>
            `;

            card.querySelector('.add-to-cart').addEventListener('click', () => addToCart(product));
            grid.appendChild(card);
        });

        const existing = mainSection.querySelector(".product-grid");
        if (existing) existing.remove();
        mainSection.appendChild(grid);
    }

        function setupSearch() {
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase();
                const filtered = appState.products.filter(p => p.name.toLowerCase().includes(query));
                renderProducts(filtered);
            });
        }

        // Use products from MongoDB
        if (appState.products.length > 0) {
            renderProducts(appState.products);
            setupSearch();
        } else {
            console.warn('No products available');
            mainSection.innerHTML = '<p>No products found in database</p>';
        }
    }
});


  document.addEventListener("DOMContentLoaded", function() {
    const lazyImages = document.querySelectorAll("img[loading='lazy']");
    
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            imageObserver.unobserve(img);
          }
        });
      });
      
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  });

  async function addToCart(product) {
    if (!product || !product.id || !product.name || !product.price || !product.stock) {
        console.error('Invalid product data:', product);
        showToast('Error adding item to cart', 'error');
        return false;
    }

    let cart = getCart();

    // Server-side inventory check
    let inStock = true;
    try {
        const response = await fetch('/api/products/check-stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id })
        });
        const data = await response.json();
        if (!response.ok) throw new Error('Stock check failed');
        inStock = data.inStock;
    } catch (err) {
        console.warn('Stock check failed, falling back to client-side check:', err);
        inStock = product.stock > 0; // Fallback
    }

    if (!inStock) {
        showToast(`${product.name} is out of stock`, 'error');
        return false;
    }

    const stock = product.stock ?? 0;
    if (stock <= 0) {
        showToast(`${product.name} is out of stock`, 'error');
        return false;
    }

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        if (existing.quantity >= stock) {
            showToast(`${product.name} has reached stock limit`, 'error');
            return false;
        }
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    const saved = saveCart(cart);
    if (saved) {
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        }
        showToast(`${product.name} added to cart!`, 'success');
        return true;
    }
    showToast('Error saving cart', 'error');
    return false;
}


