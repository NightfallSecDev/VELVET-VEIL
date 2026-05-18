// Premium Beauty Store State & Catalog Management

function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/storefront/') || path.includes('/admin/') || path.includes('/legal/')) {
        return '../';
    }
    return './';
}

const INITIAL_PRODUCTS = [
    {
        id: "prod_01",
        name: "VELVET_MATTE_LIP_SERUM",
        category: "LIP ARTISTRY (LIP_LAB)",
        categorySlug: "lip-lab",
        theme: "Rose Gold Minimalist / Gilded Noir",
        description: "A weightless, hydrating liquid lipstick infused with Argan oil that dries to a premium, transfer-proof matte finish.",
        price: 1299,
        oldPrice: 1699,
        rating: 4.9,
        reviews: 184,
        image: "assets/images/lip.png",
        shades: [
            { name: "Ruby Velvet", hex: "#8C2636" },
            { name: "Desert Rose", hex: "#B56576" },
            { name: "Spiced Cocoa", hex: "#6F3A43" }
        ]
    },
    {
        id: "prod_02",
        name: "SATIN_SHINE_PLUMPER",
        category: "LIP ARTISTRY (LIP_LAB)",
        categorySlug: "lip-lab",
        theme: "Rose Gold Minimalist",
        description: "High-gloss, non-sticky lip plumping formula with micro-reflective gold flecks for an instant full-lip look.",
        price: 1099,
        oldPrice: 1499,
        rating: 4.8,
        reviews: 142,
        image: "assets/images/lip.png",
        shades: [
            { name: "Pink Quartz", hex: "#FAD2E1" },
            { name: "Honey Glaze", hex: "#E0A96D" }
        ]
    },
    {
        id: "prod_03",
        name: "HYDRA_GLOW_SERUM_FOUNDATION",
        category: "FACE SCULPT & GLOW (FACE_ARCHITECT)",
        categorySlug: "face-architect",
        theme: "Bio-Elegance / Rose Gold Minimalist",
        description: "A breathable, medium-coverage foundation that mimics natural skin texture while delivering a dewy, radiant finish.",
        price: 1899,
        oldPrice: 2499,
        rating: 5.0,
        reviews: 230,
        image: "assets/images/face.png",
        shades: [
            { name: "Light Ivory", hex: "#F3E1CE" },
            { name: "Warm Sand", hex: "#E3C1A1" },
            { name: "Rich Honey", hex: "#C59B76" },
            { name: "Deep Almond", hex: "#A1744E" }
        ]
    },
    {
        id: "prod_04",
        name: "MONOCHROME_LIQUID_BLUSH",
        category: "FACE SCULPT & GLOW (FACE_ARCHITECT)",
        categorySlug: "face-architect",
        theme: "Rose Gold Minimalist",
        description: "A melt-into-skin liquid blush that builds effortlessly from a sheer natural flush to a high-impact evening glow.",
        price: 1199,
        oldPrice: 1599,
        rating: 4.9,
        reviews: 195,
        image: "assets/images/face.png",
        shades: [
            { name: "Soft Peach", hex: "#E5989B" },
            { name: "Berry Dusk", hex: "#B5828C" }
        ]
    },
    {
        id: "prod_05",
        name: "METALLIC_VEIL_HIGHLIGHTER",
        category: "FACE SCULPT & GLOW (FACE_ARCHITECT)",
        categorySlug: "face-architect",
        theme: "Gilded Noir",
        description: "A hyper-fine, pressed-powder highlighter that delivers a liquid-gold sheen to the high points of the face without looking chalky.",
        price: 1499,
        oldPrice: 1999,
        rating: 4.7,
        reviews: 118,
        image: "assets/images/face.png",
        shades: [
            { name: "Champagne Gold", hex: "#E6C594" },
            { name: "Bronze Melt", hex: "#C39B62" }
        ]
    },
    {
        id: "prod_06",
        name: "CARBON_STEALTH_LIQUID_LINER",
        category: "EYE DEFINITION (EYE_MATRIX)",
        categorySlug: "eye-matrix",
        theme: "Gilded Noir",
        description: "A 24-hour waterproof, ultra-matte black liquid eyeliner with a 0.1mm micro-tip brush for surgical precision lines.",
        price: 899,
        oldPrice: 1199,
        rating: 4.9,
        reviews: 275,
        image: "assets/images/eye.png",
        shades: [
            { name: "Absolute Noir", hex: "#000000" }
        ]
    },
    {
        id: "prod_07",
        name: "9-SHADE_ESSENTIAL_PALETTE",
        category: "EYE DEFINITION (EYE_MATRIX)",
        categorySlug: "eye-matrix",
        theme: "Bio-Elegance / Gilded Noir",
        description: "A curated palette of 9 ultra-blendable eyeshadows featuring deep mattes, rich metallics, and high-glimmer foils.",
        price: 1999,
        oldPrice: 2799,
        rating: 5.0,
        reviews: 310,
        image: "assets/images/eye.png",
        shades: [
            { name: "Terracotta Earth (Warm browns, copper, ochre)", hex: "#C86D51" },
            { name: "Midnight Glam (Smoky quartz, silver, deep charcoal)", hex: "#3B3C40" }
        ]
    }
];

