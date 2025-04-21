document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const productForm = document.getElementById('product-form');
    const productsContainer = document.getElementById('products');
    const cancelEditBtn = document.getElementById('cancel-edit');
    
    // Load products when page loads
    loadProducts();
    
    // Form submission handler
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(productForm);
        const isEditing = productForm.dataset.editingId;
        const originalProduct = isEditing ? JSON.parse(productForm.dataset.originalProduct) : null;
        
        const product = {
            id: isEditing ? parseInt(isEditing) : Date.now(),
            name: formData.get('name').trim() || (originalProduct ? originalProduct.name : ''),
            brand: formData.get('brand').trim() || (originalProduct ? originalProduct.brand : ''),
            price: parseFloat(formData.get('price')) || (originalProduct ? originalProduct.price : 0),
            price_sign: formData.get('price_sign') || (originalProduct ? originalProduct.price_sign : '$'),
            image_link: formData.get('image_link').trim() || (originalProduct ? originalProduct.image_link : ''),
            description: formData.get('description').trim() || (originalProduct ? originalProduct.description : ''),
            rating: formData.get('rating') ? parseFloat(formData.get('rating')) : (originalProduct ? originalProduct.rating : null),
            product_type: formData.get('product_type') || (originalProduct ? originalProduct.product_type : ''),
            stock: parseInt(formData.get('stock')) || (originalProduct ? originalProduct.stock : 0),
            createdAt: originalProduct ? originalProduct.createdAt : new Date().toISOString()
        };
        
        // Save to localStorage
        const savedProducts = JSON.parse(localStorage.getItem('products')) || [];
        
        if (isEditing) {
            // Update existing product
            const updatedProducts = savedProducts.map(p => p.id === product.id ? product : p);
            localStorage.setItem('products', JSON.stringify(updatedProducts));
            
            // Update UI
            document.querySelector(`.product-card[data-id="${product.id}"]`).remove();
            renderProduct(product);
            
            showToast(`${product.name} updated successfully!`);
        } else {
            // Add new product
            savedProducts.push(product);
            localStorage.setItem('products', JSON.stringify(savedProducts));
            renderProduct(product);
            
            showToast(`${product.name} added successfully!`);
        }
        
        // Reset form
        resetForm();
    });
    
    // Cancel edit handler
    cancelEditBtn.addEventListener('click', resetForm);
    
    // Load products from localStorage
    function loadProducts() {
        const savedProducts = localStorage.getItem('products');
        if (savedProducts) {
            JSON.parse(savedProducts).forEach(product => renderProduct(product));
        }
    }
    
    // Render a single product
    function renderProduct(product) {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.id = product.id;
        
        productCard.innerHTML = `
            <img src="${product.image_link}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
            <h2>${product.name}</h2>
            <p><strong>Brand:</strong> ${product.brand}</p>
            <p><strong>Price:</strong> ${product.price_sign}${product.price.toFixed(2)}</p>
            <p><strong>Rating:</strong> ${product.rating !== null ? product.rating : 'N/A'}</p>
            <p><strong>Type:</strong> ${product.product_type || 'N/A'}</p>
            <p><strong>Stock:</strong> ${product.stock}</p>
            <p>${product.description}</p>
            <div class="product-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
        
        // Add event listeners to the buttons
        productCard.querySelector('.edit-btn').addEventListener('click', () => editProduct(product));
        productCard.querySelector('.delete-btn').addEventListener('click', () => deleteProduct(product.id));
    }
    
    // Edit product
    function editProduct(product) {
        productForm.name.value = product.name;
        productForm.brand.value = product.brand;
        productForm.price.value = product.price;
        productForm.price_sign.value = product.price_sign;
        productForm.image_link.value = product.image_link;
        productForm.description.value = product.description;
        productForm.rating.value = product.rating || '';
        productForm.product_type.value = product.product_type || '';
        productForm.stock.value = product.stock;
        
        productForm.dataset.editingId = product.id;
        productForm.dataset.originalProduct = JSON.stringify(product);
        
        productForm.querySelector('button[type="submit"]').textContent = 'Update Product';
        cancelEditBtn.style.display = 'block';
        
        // Scroll to form
        productForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Delete product
    function deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            // Remove from localStorage
            const savedProducts = JSON.parse(localStorage.getItem('products')) || [];
            const updatedProducts = savedProducts.filter(p => p.id !== productId);
            localStorage.setItem('products', JSON.stringify(updatedProducts));
            
            // Remove from DOM
            document.querySelector(`.product-card[data-id="${productId}"]`).remove();
            
            showToast('Product deleted successfully!');
        }
    }
    
    // Reset form
    function resetForm() {
        productForm.reset();
        delete productForm.dataset.editingId;
        delete productForm.dataset.originalProduct;
        productForm.querySelector('button[type="submit"]').textContent = 'Add Product';
        cancelEditBtn.style.display = 'none';
    }
    
    // Show toast notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
});