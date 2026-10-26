/**
 * =============================================================================
 * ONLINE FOOD ORDERING SYSTEM - FRONTEND SCRIPT
 * Vanilla JavaScript interacting with Express REST APIs via fetch()
 * =============================================================================
 */

// Application State
let restaurantsMap = {};
let categoriesMap = {};
let allFoodItems = [];
let cart = []; // In-memory cart: [{ id, name, price, quantity }]
let activeCategoryId = 'all';

// DOM Element References
const apiStatusEl = document.getElementById('apiStatus');
const statusTextEl = document.getElementById('statusText');
const restaurantsListEl = document.getElementById('restaurantsList');
const restaurantCountEl = document.getElementById('restaurantCount');
const categoryFilterEl = document.getElementById('categoryFilter');
const foodListEl = document.getElementById('foodList');
const foodCountEl = document.getElementById('foodCount');
const cartItemsEl = document.getElementById('cartItems');
const cartCountBadgeEl = document.getElementById('cartCountBadge');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtnEl = document.getElementById('checkoutBtn');

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupCartListeners();
});

/**
 * Main Initialization Sequence
 * Calls backend APIs in sequence and hydrates the UI.
 */
async function initApp() {
  await checkBackendHealth();
  await loadRestaurants();
  await loadCategories();
  await loadFoodItems();
}

/**
 * 1. Health Check Endpoint
 * Calls GET /api/health to verify connectivity
 */
async function checkBackendHealth() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();

    if (data.success && data.data.database === 'CONNECTED') {
      apiStatusEl.className = 'status-pill status-connected';
      statusTextEl.textContent = 'Backend Connected';
    } else {
      apiStatusEl.className = 'status-pill status-offline';
      statusTextEl.textContent = 'Database Disconnected';
    }
  } catch (error) {
    console.error('Health check failed:', error);
    apiStatusEl.className = 'status-pill status-offline';
    statusTextEl.textContent = 'Backend Offline';
  }
}

/**
 * 2. Fetch Restaurants
 * Calls GET /api/restaurants
 */
async function loadRestaurants() {
  try {
    const response = await fetch('/api/restaurants');
    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      // Store in dictionary for quick lookup by food items
      result.data.forEach(rest => {
        restaurantsMap[rest.id] = rest;
      });

      renderRestaurants(result.data);
      restaurantCountEl.textContent = `${result.data.length} Available`;
    } else {
      restaurantsListEl.innerHTML = `<div class="loading-placeholder">No restaurants found.</div>`;
      restaurantCountEl.textContent = `0 Available`;
    }
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    restaurantsListEl.innerHTML = `
      <div class="loading-placeholder" style="color: var(--danger);">
        Unable to load restaurants. Please check if the backend server is running.
      </div>
    `;
    restaurantCountEl.textContent = `Offline`;
  }
}

/**
 * Render Restaurant Cards in DOM
 */