const INITIAL_ORDERS = [
    { id: "ORD-9823", customer: "Aanya Sharma", email: "aanya@example.com", total: 2598, status: "Processing", date: "2026-05-18", items: "VELVET_MATTE_LIP_SERUM (Ruby Velvet) x2" },
    { id: "ORD-9822", customer: "Rohan Verma", email: "rohan@example.com", total: 1899, status: "Shipped", date: "2026-05-17", items: "HYDRA_GLOW_SERUM_FOUNDATION (Warm Sand) x1" },
    { id: "ORD-9821", customer: "Simran Kaur", email: "simran@example.com", total: 3498, status: "Delivered", date: "2026-05-16", items: "9-SHADE_ESSENTIAL_PALETTE (Midnight Glam) x1, METALLIC_VEIL_HIGHLIGHTER x1" }
];

const INITIAL_USERS = [
    { id: "usr_01", name: "Aanya Sharma", email: "aanya@example.com", password: "password123", isVIP: true }
];

// Initialize Storage
if (!localStorage.getItem("store_products")) {
    localStorage.setItem("store_products", JSON.stringify(INITIAL_PRODUCTS));
} else {
    // Merge oldPrice and rating if missing from existing localStorage
    let existing = JSON.parse(localStorage.getItem("store_products"));
    let updated = existing.map(p => {
        const initP = INITIAL_PRODUCTS.find(ip => ip.id === p.id);
        if (initP && !p.oldPrice) {
            p.oldPrice = initP.oldPrice;
            p.rating = initP.rating;
            p.reviews = initP.reviews;
        }
        return p;
    });
    localStorage.setItem("store_products", JSON.stringify(updated));
}

if (!localStorage.getItem("store_cart")) {
    localStorage.setItem("store_cart", JSON.stringify([]));
}
if (!localStorage.getItem("store_orders")) {
    localStorage.setItem("store_orders", JSON.stringify(INITIAL_ORDERS));
}
if (!localStorage.getItem("store_users")) {
    localStorage.setItem("store_users", JSON.stringify(INITIAL_USERS));
}
if (!localStorage.getItem("current_user")) {
    localStorage.setItem("current_user", JSON.stringify(INITIAL_USERS[0])); // Default logged in as Aanya for premium demo
}

// Store Helper Methods
const Store = {
    getProducts: () => JSON.parse(localStorage.getItem("store_products")),
    setProducts: (products) => localStorage.setItem("store_products", JSON.stringify(products)),
    getProductById: (id) => Store.getProducts().find(p => p.id === id),
    
    getCart: () => JSON.parse(localStorage.getItem("store_cart")),
    setCart: (cart) => {
        localStorage.setItem("store_cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cart_updated"));
    },
    addToCart: (productId, shadeName, quantity = 1) => {
        const cart = Store.getCart();
        const product = Store.getProductById(productId);
        if (!product) return;
        
        const existingIndex = cart.findIndex(item => item.productId === productId && item.shadeName === shadeName);
        if (existingIndex > -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            const shade = product.shades.find(s => s.name === shadeName) || product.shades[0];
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                shadeName: shade.name,
                shadeHex: shade.hex,
                quantity: quantity
            });
        }
        Store.setCart(cart);
        showToast(`Added ${product.name} (${shadeName}) to cart!`);
    },
    removeFromCart: (productId, shadeName) => {
        const cart = Store.getCart().filter(item => !(item.productId === productId && item.shadeName === shadeName));
        Store.setCart(cart);
        showToast("Item removed from cart.");
    },
    clearCart: () => Store.setCart([]),
    
    getOrders: () => JSON.parse(localStorage.getItem("store_orders")),
    addOrder: (orderData) => {
        const orders = Store.getOrders();
        orders.unshift(orderData);
        localStorage.setItem("store_orders", JSON.stringify(orders));
    },
    updateOrderStatus: (orderId, status) => {
        const orders = Store.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            localStorage.setItem("store_orders", JSON.stringify(orders));
        }
    },

    getUsers: () => JSON.parse(localStorage.getItem("store_users")),
    getCurrentUser: () => JSON.parse(localStorage.getItem("current_user")),
    setCurrentUser: (user) => {
        localStorage.setItem("current_user", JSON.stringify(user));
        window.dispatchEvent(new Event("auth_updated"));
    },
    addUser: (userData) => {
        const users = Store.getUsers();
        users.push(userData);
        localStorage.setItem("store_users", JSON.stringify(users));
    },
    loginUser: (email, password) => {
        const users = Store.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            Store.setCurrentUser(user);
            return true;
        }
        return false;
    },
    logoutUser: () => {
        localStorage.removeItem("current_user");
        window.dispatchEvent(new Event("auth_updated"));
    }
};

// Global Toast Utility
function showToast(message) {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3500);
}
