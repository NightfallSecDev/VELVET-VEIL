// Admin Dashboard Logic & State Management

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    if (path.includes("dashboard.html")) {
        initAdminDashboard();
    } else if (path.includes("orders.html")) {
        initAdminOrders();
    } else if (path.includes("products.html")) {
        initAdminProducts();
    }
});

function initAdminDashboard() {
    const orders = Store.getOrders();
    const products = Store.getProducts();

    // Calculate Stats
    const totalRev = orders.reduce((acc, o) => acc + o.total, 0);
    const pendingOrders = orders.filter(o => o.status === "Processing" || o.status === "Pending").length;

    document.querySelector(".stat-rev").textContent = `₹${totalRev.toLocaleString('en-IN')}`;
    document.querySelector(".stat-orders").textContent = orders.length;
    document.querySelector(".stat-pending").textContent = pendingOrders;
    document.querySelector(".stat-products").textContent = products.length;

    // Render Recent Orders Table
    const tbody = document.querySelector(".recent-orders-tbody");
    if (!tbody) return;

    tbody.innerHTML = orders.slice(0, 5).map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>${order.customer}</td>
            <td>${order.date}</td>
            <td><strong>₹${order.total.toLocaleString('en-IN')}</strong></td>
            <td><span class="badge-status badge-${order.status.toLowerCase()}">${order.status}</span></td>
            <td><a href="${getBasePath()}admin/orders.html" style="color: var(--rose-gold); font-weight:600;">View</a></td>
        </tr>
    `).join("");
}

function initAdminOrders() {
    const orders = Store.getOrders();
    const tbody = document.querySelector(".orders-tbody");
    if (!tbody) return;

    const renderOrders = () => {
        tbody.innerHTML = Store.getOrders().map(order => `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>
                    <div><strong>${order.customer}</strong></div>
                    <div style="font-size: 0.8rem; color: #888;">${order.email}</div>
                </td>
                <td><div style="max-width: 300px; font-size: 0.85rem;">${order.items}</div></td>
                <td>${order.date}</td>
                <td><strong>₹${order.total.toLocaleString('en-IN')}</strong></td>
                <td>
                    <select class="status-select" data-orderid="${order.id}" style="padding: 0.4rem 0.8rem; border-radius: 12px; border: 1px solid #ccc;">
                        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                </td>
            </tr>
        `).join("");

        tbody.querySelectorAll(".status-select").forEach(select => {
            select.addEventListener("change", (e) => {
                Store.updateOrderStatus(e.target.dataset.orderid, e.target.value);
                showToast(`Order ${e.target.dataset.orderid} status updated to ${e.target.value}`);
                renderOrders();
            });
        });
    };

    renderOrders();
}

function initAdminProducts() {
    const tbody = document.querySelector(".products-tbody");
    const addBtn = document.querySelector(".btn-add-product");
    const modal = document.querySelector(".modal-overlay");
    const form = document.querySelector(".product-form");
    if (!tbody) return;

    const renderProducts = () => {
        tbody.innerHTML = Store.getProducts().map(product => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <img src="${getBasePath()}${product.image}" style="width: 50px; height: 50px; border-radius: 12px; object-fit: cover; background: var(--bg-blush);">
                        <div>
                            <strong>${product.name}</strong>
                            <div style="font-size: 0.8rem; color: #888;">${product.category}</div>
                        </div>
                    </div>
                </td>
                <td>₹${product.price.toLocaleString('en-IN')}</td>
                <td>
                    <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
                        ${product.shades.map(s => `<span class="shade-dot" style="background-color: ${s.hex};" title="${s.name}"></span>`).join("")}
                        <span style="font-size: 0.8rem; color: #777;">(${product.shades.length} Shades)</span>
                    </div>
                </td>
                <td><span style="color: #28a745; font-weight: 600;">In Stock</span></td>
                <td>
                    <button class="btn-delete" data-id="${product.id}" style="color: #dc3545; background: transparent; font-weight:600;">Delete</button>
                </td>
            </tr>
        `).join("");

        tbody.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.dataset.id;
                const filtered = Store.getProducts().filter(p => p.id !== id);
                Store.setProducts(filtered);
                showToast("Product deleted successfully");
                renderProducts();
            });
        });
    };

    renderProducts();

    if (addBtn && modal) {
        addBtn.addEventListener("click", () => modal.classList.add("open"));
        modal.querySelector(".modal-close").addEventListener("click", () => modal.classList.remove("open"));
        modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const shadesRaw = formData.get("shades").split(",").map(s => s.trim());
            const shades = shadesRaw.map(s => {
                const parts = s.split("|");
                return { name: parts[0] ? parts[0].trim() : "Default", hex: parts[1] ? parts[1].trim() : "#B76E79" };
            });

            const newProduct = {
                id: `prod_${Date.now()}`,
                name: formData.get("name"),
                category: formData.get("category"),
                categorySlug: formData.get("category").toLowerCase().includes("lip") ? "lip-lab" : formData.get("category").toLowerCase().includes("face") ? "face-architect" : "eye-matrix",
                theme: "Clean Luxury",
                description: formData.get("description"),
                price: parseFloat(formData.get("price")),
                image: formData.get("category").toLowerCase().includes("lip") ? "assets/images/lip.png" : formData.get("category").toLowerCase().includes("face") ? "assets/images/face.png" : "assets/images/eye.png",
                shades: shades
            };

            const prods = Store.getProducts();
            prods.push(newProduct);
            Store.setProducts(prods);

            modal.classList.remove("open");
            form.reset();
            showToast("New premium product added successfully!");
            renderProducts();
        });
    }
}
