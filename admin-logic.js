// مصفوفات البيانات
let products = JSON.parse(localStorage.getItem('products')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || {
    visitors: { day: 0, week: 0, month: 0 },
    sales: { day: 0, week: 0, month: 0 },
    lastReset: { day: Date.now(), week: Date.now(), month: Date.now() }
};

// --- عند تحميل الصفحة ---
document.addEventListener('DOMContentLoaded', () => {
    updateStatsDisplay();
    renderAdminProducts();
    updateOrderBadge();
    checkNewData(); // فحص الطلبات والزوار الجدد
    updateStorageInfo();
    
    const storedName = localStorage.getItem('storeName') || "متجر حسام DZ";
    const storeNameElem = document.getElementById('display-store-name');
    if(storeNameElem) storeNameElem.innerText = storedName;
});

// --- وظيفة الرادار: عرض الزوار الجزائريين ---
function renderVisitors() {
    const list = document.getElementById('visitors-list');
    const logs = JSON.parse(localStorage.getItem('visitorsLogs')) || [];
    
    if (!list) return;
    
    if (logs.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding:20px;'>لا يوجد نشاط حالياً 📡</p>";
        return;
    }

    list.innerHTML = logs.slice().reverse().map(v => `
        <div class="visitor-card">
            <div>
                <span style="font-size: 1.2rem;">🇩🇿</span> 
                <b style="color:#006233;">${v.wilaya}</b> 
                <small style="color:#666;">(${v.city})</small>
            </div>
            <div style="text-align: left;">
                <span style="font-size: 0.8rem; display:block; color:#999;">${v.time.split(',')[1]}</span>
                <span style="font-size: 0.7rem; color:#475569; font-family:monospace;">${v.ip}</span>
            </div>
        </div>
    `).join('');
}

// تبديل عرض الرادار
function toggleRadar() {
    const container = document.getElementById('radar-container');
    const isHidden = container.style.display === 'none';
    container.style.display = isHidden ? 'block' : 'none';
    if(isHidden) renderVisitors();
}

// --- إضافة منتج جديد (مع الضغط) ---
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
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 500; 
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);

            const newProduct = {
                id: Date.now(),
                name, description: desc, 
                price: parseFloat(price), 
                oldPrice: oldPrice ? parseFloat(oldPrice) : null,
                useTimer, timerHours: hours, timerMinutes: minutes,
                endTime: Date.now() + (hours * 3600000) + (minutes * 60000),
                image: compressedBase64 
            };

            products.push(newProduct);
            localStorage.setItem('products', JSON.stringify(products));
            
            alert("تم إضافة المنتج!");
            closeModal('add-modal');
            renderAdminProducts();
            updateStorageInfo();
        };
    };
    reader.readAsDataURL(file);
}

// --- عرض المنتجات ---
function renderAdminProducts() {
    const list = document.getElementById('admin-products-list');
    if(!list) return;
    list.innerHTML = products.map(p => `
        <div class="order-card" style="border-right: 5px solid #fbbf24; background: #fdfdfd; padding:10px; margin-bottom:10px; border-radius:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <b>${p.name}</b> <br>
                    <span style="color:#e74c3c; font-weight:bold;">${p.price} دج</span>
                </div>
                <button onclick="deleteProduct(${p.id})" style="background:#ffeded; color:#e74c3c; border:none; padding:5px; border-radius:5px;">حذف</button>
            </div>
        </div>
    `).join('');
}

// --- عرض الطلبيات ---
function renderOrders() {
    const list = document.getElementById('orders-list');
    if (!list || orders.length === 0) {
        if(list) list.innerHTML = "<p style='text-align:center;'>لا يوجد طلبات</p>";
        return;
    }
    list.innerHTML = orders.slice().reverse().map(o => `
        <div class="order-card" style="border-right: 5px solid #10b981; margin-bottom:15px; padding:15px; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <b>📦 ${o.productName} (x${o.quantity})</b>
            <p>👤 ${o.customerName} | 📞 ${o.customerPhone}</p>
            <p>📍 ${o.customerAddress}</p>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <button onclick="window.location.href='tel:${o.customerPhone}'" style="flex:1; background:#00b894; color:white; border:none; padding:8px; border-radius:5px;">اتصال</button>
                <button onclick="deleteOrder(${o.id})" style="flex:1; background:#fab1a0; color:#d63031; border:none; padding:8px; border-radius:5px;">حذف</button>
            </div>
        </div>
    `).join('');
}

// --- وظائف التحديث المستمر ---
function checkNewData() {
    setInterval(() => {
        // فحص الطلبات
        const latestOrders = JSON.parse(localStorage.getItem('orders')) || [];
        if (latestOrders.length > orders.length) {
            orders = latestOrders;
            document.getElementById('notif-sound').play().catch(() => {});
            updateOrderBadge();
            if(document.getElementById('orders-container').style.display === 'block') renderOrders();
        }
        
        // تحديث الرادار تلقائياً إذا كان مفتوحاً
        if(document.getElementById('radar-container').style.display === 'block') {
            renderVisitors();
        }
    }, 4000);
}

// --- الوظائف المساعدة ---
function deleteProduct(id) {
    if(confirm("حذف المنتج؟")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        renderAdminProducts();
        updateStorageInfo();
    }
}

function deleteOrder(id) {
    if(confirm("حذف الطلبية؟")) {
        orders = orders.filter(o => o.id !== id);
        localStorage.setItem('orders', JSON.stringify(orders));
        renderOrders();
        updateOrderBadge();
    }
}

function updateOrderBadge() {
    const badge = document.getElementById('order-badge');
    if (badge) {
        badge.innerText = orders.length;
        badge.style.display = orders.length > 0 ? 'inline-block' : 'none';
    }
}

function updateStorageInfo() {
    const totalSize = (encodeURI(JSON.stringify(localStorage)).length / 1024); 
    const limit = 5120; 
    const percent = Math.min((totalSize / limit) * 100, 100).toFixed(1);
    const bar = document.getElementById('storage-bar');
    const percentText = document.getElementById('storage-percent');
    if (bar && percentText) {
        bar.style.width = percent + "%";
        percentText.innerText = percent + "%";
        bar.style.background = percent > 80 ? "#ef4444" : (percent > 50 ? "#f59e0b" : "#10b981");
    }
}

function copyStoreLink() {
    const link = window.location.href.replace('admin.html', 'index.html');
    navigator.clipboard.writeText(link).then(() => alert("تم نسخ رابط المتجر 🇩🇿"));
}

function updateStatsDisplay() {
    ['v-day', 'v-week', 'v-month', 's-day', 's-week', 's-month'].forEach(id => {
        const elem = document.getElementById(id);
        if(elem) {
            const type = id.startsWith('v') ? 'visitors' : 'sales';
            const period = id.split('-')[1];
            elem.innerText = stats[type][period];
        }
    });
}

function openAddModal() { document.getElementById('add-modal').style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function toggleOrders() { document.getElementById('orders-container').style.display = document.getElementById('orders-container').style.display === 'none' ? 'block' : 'none'; renderOrders(); }
function toggleProductsList() { document.getElementById('admin-products-container').style.display = document.getElementById('admin-products-container').style.display === 'none' ? 'block' : 'none'; }
function openSettings() { document.getElementById('settings-modal').style.display = 'flex'; }
function updateStoreName() {
    const name = document.getElementById('new-store-name').value;
    if(name) {
        localStorage.setItem('storeName', name);
        document.getElementById('display-store-name').innerText = name;
        closeModal('settings-modal');
    }
        }
