// Cart state
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentProduct = null;
let currentQuantity = 1;

// Initialize icons
const initIcons = () => { if (window.lucide) window.lucide.createIcons(); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initIcons);
else initIcons();

// Update cart count in navbar
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.getElementById('cartCount');
    if (count > 0) {
        cartCount.textContent = count;
        cartCount.classList.remove('hidden');
    } else {
        cartCount.classList.add('hidden');
    }
}

// Show product detail modal
function showProductDetail(name, price, image) {
    currentProduct = { name, price, image };
    currentQuantity = 1;
    
    document.getElementById('modalProductName').textContent = name;
    document.getElementById('modalProductPrice').textContent = `₹${price}`;
    document.getElementById('modalProductImage').src = image;
    document.getElementById('productQuantity').textContent = currentQuantity;
    
    // Set mock product details
    document.getElementById('modalProductDesc').textContent = `Premium quality ${name} with advanced features and long battery life. Perfect for daily use.`;
    document.getElementById('modalBrand').textContent = name.split(' ')[0];
    document.getElementById('modalModel').textContent = name.split(' ').slice(1).join(' ');
    
    document.getElementById('productModal').classList.remove('hidden');
}

// Close modal
function closeModal() {
    document.getElementById('productModal').classList.add('hidden');
}

// Quantity controls
function increaseQuantity() {
    currentQuantity++;
    document.getElementById('productQuantity').textContent = currentQuantity;
}

function decreaseQuantity() {
    if (currentQuantity > 1) {
        currentQuantity--;
        document.getElementById('productQuantity').textContent = currentQuantity;
    }
}

// Add to cart from modal
function addToCartFromModal() {
    const existingItem = cart.find(item => item.name === currentProduct.name);
    
    if (existingItem) {
        existingItem.quantity += currentQuantity;
    } else {
        cart.push({
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.image,
            quantity: currentQuantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`${currentProduct.name} added to cart`);
    closeModal();
}

// Display cart items
function displayCartItems() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';
    
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'bg-white p-4 rounded-xl shadow-sm flex gap-4';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-contain">
            <div class="flex-1">
                <h3 class="font-medium">${item.name}</h3>
                <p class="text-gray-500 text-sm">₹${item.price}</p>
                <div class="flex items-center justify-between mt-2">
                    <div class="flex items-center gap-2">
                        <button onclick="updateQuantity(${index}, -1)" class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <i data-lucide="minus" class="w-3 h-3"></i>
                        </button>
                        <span class="font-medium">${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)" class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <i data-lucide="plus" class="w-3 h-3"></i>
                        </button>
                    </div>
                    <p class="font-bold">₹${itemTotal}</p>
                </div>
                <button onclick="removeItem(${index})" class="mt-2 text-red-500 text-sm flex items-center gap-1">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                    Remove
                </button>
            </div>
        `;
        container.appendChild(itemElement);
    });
    
    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('total').textContent = `₹${subtotal + 49}`;
    
    lucide.createIcons();
}

// Update item quantity in cart
function updateQuantity(index, change) {
    const newQuantity = cart[index].quantity + change;
    
    if (newQuantity > 0) {
        cart[index].quantity = newQuantity;
    } else {
        cart.splice(index, 1);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartCount();
}

// Remove item from cart
function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartCount();
    showToast('Item removed from cart');
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }
    window.location.href = 'checkout.html';
}

// Display order summary in checkout
function displayOrderSummary() {
    const container = document.getElementById('orderSummary');
    container.innerHTML = '';
    
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'flex justify-between';
        itemElement.innerHTML = `
            <span>${item.name} × ${item.quantity}</span>
            <span>₹${itemTotal}</span>
        `;
        container.appendChild(itemElement);
    });
    
    document.getElementById('checkoutSubtotal').textContent = `₹${subtotal}`;
    document.getElementById('checkoutTotal').textContent = `₹${subtotal + 49}`;
}

// Place order
function placeOrder() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const pincode = document.getElementById('pincode').value;
    
    if (!name || !phone || !address || !pincode) {
        showToast('Please fill all address details');
        return;
    }
    
    // In a real app, you would send this data to your backend
    const orderData = {
        items: [...cart],
        address: { name, phone, address, pincode },
        paymentMethod: document.querySelector('input[name="payment"]:checked').id,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 49
    };
    
    console.log('Order placed:', orderData);
    
    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Redirect to success page
    window.location.href = 'order-success.html';
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}