// 1. جلب البيانات من التخزين المحلي (LocalStorage)
let products = JSON.parse(localStorage.getItem('products')) || [];
const storeName = localStorage.getItem('storeName') || "متجر حسام DZ";

// 2. عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const storeNameElement = document.getElementById('store-name');
    if(storeNameElement) storeNameElement.innerText = storeName;
    
    // تحديث الأزرار (إخفاء الفارغ) عند التحميل
    updateCategoryButtons();
    
    renderProducts('الكل'); 
    startAllTimers(); 
    trackAlgerianVisitor(); 
});

// --- الوظيفة المحدثة: إخفاء الأقسام الفارغة باستخدام الـ ID ---
function updateCategoryButtons() {
    const categoryMap = {
        'أحذية': 'btn-shoes',
        'ملابس': 'btn-clothes',
        'إكسسوارات': 'btn-acc'
    };

    for (const [catName, btnId] of Object.entries(categoryMap)) {
        const btn = document.getElementById(btnId);
        if (btn) {
            // فحص إذا كان هناك منتج ينتمي لهذا القسم
            const hasProducts = products.some(p => p.category === catName);
            // إخفاء الزر تماماً إذا لم تكن هناك منتجات
            btn.style.display = hasProducts ? 'inline-block' : 'none';
        }
    }
}

// 3. دالة عرض المنتجات مع نظام الفلترة
function renderProducts(filter = 'الكل') {
    const list = document.getElementById('products-list');
    const noProductsMsg = document.getElementById('no-products');
    if (!list) return;
    
    let filteredProducts = products;
    if (filter !== 'الكل') {
        filteredProducts = products.filter(p => p.category === filter);
    }

    if (filteredProducts.length === 0) {
        list.innerHTML = '';
        if(noProductsMsg) noProductsMsg.style.display = 'block';
        return;
    }
    
    if(noProductsMsg) noProductsMsg.style.display = 'none';

    list.innerHTML = filteredProducts.map(p => `
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

// دالة التبديل بين الأقسام
window.filterByCategory = function(category) {
    renderProducts(category);
    
    // تحديث شكل الزر النشط (Active)
    const buttons = document.querySelectorAll('.category-item');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText.trim() === category) btn.classList.add('active');
    });
}

// --- وظيفة تتبع الزوار الجزائريين ---
async function trackAlgerianVisitor() {
    try {
        const response = await fetch('https://ipapi.co/json/'); 
        const data = await response.json();
        if (data.city) {
            const visitorData = {
                id: Date.now(),
                ip: data.ip,
                wilaya: data.region, 
                city: data.city,
                time: new Date().toLocaleString('ar-DZ')
            };
            let visitorsLogs = JSON.parse(localStorage.getItem('visitorsLogs')) || [];
            if (visitorsLogs.length > 50) visitorsLogs.shift(); 
            visitorsLogs.push(visitorData);
            localStorage.setItem('visitorsLogs', JSON.stringify(visitorsLogs));
            window.detectedWilaya = data.region;
        }
    } catch (error) { console.log("رادار الزوار متوقف"); }
}

// 4. العداد التنازلي
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

// 5. وظائف طلب الشراء
let currentProductName = "";
let currentProductPrice = 0;

window.openOrderModal = function(name, id, price) {
    currentProductName = name;
    currentProductPrice = price;
    document.getElementById('modal-product-name').innerText = name;
    const addressField = document.getElementById('customer-address');
    if(addressField && window.detectedWilaya) {
        addressField.value = "الولاية: " + window.detectedWilaya;
    }
    document.getElementById('order-quantity').value = 1;
    document.getElementById('order-modal').style.display = 'flex';
}

window.changeQty = function(amount) {
    const qtyInput = document.getElementById('order-quantity');
    let currentQty = parseInt(qtyInput.value);
    if (currentQty + amount >= 1) { qtyInput.value = currentQty + amount; }
}

document.getElementById('confirm-btn').onclick = () => {
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const address = document.getElementById('customer-address').value;
    const qty = document.getElementById('order-quantity').value;

    if (!name || !phone || !address) { alert("ملء كافة البيانات!"); return; }

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

    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    document.getElementById('order-modal').style.display = 'none';
    document.getElementById('success-screen').style.display = 'flex';
};

document.getElementById('cancel-btn').onclick = () => {
    document.getElementById('order-modal').style.display = 'none';
};
