// --- إعدادات البيانات ---
let products = JSON.parse(localStorage.getItem('myProducts')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];

// --- وظيفة نسخ الرابط مع النافذة الجذابة ---
function copyStoreLink() {
    const link = "https://houssemdz2026.github.io/Stour00/";
    navigator.clipboard.writeText(link).then(() => {
        actionSuccess("✨ تم نسخ رابط متجرك بنجاح!");
    });
}

// --- نظام الإحصائيات والتصفير التلقائي ---
function checkAutoReset() {
    const now = new Date();
    const lastReset = JSON.parse(localStorage.getItem('lastResetStats')) || {
        day: now.getTime(),
        week: now.getTime(),
        month: now.getTime()
    };

    const diff = now.getTime() - lastReset.day;
    
    // تصفير يومي (24 ساعة)
    if (diff >= 24 * 60 * 60 * 1000) {
        resetStatValue('v-day');
        lastReset.day = now.getTime();
    }
    // تصفير أسبوعي (7 أيام)
    if (diff >= 7 * 24 * 60 * 60 * 1000) {
        lastReset.week = now.getTime();
    }
    // تصفير شهري (30 يوم)
    if (diff >= 30 * 24 * 60 * 60 * 1000) {
        lastReset.month = now.getTime();
    }
    
    localStorage.setItem('lastResetStats', JSON.stringify(lastReset));
}

function resetStatValue(id) {
    document.getElementById(id).innerText = '0';
    actionSuccess("تم تصفير العداد");
}

// --- إضافة منتج جديد مع الصورة ومؤقت التشويق ---
function saveProduct() {
    const name = document.getElementById('p-name').value;
    const desc = document.getElementById('p-desc').value;
    const price = document.getElementById('p-price').value;
    const oldPrice = document.getElementById('p-old-price').value;
    const timer = document.getElementById('p-timer').value;
    const fileInput = document.getElementById('f-input');

    if (!name || !price || !fileInput.files[0]) {
        alert("أدخل اسم المنتج، السعر، والصورة!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const newProduct = {
            id: Date.now(),
            name: name,
            desc: desc,
            price: price,
            oldPrice: oldPrice,
            timer: timer,
            image: e.target.result // الصورة بصيغة نصية محفظة
        };

        products.push(newProduct);
        localStorage.setItem('myProducts', JSON.stringify(products));
        
        actionSuccess("تم إضافة المنتج بنجاح ✨");
        setTimeout(() => { location.reload(); }, 1500);
    };
    reader.readAsDataURL(fileInput.files[0]);
}

// --- نظام الإشعارات والرنة الجذابة ---
function playNotificationSound() {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'); // صوت رنة مبيعة
    audio.play();
}

// --- عرض وإدارة الطلبيات الواردة ---
function displayOrders() {
    const container = document.getElementById('ordersList');
    if(!container) return;

    container.innerHTML = orders.map((order, index) => `
        <div class="stat-box" style="text-align:right; margin-bottom:15px; border-right: 5px solid var(--gold);">
            <p><strong>📦 المنتج:</strong> ${order.productName}</p>
            <p><strong>👤 الزبون:</strong> ${order.customerName}</p>
            <p><strong>📞 الهاتف:</strong> ${order.customerPhone}</p>
            <p><strong>📍 العنوان:</strong> ${order.customerAddress}</p>
            <p style="font-size:0.8em; color:#888;">📅 ${order.date}</p>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <a href="tel:${order.customerPhone}" class="btn-main add-btn" style="text-decoration:none; font-size:0.8em; flex:1;">اتصال</a>
                <button onclick="deleteOrder(${index})" class="btn-main" style="background:red; color:white; font-size:0.8em; flex:1;">حذف</button>
            </div>
        </div>
    `).join('');
}

function deleteOrder(index) {
    if(confirm("هل أنت متأكد من حذف الطلبية؟")) {
        orders.splice(index, 1);
        localStorage.setItem('orders', JSON.stringify(orders));
        displayOrders();
        actionSuccess("تم الحذف");
    }
}

// --- تشغيل الوظائف عند فتح الصفحة ---
window.onload = function() {
    checkAutoReset();
    if(document.getElementById('v-day')) {
        // تحديث أرقام الإحصائيات من الـ LocalStorage
        document.getElementById('s-day').innerText = orders.length;
    }
    displayOrders();
};

// وظيفة رسالة النجاح الجذابة
function actionSuccess(msg) {
    const toast = document.getElementById('successToast');
    if(toast) {
        toast.innerText = msg;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2500);
    }
                                              }
