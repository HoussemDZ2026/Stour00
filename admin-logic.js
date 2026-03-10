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
    checkNewData(); 
    updateStorageInfo();
    
    // تحميل اسم المتجر وأسماء الأقسام
    loadCategoryNames();
    
    const storedName = localStorage.getItem('storeName') || "متجر حسام DZ";
    const storeNameElem = document.getElementById('display-store-name');
    if(storeNameElem) storeNameElem.innerText = storedName;
});

// --- وظيفة تحميل وتحديث أسماء الأقسام ---
function loadCategoryNames() {
    // جلب الأسماء المخصصة أو استخدام الافتراضية
    const names = JSON.parse(localStorage.getItem('categoryNames')) || ['أحذية', 'ملابس', 'إكسسوارات'];
    
    // 1. تحديث القائمة المنسدلة (Select) في مودال إضافة منتج
    const select = document.getElementById('p-category');
    if (select) {
        select.innerHTML = names.map(name => `<option value="${name}">${name}</option>`).join('');
    }

    // 2. ملء خانات الإدخال في مودال الإعدادات بالأسماء الحالية
    if(document.getElementById('cat1-name')) document.getElementById('cat1-name').value = names[0];
    if(document.getElementById('cat2-name')) document.getElementById('cat2-name').value = names[1];
    if(document.getElementById('cat3-name')) document.getElementById('cat3-name').value = names[2];
    
    // ملء اسم المتجر الحالي في الإعدادات
    const currentStoreName = localStorage.getItem('storeName') || "متجر حسام DZ";
    if(document.getElementById('new-store-name')) document.getElementById('new-store-name').value = currentStoreName;
}

