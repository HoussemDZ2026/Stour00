// مصفوفات البيانات
let products = JSON.parse(localStorage.getItem('products')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || {
    visitors: { day: 0, week: 0, month: 0 },
    sales: { day: 0, week: 0, month: 0 },
    lastReset: { day: Date.now(), week: Date.now(), month: Date.now() }
};

// نظام تثبيت التطبيق
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

async function showInstallPrompt() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') { console.log('User accepted the install prompt'); }
        deferredPrompt = null;
    } else {
        alert("التطبيق جاهز! إذا لم يظهر التثبيت، يمكنك إضافته يدوياً من خيارات المتصفح (إضافة إلى الشاشة الرئيسية)");
    }
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    checkAutoReset();
    updateStatsDisplay();
    renderAdminProducts();
    updateOrderBadge();
    checkNewOrders();
    
    const storedName = localStorage.getItem('storeName') || "متجر حسام DZ";
    document.getElementById('display-store-name').innerText = storedName;
});

// حفظ المنتج مع الوقت المحدد
function saveProduct() {
    const name = document.getElementById('p-name').value;
    const desc = document.getElementById('p-desc').value;
    const price = document.getElementById('p-price').value;
    const oldPrice = document.getElementById('p-old-price').value;
    const useTimer = document.getElementById('p-timer').checked;
    
    // جلب الساعات والدقائق المحددة
    const hours = parseInt(document.getElementById('p-hours').value) || 0;
    const minutes = parseInt(document.getElementById('p-minutes').value) || 0;
    
    const imageInput = document.getElementById('p-image');

    if (!name || !price || !imageInput.files[0]) {
        alert("الرجاء ملء البيانات الأساسية ورفع صورة!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const newProduct = {
            id: Date.now(),
            name, description: desc, price, oldPrice,
            useTimer,
            timerHours: hours,   // حفظ الساعات الجديدة
            timerMinutes: minutes, // حفظ الدقائق الجديدة
            endTime: Date.now() + (hours * 3600000) + (minutes * 60000), // حساب وقت النهاية
            image: e.target.result
        };
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        alert("تم رفع المنتج مع العداد بنجاح!");
        closeModal('add-modal');
        renderAdminProducts();
    };
    reader.readAsDataURL(imageInput.files[0]);
}

// باقي وظائف الإدارة (حذف، طلبات، إحصائيات)
function renderAdminProducts() {
    const list = document.getElementById('admin-products-list');
    list.innerHTML = products.map(p => `
        <div class="order-card">
            <b>${p.name}</b> - ${p.price} دج
            ${p.useTimer ? `<br><small>⏳ العداد: ${p.timerHours}س و ${p.timerMinutes}د</small>` : ''}
            <button onclick="deleteProduct(${p.id})" class="btn-delete" style="margin-top:10px; width:100%">حذف المنتج</button>
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
            <p>الزبون: <b>${o.customerName}</b></p>
            <p>الهاتف: ${o.customerPhone}</p>
            <button class="btn-call" onclick="window.location.href='tel:${o.customerPhone}'">اتصال</button>
            <button class="btn-delete" onclick="deleteOrder(${o.id})">حذف</button>
        </div>
    `).join('');
}

function deleteOrder(id) {
    if(confirm("حذف الطلبية؟")) {
        orders = orders.filter(o => o.id !== id);
        localStorage.setItem('orders', JSON.stringify(orders));
        renderOrders();
        updateOrderBadge();
    }
}

function checkNewOrders() {
    setInterval(() => {
        const latestOrders = JSON.parse(localStorage.getItem('orders')) || [];
        if (latestOrders.length > orders.length) {
            orders = latestOrders;
            document.getElementById('notif-sound').play();
            updateOrderBadge();
        }
    }, 3000);
}

function updateOrderBadge() {
    const badge = document.getElementById('order-badge');
    if (orders.length > 0) {
        badge.innerText = orders.length;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function copyStoreLink() {
    const link = window.location.href.replace('admin.html', 'index.html');
    navigator.clipboard.writeText(link);
    alert("تم نسخ رابط المتجر");
}

function checkAutoReset() { /* دالة التصفير التلقائي تبقى كما هي */ }
function updateStatsDisplay() { /* دالة عرض الإحصائيات تبقى كما هي */ }
function resetStatsManual() { /* دالة التصفير اليدوي تبقى كما هي */ }
function openAddModal() { document.getElementById('add-modal').style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function toggleProductsList() {
    const list = document.getElementById('admin-products-container');
    list.style.display = list.style.display === 'none' ? 'block' : 'none';
}
function openSettings() { document.getElementById('settings-modal').style.display = 'flex'; }
function updateStoreName() {
    const newName = document.getElementById('new-store-name').value;
    if(newName) {
        localStorage.setItem('storeName', newName);
        document.getElementById('display-store-name').innerText = newName;
        closeModal('settings-modal');
    }
}
