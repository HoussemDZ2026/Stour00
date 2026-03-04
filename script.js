// جلب المنتجات والبيانات من التخزين المحلي
let products = JSON.parse(localStorage.getItem('products')) || [];
const storeName = localStorage.getItem('storeName') || "متجر حسام DZ";

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('store-name').innerText = storeName;
    renderProducts();
    startAllTimers(); // تشغيل العدادات التنازلية
});

function renderProducts() {
    const list = document.getElementById('products-list');
    const noProducts = document.getElementById('no-products');

    if (products.length === 0) {
        noProducts.style.display = 'block';
        return;
    }

    noProducts.style.display = 'none';
    list.innerHTML = products.map(p => `
        <div class="product-card">
            ${p.useTimer ? `<div class="timer-badge" id="timer-${p.id}">جاري الحساب...</div>` : ''}
            <img src="${p.image}" class="product-img">
            <div class="product-info">
                <h2 class="product-title">${p.name}</h2>
                <p class="product-desc">${p.description}</p>
                <div class="price-container">
                    <span class="current-price">${p.price} دج</span>
                    ${p.oldPrice ? `<span class="old-price">${p.oldPrice} دج</span>` : ''}
                </div>
                <button class="buy-btn" onclick="openOrderModal('${p.name}', ${p.id})">اطلب الآن - الدفع عند الاستلام</button>
            </div>
        </div>
    `).join('');
}

// دالة تشغيل العدادات التنازلية لكل منتج
function startAllTimers() {
    setInterval(() => {
        products.forEach(p => {
            if (p.useTimer && p.endTime) {
                const timerElement = document.getElementById(`timer-${p.id}`);
                if (!timerElement) return;

                const now = Date.now();
                const distance = p.endTime - now;

                if (distance < 0) {
                    timerElement.innerHTML = "انتهى العرض!";
                    timerElement.style.background = "#ef4444";
                } else {
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    timerElement.innerHTML = `⏳ ينتهي العرض خلال: ${hours}:${minutes}:${seconds}`;
                }
            }
        });
    }, 1000);
}

// وظائف الطلب (تبقى كما هي في النسخة السابقة)
let currentProduct = "";
function openOrderModal(name, id) {
    currentProduct = name;
    document.getElementById('modal-product-name').innerText = name;
    document.getElementById('order-modal').style.display = 'flex';
}

document.getElementById('confirm-btn').onclick = () => {
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const address = document.getElementById('customer-address').value;
    const qty = document.getElementById('order-quantity').value;

    if (!name || !phone || !address) {
        alert("الرجاء ملء كافة البيانات!");
        return;
    }

    const newOrder = {
        id: Date.now(),
        productName: currentProduct,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        quantity: qty,
        date: new Date().toLocaleString('ar-DZ')
    };

    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    // تحديث إحصائيات المبيعات
    let stats = JSON.parse(localStorage.getItem('stats'));
    stats.sales.day++; stats.sales.week++; stats.sales.month++;
    localStorage.setItem('stats', JSON.stringify(stats));

    document.getElementById('order-modal').style.display = 'none';
    document.getElementById('success-screen').style.display = 'flex';
};

document.getElementById('cancel-btn').onclick = () => {
    document.getElementById('order-modal').style.display = 'none';
};
