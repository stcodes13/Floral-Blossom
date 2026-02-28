let products = [];
let orders = [];
let selectedFile = null;
let currentTab = 'products';

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === 'admin123') {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        sessionStorage.setItem('admin_logged_in', 'true');
        loadDashboard();
    } else {
        showToast('Invalid credentials', 'error');
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('admin_logged_in');
    location.reload();
});

// Check session
if (sessionStorage.getItem('admin_logged_in')) {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadDashboard();
}

async function loadDashboard() {
    await loadProducts();
    await loadOrders();
    updateStats();
}

async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        products = data || [];
        displayProducts();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('productsList').innerHTML = '<p style="color: #d32f2f;">Error loading products</p>';
    }
}

function displayProducts() {
    const list = document.getElementById('productsList');
    list.innerHTML = '';
    
    if (products.length === 0) {
        list.innerHTML = '<p>No products yet</p>';
        return;
    }
    
    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'admin-product';
        div.innerHTML = `
            <img src="${product.image_url}" class="admin-product-image">
            <div class="admin-product-info">
                <h3>${product.title}</h3>
                <div style="color: var(--primary-green); font-weight: 600;">₹${product.price}</div>
            </div>
            <div>
                <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
            </div>
        `;
        list.appendChild(div);
    });
}

async function loadOrders() {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        orders = data || [];
        displayOrders();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('ordersList').innerHTML = '<p style="color: #d32f2f;">Error loading orders</p>';
    }
}

function displayOrders() {
    const list = document.getElementById('ordersList');
    list.innerHTML = '';
    
    if (orders.length === 0) {
        list.innerHTML = '<p>No orders yet</p>';
        return;
    }
    
    orders.forEach(order => {
        const div = document.createElement('div');
        div.className = 'order-card';
        div.innerHTML = `
            <div class="order-header">
                <div>
                    <strong>Order #${order.id}</strong>
                    <div style="font-size: 0.9rem; color: var(--text-light);">${new Date(order.created_at).toLocaleString()}</div>
                </div>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <strong>Customer:</strong> ${order.customer_name}<br>
                    <strong>Phone:</strong> ${order.phone}<br>
                    <strong>Email:</strong> ${order.email}
                </div>
                <div>
                    <strong>Address:</strong><br>
                    ${order.address}, ${order.city} - ${order.pincode}
                </div>
            </div>
            <div style="background: var(--cream); padding: 1rem; border-radius: 4px;">
                <strong>Items:</strong><br>
                ${order.items.map(item => `${item.title} × ${item.quantity} = ₹${item.price * item.quantity}`).join('<br>')}
                <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--beige); font-weight: 600;">
                    Total: ₹${order.total}
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}

function updateStats() {
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('totalRevenue').textContent = `₹${revenue}`;
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tab === 'products') {
        document.querySelector('.tab-btn').classList.add('active');
        document.getElementById('productsTab').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('ordersTab').classList.add('active');
    }
}

// Product Form
document.getElementById('addProductBtn').addEventListener('click', () => {
    document.getElementById('productFormTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('existingImageUrl').value = '';
    selectedFile = null;
    document.getElementById('imagePreview').innerHTML = '<span style="color: var(--text-light);">Preview will appear here</span>';
    document.getElementById('productFormModal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
});

async function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('productFormTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productTitle').value = product.title;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('existingImageUrl').value = product.image_url;
    selectedFile = null;
    document.getElementById('imagePreview').innerHTML = `<img src="${product.image_url}">`;
    document.getElementById('productFormModal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        showToast('Product deleted', 'success');
        await loadProducts();
        updateStats();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error deleting product', 'error');
    }
}

// Image upload
document.getElementById('imageUploadArea').addEventListener('click', () => {
    document.getElementById('imageInput').click();
});

document.getElementById('imageUploadArea').addEventListener('dragover', (e) => {
    e.preventDefault();
    e.target.style.borderColor = 'var(--primary-green)';
});

document.getElementById('imageUploadArea').addEventListener('dragleave', (e) => {
    e.target.style.borderColor = 'var(--beige)';
});

document.getElementById('imageUploadArea').addEventListener('drop', (e) => {
    e.preventDefault();
    e.target.style.borderColor = 'var(--beige)';
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files[0]);
});

document.getElementById('imageInput').addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
});

function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be less than 5MB', 'error');
        return;
    }
    
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}">`;
    };
    reader.readAsDataURL(file);
}

async function uploadImage(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    try {
        const { data, error } = await supabase.storage
            .from('products')
            .upload(fileName, file);
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName);
        
        return publicUrl;
    } catch (error) {
        throw error;
    }
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('productId').value;
    const title = document.getElementById('productTitle').value.trim();
    const price = parseInt(document.getElementById('productPrice').value);
    let imageUrl = document.getElementById('existingImageUrl').value;
    
    try {
        if (selectedFile) {
            imageUrl = await uploadImage(selectedFile);
        }
        
        if (!imageUrl) {
            showToast('Please upload an image', 'error');
            return;
        }
        
        const productData = { title, price, image_url: imageUrl };
        
        if (id) {
            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', id);
            
            if (error) throw error;
            showToast('Product updated', 'success');
        } else {
            const { error } = await supabase
                .from('products')
                .insert([productData]);
            
            if (error) throw error;
            showToast('Product added', 'success');
        }
        
        document.getElementById('productFormModal').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
        await loadProducts();
        updateStats();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error saving product', 'error');
    }
});

document.getElementById('closeProductForm').addEventListener('click', () => {
    document.getElementById('productFormModal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
});

document.getElementById('cancelProductForm').addEventListener('click', () => {
    document.getElementById('productFormModal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
});

document.getElementById('overlay').addEventListener('click', () => {
    document.getElementById('productFormModal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
});

function showToast(message, type) {
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
