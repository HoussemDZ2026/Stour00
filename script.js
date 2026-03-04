// عند تحميل الصفحة، ابدأ بعرض المنتجات
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
});

// دالة لجلب وعرض المنتجات من التخزين المحلي
function displayProducts() {
    const productsContainer = document.getElementById('products-list');
    const noProductsMsg = document.getElementById('no-products');
    
    // جلب البيانات المخزنة (سنتحكم بها من لوحة التحكم لاحقاً)
    const products = JSON.parse(localStorage.getItem('products')) || [];

    if (products.length === 0) {
        noProductsMsg.style.display = 'block';
        productsContainer.innerHTML = '';
        return;
    }

    noProductsMsg.style.display = 'none';
    productsContainer.innerHTML = '';

    products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // التحقق من وجود سعر قبل التخفيض
        const oldPriceHTML = product.oldPrice ? `<span style="text-decoration: line-through; color: #888; font-size: 1rem; margin-left: 10px;">${product.oldPrice} دج</span>` : '';
        
        // نظام العداد التنازلي الاختياري
        const timerHTML = product.useTimer ? `
            <div class="timer-box" id="timer-${index}" style="background: #fff3f3; padding: 10px; border-radius: 10px; margin: 10px 0; border: 1px dashed #ff3e3e; text-align: center;">
                <p style="margin: 0; font-size: 0.9rem; color: #ff3e3e; font-weight: bold;">🔥 ينتهي العرض خلال:</p>
                <span id="time-display-${index}" style="font-size: 1.2rem; font-weight: 900;">00:00:00</span>
            </div>` : '';

        productCard.innerHTML = `
            <img src="${product.image}" class="product-image" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p style="color: #666; font-size: 0.9rem;">${product.description}</p>
                <div class="price-tag">
                    <span class="product-price">${product.price} دج</span>
                    ${oldPriceHTML}
                </div>
                ${timerHTML}
                <button class="btn-buy" onclick="openOrderModal('${product.name}')">
                    <i class="fas fa-shopping-cart"></i> اطلب الآن - شراء
                </button>
            </div>
        `;
        productsContainer.appendChild(productCard);

        if (product.useTimer) {
            startCountdown(index);
        }
    });
}

// دالة فتح نافذة الشراء
function openOrderModal(productName) {
    document.getElementById('modal-product-name').innerText = productName;
    document.getElementById('order-modal').style.display = 'flex';
}

// إغلاق النافذة عند الضغط على إلغاء
document.getElementById('cancel-btn').onclick = function() {
    document.getElementById('order-modal').style.display = 'none';
};

// معالجة تأكيد الطلب
document.getElementById('confirm-btn').onclick = function() {
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const address = document.getElementById('customer-address').value;
    const qty = document.getElementById('order-quantity').value;
    const productName = document.getElementById('modal-product-name').innerText;

    if (!name || !phone || !address) {
        alert("أرجوك املأ جميع البيانات بشكل صحيح!");
        return;
    }

    const newOrder = {
        id: Date.now(),
        productName: productName,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        quantity: qty,
        date: new Date().toLocaleString('ar-DZ')
    };

    // حفظ الطلبية لكي تظهر في لوحة التحكم
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    // تحديث عداد المبيعات للإحصائيات
    let stats = JSON.parse(localStorage.getItem('stats')) || { dailySales: 0 };
    stats.dailySales += 1;
    localStorage.setItem('stats', JSON.stringify(stats));

    // إظهار شاشة النجاح
    document.getElementById('order-modal').style.display = 'none';
    document.getElementById('success-screen').style.display = 'flex';
};

// دالة العداد التنازلي (وهمي للتشويق)
function startCountdown(index) {
    let hours = 2, minutes = 45, seconds = 0;
    const display = document.getElementById(`time-display-${index}`);
    
    const interval = setInterval(() => {
        if (seconds > 0) seconds--;
        else {
            if (minutes > 0) { minutes--; seconds = 59; }
            else {
                if (hours > 0) { hours--; minutes = 59; seconds = 59; }
                else clearInterval(interval);
            }
        }
        display.innerText = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}