function renderRestaurants(restaurants) {
  if (restaurants.length === 0) {
    restaurantsListEl.innerHTML = `<div class="loading-placeholder">No restaurants registered yet.</div>`;
    return;
  }

  restaurantsListEl.innerHTML = restaurants.map(rest => `
    <div class="restaurant-card">
      <div class="restaurant-card-header">
        <h3 class="restaurant-name">${escapeHtml(rest.name)}</h3>
        <span class="status-tag ${rest.status.toLowerCase()}">${rest.status}</span>
      </div>
      <p class="restaurant-desc">${escapeHtml(rest.description || 'Quality meals and authentic flavors.')}</p>
      <div class="restaurant-meta">
        <div class="meta-item">
          <span>📍</span>
          <span>${escapeHtml(rest.address)}</span>
        </div>
        ${rest.phone ? `
          <div class="meta-item">
            <span>📞</span>
            <span>${escapeHtml(rest.phone)}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

/**
 * 3. Fetch Categories
 * Calls GET /api/categories
 */
async function loadCategories() {
  try {
    const response = await fetch('/api/categories');
    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      result.data.forEach(cat => {
        categoriesMap[cat.id] = cat;
      });

      renderCategoryFilters(result.data);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

/**
 * Render Category Filter Buttons
 */
function renderCategoryFilters(categories) {
  const allBtn = `
    <button class="filter-btn active" data-category="all" onclick="filterByCategory('all', this)">
      All Items
    </button>
  `;

  const categoryBtns = categories.map(cat => `
    <button class="filter-btn" data-category="${cat.id}" onclick="filterByCategory(${cat.id}, this)">
      ${escapeHtml(cat.name)}
    </button>
  `).join('');

  categoryFilterEl.innerHTML = allBtn + categoryBtns;
}

/**
 * Filter Food Items by Category
 */
function filterByCategory(categoryId, buttonElement) {
  activeCategoryId = categoryId;

  // Toggle active button styling
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  buttonElement.classList.add('active');

  // Re-render food items according to category filter
  renderFoodItems();
}

/**
 * 4. Fetch Food Items
 * Calls GET /api/food
 */
async function loadFoodItems() {
  try {
    const response = await fetch('/api/food');
    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      allFoodItems = result.data;
      renderFoodItems();
    } else {
      foodListEl.innerHTML = `<div class="loading-placeholder">No food items found.</div>`;
      foodCountEl.textContent = `0 Dishes`;
    }
  } catch (error) {
    console.error('Error fetching food items:', error);
    foodListEl.innerHTML = `
      <div class="loading-placeholder" style="color: var(--danger);">
        Unable to load food items. Please check if the backend server is running.
      </div>
    `;
    foodCountEl.textContent = `Offline`;
  }
}

/**
 * Render Food Cards Grid
 */
function renderFoodItems() {
  // Filter by category if one is selected
  const filteredItems = activeCategoryId === 'all'
    ? allFoodItems
    : allFoodItems.filter(item => String(item.category_id) === String(activeCategoryId));

  foodCountEl.textContent = `${filteredItems.length} Dishes`;

  if (filteredItems.length === 0) {
    foodListEl.innerHTML = `
      <div class="loading-placeholder">
        No dishes available under this category.
      </div>
    `;
    return;
  }

  foodListEl.innerHTML = filteredItems.map(item => {
    const restaurantName = restaurantsMap[item.restaurant_id]?.name || 'Partner Restaurant';
    const categoryName = categoriesMap[item.category_id]?.name || 'Menu Dish';
    const isAvailable = Boolean(item.availability);
    const formattedPrice = Number(item.price).toFixed(2);

    return `
      <div class="food-card">
        <div>
          <div class="food-header">
            <h3 class="food-title">${escapeHtml(item.name)}</h3>
          </div>
          
          <div class="food-badges">
            <span class="badge-tag">🏢 ${escapeHtml(restaurantName)}</span>
            <span class="badge-tag">🏷️ ${escapeHtml(categoryName)}</span>
            <span class="badge-tag" style="color: ${isAvailable ? 'var(--success)' : 'var(--danger)'}">
              ${isAvailable ? '● In Stock' : '○ Unavailable'}
            </span>
          </div>

          <p class="food-description">${escapeHtml(item.description || 'Freshly prepared upon your order.')}</p>
        </div>

        <div class="food-card-bottom">
          <div class="food-price">₹${formattedPrice}</div>
          <button 
            class="add-cart-btn" 
            onclick="addToCart(${item.id})"
            ${!isAvailable ? 'disabled' : ''}
          >
            <span>+</span> Add to Cart
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * =============================================================================
 * IN-MEMORY FRONTEND CART LOGIC
 * =============================================================================
 */

/**
 * Add Food Item to Cart
 */
function addToCart(foodId) {
  const foodItem = allFoodItems.find(f => f.id === foodId);
  if (!foodItem) return;

  const existingCartIndex = cart.findIndex(c => c.id === foodId);

  if (existingCartIndex > -1) {
    // If already in cart, increment quantity
    cart[existingCartIndex].quantity += 1;
  } else {
    // Push new item into cart
    cart.push({
      id: foodItem.id,
      name: foodItem.name,
      price: Number(foodItem.price),
      quantity: 1
    });
  }

  renderCart();
}

/**
 * Update Item Quantity (+ or -)
 */
function updateQuantity(foodId, change) {
  const cartItem = cart.find(c => c.id === foodId);
  if (!cartItem) return;

  cartItem.quantity += change;

  // If quantity reaches 0 or less, remove item
  if (cartItem.quantity <= 0) {
    cart = cart.filter(c => c.id !== foodId);
  }

  renderCart();
}

/**
 * Remove Item Completely from Cart
 */
function removeFromCart(foodId) {
  cart = cart.filter(c => c.id !== foodId);
  renderCart();
}

/**
 * Render Live Cart
 */
function renderCart() {
  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCountBadgeEl.textContent = `${totalItemCount} items`;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty-state">
        <div class="empty-icon">🍽️</div>
        <p>Your cart is empty</p>
        <span>Click "+ Add to Cart" on any dish to start ordering</span>
      </div>
    `;
    cartSubtotalEl.textContent = '₹0.00';
    cartTotalEl.textContent = '₹0.00';
    checkoutBtnEl.disabled = true;
    return;
  }

  let subtotal = 0;

  cartItemsEl.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(item.name)}</div>
          <div class="cart-item-unit-price">₹${item.price.toFixed(2)} each</div>
        </div>

        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
          <span class="qty-count">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
        </div>

        <div class="cart-item-total">₹${itemTotal.toFixed(2)}</div>
        
        <button class="remove-btn" title="Remove" onclick="removeFromCart(${item.id})">✕</button>
      </div>
    `;
  }).join('');

  cartSubtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
  cartTotalEl.textContent = `₹${subtotal.toFixed(2)}`;
  checkoutBtnEl.disabled = false;
}

/**
 * Setup Cart Interaction Events
 */
function setupCartListeners() {
  checkoutBtnEl.addEventListener('click', () => {
    if (cart.length === 0) return;

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    alert(
      `🎉 Faculty Demonstration Successful!\n\n` +
      `Order Summary:\n` +
      cart.map(i => `• ${i.name} x ${i.quantity} = ₹${(i.price * i.quantity).toFixed(2)}`).join('\n') +
      `\n\nTotal Calculated: ₹${total.toFixed(2)}\n\n` +
      `Note: In Phase 4, this order will be saved into the MySQL database tables (orders and order_items).`
    );
  });
}

/**
 * Utility: HTML Escaping to prevent XSS
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