// --- وظيفة حفظ الإعدادات العامة (الاسم + الأقسام) ---
function saveAdminSettings() {
    // حفظ أسماء الأقسام
    const n1 = document.getElementById('cat1-name').value || 'أحذية';
    const n2 = document.getElementById('cat2-name').value || 'ملابس';
    const n3 = document.getElementById('cat3-name').value || 'إكسسوارات';
    localStorage.setItem('categoryNames', JSON.stringify([n1, n2, n3]));

    // حفظ اسم المتجر
    const newName = document.getElementById('new-store-name').value;
    if(newName) {
        localStorage.setItem('storeName', newName);
        document.getElementById('display-store-name').innerText = newName;
    }

    alert("تم حفظ جميع الإعدادات بنجاح! ✅");
    loadCategoryNames(); // تحديث القوائم فوراً
    closeModal('settings-modal');
}

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
        <div class="visitor-card" style="background:#fff; padding:10px; border-radius:10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; border:1px solid #eee;">
            <div>
                <span style="font-size: 1.2rem;">🇩🇿</span> 
                <b style="color:#006233;">${v.wilaya}</b> 
                <small style="color:#666;">(${v.city})</small>
            </div>
            <div style="text-align: left;">
                <span style="font-size: 0.8rem; display:block; color:#999;">${v.time.split(',')[1] || v.time}</span>
                <span style="font-size: 0.7rem; color:#475569; font-family:monospace;">${v.ip}</span>
            </div>
        </div>
    `).join('');
}

function toggleRadar() {
    const container = document.getElementById('radar-container');
    const isHidden = container.style.display === 'none';
    container.style.display = isHidden ? 'block' : 'none';
    if(isHidden) renderVisitors();
}

// --- إضافة منتج جديد ---
function saveProduct() {
    const name = document.getElementById('p-name').value;
    const desc = document.getElementById('p-desc').value;
    const price = document.getElementById('p-price').value;
    const oldPrice = document.getElementById('p-old-price').value;
    const useTimer = document.getElementById('p-timer').checked;
    const category = document.getElementById('p-category').value;
    
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
                name: name,
                category: category,
                description: desc, 
                price: parseFloat(price), 
                oldPrice: oldPrice ? parseFloat(oldPrice) : null,
                useTimer, timerHours: hours, timerMinutes: minutes,
                endTime: Date.now() + (hours * 3600000) + (minutes * 60000),
                image: compressedBase64 
            };

            products.push(newProduct);
            localStorage.setItem('products', JSON.stringify(products));
            
            alert(`تم إضافة المنتج في قسم ${category}!`);
            closeModal('add-modal');
            renderAdminProducts();
            updateStorageInfo();

            // تصغير النموذج
            document.getElementById('p-name').value = '';
            document.getElementById('p-desc').value = '';
            document.getElementById('p-price').value = '';
        };
    };
    reader.readAsDataURL(file);
}

// --- عرض المنتجات في الإدارة ---
function renderAdminProducts() {
    const list = document.getElementById('admin-products-list');
    if(!list) return;
    list.innerHTML = products.map(p => `
        <div class="order-card" style="border-right: 5px solid #fbbf24; background: #fdfdfd; padding:10px; margin-bottom:10px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <b>${p.name}</b> 
                    <span style="font-size:0.7rem; background:#e2e8f0; padding:2px 6px; border-radius:10px; margin-right:5px;">${p.category || 'بدون قسم'}</span>
                    <br>
                    <span style="color:#e74c3c; font-weight:bold;">${p.price} دج</span>
                </div>
                <button onclick="deleteProduct(${p.id})" style="background:#ffeded; color:#e74c3c; border:none; padding:5px; border-radius:5px; cursor:pointer;">حذف</button>
            </div>
        </div>
    `).join('');
}

// --- عرض الطلبيات ---
function renderOrders() {
    const list = document.getElementById('orders-list');
    if (!list) return;
    if (orders.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding:20px;'>لا يوجد طلبات حالياً</p>";
        return;
    }
    list.innerHTML = orders.slice().reverse().map(o => `
        <div class="order-card" style="border-right: 5px solid #10b981; margin-bottom:15px; padding:15px; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <b>📦 ${o.productName} (x${o.quantity})</b>
            <p style="margin:5px 0;">👤 ${o.customerName} | 📞 ${o.customerPhone}</p>
            <p style="margin:5px 0; font-size:0.9rem; color:#666;">📍 ${o.customerAddress}</p>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <a href="tel:${o.customerPhone}" style="flex:1; background:#00b894; color:white; text-align:center; text-decoration:none; padding:8px; border-radius:5px; font-weight:bold;">اتصال</a>
                <button onclick="deleteOrder(${o.id})" style="flex:1; background:#fab1a0; color:#d63031; border:none; padding:8px; border-radius:5px; font-weight:bold; cursor:pointer;">حذف</button>
            </div>
        </div>
    `).join('');
}

// --- فحص البيانات الجديدة ---
function checkNewData() {
    setInterval(() => {
        const latestOrders = JSON.parse(localStorage.getItem('orders')) || [];
        if (latestOrders.length > orders.length) {
            orders = latestOrders;
            const sound = document.getElementById('notif-sound');
            if(sound) sound.play().catch(() => {});
            updateOrderBadge();
            if(document.getElementById('orders-container').style.display === 'block') renderOrders();
        }
        
        if(document.getElementById('radar-container').style.display === 'block') {
            renderVisitors();
        }
    }, 4000);
}

// --- وظائف الحذف والتحديث ---
function deleteProduct(id) {
    if(confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        renderAdminProducts();
        updateStorageInfo();
    }
}

function deleteOrder(id) {
    if(confirm("هل تريد حذف هذه الطلبية من السجل؟")) {
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
    try {
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
    } catch(e) {}
}

function copyStoreLink() {
    const link = window.location.href.replace('admin.html', 'index.html');
    navigator.clipboard.writeText(link).then(() => alert("تم نسخ رابط المتجر بنجاح! 🇩🇿"));
}

function updateStatsDisplay() {
    ['v-day', 'v-week', 'v-month', 's-day', 's-week', 's-month'].forEach(id => {
        const elem = document.getElementById(id);
        if(elem) {
            const type = id.startsWith('v') ? 'visitors' : 'sales';
            const period = id.split('-')[1];
            elem.innerText = stats[type][period] || 0;
        }
    });
}

// --- التحكم في النوافذ ---
function openAddModal() { document.getElementById('add-modal').style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function toggleOrders() { 
    const cont = document.getElementById('orders-container');
    cont.style.display = cont.style.display === 'none' ? 'block' : 'none'; 
    if(cont.style.display === 'block') renderOrders(); 
}
function toggleProductsList() { 
    const cont = document.getElementById('admin-products-container');
    cont.style.display = cont.style.display === 'none' ? 'block' : 'none'; 
    if(cont.style.display === 'block') renderAdminProducts();
}
function openSettings() { document.getElementById('settings-modal').style.display = 'flex'; }

// تم دمج هذه الوظيفة مع saveAdminSettings
function updateStoreName() { saveAdminSettings(); }
