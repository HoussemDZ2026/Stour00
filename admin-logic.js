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
    checkNewOrders();
    updateStorageInfo();
    
    const storedName = localStorage.getItem('storeName') || "متجر حسام DZ";
    const storeNameElem = document.getElementById('display-store-name');
    if(storeNameElem) storeNameElem.innerText = storedName;
});

// --- إضافة منتج جديد (مع دعم السعر القديم والضغط) ---
function saveProduct() {
    const name = document.getElementById('p-name').value;
    const desc = document.getElementById('p-desc').value;
    const price = document.getElementById('p-price').value;
    const oldPrice = document.getElementById('p-old-price').value; // الحقل الجديد
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

            // ضغط الصورة لتقليل استهلاك مساحة التخزين
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);

            const newProduct = {
                id: Date.now(),
                name, 
                description: desc, 
                price: parseFloat(price), 
                oldPrice: oldPrice ? parseFloat(oldPrice) : null,
                useTimer,
                timerHours: hours,
                timerMinutes: minutes,
                endTime: Date.now() + (hours * 3600000) + (minutes * 60000),
                image: compressedBase64 
            };

            products.push(newProduct);
            localStorage.setItem('products', JSON.stringify(products));
            
            alert("تم إضافة المنتج بنجاح!");
            closeModal('add-modal');
            renderAdminProducts();
            updateStorageInfo();
            imageInput.value = "";
        };
    };
    reader.readAsDataURL(file);
}

// --- عرض المنتجات في لوحة التحكم ---
function renderAdminProducts() {
    const list = document.getElementById('admin-products-list');
    if(!list) return;
    list.innerHTML = products.map(p => `
        <div class="order-card" style="border-right: 5px solid #fbbf24; background: #fdfdfd; padding:10px; margin-bottom:10px; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <b>${p.name}</b> <br>
                    <span style="color:#e74c3c; font-weight:bold;">${p.price} دج</span> 
                    ${p.oldPrice ? `<small style="text-decoration:line-through; color:#999; margin-left:5px;">${p.oldPrice} دج</small>` : ''}
                </div>
                <button onclick="deleteProduct(${p.id})" class="btn-delete" style="background:#ffeded; color:#e74c3c; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">حذف</button>
            </div>
        </div>
    `).join('');
}

// --- عرض الطلبيات (المبيعات) ---
function renderOrders() {
    const list = document.getElementById('orders-list');
    if (!list) return;
    
    if (orders.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding:20px;'>لا يوجد طلبات حالياً</p>";
        return;
    }
    list.innerHTML = orders.slice().reverse().map(o => `
        <div class="order-card" style="border-right: 5px solid #10b981; margin-bottom:15px; padding:15px; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <div style="font-weight:900; color:#2d3436; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
                📦 ${o.productName} (الكمية: ${o.quantity || 1})
            </div>
            <p style="margin:5px 0;">👤 الزبون: <b>${o.customerName}</b></p>
            <p style="margin:5px 0;">📞 الهاتف: <a href="tel:${o.customerPhone}" style="color:#0984e3; text-decoration:none;">${o.customerPhone}</a></p>
            <p style="margin:5px 0;">📍 العنوان: ${o.customerAddress}</p>
            <p style="margin:5px 0; font-size:12px; color:#636e72;">📅 التاريخ: ${o.date}</p>
            <div style="margin-top:10px; display:flex; gap:10px;">
                <button class="btn-call" onclick="window.location.href='tel:${o.customerPhone}'" style="flex:1; background:#00b894; color:white; border:none; padding:8px; border-radius:5px; font-weight:bold;">اتصال</button>
                <button class="btn-delete" onclick="deleteOrder(${o.id})" style="flex:1; background:#fab1a0; color:#d63031; border:none; padding:8px; border-radius:5px;">حذف</button>
            </div>
        </div>
    `).join('');
}

// --- تحديث شريط مساحة التخزين ---
function updateStorageInfo() {
    const totalSize = (encodeURI(JSON.stringify(localStorage)).length / 1024); 
    const limit = 5120; 
    const percent = Math.min((totalSize / limit) * 100, 100).toFixed(1);

    const bar = document.getElementById('storage-bar');
    const percentText = document.getElementById('storage-percent');
    
    if (bar && percentText) {
        bar.style.width = percent + "%";
        percentText.innerText = percent + "%";
        if (percent > 80) bar.style.background = "#ef4444";
        else if (percent > 50) bar.style.background = "#f59e0b";
        else bar.style.background = "#10b981";
    }
}

// --- حذف الطلبات ---
function deleteOrder(id) {
    if(confirm("هل تريد حذف هذه الطلبية؟")) {
        orders = orders.filter(o => o.id !== id);
        localStorage.setItem('orders', JSON.stringify(orders));
        renderOrders();
        updateOrderBadge();
        updateStorageInfo();
    }
}

// --- تحديث شارة التنبيه ---
function updateOrderBadge() {
    const badge = document.getElementById('order-badge');
    if (badge) {
        badge.innerText = orders.length;
        badge.style.display = orders.length > 0 ? 'inline-block' : 'none';
    }
}

// --- جلب التغييرات من التخزين بانتظام (للسماح بالتحديث التلقائي) ---
function checkNewOrders() {
    setInterval(() => {
        const latest = JSON.parse(localStorage.getItem('orders')) || [];
        if (latest.length > orders.length) {
            orders = latest;
            const sound = document.getElementById('notif-sound');
            if (sound) sound.play().catch(e => console.log("صوت الإشعار يحتاج تفاعل أولاً"));
            updateOrderBadge();
            if(document.getElementById('orders-container').style.display === 'block') {
                renderOrders();
            }
        }
    }, 4000);
}

// --- الوظائف العامة للمودال ---
function openAddModal() { document.getElementById('add-modal').style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function toggleOrders() {
    const container = document.getElementById('orders-container');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
    renderOrders();
}
function toggleProductsList() {
    const list = document.getElementById('admin-products-container');
    list.style.display = list.style.display === 'none' ? 'block' : 'none';
}
function updateStatsDisplay() {
    const ids = ['v-day', 'v-week', 'v-month', 's-day', 's-week', 's-month'];
    ids.forEach(id => {
        const elem = document.getElementById(id);
        if(elem) {
            const type = id.startsWith('v') ? 'visitors' : 'sales';
            const period = id.split('-')[1];
            elem.innerText = stats[type][period];
        }
    });
}
