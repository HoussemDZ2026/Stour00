// 1. جلب البيانات من التخزين المحلي (LocalStorage)
let products = JSON.parse(localStorage.getItem('products')) || [];
const storeName = localStorage.getItem('storeName') || "متجر حسام DZ";

// 2. عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const storeNameElement = document.getElementById('store-name');
    if(storeNameElement) storeNameElement.innerText = storeName;
    
    renderProducts();
    startAllTimers(); // تشغيل العدادات التنازلية
});

// 3. دالة عرض المنتجات بتنسيق الشبكة (Grid) الجديد
function renderProducts() {
    const list = document.getElementById('products-list');
    const noProducts = document.getElementById('no-products');

    if (!list) return;

    if (products.length === 0) {
        if (noProducts) noProducts.style.display = 'block';
        return;
    }

    if (noProducts) noProducts.style.display = 'none';
    
    list.innerHTML = products.map(p => `
        <div class="product-card">
            ${p.useTimer ? `<div class="timer-badge" id="timer-${p.id}" style="position:absolute; top:5px; right:5px; background:rgba(231, 76, 60, 0.9); color:white; padding:2px 8px; border-radius:4px; font-size:10px; z-index:10;">جاري الحساب...</div>` : ''}
            <img src="${p.image}" class="product-image" alt="${p.name}">
            <div class="product-info">
                <h3 class="product-title">${p.name}</h3>
                <div class="price-container">
                    <span class="price-tag">${p.price} دج</span>
                    ${p.oldPrice ? `<span style="text-decoration: line-through; color: #999; font-size: 11px; margin-right:5px;">${p.oldPrice} دج</span>` : ''}
                </div>
                <button class="btn-buy" onclick="openOrderModal('${p.name}', ${p.id}, ${p.price})">اشتري الآن</button>
            </div>
        </div>
    `).join('');
}

// 4. دالة العداد التنازلي (مدمجة من كودك القديم)
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
                    timerElement.innerHTML = `⏳ ${hours}:${minutes}:${seconds}`;
                }
            }
        });
    }, 1000);
}

// 5. وظائف طلب الشراء (تعديل الكمية والنافذة)
let currentProductName = "";
let currentProductPrice = 0;

window.openOrderModal = function(name, id, price) {
    currentProductName = name;
    currentProductPrice = price;
    document.getElementById('modal-product-name').innerText = name;
    // تحديث السعر في النافذة إذا وجد عنصر له
    const priceElem = document.getElementById('modal-product-price');
    if(priceElem) priceElem.innerText = price + " دج";
    
    document.getElementById('order-quantity').value = 1;
    document.getElementById('order-modal').style.display = 'flex';
}

window.changeQty = function(amount) {
    const qtyInput = document.getElementById('order-quantity');
    let currentQty = parseInt(qtyInput.value);
    if (currentQty + amount >= 1) {
        qtyInput.value = currentQty + amount;
    }
}

// 6. تأكيد الطلب وحفظه في LocalStorage مع الإحصائيات
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
        productName: currentProductName,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        quantity: qty,
        totalPrice: currentProductPrice * qty,
        date: new Date().toLocaleString('ar-DZ')
    };

    // حفظ الطلب
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    // تحديث الإحصائيات (تأكد من وجود كائن stats في الـ Admin)
    let stats = JSON.parse(localStorage.getItem('stats')) || { sales: { day: 0, week: 0, month: 0 } };
    stats.sales.day++; stats.sales.week++; stats.sales.month++;
    localStorage.setItem('stats', JSON.stringify(stats));

    // إظهار شاشة النجاح
    document.getElementById('order-modal').style.display = 'none';
    document.getElementById('success-screen').style.display = 'flex';
};

document.getElementById('cancel-btn').onclick = () => {
    document.getElementById('order-modal').style.display = 'none';
};
