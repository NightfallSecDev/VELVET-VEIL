// Main Application Logic & UI Interactions

document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initCartDrawer();
    initAuthMenu();
    initFAQ();
    
    // Page specific initializers
    const path = window.location.pathname;
    if (path.endsWith("index.html") || path.endsWith("/") || path.endsWith("Cosmetics_Wellness _Beauty/")) {
        initHomePage();
    } else if (path.includes("shop.html")) {
        initShopPage();
    } else if (path.includes("product.html")) {
        initProductDetailPage();
    } else if (path.includes("checkout.html")) {
        initCheckoutPage();
    } else if (path.includes("success.html")) {
        initSuccessPage();
    } else if (path.includes("contactus.html")) {
        initContactPage();
    } else if (path.includes("login.html")) {
        initLoginPage();
    } else if (path.includes("signup.html")) {
        initSignupPage();
    }
});


/* --- GLOBAL HEADER & SCROLL BEHAVIOR --- */
function initHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.style.background = "rgba(255, 255, 255, 0.95)";
            header.style.boxShadow = "0 4px 20px rgba(43, 30, 31, 0.08)";
        } else {
            header.style.background = "var(--glass-bg)";
            header.style.boxShadow = "none";
        }
    });
}

/* --- AUTHENTICATION MENU COMPONENT --- */
function initAuthMenu() {
    const authMenu = document.querySelector(".auth-menu");
    if (!authMenu) return;

    const renderAuth = () => {
        const user = Store.getCurrentUser();
        if (user) {
            authMenu.innerHTML = `
                <span class="nav-link" style="color: var(--rose-gold); font-weight: 600;">VIP: ${user.name.split(" ")[0]}</span>
                <button class="btn-secondary btn-logout" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Logout</button>
            `;
            authMenu.querySelector(".btn-logout").addEventListener("click", () => {
                Store.logoutUser();
                showToast("Logged out successfully");
            });
        } else {
            authMenu.innerHTML = `
                <a href="${getBasePath()}storefront/login.html" class="nav-link auth-login-link">Login</a>
                <a href="${getBasePath()}storefront/signup.html" class="btn-primary auth-signup-link" style="padding: 0.5rem 1.2rem; font-size: 0.9rem;">Sign Up</a>
            `;
        }
    };

    renderAuth();
    window.addEventListener("auth_updated", renderAuth);
}

/* --- CART DRAWER COMPONENT --- */
function initCartDrawer() {
    const cartToggleBtns = document.querySelectorAll(".cart-toggle");
    let drawer = document.querySelector(".cart-drawer");
    let backdrop = document.querySelector(".cart-drawer-backdrop");

    // Create Cart Drawer DOM if not present
    if (!drawer) {
        backdrop = document.createElement("div");
        backdrop.className = "cart-drawer-backdrop";
        
        drawer = document.createElement("div");
        drawer.className = "cart-drawer";
        drawer.innerHTML = `
            <div class="cart-header">
                <h3 class="cart-title">Your Luxury Bag</h3>
                <button class="cart-close">&times;</button>
            </div>
            <div class="cart-items"></div>
            <div class="cart-footer">
                <div class="cart-subtotal">
                    <span>Subtotal</span>
                    <span class="subtotal-val">₹0</span>
                </div>
                <a href="${getBasePath()}storefront/checkout.html" class="btn-checkout">Proceed to Checkout</a>
            </div>
        `;
        document.body.appendChild(backdrop);
        document.body.appendChild(drawer);
    }

    const closeBtn = drawer.querySelector(".cart-close");
    
    const openCart = () => {
        drawer.classList.add("open");
        backdrop.classList.add("open");
        renderCartItems();
    };

    const closeCart = () => {
        drawer.classList.remove("open");
        backdrop.classList.remove("open");
    };

    cartToggleBtns.forEach(btn => btn.addEventListener("click", (e) => {
        e.preventDefault();
        openCart();
    }));
    closeBtn.addEventListener("click", closeCart);
    backdrop.addEventListener("click", closeCart);

    // Update cart badge & drawer on custom event
    window.addEventListener("cart_updated", () => {
        updateCartBadge();
        if (drawer.classList.contains("open")) {
            renderCartItems();
        }
    });

    updateCartBadge();
}

function updateCartBadge() {
    const cart = Store.getCart();
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    document.querySelectorAll(".cart-badge").forEach(badge => {
        badge.textContent = count;
    });
}

