// **script.js - Fixed Version**

// Initialize data
let cart = [];
let selectedPayment = 'cash';

// Update time and date
function updateDateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
    const dateStr = now.toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
    
    document.getElementById('currentTime').textContent = timeStr;
    document.getElementById('currentDate').textContent = dateStr;
    
    // Update preview date
    const previewDate = now.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'});
    const previewTime = now.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
    document.getElementById('previewDate').textContent = `${previewDate}, ${previewTime}`;
    
    // Generate random ticket ID
    const randomId = 'WP-' + now.getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('previewTicketId').textContent = randomId;
}

// Initialize date/time
updateDateTime();
setInterval(updateDateTime, 60000); // Update every minute

// Ticket selection - FIXED VERSION
document.addEventListener('click', function(e) {
    // Handle ticket card clicks
    if (e.target.closest('.ticket-card')) {
        const ticketCard = e.target.closest('.ticket-card');
        addToCart(ticketCard);
    }
    
    // Handle category button clicks
    if (e.target.closest('.category-btn')) {
        const categoryBtn = e.target.closest('.category-btn');
        const category = categoryBtn.getAttribute('data-category');
        
        // Remove active class from all buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        categoryBtn.classList.add('active');
        filterTickets(category);
    }
    
    // Handle payment button clicks
    if (e.target.closest('.payment-btn')) {
        const paymentBtn = e.target.closest('.payment-btn');
        selectedPayment = paymentBtn.getAttribute('data-method');
        
        // Remove active class from all buttons
        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        paymentBtn.classList.add('active');
        updatePaymentMethod();
    }
    
    // Handle cart button clicks
    if (e.target.closest('.decrease-btn')) {
        const index = parseInt(e.target.closest('.decrease-btn').getAttribute('data-index'));
        updateQuantity(index, -1);
    }
    
    if (e.target.closest('.increase-btn')) {
        const index = parseInt(e.target.closest('.increase-btn').getAttribute('data-index'));
        updateQuantity(index, 1);
    }
    
    if (e.target.closest('.remove-btn')) {
        const index = parseInt(e.target.closest('.remove-btn').getAttribute('data-index'));
        removeFromCart(index);
    }
});

// Add item to cart
function addToCart(ticketCard) {
    const title = ticketCard.querySelector('.ticket-title').textContent;
    const price = parseInt(ticketCard.getAttribute('data-price'));
    
    // Add visual feedback
    ticketCard.classList.add('selected');
    setTimeout(() => {
        ticketCard.classList.remove('selected');
    }, 300);
    
    // Check if ticket already in cart
    const existingItemIndex = cart.findIndex(item => item.title === title);
    
    if (existingItemIndex !== -1) {
        // Increase quantity if item exists
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item to cart
        cart.push({
            title: title,
            price: price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
}

// Filter tickets by category
function filterTickets(category) {
    const tickets = document.querySelectorAll('.ticket-card');
    
    tickets.forEach(ticket => {
        const ticketCategory = ticket.getAttribute('data-category');
        if (category === 'all' || ticketCategory === category) {
            ticket.style.display = 'block';
            setTimeout(() => {
                ticket.style.opacity = '1';
                ticket.style.transform = 'translateY(0)';
            }, 10);
        } else {
            ticket.style.opacity = '0';
            ticket.style.transform = 'translateY(10px)';
            setTimeout(() => {
                ticket.style.display = 'none';
            }, 300);
        }
    });
}

// Search functionality
document.getElementById('searchTickets')?.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    const tickets = document.querySelectorAll('.ticket-card');
    
    if (searchTerm === '') {
        // If search is empty, show tickets based on active category
        const activeCategory = document.querySelector('.category-btn.active')?.getAttribute('data-category') || 'all';
        filterTickets(activeCategory);
        return;
    }
    
    tickets.forEach(ticket => {
        const title = ticket.querySelector('.ticket-title').textContent.toLowerCase();
        const desc = ticket.querySelector('.ticket-desc').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || desc.includes(searchTerm)) {
            ticket.style.display = 'block';
            setTimeout(() => {
                ticket.style.opacity = '1';
                ticket.style.transform = 'translateY(0)';
            }, 10);
        } else {
            ticket.style.opacity = '0';
            ticket.style.transform = 'translateY(10px)';
            setTimeout(() => {
                ticket.style.display = 'none';
            }, 300);
        }
    });
});

function updatePaymentMethod() {
    let paymentText = selectedPayment.charAt(0).toUpperCase() + selectedPayment.slice(1);
    if (selectedPayment === 'jazzcash') paymentText = 'JazzCash';
    if (selectedPayment === 'easypaisa') paymentText = 'EasyPaisa';
    document.getElementById('previewPayment').textContent = paymentText;
}

