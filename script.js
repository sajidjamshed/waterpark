// Initialize data
let cart = [];
let selectedPayment = 'cash';

// DOM Elements
const cartItemsContainer = document.getElementById('cartItems');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const cartCountElement = document.getElementById('cartCount');
const subtotalElement = document.getElementById('subtotal');
const taxAmountElement = document.getElementById('taxAmount');
const discountElement = document.getElementById('discount');
const totalAmountElement = document.getElementById('totalAmount');
const previewTotalElement = document.getElementById('previewTotal');

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
setInterval(updateDateTime, 60000);

// Ticket selection
document.addEventListener('click', function(e) {
    const ticketCard = e.target.closest('.ticket-card');
    if (ticketCard) {
        addToCart(ticketCard);
    }
});

// Add item to cart
function addToCart(ticketCard) {
    const title = ticketCard.querySelector('.ticket-title').textContent;
    const price = parseInt(ticketCard.getAttribute('data-price'));
    const category = ticketCard.getAttribute('data-category');
    
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
            category: category,
            quantity: 1
        });
    }
    
    updateCartDisplay();
}

// Update cart display - FIXED VERSION
function updateCartDisplay() {
    // Always ensure we have elements
    if (!cartItemsContainer || !emptyCartMessage) {
        console.log('Cart elements not initialized yet');
        return;
    }
    
    if (cart.length === 0) {
        // Show empty cart message
        emptyCartMessage.style.display = 'flex';
        cartItemsContainer.innerHTML = '';
        
        // Update totals
        updateCartTotals();
        return;
    }
    
    // Hide empty cart message
    emptyCartMessage.style.display = 'none';
    
    let cartHTML = '';
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        
        cartHTML += `
        <div class="cart-item">
            <div class="cart-item-info">
                <h6 class="mb-1">${item.title}</h6>
                <p class="mb-0">PKR ${item.price.toLocaleString()} each</p>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                <span class="ms-3" style="font-weight: 600; min-width: 80px; text-align: right;">
                    PKR ${itemTotal.toLocaleString()}
                </span>
                <button class="qty-btn text-danger" onclick="removeFromCart(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    updateCartTotals();
}

// Update cart totals
function updateCartTotals() {
    let subtotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const tax = subtotal * 0.16;
    const discount = 0;
    const total = subtotal + tax - discount;
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    
    // Update totals display
    subtotalElement.textContent = `PKR ${subtotal.toLocaleString()}`;
    taxAmountElement.textContent = `PKR ${tax.toLocaleString()}`;
    discountElement.textContent = `PKR ${discount.toLocaleString()}`;
    totalAmountElement.textContent = `PKR ${total.toLocaleString()}`;
    
    // Update preview total
    previewTotalElement.textContent = `PKR ${total.toLocaleString()}`;
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

// Category filtering
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');
        
        const category = this.getAttribute('data-category');
        filterTickets(category);
    });
});

// Filter tickets by category
function filterTickets(category) {
    const tickets = document.querySelectorAll('.ticket-card');
    
    tickets.forEach(ticket => {
        if (category === 'all' || ticket.getAttribute('data-category') === category) {
            ticket.style.display = 'block';
        } else {
            ticket.style.display = 'none';
        }
    });
}

// Search functionality
document.getElementById('searchTickets').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const tickets = document.querySelectorAll('.ticket-card');
    
    tickets.forEach(ticket => {
        const title = ticket.querySelector('.ticket-title').textContent.toLowerCase();
        const desc = ticket.querySelector('.ticket-desc').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || desc.includes(searchTerm)) {
            ticket.style.display = 'block';
        } else {
            ticket.style.display = 'none';
        }
    });
});

// Payment method selection
document.querySelectorAll('.payment-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons
        document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');
        
        selectedPayment = this.getAttribute('data-method');
        updatePaymentMethod();
    });
});

function updatePaymentMethod() {
    let paymentText = selectedPayment.charAt(0).toUpperCase() + selectedPayment.slice(1);
    if (selectedPayment === 'jazzcash') paymentText = 'JazzCash';
    if (selectedPayment === 'easypaisa') paymentText = 'EasyPaisa';
    document.getElementById('previewPayment').textContent = paymentText;
}

// Clear cart
document.getElementById('clearCart').addEventListener('click', function() {
    if (cart.length > 0 && confirm('Are you sure you want to clear all items?')) {
        cart = [];
        updateCartDisplay();
    }
});

// Generate ticket
document.getElementById('generateTicket').addEventListener('click', function() {
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
document.getElementById('closePreview').addEventListener('click', function() {
    document.getElementById('ticketPreview').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
});

// Print ticket
document.getElementById('printTicket').addEventListener('click', function() {
    // In a real app, this would connect to a thermal printer
   // alert('Ticket sent to printer! Total: ' + document.getElementById('previewTotal').textContent);
    
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
document.getElementById('overlay').addEventListener('click', function() {
    document.getElementById('ticketPreview').classList.remove('active');
    this.classList.remove('active');
});

// Initialize app
function initializeApp() {
    // Set cash as default payment method
    updatePaymentMethod();
    
    // Initialize cart display
    updateCartDisplay();
    
    // Add demo items to cart for demonstration (optional)
    setTimeout(() => {
        if (cart.length === 0) {
            cart.push({
                title: "Daily Entry Pass",
                price: 1500,
                category: "entry",
                quantity: 2
            });
            
            cart.push({
                title: "Sky Wheel",
                price: 600,
                category: "rides",
                quantity: 1
            });
            
            updateCartDisplay();
        }
    }, 1000);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}




// Ticket Display Modal Functions

// Generate ticket display
function generateTicketDisplay() {
    if (cart.length === 0) return;
    
    const ticketsGrid = document.getElementById('ticketsGrid');
    const totalTicketsCount = document.getElementById('totalTicketsCount');
    const displayCustomerName = document.getElementById('displayCustomerName');
    const displayGenerationTime = document.getElementById('displayGenerationTime');
    const displayPaymentMethod = document.getElementById('displayPaymentMethod');
    const displayTotalAmount = document.getElementById('displayTotalAmount');
    
    // Calculate total number of tickets (including quantities)
    let totalTickets = 0;
    let ticketsHTML = '';
    
    // Generate a unique ticket ID base
    const baseTicketId = 'WP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    
    cart.forEach((item, index) => {
        // Create one ticket per quantity
        for (let i = 0; i < item.quantity; i++) {
            totalTickets++;
            const ticketNumber = totalTickets;
            const uniqueTicketId = baseTicketId + (index + 1) + String.fromCharCode(65 + i); // WP-2024-1234A
            
            // Generate QR code text
            const qrText = `${uniqueTicketId}|${item.title}|${item.price}|${new Date().toISOString()}`;
            
            ticketsHTML += `
            <div class="ticket-item">
                <div class="ticket-header">
                    <span class="ticket-number">${ticketNumber}</span>
                    <h4>${item.title}</h4>
                    <p>WonderPark Admission Ticket</p>
                </div>
                
                <div class="ticket-body">
                    <div class="ticket-qr-section">
                        <div class="ticket-qr-code" title="${qrText}">
                            <i class="fas fa-qrcode"></i>
                        </div>
                        <p class="text-muted" style="font-size: 0.85rem;">Scan QR at entrance</p>
                    </div>
                    
                    <div class="ticket-details">
                        <div class="ticket-detail-row">
                            <span class="ticket-detail-label">Ticket ID:</span>
                            <span class="ticket-detail-value">${uniqueTicketId}</span>
                        </div>
                        <div class="ticket-detail-row">
                            <span class="ticket-detail-label">Type:</span>
                            <span class="ticket-detail-value">${item.category}</span>
                        </div>
                        <div class="ticket-detail-row">
                            <span class="ticket-detail-label">Date:</span>
                            <span class="ticket-detail-value">${new Date().toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            })}</span>
                        </div>
                        <div class="ticket-detail-row">
                            <span class="ticket-detail-label">Time:</span>
                            <span class="ticket-detail-value">${new Date().toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}</span>
                        </div>
                        <div class="ticket-detail-row">
                            <span class="ticket-detail-label">Valid For:</span>
                            <span class="ticket-detail-value">One-time use</span>
                        </div>
                    </div>
                    
                    <div class="ticket-price-large">
                        <div class="price-label">Ticket Price</div>
                        <div class="price-value">PKR ${item.price.toLocaleString()}</div>
                    </div>
                </div>
                
                <div class="ticket-footer">
                    <div class="ticket-validity">
                        <i class="fas fa-check-circle"></i>
                        <span>Valid Today Only</span>
                    </div>
                    <div class="ticket-id">ID: ${uniqueTicketId}</div>
                </div>
            </div>
            `;
        }
    });
    
    // Update display elements
    ticketsGrid.innerHTML = ticketsHTML;
    totalTicketsCount.textContent = `${totalTickets} Ticket${totalTickets !== 1 ? 's' : ''}`;
    
    // Update customer info
    const customerName = document.getElementById('customerName').value || 'Walk-in Customer';
    displayCustomerName.textContent = customerName;
    
    // Update time
    displayGenerationTime.textContent = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Update payment method
    let paymentText = selectedPayment.charAt(0).toUpperCase() + selectedPayment.slice(1);
    if (selectedPayment === 'jazzcash') paymentText = 'JazzCash';
    if (selectedPayment === 'easypaisa') paymentText = 'EasyPaisa';
    displayPaymentMethod.textContent = paymentText;
    
    // Update total amount
    displayTotalAmount.textContent = document.getElementById('totalAmount').textContent;
}
// Show ticket display modal
function showTicketDisplay() {
    // First close the preview modal if exists
    const previewModal = document.getElementById('ticketPreview');
    if (previewModal) {
        previewModal.classList.remove('active');
    }
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
    
    // Generate tickets and update count
    generateTicketDisplay();
    
    // Show ticket display modal
    const displayModal = document.getElementById('ticketDisplayModal');
    if (displayModal) {
        displayModal.classList.add('active');
        displayModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

// Close ticket display modal
function closeTicketDisplay() {
    const displayModal = document.getElementById('ticketDisplayModal');
    if (displayModal) {
        displayModal.classList.remove('active');
        displayModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

// Generate ticket display with counts and totals
function generateTicketDisplay() {
    // Update ticket count
    const ticketItems = document.querySelectorAll('.ticket-item');
    const totalTicketsCount = document.getElementById('totalTicketsCount');
    
    if (ticketItems.length > 0 && totalTicketsCount) {
        totalTicketsCount.textContent = `${ticketItems.length} Tickets`;
        
        // Update total amount
        const displayTotalAmount = document.getElementById('displayTotalAmount');
        if (displayTotalAmount) {
            const ticketPrice = 500;
            const totalAmount = ticketItems.length * ticketPrice;
            displayTotalAmount.textContent = `PKR ${totalAmount}`;
        }
    }
    
    // Update current time
    const displayGenerationTime = document.getElementById('displayGenerationTime');
    if (displayGenerationTime) {
        const now = new Date();
        displayGenerationTime.textContent = now.toLocaleString();
    }
}

// Print all tickets
function printAllTickets() {
    alert('Printing all tickets... In a real system, this would send to printer.');
    
    // Simulate print delay
    setTimeout(() => {
        alert('All tickets have been sent to the printer successfully!');
        closeTicketDisplay();
    }, 1000);
}

// Email tickets
function emailTickets() {
    const customerEmail = prompt('Enter customer email address:', 'customer@example.com');
    if (customerEmail) {
        alert(`Tickets have been sent to ${customerEmail}`);
    }
}

// Download tickets as PDF
function downloadTickets() {
    alert('Downloading tickets as PDF... In a real system, this would generate a PDF file.');
}

// Initialize all event listeners
function initTicketModal() {
    // Print Ticket button (to open modal)
    const printTicketBtn = document.getElementById('printTicket');
    if (printTicketBtn) {
        printTicketBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showTicketDisplay();
        });
    }
    
    // Close button
    const closeBtn = document.getElementById('closeTicketDisplay');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeTicketDisplay);
    }
    
    // Action buttons
    const printAllBtn = document.getElementById('printAllTickets');
    if (printAllBtn) {
        printAllBtn.addEventListener('click', printAllTickets);
    }
    
    const emailBtn = document.getElementById('emailTickets');
    if (emailBtn) {
        emailBtn.addEventListener('click', emailTickets);
    }
    
    const downloadBtn = document.getElementById('downloadTickets');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadTickets);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('ticketDisplayModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeTicketDisplay();
            }
        });
    }
    
    // Generate initial display on page load
    generateTicketDisplay();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initTicketModal);