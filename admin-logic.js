// مصفوفات البيانات
let products = JSON.parse(localStorage.getItem('products')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || {
    visitors: { day: 0, week: 0, month: 0 },
    sales: { day: 0, week: 0, month: 0 },
    lastReset: { day: Date.now(), week: Date.now(), month: Date.now() }
};

// نظام تثبيت التطبيق المطور
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

// دالة إظهار النافذة الاحترافية (نعم / لا)
function showInstallPrompt() {
    const modal = document.getElementById('custom-alert-modal');
    const btnYes = document.getElementById('alert-yes');
    const btnNo = document.getElementById('alert-no');

    // إظهار النافذة
    modal.style.display = 'flex';

    // عند الضغط على "نعم، تثبيت الآن"
    btnYes.onclick = async () => {
        modal.style.display = 'none';
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') { console.log('User accepted the install prompt'); }
            deferredPrompt = null;
        } else {
            alert("التطبيق جاهز بالفعل! إذا لم يظهر التثبيت التلقائي، يمكنك إضافته يدوياً من خيارات المتصفح (Add to Home Screen)");
        }
    };

    // عند الضغط على "ليس الآن"
    btnNo.onclick = () => {
        modal.style.display = 'none';
    };
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
            timerHours: hours,
            timerMinutes: minutes,
            endTime: Date.now() + (hours * 3600000) + (minutes * 60000),
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

// عرض المنتجات في لوحة الإدارة
function renderAdminProducts() {
    const list = document.getElementById('admin-products-list');
    list.innerHTML = products.map(p => `
        <div class="order-card" style="border-right: 4px solid #fbbf24; margin-bottom: 10px; padding: 15px; background: #fff; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <div style="font-weight: bold; font-size: 1.1rem; color: #1e293b;">${p.name}</div>
            <div style="color: #fbbf24; font-weight: bold;">${p.price} دج</div>
            ${p.useTimer ? `<div style="font-size: 0.85rem; color: #64748b; margin-top: 5px;"><i class="fas fa-clock"></i> العداد: ${p.timerHours}س و ${p.timerMinutes}د</div>` : ''}
            <button onclick="deleteProduct(${p.id})" class="btn-delete" style="margin-top:10px; width:100%; background: #fee2e2; color: #ef4444; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">حذف المنتج</button>
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

function checkAutoReset() { /* منطق التصفير يبقى كما هو */ }
function updateStatsDisplay() { /* منطق الإحصائيات يبقى كما هو */ }
function resetStatsManual() { /* تصفير الإحصائيات يبقى كما هو */ }
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