// Update cart display - FIXED VERSION
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    
    if (!cartItemsContainer || !emptyCartMessage) {
        console.error('Cart elements not found');
        return;
    }
    
    if (cart.length === 0) {
        // Show empty cart message
        emptyCartMessage.style.display = 'block';
        cartItemsContainer.innerHTML = '';
        
        // Reset totals
        document.getElementById('subtotal').textContent = 'PKR 0';
        document.getElementById('taxAmount').textContent = 'PKR 0';
        document.getElementById('discount').textContent = 'PKR 0';
        document.getElementById('totalAmount').textContent = 'PKR 0';
        document.getElementById('previewTotal').textContent = 'PKR 0';
        
        // Update cart count
        document.getElementById('cartCount').textContent = '0 items';
        
        return;
    }
    
    // Hide empty cart message
    emptyCartMessage.style.display = 'none';
    
    let cartHTML = '';
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        cartHTML += `
        <div class="cart-item" data-index="${index}">
            <div class="cart-item-info">
                <h6 class="mb-1">${item.title}</h6>
                <p class="mb-0">PKR ${item.price.toLocaleString()} each</p>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn decrease-btn" data-index="${index}">-</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn increase-btn" data-index="${index}">+</button>
                <span class="item-total" style="font-weight: 600; min-width: 80px; text-align: right;">
                    PKR ${itemTotal.toLocaleString()}
                </span>
                <button class="qty-btn text-danger remove-btn" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    
    // Calculate totals
    const tax = subtotal * 0.16;
    const discount = 0;
    const total = subtotal + tax - discount;
    
    // Update total displays
    document.getElementById('subtotal').textContent = `PKR ${subtotal.toLocaleString()}`;
    document.getElementById('taxAmount').textContent = `PKR ${tax.toLocaleString()}`;
    document.getElementById('discount').textContent = `PKR ${discount.toLocaleString()}`;
    document.getElementById('totalAmount').textContent = `PKR ${total.toLocaleString()}`;
    
    // Update preview total
    document.getElementById('previewTotal').textContent = `PKR ${total.toLocaleString()}`;
}

// Update quantity
function updateQuantity(index, change) {
    if (index >= 0 && index < cart.length) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        updateCartDisplay();
    }
}

// Remove from cart
function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        updateCartDisplay();
    }
}

// Clear cart
document.getElementById('clearCart')?.addEventListener('click', function() {
    if (cart.length > 0 && confirm('Are you sure you want to clear all items from the cart?')) {
        cart = [];
        updateCartDisplay();
    }
});

// Generate ticket
document.getElementById('generateTicket')?.addEventListener('click', function() {
    if (cart.length === 0) {
        alert('Please add at least one ticket to generate.');
        return;
    }
    
    // Update customer info in preview
    const customerName = document.getElementById('customerName').value || 'Walk-in Customer';
    
    document.getElementById('previewCustomer').textContent = customerName;
    
    // Show ticket preview
    document.getElementById('ticketPreview').classList.add('active');
    document.getElementById('overlay').classList.add('active');
});

// Close preview
document.getElementById('closePreview')?.addEventListener('click', function() {
    document.getElementById('ticketPreview').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
});

// Print ticket
document.getElementById('printTicket')?.addEventListener('click', function() {
    // In a real app, this would connect to a thermal printer
    alert('Ticket sent to printer! Total: ' + document.getElementById('previewTotal').textContent);
    
    // Clear cart after printing
    cart = [];
    updateCartDisplay();
    
    // Reset customer form
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    
    // Close preview
    document.getElementById('ticketPreview').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
});

// Close preview when clicking overlay
document.getElementById('overlay')?.addEventListener('click', function() {
    document.getElementById('ticketPreview').classList.remove('active');
    this.classList.remove('active');
});

// Initialize
function initializeApp() {
    // Set cash as default payment method
    const cashBtn = document.querySelector('.payment-btn[data-method="cash"]');
    if (cashBtn) {
        cashBtn.classList.add('active');
    }
    updatePaymentMethod();
    
    // Initialize cart display
    updateCartDisplay();
    
    // Add demo items to cart for demonstration (optional)
    setTimeout(() => {
        if (cart.length === 0) {
            cart.push({
                title: "Daily Entry Pass",
                price: 1500,
                quantity: 2
            });
            
            cart.push({
                title: "Sky Wheel",
                price: 600,
                quantity: 1
            });
            
            updateCartDisplay();
        }
    }, 1000);
}

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}