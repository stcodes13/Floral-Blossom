let cart = [];
let products = [];
let allProducts = [];

async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        products = data || [];
        allProducts = [...products];
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsGrid').innerHTML = '<p style="text-align: center; color: #d32f2f; padding: 3rem;">Error loading products</p>';
    }
}

function displayProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 3rem;">No products found</p>';
        return;
    }
    
    products.forEach(product => {
        const cartItem = cart.find(item => item.id === product.id);
        const badge = cartItem ? `<div class="cart-badge">In Cart: ${cartItem.quantity}</div>` : '';
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            ${badge}
            <img src="${product.image_url}" alt="${product.title}" class="product-image" loading="lazy" onerror="this.src='https://via.placeholder.com/600x800/f8f6f3/2d5147?text=Image+Not+Available'">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">₹${product.price}</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity++;
        showToast(`${product.title} quantity increased`, 'success');
    } else {
        cart.push({ ...product, quantity: 1 });
        showToast(`${product.title} added to cart`, 'success');
    }
    
    saveCart();
    updateCart();
    displayProducts();
}

function updateCart() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        checkoutBtn.disabled = true;
    } else {
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.image_url}" alt="${item.title}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/100/f8f6f3/2d5147?text=No+Image'">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">₹${item.price}</div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            `;
            cartItems.appendChild(div);
        });
        checkoutBtn.disabled = false;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `₹${total}`;
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCart();
            displayProducts();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCart();
    displayProducts();
}

function saveCart() {
    localStorage.setItem('floralblossom_cart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('floralblossom_cart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCart();
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    document.getElementById('toastContainer').appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Search
document.getElementById('searchInput').addEventListener('input', (e) => {
    const search = e.target.value.toLowerCase().trim();
    
    if (search === '') {
        products = [...allProducts];
    } else {
        products = allProducts.filter(p => 
            p.title.toLowerCase().includes(search)
        );
    }
    
    displayProducts();
});

// Cart sidebar
document.getElementById('cartBtn').addEventListener('click', () => {
    document.getElementById('cartSidebar').classList.add('active');
    document.getElementById('overlay').classList.add('active');
});

document.getElementById('closeCart').addEventListener('click', () => {
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
});

document.getElementById('overlay').addEventListener('click', () => {
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('checkoutModal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
});

// Checkout
document.getElementById('checkoutBtn').addEventListener('click', () => {
    const orderItems = document.getElementById('orderItems');
    orderItems.innerHTML = '';
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'order-item';
        div.innerHTML = `<span>${item.title} × ${item.quantity}</span><span>₹${item.price * item.quantity}</span>`;
        orderItems.appendChild(div);
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('orderTotal').textContent = `₹${total}`;
    document.getElementById('checkoutModal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
});

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('checkoutModal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
});

// Form validation
const formFields = {
    name: { validate: v => v.trim().length >= 3, error: 'Name must be at least 3 characters' },
    phone: { validate: v => /^[0-9]{10}$/.test(v), error: 'Enter valid 10-digit phone' },
    email: { validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), error: 'Enter valid email' },
    address: { validate: v => v.trim().length >= 10, error: 'Address too short' },
    city: { validate: v => v.trim().length >= 2, error: 'Enter valid city' },
    pincode: { validate: v => /^[0-9]{6}$/.test(v), error: 'Enter valid 6-digit pincode' }
};

Object.keys(formFields).forEach(name => {
    const field = document.getElementById(name);
    const error = document.getElementById(name + 'Error');
    if (field && error) {
        field.addEventListener('blur', () => {
            if (field.value && !formFields[name].validate(field.value)) {
                field.classList.add('error');
                error.textContent = formFields[name].error;
            } else {
                field.classList.remove('error');
                error.textContent = '';
            }
        });
    }
});

document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let valid = true;
    Object.keys(formFields).forEach(name => {
        const field = document.getElementById(name);
        const error = document.getElementById(name + 'Error');
        if (field && error) {
            if (field.hasAttribute('required') && !field.value) {
                field.classList.add('error');
                error.textContent = 'Required';
                valid = false;
            } else if (field.value && !formFields[name].validate(field.value)) {
                field.classList.add('error');
                error.textContent = formFields[name].error;
                valid = false;
            }
        }
    });
    
    if (!valid) {
        showToast('Please fix form errors', 'error');
        return;
    }
    
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'Placing Order...';
    
    try {
        const orderData = {
            customer_name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            pincode: document.getElementById('pincode').value,
            notes: document.getElementById('notes').value,
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'pending'
        };
        
        // Save to Supabase
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();
        
        if (error) throw error;
        
        // Send email receipt
        try {
            const response = await fetch('/api/send-receipt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: data.id,
                    customerEmail: orderData.email,
                    customerName: orderData.customer_name,
                    items: cart,
                    total: orderData.total,
                    address: `${orderData.address}, ${orderData.city} - ${orderData.pincode}`
                })
            });
            
            if (!response.ok) {
                console.error('Failed to send email');
            }
        } catch (emailError) {
            console.error('Email error:', emailError);
        }
        
        cart = [];
        saveCart();
        updateCart();
        displayProducts();
        
        document.getElementById('checkoutModal').classList.remove('active');
        document.getElementById('successMessage').classList.add('active');
        document.getElementById('checkoutForm').reset();
        
        Object.keys(formFields).forEach(name => {
            const field = document.getElementById(name);
            const error = document.getElementById(name + 'Error');
            if (field && error) {
                field.classList.remove('error');
                error.textContent = '';
            }
        });
    } catch (error) {
        console.error('Error placing order:', error);
        showToast('Error placing order. Please try again.', 'error');
    } finally {
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = 'Place Order';
    }
});

document.getElementById('continueBtn').addEventListener('click', () => {
    document.getElementById('successMessage').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
});

document.getElementById('newsletterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Thank you for subscribing!', 'success');
    e.target.reset();
});

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    loadProducts();
});
