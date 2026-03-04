// مصفوفات البيانات
let products = JSON.parse(localStorage.getItem('products')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || {
    visitors: { day: 0, week: 0, month: 0 },
    sales: { day: 0, week: 0, month: 0 },
    lastReset: { day: Date.now(), week: Date.now(), month: Date.now() }
};

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    checkAutoReset();
    updateStatsDisplay();
    renderAdminProducts();
    updateOrderBadge();
    checkNewOrders();
    
    // تحديث اسم المتجر في اللوحة
    const storedName = localStorage.getItem('storeName') || "متجر حسام DZ";
    document.getElementById('display-store-name').innerText = storedName;
});

// 1. نظام التقارير والتصفير التلقائي
function checkAutoReset() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    if (now - stats.lastReset.day >= oneDay) {
        stats.visitors.day = 0; stats.sales.day = 0;
        stats.lastReset.day = now;
    }
    if (now - stats.lastReset.week >= oneWeek) {
        stats.visitors.week = 0; stats.sales.week = 0;
        stats.lastReset.week = now;
    }
    if (now - stats.lastReset.month >= oneMonth) {
        stats.visitors.month = 0; stats.sales.month = 0;
        stats.lastReset.month = now;
    }
    saveStats();
}

function updateStatsDisplay() {
    document.getElementById('v-day').innerText = stats.visitors.day;
    document.getElementById('v-week').innerText = stats.visitors.week;
    document.getElementById('v-month').innerText = stats.visitors.month;
    document.getElementById('s-day').innerText = stats.sales.day;
    document.getElementById('s-week').innerText = stats.sales.week;
    document.getElementById('s-month').innerText = stats.sales.month;
}

function resetStatsManual() {
    if(confirm("هل أنت متأكد من تصفير جميع الإحصائيات يدوياً؟")) {
        stats.visitors = { day: 0, week: 0, month: 0 };
        stats.sales = { day: 0, week: 0, month: 0 };
        saveStats();
        updateStatsDisplay();
        alert("تم التصفير بنجاح!");
    }
}

// 2. إدارة المنتجات
function openAddModal() { document.getElementById('add-modal').style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function saveProduct() {
    const name = document.getElementById('p-name').value;
    const desc = document.getElementById('p-desc').value;
    const price = document.getElementById('p-price').value;
    const oldPrice = document.getElementById('p-old-price').value;
    const useTimer = document.getElementById('p-timer').checked;
    const imageInput = document.getElementById('p-image');

    if (!name || !price || !imageInput.files[0]) {
        alert("الرجاء ملء البيانات الأساسية ورفع صورة!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const newProduct = {
            id: Date.now(),
            name, description: desc, price, oldPrice, useTimer,
            image: e.target.result
        };
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        alert("تم رفع المنتج بنجاح!");
        closeModal('add-modal');
        renderAdminProducts();
    };
    reader.readAsDataURL(imageInput.files[0]);
}

function renderAdminProducts() {
    const list = document.getElementById('admin-products-list');
    list.innerHTML = products.map(p => `
        <div class="order-card">
            <b>${p.name}</b> - ${p.price} دج
            <button onclick="deleteProduct(${p.id})" class="btn-delete" style="margin-top:10px;">حذف المنتج</button>
        </div>
    `).join('');
}

function deleteProduct(id) {
    if(confirm("حذف هذا المنتج؟")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        renderAdminProducts();
    }
}

// 3. إدارة الطلبيات الواردة والتنبيهات
function toggleOrders() {
    const container = document.getElementById('orders-container');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
    renderOrders();
}

function renderOrders() {
    const list = document.getElementById('orders-list');
    if (orders.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding:20px;'>لا يوجد طلبيات</p>";
        return;
    }
    list.innerHTML = orders.slice().reverse().map(o => `
        <div class="order-card">
            <div class="order-header">${o.productName}</div>
            <div class="order-date">${o.date}</div>
            <p>الزبون: <b>${o.customerName}</b></p>
            <span class="order-phone">${o.customerPhone}</span>
            <p>العنوان: ${o.customerAddress}</p>
            <p>الكمية: ${o.quantity}</p>
            <button class="btn-call" onclick="window.location.href='tel:${o.customerPhone}'">اتصال بالزبون</button>
            <button class="btn-delete" onclick="deleteOrder(${o.id})">حذف الطلبية</button>
        </div>
    `).join('');
}

function deleteOrder(id) {
    if(confirm("هل أنت متأكد من حذف الطلبية؟")) {
        orders = orders.filter(o => o.id !== id);
        localStorage.setItem('orders', JSON.stringify(orders));
        renderOrders();
        updateOrderBadge();
        alert("تم الحذف بنجاح");
    }
}

// 4. نظام الإشعارات والصوت
function checkNewOrders() {
    setInterval(() => {
        const latestOrders = JSON.parse(localStorage.getItem('orders')) || [];
        if (latestOrders.length > orders.length) {
            orders = latestOrders;
            document.getElementById('notif-sound').play();
            updateOrderBadge();
            alert("مبروك! وصلتك طلبية جديدة الآن 🔥");
        }
    }, 3000);
}

function updateOrderBadge() {
    const badge = document.getElementById('order-badge');
    if (orders.length > 0) {
        badge.innerText = orders.length;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// وظائف إضافية
function updateStoreName() {
    const newName = document.getElementById('new-store-name').value;
    if(newName) {
        localStorage.setItem('storeName', newName);
        document.getElementById('display-store-name').innerText = newName;
        alert("تم تغيير اسم المتجر بنجاح");
        closeModal('settings-modal');
    }
}

function copyStoreLink() {
    const link = window.location.href.replace('admin.html', 'index.html');
    navigator.clipboard.writeText(link);
    alert("تم نسخ رابط متجرك بنجاح");
}

function saveStats() { localStorage.setItem('stats', JSON.stringify(stats)); }
function openSettings() { document.getElementById('settings-modal').style.display = 'flex'; }
function toggleProductsList() {
    const list = document.getElementById('admin-products-container');
    list.style.display = list.style.display === 'none' ? 'block' : 'none';
                                                             }
