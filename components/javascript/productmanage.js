console.log('productmanage.js loaded');

// Initialize product management functionality
function initializeProductManagement() {
    if (!window.location.pathname.includes('productmanage.html')) {
        console.log('Not on product management page, skipping initialization.');
        return;
    }

    // DOM Elements
    const productForm = document.getElementById('product-form');
    const productsContainer = document.getElementById('products');
    const cancelEditBtn = document.getElementById('cancel-edit');

    if (!productForm || !productsContainer) {
        console.warn('Required elements not found. The DOM might not be ready.');
        return;
    }

    // Load products when page loads
    loadProducts();

    // Form submission handler
    productForm.addEventListener('submit', handleFormSubmit);
    cancelEditBtn.addEventListener('click', resetForm);
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    try {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        
        const formData = new FormData(form);
        const isEditing = form.dataset.editingId;
        
        const product = {
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            category: formData.get('product_type').trim(), // Map product_type to category
            image: formData.get('image_link').trim(),
            // Add other fields if needed, e.g., brand, rating
        };

        // Validate required fields
        if (!product.name || isNaN(product.price) || !product.description || !product.image || isNaN(product.stock)) {
            throw new Error('All required fields must be filled');
        }

        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        if (!token) {
            throw new Error('Authentication token not found. Please log in.');
        }

        let response;
        if (isEditing) {
            // Update existing product
            response = await fetch(`http://localhost:5000/api/products/${isEditing}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(product),
            });
        } else {
            // Add new product
            response = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(product),
            });
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save product');
        }

        const savedProduct = await response.json();
        
        // Update UI
        if (isEditing) {
            document.querySelector(`.product-card[data-id="${isEditing}"]`)?.remove();
        }
        renderProduct(savedProduct);
        
        showToast(`${product.name} ${isEditing ? 'updated' : 'added'} successfully!`);
        resetForm();
    } catch (error) {
        console.error('Submission error:', error);
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = false;
    }
}

// Load products from API
async function loadProducts() {
    const productsContainer = document.getElementById('products');
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '';
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/products', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const products = await response.json();
        products.forEach(product => renderProduct(product));
    } catch (error) {
        console.error('Error loading products:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

// Render a single product
function renderProduct(product) {
    const productsContainer = document.getElementById('products');
    if (!productsContainer) return;

    const existingCard = document.querySelector(`.product-card[data-id="${product._id}"]`);
    if (existingCard) existingCard.remove();

    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.dataset.id = product._id;
    
    productCard.innerHTML = `
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
        <h2>${product.name}</h2>
        <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
        <p><strong>Stock:</strong> ${product.stock}</p>
        <p><strong>Category:</strong> ${product.category || 'N/A'}</p>
        <p>${product.description}</p>
        <div class="product-actions">
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;
    
    productsContainer.appendChild(productCard);
    
    // Add event listeners to the buttons
    productCard.querySelector('.edit-btn').addEventListener('click', () => editProduct(product));
    productCard.querySelector('.delete-btn').addEventListener('click', () => deleteProduct(product._id));
}

// Edit product
function editProduct(product) {
    const productForm = document.getElementById('product-form');
    if (!productForm) return;

    productForm.name.value = product.name;
    productForm.description.value = product.description;
    productForm.price.value = product.price;
    productForm.image_link.value = product.image;
    productForm.product_type.value = product.category || '';
    productForm.stock.value = product.stock;
    
    productForm.dataset.editingId = product._id;
    
    productForm.querySelector('button[type="submit"]').textContent = 'Update Product';
    document.getElementById('cancel-edit').style.display = 'block';
    
    productForm.scrollIntoView({ behavior: 'smooth' });
}

// Delete product
async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete product');
            }
            
            document.querySelector(`.product-card[data-id="${productId}"]`)?.remove();
            showToast('Product deleted successfully!');
        } catch (error) {
            console.error('Deletion error:', error);
            showToast(`Error: ${error.message}`, 'error');
        }
    }
}

// Reset form
function resetForm() {
    const productForm = document.getElementById('product-form');
    if (!productForm) return;

    productForm.reset();
    delete productForm.dataset.editingId;
    productForm.querySelector('button[type="submit"]').textContent = 'Add Product';
    document.getElementById('cancel-edit').style.display = 'none';
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeProductManagement);

// Retry initialization if needed
setTimeout(() => {
    console.log('Retrying product management initialization after delay');
    initializeProductManagement();
}, 1000);