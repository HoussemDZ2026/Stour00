// مصفوفات البيانات
let products = JSON.parse(localStorage.getItem('products')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || {
    visitors: { day: 0, week: 0, month: 0 },
    sales: { day: 0, week: 0, month: 0 },
    lastReset: { day: Date.now(), week: Date.now(), month: Date.now() }
};

// --- نظام تثبيت التطبيق المطور ---
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

function showInstallPrompt() {
    const modal = document.getElementById('custom-alert-modal');
    const btnYes = document.getElementById('alert-yes');
    const btnNo = document.getElementById('alert-no');

    modal.style.display = 'flex';

    btnYes.onclick = async () => {
        modal.style.display = 'none';
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
        } else {
            alert("التطبيق مهيأ! إذا لم يظهر التثبيت، أضفه يدوياً من إعدادات المتصفح.");
        }
    };

    btnNo.onclick = () => { modal.style.display = 'none'; };
}

// --- عند تحميل الصفحة ---
document.addEventListener('DOMContentLoaded', () => {
    updateStatsDisplay();
    renderAdminProducts();
    updateOrderBadge();
    checkNewOrders();
    
    const storedName = localStorage.getItem('storeName') || "متجر حسام DZ";
    document.getElementById('display-store-name').innerText = storedName;
});

// --- دوال التصفير الجديدة للجداول ---
function resetVisitors() {
    if(confirm("هل أنت متأكد من تصفير إحصائيات الزوار؟")) {
        stats.visitors = { day: 0, week: 0, month: 0 };
        localStorage.setItem('stats', JSON.stringify(stats));
        updateStatsDisplay();
    }
}

function resetSales() {
    if(confirm("هل أنت متأكد من تصفير إحصائيات المبيعات؟")) {
        stats.sales = { day: 0, week: 0, month: 0 };
        localStorage.setItem('stats', JSON.stringify(stats));
        updateStatsDisplay();
    }
}

function updateStatsDisplay() {
    document.getElementById('v-day').innerText = stats.visitors.day;
    document.getElementById('v-week').innerText = stats.visitors.week;
    document.getElementById('v-month').innerText = stats.visitors.month;
    
    document.getElementById('s-day').innerText = stats.sales.day;
    document.getElementById('s-week').innerText = stats.sales.week;
    document.getElementById('s-month').innerText = stats.sales.month;
}

// --- إدارة المنتجات مع ضغط الصور التلقائي ---
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
        alert("أدخل البيانات الأساسية والصورة!");
        return;
    }

    const file = imageInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;

        img.onload = function() {
            // إعدادات الضغط: تصغير الصورة لتوفير المساحة
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 500; // عرض الصورة الأقصى (كافٍ للهواتف)
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // تحويل الصورة إلى JPEG بجودة متوسطة (0.6) لتقليل حجم الكود المخزن
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);

            const newProduct = {
                id: Date.now(),
                name, description: desc, price, oldPrice,
                useTimer,
                timerHours: hours,
                timerMinutes: minutes,
                endTime: Date.now() + (hours * 3600000) + (minutes * 60000),
                image: compressedBase64 
            };

            products.push(newProduct);
            localStorage.setItem('products', JSON.stringify(products));
            
            alert("تم حفظ المنتج بنجاح! تم ضغط الصورة تلقائياً لتوفير المساحة.");
            closeModal('add-modal');
            renderAdminProducts();
            
            // تصفير خانة الصورة للمعالجة القادمة
            imageInput.value = "";
        };
    };
    reader.readAsDataURL(file);
}

function renderAdminProducts() {
    const list = document.getElementById('admin-products-list');
    list.innerHTML = products.map(p => `
        <div class="order-card" style="border-right: 5px solid #fbbf24; background: #f9fafb; margin-bottom:10px;">
            <b>${p.name}</b> - <span style="color:#f59e0b">${p.price} دج</span>
            ${p.useTimer ? `<br><small>⏳ العداد: ${p.timerHours}س و ${p.timerMinutes}د</small>` : ''}
            <button onclick="deleteProduct(${p.id})" class="btn-delete" style="width:100%; margin-top:10px;">حذف</button>
        </div>
    `).join('');
}

// --- إدارة الطلبيات ---
function toggleOrders() {
    const container = document.getElementById('orders-container');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
    renderOrders();
}

function renderOrders() {
    const list = document.getElementById('orders-list');
    if (orders.length === 0) {
        list.innerHTML = "<p style='text-align:center;'>لا يوجد طلبات حالياً</p>";
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

// --- الوظائف العامة ---
function deleteProduct(id) {
    if(confirm("حذف المنتج؟")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        renderAdminProducts();
    }
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

function checkNewOrders() {
    setInterval(() => {
        const latest = JSON.parse(localStorage.getItem('orders')) || [];
        if (latest.length > orders.length) {
            orders = latest;
            document.getElementById('notif-sound').play();
            updateOrderBadge();
        }
    }, 3000);
}

function copyStoreLink() {
    const link = window.location.href.replace('admin.html', 'index.html');
    navigator.clipboard.writeText(link).then(() => alert("تم نسخ الرابط بنجاح!"));
}

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