function renderCartItems() {
    const cart = Store.getCart();
    const itemsContainer = document.querySelector(".cart-items");
    const subtotalVal = document.querySelector(".subtotal-val");
    if (!itemsContainer || !subtotalVal) return;

    if (cart.length === 0) {
        itemsContainer.innerHTML = `<div style="text-align: center; padding: 4rem 1rem; color: #888;">Your luxury bag is currently empty.</div>`;
        subtotalVal.textContent = "₹0";
        return;
    }

    itemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${getBasePath()}${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <h4 class="cart-item-title">${item.name}</h4>
                <div class="cart-item-shade">
                    <span class="cart-item-shade-dot" style="background-color: ${item.shadeHex};"></span>
                    <span>${item.shadeName}</span>
                </div>
                <div class="cart-item-controls">
                    <span class="cart-item-price">₹${item.price} x ${item.quantity}</span>
                    <button class="cart-item-remove" onclick="Store.removeFromCart('${item.productId}', '${item.shadeName}')">Remove</button>
                </div>
            </div>
        </div>
    `).join("");

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    subtotalVal.textContent = `₹${total.toLocaleString('en-IN')}`;
}

/* --- HOME PAGE LOGIC --- */
function initHomePage() {
    const featuredContainer = document.querySelector(".featured-products-container");
    if (!featuredContainer) return;

    const products = Store.getProducts().slice(0, 4); // Show first 4 featured
    featuredContainer.innerHTML = products.map(product => {
        const discountPct = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
        return `
            <div class="product-card">
                <div class="product-badge">${product.category.split(" ")[0]}</div>
                <a href="${getBasePath()}storefront/product.html?id=${product.id}" class="product-img-wrapper">
                    <img src="${getBasePath()}${product.image}" alt="${product.name}" class="product-img">
                </a>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <a href="${getBasePath()}storefront/product.html?id=${product.id}">
                        <h3 class="product-title">${product.name}</h3>
                    </a>
                    <div class="product-rating">
                        <span>★★★★★</span>
                        <span style="font-weight: 600; color: var(--dark-cocoa);">${product.rating.toFixed(1)}</span>
                        <span class="product-rating-count">(${product.reviews})</span>
                    </div>
                    <div class="product-shades-preview">
                        ${product.shades.slice(0, 4).map(s => `<span class="shade-dot" style="background-color: ${s.hex};" title="${s.name}"></span>`).join("")}
                        <span class="shade-count">${product.shades.length > 4 ? '+' + (product.shades.length - 4) : product.shades.length} Shades</span>
                    </div>
                    <div class="product-footer" style="align-items: center; margin-top: 1rem;">
                        <div class="product-price-group">
                            <span class="price-new">₹${product.price.toLocaleString('en-IN')}</span>
                            <span class="price-old">₹${product.oldPrice.toLocaleString('en-IN')}</span>
                            <span class="discount-badge">${discountPct}% OFF</span>
                        </div>
                        <button class="btn-card-add" onclick="Store.addToCart('${product.id}', '${product.shades[0].name}', 1)">Quick Add</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

/* --- SHOP / CATALOG PAGE LOGIC --- */
function initShopPage() {
    const gridContainer = document.querySelector(".shop-product-grid");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const searchInput = document.querySelector("#catalog-search");
    const finishSelect = document.querySelector("#filter-finish");
    const sortSelect = document.querySelector("#sort-price");
    if (!gridContainer) return;

    let currentCategory = "all";
    let currentSearch = "";
    let currentFinish = "all";
    let currentSort = "default";

    const renderProducts = () => {
        let products = Store.getProducts();

        // 1. Filter by Category
        if (currentCategory !== "all") {
            products = products.filter(p => p.categorySlug === currentCategory);
        }

        // 2. Filter by Search Query
        if (currentSearch.trim() !== "") {
            const q = currentSearch.toLowerCase().trim();
            products = products.filter(p => 
                p.name.toLowerCase().includes(q) || 
                p.description.toLowerCase().includes(q) || 
                p.category.toLowerCase().includes(q) ||
                p.shades.some(s => s.name.toLowerCase().includes(q))
            );
        }

        // 3. Filter by Finish / Theme
        if (currentFinish !== "all") {
            products = products.filter(p => {
                const desc = p.description.toLowerCase();
                const name = p.name.toLowerCase();
                const theme = p.theme.toLowerCase();
                if (currentFinish === "matte") return desc.includes("matte") || name.includes("matte");
                if (currentFinish === "glow") return desc.includes("glow") || desc.includes("dewy") || name.includes("glow");
                if (currentFinish === "shimmer") return desc.includes("shimmer") || desc.includes("metallic") || desc.includes("gold flecks") || name.includes("plumper") || name.includes("metallic");
                if (currentFinish === "waterproof") return desc.includes("waterproof") || name.includes("stealth");
                return true;
            });
        }

        // 4. Sort by Price
        if (currentSort === "low-high") {
            products.sort((a, b) => a.price - b.price);
        } else if (currentSort === "high-low") {
            products.sort((a, b) => b.price - a.price);
        }

        // Render to DOM
        if (products.length === 0) {
            gridContainer.innerHTML = `<div style="grid-column: span 3; text-align: center; padding: 6rem 2rem; color: #888; font-size: 1.2rem;">No premium beauty products match your selected filters or search query.</div>`;
            return;
        }

        gridContainer.innerHTML = products.map(product => {
            const discountPct = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
            return `
                <div class="product-card">
                    <div class="product-badge">${product.category.split(" ")[0]}</div>
                    <a href="${getBasePath()}storefront/product.html?id=${product.id}" class="product-img-wrapper">
                        <img src="${getBasePath()}${product.image}" alt="${product.name}" class="product-img">
                    </a>
                    <div class="product-info">
                        <span class="product-category">${product.category}</span>
                        <a href="${getBasePath()}storefront/product.html?id=${product.id}">
                            <h3 class="product-title">${product.name}</h3>
                        </a>
                        <div class="product-rating">
                            <span>★★★★★</span>
                            <span style="font-weight: 600; color: var(--dark-cocoa);">${product.rating.toFixed(1)}</span>
                            <span class="product-rating-count">(${product.reviews})</span>
                        </div>
                        <div class="product-shades-preview">
                            ${product.shades.slice(0, 4).map(s => `<span class="shade-dot" style="background-color: ${s.hex};" title="${s.name}"></span>`).join("")}
                            <span class="shade-count">${product.shades.length > 4 ? '+' + (product.shades.length - 4) : product.shades.length} Shades</span>
                        </div>
                        <div class="product-footer" style="align-items: center; margin-top: 1rem;">
                            <div class="product-price-group">
                                <span class="price-new">₹${product.price.toLocaleString('en-IN')}</span>
                                <span class="price-old">₹${product.oldPrice.toLocaleString('en-IN')}</span>
                                <span class="discount-badge">${discountPct}% OFF</span>
                            </div>
                            <button class="btn-card-add" onclick="Store.addToCart('${product.id}', '${product.shades[0].name}', 1)">Quick Add</button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    };

    // Event Listeners
    if (filterBtns) {
        filterBtns.forEach(btn => btn.addEventListener("click", (e) => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = btn.dataset.filter;
            renderProducts();
        }));
    }

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            currentSearch = e.target.value;
            renderProducts();
        });
    }

    if (finishSelect) {
        finishSelect.addEventListener("change", (e) => {
            currentFinish = e.target.value;
            renderProducts();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSort = e.target.value;
            renderProducts();
        });
    }

    renderProducts();
}

/* --- PRODUCT DETAIL PAGE LOGIC --- */
function initProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id") || "prod_01";
    const product = Store.getProductById(productId);

    if (!product) {
        document.querySelector(".product-detail-container").innerHTML = `<div style="grid-column: span 2; text-align: center; padding: 6rem; font-size: 1.5rem;">Product not found.</div>`;
        return;
    }

    // Populate DOM elements
    document.querySelector(".main-image").src = getBasePath() + product.image;
    document.querySelector(".detail-category").textContent = product.category;
    document.querySelector(".detail-title").textContent = product.name;

    const discountPct = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
    
    // Rating Container
    const ratingEl = document.querySelector(".detail-rating-container");
    if (ratingEl) {
        ratingEl.innerHTML = `
            <div class="product-rating" style="font-size: 1.2rem; margin-bottom: 1.5rem;">
                <span style="color: #E0A96D;">★★★★★</span>
                <span style="font-weight: 800; color: var(--dark-cocoa); margin-left: 0.4rem;">${product.rating.toFixed(1)}</span>
                <span class="product-rating-count" style="font-size: 1rem; margin-left: 0.6rem;">(${product.reviews} verified luxury reviews)</span>
            </div>
        `;
    }

    // Price Container
    const priceEl = document.querySelector(".detail-price-container");
    if (priceEl) {
        priceEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1.2rem; margin-bottom: 2.5rem; flex-wrap: wrap;">
                <span class="price-new" style="font-size: 2.4rem; color: var(--dark-cocoa);">₹${product.price.toLocaleString('en-IN')}</span>
                <span class="price-old" style="font-size: 1.5rem; color: #aaa; text-decoration: line-through;">₹${product.oldPrice.toLocaleString('en-IN')}</span>
                <span class="discount-badge" style="font-size: 0.95rem; padding: 0.5rem 1rem;">Save ${discountPct}%</span>
            </div>
        `;
    }

    document.querySelector(".detail-desc").textContent = product.description;

    // Live Countdown Timer Logic
    let totalSeconds = 3 * 3600 + 42 * 60 + 15; // 3h 42m 15s
    const hoursEl = document.querySelector(".timer-val.hours");
    const minsEl = document.querySelector(".timer-val.minutes");
    const secsEl = document.querySelector(".timer-val.seconds");

    if (hoursEl && minsEl && secsEl) {
        setInterval(() => {
            if (totalSeconds > 0) totalSeconds--;
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;
            hoursEl.textContent = String(h).padStart(2, '0');
            minsEl.textContent = String(m).padStart(2, '0');
            secsEl.textContent = String(s).padStart(2, '0');
        }, 1000);
    }

    // Render Shades
    const shadesContainer = document.querySelector(".shades-list");
    const selectedShadeLabel = document.querySelector(".selected-shade-name");
    let activeShade = product.shades[0];
    selectedShadeLabel.textContent = activeShade.name;

    shadesContainer.innerHTML = product.shades.map((shade, i) => `
        <button class="shade-btn ${i === 0 ? 'active' : ''}" data-shadename="${shade.name}" data-shadehex="${shade.hex}">
            <span class="shade-btn-dot" style="background-color: ${shade.hex};"></span>
            <span class="shade-btn-name">${shade.name}</span>
        </button>
    `).join("");

    shadesContainer.querySelectorAll(".shade-btn").forEach(btn => btn.addEventListener("click", () => {
        shadesContainer.querySelectorAll(".shade-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeShade = { name: btn.dataset.shadename, hex: btn.dataset.shadehex };
        selectedShadeLabel.textContent = activeShade.name;
    }));

    // Quantity Selector
    const qtyInput = document.querySelector(".qty-input");
    document.querySelector(".qty-dec").addEventListener("click", () => {
        let val = parseInt(qtyInput.value);
        if (val > 1) qtyInput.value = val - 1;
    });
    document.querySelector(".qty-inc").addEventListener("click", () => {
        let val = parseInt(qtyInput.value);
        if (val < 10) qtyInput.value = val + 1;
    });

    // Add to Cart Action
    document.querySelector(".btn-add-large").addEventListener("click", () => {
        const qty = parseInt(qtyInput.value);
        Store.addToCart(product.id, activeShade.name, qty);
    });

    // Accordions
    document.querySelectorAll(".accordion-header").forEach(header => {
        header.addEventListener("click", () => {
            const item = header.parentElement;
            item.classList.toggle("active");
        });
    });

    // Recommended Products Grid
    const recommendedContainer = document.querySelector(".recommended-product-grid");
    if (recommendedContainer) {
        const recProducts = Store.getProducts().filter(p => p.id !== product.id).slice(0, 3);
        recommendedContainer.innerHTML = recProducts.map(rec => {
            const recDiscount = Math.round(((rec.oldPrice - rec.price) / rec.oldPrice) * 100);
            return `
                <div class="product-card">
                    <div class="product-badge">${rec.category.split(" ")[0]}</div>
                    <a href="${getBasePath()}storefront/product.html?id=${rec.id}" class="product-img-wrapper">
                        <img src="${getBasePath()}${rec.image}" alt="${rec.name}" class="product-img">
                    </a>
                    <div class="product-info">
                        <span class="product-category">${rec.category}</span>
                        <a href="${getBasePath()}storefront/product.html?id=${rec.id}">
                            <h3 class="product-title">${rec.name}</h3>
                        </a>
                        <div class="product-rating">
                            <span>★★★★★</span>
                            <span style="font-weight: 600; color: var(--dark-cocoa);">${rec.rating.toFixed(1)}</span>
                            <span class="product-rating-count">(${rec.reviews})</span>
                        </div>
                        <div class="product-shades-preview">
                            ${rec.shades.slice(0, 4).map(s => `<span class="shade-dot" style="background-color: ${s.hex};" title="${s.name}"></span>`).join("")}
                            <span class="shade-count">${rec.shades.length > 4 ? '+' + (rec.shades.length - 4) : rec.shades.length} Shades</span>
                        </div>
                        <div class="product-footer" style="align-items: center; margin-top: 1rem;">
                            <div class="product-price-group">
                                <span class="price-new">₹${rec.price.toLocaleString('en-IN')}</span>
                                <span class="price-old">₹${rec.oldPrice.toLocaleString('en-IN')}</span>
                                <span class="discount-badge">${recDiscount}% OFF</span>
                            </div>
                            <button class="btn-card-add" onclick="Store.addToCart('${rec.id}', '${rec.shades[0].name}', 1)">Quick Add</button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }
}

/* --- CHECKOUT PAGE LOGIC --- */
function initCheckoutPage() {
    const cart = Store.getCart();
    const summaryContainer = document.querySelector(".summary-items");
    const subtotalEl = document.querySelector(".summary-subtotal");
    const totalEl = document.querySelector(".summary-total");
    const form = document.querySelector(".checkout-form");

    if (cart.length === 0) {
        summaryContainer.innerHTML = `<div style="text-align: center; color: #888; padding: 2rem;">Your cart is empty.</div>`;
        subtotalEl.textContent = "₹0";
        totalEl.textContent = "₹0";
        return;
    }

    summaryContainer.innerHTML = cart.map(item => `
        <div class="cart-item" style="padding-bottom: 1rem; margin-bottom: 1rem;">
            <img src="${getBasePath()}${item.image}" alt="${item.name}" class="cart-item-img" style="width: 60px; height: 60px;">
            <div class="cart-item-info">
                <h4 class="cart-item-title" style="font-size: 0.95rem;">${item.name}</h4>
                <div class="cart-item-shade" style="font-size: 0.8rem; margin-bottom: 0.2rem;">
                    <span class="cart-item-shade-dot" style="background-color: ${item.shadeHex}; width:10px; height:10px;"></span>
                    <span>${item.shadeName}</span>
                </div>
                <div class="cart-item-controls" style="font-size: 0.9rem; font-weight:600;">
                    <span>₹${item.price} x ${item.quantity}</span>
                </div>
            </div>
        </div>
    `).join("");

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    subtotalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
    totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            showToast("Your cart is empty!");
            return;
        }

        const formData = new FormData(form);
        const newOrder = {
            id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            customer: `${formData.get('fname')} ${formData.get('lname')}`,
            email: formData.get('email'),
            total: total,
            status: "Processing",
            date: new Date().toISOString().split('T')[0],
            items: cart.map(i => `${i.name} (${i.shadeName}) x${i.quantity}`).join(", ")
        };

        Store.addOrder(newOrder);
        Store.clearCart();
        localStorage.setItem("last_order", JSON.stringify(newOrder));
        window.location.href = getBasePath() + "storefront/success.html";
    });
}

/* --- SUCCESS PAGE LOGIC --- */
function initSuccessPage() {
    const lastOrder = JSON.parse(localStorage.getItem("last_order"));
    if (!lastOrder) return;

    document.querySelector(".order-id-val").textContent = lastOrder.id;
    document.querySelector(".order-date-val").textContent = lastOrder.date;
    document.querySelector(".order-total-val").textContent = `₹${lastOrder.total.toLocaleString('en-IN')}`;
}

/* --- CONTACT PAGE LOGIC --- */
function initContactPage() {
    const form = document.querySelector(".contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        showToast("Thank you for reaching out! Our VIP concierge will contact you within 2 hours.");
        form.reset();
    });
}

/* --- LOGIN PAGE LOGIC --- */
function initLoginPage() {
    const form = document.querySelector(".login-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const email = formData.get("email");
        const password = formData.get("password");

        if (Store.loginUser(email, password)) {
            showToast("Welcome back to Velvet & Veil!");
            setTimeout(() => {
                window.location.href = getBasePath() + "index.html";
            }, 1000);
        } else {
            showToast("Invalid email or password. Please try again.");
        }
    });
}

/* --- SIGNUP PAGE LOGIC --- */
function initSignupPage() {
    const form = document.querySelector(".signup-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const email = formData.get("email");
        const password = formData.get("password");
        const fname = formData.get("fname");
        const lname = formData.get("lname");

        const users = Store.getUsers();
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            showToast("An account with this email already exists.");
            return;
        }

        const newUser = {
            id: `usr_${Date.now()}`,
            name: `${fname} ${lname}`,
            email: email,
            password: password,
            isVIP: true
        };

        Store.addUser(newUser);
        Store.setCurrentUser(newUser);
        showToast("Welcome to the VIP Insider Veil!");
        setTimeout(() => {
            window.location.href = getBasePath() + "index.html";
        }, 1000);
    });
}

/* --- GLOBAL FAQ COMPONENT --- */
function initFAQ() {
    document.querySelectorAll(".faq-header").forEach(header => {
        header.addEventListener("click", () => {
            const item = header.parentElement;
            const wasActive = item.classList.contains("active");
            // Close all other faq items in the same accordion
            item.parentElement.querySelectorAll(".faq-item").forEach(i => i.classList.remove("active"));
            if (!wasActive) {
                item.classList.add("active");
            }
        });
    });
}

